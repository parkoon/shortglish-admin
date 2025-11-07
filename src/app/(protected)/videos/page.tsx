"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoAddDialog } from "./_components/VideoAddDialog";
import { VideoListTable } from "./_components/VideoListTable";
import { SubtitleManagementDrawer } from "./_components/SubtitleManagementDrawer";
import { useVideosQuery, createVideoMutation, queryKeys } from "@/api";
import type { Video, VideoFormData } from "@/api";

export default function VideosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useVideosQuery();

  const videoMutation = useMutation({
    mutationFn: createVideoMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      setIsDialogOpen(false);
    },
  });

  const handleVideoSubmit = (data: VideoFormData) => {
    videoMutation.mutate(data);
  };

  const handleSubtitleManage = (video: Video) => {
    setSelectedVideo(video);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-lg text-red-600">
          에러가 발생했습니다: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              비디오 목록
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              총 {videos?.length || 0}개의 비디오가 있습니다.
            </p>
          </div>
          <VideoAddDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleVideoSubmit}
            isPending={videoMutation.isPending}
            error={videoMutation.error as Error | null}
          />
        </div>

        <VideoListTable
          videos={videos || []}
          onSubtitleManage={handleSubtitleManage}
        />
      </div>

      <SubtitleManagementDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        video={selectedVideo}
      />
    </div>
  );
}
