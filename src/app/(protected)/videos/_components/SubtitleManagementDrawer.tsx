"use client";

import type {
  SubtitleFormData,
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
import { useState } from "react";
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

  const handleAddToPendingList = (data: SubtitleFormData) => {
    setPendingSubtitles((prev) => [...prev, data]);
  };

  const handleRemovePendingSubtitle = (index: number) => {
    setPendingSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSubtitles = () => {
    if (pendingSubtitles.length === 0) {
      return;
    }
    subtitleMutation.mutate(pendingSubtitles);
  };

  const handleSubtitleClick = (startTime: number) => {
    if (youtubePlayer) {
      youtubePlayer.seekTo(startTime, true);
      youtubePlayer.playVideo();
    }
  };

  if (!video) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="flex h-full max-h-[85vh]">
          {/* 왼쪽: YouTube 플레이어 */}
          <div className="w-1/2 border-r p-6">
            <DrawerHeader>
              <DrawerTitle>{video.title}</DrawerTitle>
              <DrawerDescription>
                자막을 클릭하면 해당 시간으로 영상이 이동합니다.
              </DrawerDescription>
            </DrawerHeader>
            <div className="mt-4">
              <YouTubePlayer
                videoId={video.id}
                onPlayerReady={setYoutubePlayer}
              />
            </div>
          </div>

          {/* 오른쪽: 자막 리스트 및 관리 */}
          <div className="w-1/2 flex flex-col p-6 overflow-hidden">
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

            <div className="flex-1 overflow-y-auto border-t pt-4">
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
