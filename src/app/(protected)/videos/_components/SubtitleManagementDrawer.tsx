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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, XIcon, Play } from "lucide-react";
import { SubtitleEditDialog } from "./SubtitleEditDialog";
import type { Subtitle } from "@/api";

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
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seekTime, setSeekTime] = useState<string>("");
  const animationFrameRef = useRef<number | null>(null);
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
      setIsDialogOpen(false);
      setEditingSubtitle(null);
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
      setIsDialogOpen(false);
      setEditingSubtitle(null);
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

  const handleAddClick = () => {
    setEditingSubtitle(null);
    setIsDialogOpen(true);
  };

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

  const handleEditSubtitle = (subtitle: Subtitle) => {
    setEditingSubtitle(subtitle);
    setIsDialogOpen(true);
  };

  const handleSave = (
    subtitleId: number | null,
    data: Partial<SubtitleFormData>
  ) => {
    if (subtitleId === null) {
      handleAddSubtitle(data);
    } else {
      handleUpdateSubtitle(subtitleId, data);
    }
    // 다이얼로그는 mutation의 onSuccess에서 닫힘
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

  const clearPlaybackAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return clearPlaybackAnimation;
  }, []);

  const handleSubtitleClick = (startTime: number, endTime: number) => {
    if (!youtubePlayer) return;

    clearPlaybackAnimation();

    youtubePlayer.seekTo(startTime, true);
    youtubePlayer.playVideo();

    const checkPlayback = () => {
      if (!youtubePlayer) {
        clearPlaybackAnimation();
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();
      if (currentTime >= endTime) {
        youtubePlayer.pauseVideo();
        clearPlaybackAnimation();
        return;
      }

      // 재귀적으로 requestAnimationFrame 호출
      animationFrameRef.current = requestAnimationFrame(checkPlayback);
    };

    // 첫 번째 프레임 요청
    animationFrameRef.current = requestAnimationFrame(checkPlayback);
  };

  const handleSeekTo = () => {
    if (!youtubePlayer) return;

    const time = parseFloat(seekTime);
    if (isNaN(time) || time < 0) {
      alert("올바른 시간을 입력해주세요 (0 이상의 숫자)");
      return;
    }

    clearPlaybackAnimation();
    youtubePlayer.seekTo(time, true);
    setSeekTime("");
  };

  const handleSeekTimeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSeekTo();
    }
  };

  if (!video) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} dismissible={false}>
      <DrawerContent className="w-full sm:w-[90%] md:w-[800px] lg:w-[1000px] h-screen max-h-screen! mx-auto ">
        <DrawerHeader className="flex justify-between">
          <DrawerTitle>{video.title}</DrawerTitle>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <XIcon />
          </Button>
        </DrawerHeader>
        <div className="flex flex-col h-full">
          {/* YouTube 플레이어 */}
          <div className="shrink-0 border-b">
            <YouTubePlayer
              videoId={video.id}
              onPlayerReady={setYoutubePlayer}
            />
          </div>

          {/* 자막 추가 버튼 - 고정 영역 */}
          <div className="shrink-0 border-b px-4 py-3">
            <div className="flex justify-between items-center gap-4">
              {/* 시간 이동 기능 */}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="seek-time"
                  className="text-sm whitespace-nowrap"
                >
                  시간 이동:
                </Label>
                <Input
                  id="seek-time"
                  type="number"
                  step="0.1"
                  min="0"
                  value={seekTime}
                  onChange={(e) => setSeekTime(e.target.value)}
                  onKeyPress={handleSeekTimeKeyPress}
                  placeholder="초 (예: 10.5)"
                  className="w-32"
                  disabled={!youtubePlayer}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSeekTo}
                  disabled={!youtubePlayer || !seekTime}
                >
                  <Play className="h-4 w-4 mr-1" />
                  이동
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleAddClick}
                disabled={
                  createSubtitleMutationHook.isPending ||
                  updateSubtitleMutationHook.isPending ||
                  deleteSubtitleMutationHook.isPending
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                자막 추가
              </Button>
            </div>
          </div>
          {/* 저장된 자막 - 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
            <SavedSubtitlesList
              subtitles={subtitles}
              isLoading={isSubtitlesLoading}
              onSubtitleClick={handleSubtitleClick}
              onEditSubtitle={handleEditSubtitle}
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
          {/* 자막 편집 다이얼로그 */}
          <SubtitleEditDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            subtitle={editingSubtitle}
            onSave={handleSave}
            isSaving={
              createSubtitleMutationHook.isPending ||
              updateSubtitleMutationHook.isPending
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
