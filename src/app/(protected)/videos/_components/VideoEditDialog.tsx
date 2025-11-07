"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { videoSchema, type VideoFormData } from "@/api";
import type { Video } from "@/api";

type VideoEditDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
  onSubmit: (videoId: string, data: Partial<VideoFormData>) => void;
  isPending: boolean;
  error: Error | null;
};

export function VideoEditDialog({
  isOpen,
  onOpenChange,
  video,
  onSubmit,
  isPending,
  error,
}: VideoEditDialogProps) {
  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      status: "draft",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        status: "draft",
      });
      return;
    }

    if (video) {
      form.reset({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        description: video.description || "",
        duration: video.duration,
        status: video.status,
      });
    }
  }, [isOpen, video, form]);

  const handleSubmit = async (data: VideoFormData) => {
    if (!video) return;
    
    const { id, ...updateData } = data; // id는 제외하고 업데이트
    onSubmit(video.id, updateData);
  };

  if (!video) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>영상 수정</DialogTitle>
          <DialogDescription>
            영상 정보를 수정하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-id">영상 ID</Label>
              <Input
                id="edit-id"
                {...form.register("id")}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">영상 ID는 수정할 수 없습니다.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-duration">재생시간 (초) *</Label>
              <Input
                id="edit-duration"
                type="number"
                {...form.register("duration", {
                  valueAsNumber: true,
                })}
                placeholder="예: 120"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-title">제목 *</Label>
            <Input
              id="edit-title"
              {...form.register("title")}
              placeholder="영상 제목을 입력하세요"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail">썸네일 URL *</Label>
            <Input
              id="edit-thumbnail"
              {...form.register("thumbnail")}
              placeholder="https://i.ytimg.com/vi/..."
            />
            {form.formState.errors.thumbnail && (
              <p className="text-sm text-red-600">
                {form.formState.errors.thumbnail.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">설명</Label>
            <Input
              id="edit-description"
              {...form.register("description")}
              placeholder="영상 설명 (선택사항)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">상태</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              에러: {error.message}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

