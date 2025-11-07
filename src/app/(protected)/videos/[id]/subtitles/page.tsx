"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PendingSubtitlesList } from "../../_components/PendingSubtitlesList";
import { SavedSubtitlesList } from "../../_components/SavedSubtitlesList";
import { SubtitleForm } from "../../_components/SubtitleForm";
import { YouTubePlayer } from "../../_components/YouTubePlayer";
import {
  createSubtitlesMutation,
  queryKeys,
  useSubtitlesQuery,
  useVideosQuery,
} from "@/api";
import type {
  SubtitleFormData,
  SubtitleFormInput,
  YouTubePlayer as YouTubePlayerType,
} from "@/api";

export default function SubtitleManagementPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayerType | null>(
    null
  );
  const [pendingSubtitles, setPendingSubtitles] = useState<SubtitleFormData[]>(
    []
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: videos } = useVideosQuery();
  const video = videos?.find((v) => v.id === videoId);

  const { data: subtitles, isLoading: isSubtitlesLoading } = useSubtitlesQuery(
    videoId,
    true
  );

  const subtitleMutation = useMutation({
    mutationFn: (subtitles: SubtitleFormData[]) =>
      createSubtitlesMutation(videoId, subtitles),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(videoId),
      });
      setPendingSubtitles([]);
    },
  });

  const handleAddToPendingList = (data: SubtitleFormInput) => {
    // 저장된 자막의 최대 index 계산
    const maxSavedIndex =
      subtitles && subtitles.length > 0
        ? Math.max(...subtitles.map((s) => s.index))
        : -1;

    // 다음 index는 (저장된 자막의 최대 index + 1) + (현재 pending 자막의 개수)
    const nextIndex = maxSavedIndex + 1 + pendingSubtitles.length;

    const subtitleWithIndex: SubtitleFormData = {
      ...data,
      index: nextIndex,
      origin_text: data.has_subtitle ? data.origin_text || "" : "",
      blanked_text: data.has_subtitle ? data.blanked_text || "" : "",
      translation: data.has_subtitle ? data.translation || "" : "",
    };

    setPendingSubtitles((prev) => [...prev, subtitleWithIndex]);
  };

  const handleRemovePendingSubtitle = (index: number) => {
    setPendingSubtitles((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // index 재계산
      const maxSavedIndex =
        subtitles && subtitles.length > 0
          ? Math.max(...subtitles.map((s) => s.index))
          : -1;
      return filtered.map((subtitle, idx) => ({
        ...subtitle,
        index: maxSavedIndex + 1 + idx,
      }));
    });
  };

  const handleSaveSubtitles = () => {
    if (pendingSubtitles.length === 0) {
      return;
    }
    subtitleMutation.mutate(pendingSubtitles);
  };

  // 기존 interval 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSubtitleClick = (startTime: number, endTime: number) => {
    if (!youtubePlayer) return;

    // 기존 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 시작 시간으로 이동하고 재생 시작
    youtubePlayer.seekTo(startTime, true);
    youtubePlayer.playVideo();

    // 끝 시간에 도달하면 일시정지하는 인터벌 설정
    intervalRef.current = setInterval(() => {
      if (!youtubePlayer) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();
      if (currentTime >= endTime) {
        youtubePlayer.pauseVideo();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100); // 100ms마다 체크
  };

  if (!video) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-lg text-gray-600">비디오를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-[1600px]">
        <Button
          variant="ghost"
          onClick={() => router.push("/videos")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {video.title}
        </Button>

        {/* 메인 컨텐츠 */}
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* 왼쪽: 자막 추가 폼 및 임시 자막 */}
          <div className="w-1/2 bg-white rounded-lg border border-gray-200 p-4 flex flex-col overflow-hidden">
            <div className="mb-4 shrink-0">
              <h3 className="text-lg font-semibold mb-4">자막 추가</h3>
              <SubtitleForm onSubmit={handleAddToPendingList} />
            </div>

            <PendingSubtitlesList
              pendingSubtitles={pendingSubtitles}
              onRemove={handleRemovePendingSubtitle}
              onSave={handleSaveSubtitles}
              isSaving={subtitleMutation.isPending}
              error={subtitleMutation.error as Error | null}
            />
          </div>

          {/* 오른쪽: YouTube 플레이어 및 저장된 자막 */}
          <div className="w-1/2 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="shrink-0">
              <YouTubePlayer
                videoId={video.id}
                onPlayerReady={setYoutubePlayer}
              />
            </div>

            <div className="flex-1 overflow-y-auto border-t p-4">
              <h3 className="text-lg font-semibold mb-4">저장된 자막</h3>
              <SavedSubtitlesList
                subtitles={subtitles}
                isLoading={isSubtitlesLoading}
                onSubtitleClick={handleSubtitleClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
