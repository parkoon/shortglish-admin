"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SavedSubtitlesList } from "../../_components/SavedSubtitlesList";
import { YouTubePlayer } from "../../_components/YouTubePlayer";
import {
  createSubtitleMutation,
  updateSubtitleMutation,
  deleteSubtitleMutation,
  queryKeys,
  useSubtitlesQuery,
  useVideosQuery,
} from "@/api";
import type {
  SubtitleFormData,
  YouTubePlayer as YouTubePlayerType,
} from "@/api";

export default function SubtitleManagementPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayerType | null>(
    null
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: videos } = useVideosQuery();
  const video = videos?.find((v) => v.id === videoId);

  const { data: subtitles, isLoading: isSubtitlesLoading } = useSubtitlesQuery(
    videoId,
    true
  );

  const createSubtitleMutationHook = useMutation({
    mutationFn: (subtitle: SubtitleFormData) =>
      createSubtitleMutation(videoId, subtitle),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(videoId),
      });
    },
  });

  const updateSubtitleMutationHook = useMutation({
    mutationFn: ({
      id,
      ...subtitle
    }: { id: number } & Partial<SubtitleFormData>) =>
      updateSubtitleMutation(id, subtitle),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(videoId),
      });
    },
  });

  const deleteSubtitleMutationHook = useMutation({
    mutationFn: (subtitleId: number) => deleteSubtitleMutation(subtitleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(videoId),
      });
    },
  });

  const handleAddSubtitle = (data: Partial<SubtitleFormData>) => {
    // 저장된 자막의 최대 index 계산
    const maxSavedIndex =
      subtitles && subtitles.length > 0
        ? Math.max(...subtitles.map((s) => s.index))
        : -1;

    // 다음 index는 저장된 자막의 최대 index + 1
    const nextIndex = maxSavedIndex + 1;

    // DB에 저장할 데이터 생성
    const subtitleWithIndex: SubtitleFormData = {
      start_time: data.start_time || 0,
      end_time: data.end_time || 0,
      origin_text: data.origin_text || "",
      blanked_text: data.blanked_text || "",
      translation: data.translation || "",
      index: nextIndex,
    };

    createSubtitleMutationHook.mutate(subtitleWithIndex);
  };

  const handleUpdateSubtitle = (
    subtitleId: number,
    subtitle: Partial<SubtitleFormData>
  ) => {
    updateSubtitleMutationHook.mutate({ id: subtitleId, ...subtitle });
  };

  const handleDeleteSubtitle = (subtitleId: number) => {
    if (confirm("정말 이 자막을 삭제하시겠습니까?")) {
      deleteSubtitleMutationHook.mutate(subtitleId);
    }
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
          {/* YouTube 플레이어 */}
          <div className="w-1/2 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
            <div className="shrink-0">
              <YouTubePlayer
                videoId={video.id}
                onPlayerReady={setYoutubePlayer}
              />
            </div>
          </div>

          {/* 저장된 자막 */}
          <div className="w-1/2 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden p-4">
            <div className="flex-1 overflow-y-auto">
              <SavedSubtitlesList
                subtitles={subtitles}
                isLoading={isSubtitlesLoading}
                onSubtitleClick={handleSubtitleClick}
                onAddSubtitle={handleAddSubtitle}
                onUpdateSubtitle={handleUpdateSubtitle}
                onDeleteSubtitle={handleDeleteSubtitle}
                isUpdating={updateSubtitleMutationHook.isPending}
                isDeleting={deleteSubtitleMutationHook.isPending}
                isCreating={createSubtitleMutationHook.isPending}
                error={
                  createSubtitleMutationHook.error ||
                  updateSubtitleMutationHook.error ||
                  deleteSubtitleMutationHook.error
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
