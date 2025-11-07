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

  const calculateNextIndex = (): number => {
    if (!subtitles || subtitles.length === 0) return 0;
    return Math.max(...subtitles.map((s) => s.index)) + 1;
  };

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
    const subtitleWithIndex: SubtitleFormData = {
      start_time: data.start_time || 0,
      end_time: data.end_time || 0,
      origin_text: data.origin_text || "",
      blanked_text: data.blanked_text || "",
      translation: data.translation || "",
      index: calculateNextIndex(),
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

  const clearPlaybackInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return clearPlaybackInterval;
  }, []);

  const handleSubtitleClick = (startTime: number, endTime: number) => {
    if (!youtubePlayer) return;

    clearPlaybackInterval();

    youtubePlayer.seekTo(startTime, true);
    youtubePlayer.playVideo();

    intervalRef.current = setInterval(() => {
      if (!youtubePlayer) {
        clearPlaybackInterval();
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();
      if (currentTime >= endTime) {
        youtubePlayer.pauseVideo();
        clearPlaybackInterval();
      }
    }, 100);
  };

  if (!video) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="max-h-screen w-full">
        <div className="flex flex-col h-full">
          {/* YouTube 플레이어 */}
          <div className="shrink-0 border-b">
            <YouTubePlayer
              videoId={video.id}
              onPlayerReady={setYoutubePlayer}
            />
          </div>
          <DrawerHeader className="shrink-0">
            <DrawerTitle>{video.title}</DrawerTitle>
          </DrawerHeader>
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
