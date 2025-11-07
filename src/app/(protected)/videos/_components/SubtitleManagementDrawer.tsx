"use client";

import type {
  SubtitleFormData,
  Video,
  YouTubePlayer as YouTubePlayerType,
} from "@/api";
import {
  createSubtitleMutation,
  updateSubtitleMutation,
  deleteSubtitleMutation,
  queryKeys,
  useSubtitlesQuery,
} from "@/api";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { SavedSubtitlesList } from "./SavedSubtitlesList";
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const { data: subtitles, isLoading: isSubtitlesLoading } = useSubtitlesQuery(
    video?.id,
    isOpen
  );

  const createSubtitleMutationHook = useMutation({
    mutationFn: (subtitle: SubtitleFormData) =>
      createSubtitleMutation(video!.id, subtitle),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(video!.id),
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
        queryKey: queryKeys.subtitles.byVideo(video!.id),
      });
    },
  });

  const deleteSubtitleMutationHook = useMutation({
    mutationFn: (subtitleId: number) => deleteSubtitleMutation(subtitleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(video!.id),
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
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerHeader className="shrink-0">
        <DrawerTitle>{video.title}</DrawerTitle>
        <DrawerDescription>
          자막을 클릭하면 해당 시간으로 영상이 이동합니다.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerContent className="max-h-screen w-full">
        <div className="flex flex-col h-full">
          {/* YouTube 플레이어 */}
          <div className="shrink-0 border-b">
            <YouTubePlayer
              videoId={video.id}
              onPlayerReady={setYoutubePlayer}
            />
          </div>

          {/* 저장된 자막 */}
          <div className="flex-1 overflow-y-auto p-4">
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
      </DrawerContent>
    </Drawer>
  );
}
