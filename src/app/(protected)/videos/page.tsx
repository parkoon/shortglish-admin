"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VideoAddDialog } from "./_components/VideoAddDialog";
import { VideoEditDialog } from "./_components/VideoEditDialog";
import { VideoListTable } from "./_components/VideoListTable";
import { SubtitleManagementDrawer } from "./_components/SubtitleManagementDrawer";
import {
  useVideosQuery,
  createVideoMutation,
  updateVideoMutation,
  queryKeys,
} from "@/api";
import type { Video, VideoFormData } from "@/api";

export default function VideosPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useVideosQuery();

  const createVideoMutationHook = useMutation({
    mutationFn: createVideoMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      setIsAddDialogOpen(false);
    },
  });

  const updateVideoMutationHook = useMutation({
    mutationFn: ({
      videoId,
      ...data
    }: { videoId: string } & Partial<VideoFormData>) =>
      updateVideoMutation(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      setIsEditDialogOpen(false);
      setEditingVideo(null);
    },
  });

  const handleVideoSubmit = (data: VideoFormData) => {
    createVideoMutationHook.mutate(data);
  };

  const handleVideoEdit = (videoId: string, data: Partial<VideoFormData>) => {
    updateVideoMutationHook.mutate({ videoId, ...data });
  };

  const handleEditClick = (video: Video) => {
    setEditingVideo(video);
    setIsEditDialogOpen(true);
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
            <h1 className="text-2xl font-semibold text-gray-900">영상 목록</h1>
            <p className="mt-1 text-sm text-gray-600">
              총 {videos?.length || 0}개의 영상가 있습니다이
            </p>
          </div>
          <VideoAddDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleVideoSubmit}
            isPending={createVideoMutationHook.isPending}
            error={createVideoMutationHook.error as Error | null}
          />
        </div>

        <VideoListTable
          videos={videos || []}
          onSubtitleManage={handleSubtitleManage}
          onEdit={handleEditClick}
        />

        <VideoEditDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          video={editingVideo}
          onSubmit={handleVideoEdit}
          isPending={updateVideoMutationHook.isPending}
          error={updateVideoMutationHook.error as Error | null}
        />

        <SubtitleManagementDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          video={selectedVideo}
        />
      </div>
    </div>
  );
}
