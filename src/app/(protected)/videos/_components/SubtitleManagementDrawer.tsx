"use client";

import type {
  SubtitleFormData,
  SubtitleFormInput,
  Video,
  YouTubePlayer as YouTubePlayerType,
} from "@/api";
import { createSubtitlesMutation, queryKeys, useSubtitlesQuery } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { PendingSubtitlesList } from "./PendingSubtitlesList";
import { SavedSubtitlesList } from "./SavedSubtitlesList";
import { SubtitleForm } from "./SubtitleForm";
import { YouTubePlayer } from "./YouTubePlayer";

type SubtitleManagementDrawerProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
};

export function SubtitleManagementDrawer({
  isOpen,
  onOpenChange,
  video,
}: SubtitleManagementDrawerProps) {
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayerType | null>(
    null
  );
  const [pendingSubtitles, setPendingSubtitles] = useState<SubtitleFormData[]>(
    []
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: subtitles, isLoading: isSubtitlesLoading } = useSubtitlesQuery(
    video?.id,
    isOpen
  );

  const subtitleMutation = useMutation({
    mutationFn: (subtitles: SubtitleFormData[]) =>
      createSubtitlesMutation(video!.id, subtitles),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(video!.id),
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
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerHeader className="shrink-0">
        <DrawerTitle>{video.title}</DrawerTitle>
        <DrawerDescription>
          자막을 클릭하면 해당 시간으로 영상이 이동합니다.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerContent className="max-h-[90vh]">
        <div className="flex h-full max-h-[85vh]">
          {/* 왼쪽: 자막 추가 폼 및 임시 자막 */}
          <div className="w-1/2 border-r p-6 flex flex-col overflow-hidden">
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
          <div className="w-1/2 flex flex-col p-6 overflow-hidden">
            <div className="mt-4 shrink-0">
              <YouTubePlayer
                videoId={video.id}
                onPlayerReady={setYoutubePlayer}
              />
            </div>

            <div className="flex-1 overflow-y-auto border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">저장된 자막</h3>
              <SavedSubtitlesList
                subtitles={subtitles}
                isLoading={isSubtitlesLoading}
                onSubtitleClick={handleSubtitleClick}
              />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">닫기</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
