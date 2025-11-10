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
import Link from "next/link";
import { videoFormSchema, type VideoFormData, useCategoriesQuery } from "@/api";
import type { Video } from "@/api";
import type { z } from "zod";

type VideoEditDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
  onSubmit: (videoId: string, data: Partial<VideoFormData>) => void;
  isPending: boolean;
  error: Error | null;
};
type FormData = z.infer<typeof videoFormSchema>;

export function VideoEditDialog({
  isOpen,
  onOpenChange,
  video,
  onSubmit,
  isPending,
  error,
}: VideoEditDialogProps) {
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesQuery();

  const form = useForm<FormData>({
    resolver: zodResolver(videoFormSchema),
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
        category_id: video.category_id,
        difficulty: video.difficulty,
      });
    }
  }, [isOpen, video, form]);

  const hasCategories = categories && categories.length > 0;

  const handleSubmit = async (data: FormData) => {
    if (!video) return;

    // refine 검증을 통과했으므로 category_id는 항상 number
    const validatedData: VideoFormData = {
      ...data,
      category_id: data.category_id as number,
    };

    // id는 제외하고 업데이트
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = validatedData;
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
          <DialogDescription>영상 정보를 수정하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* 카테고리 필드 - 최상단 */}
          <div className="space-y-2">
            <Label htmlFor="edit-category_id">카테고리 *</Label>
            {categoriesLoading ? (
              <div className="text-sm text-gray-500">로딩 중...</div>
            ) : !hasCategories ? (
              <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                카테고리가 없습니다.{" "}
                <Link
                  href="/categories"
                  className="font-semibold underline hover:text-yellow-900"
                  onClick={() => onOpenChange(false)}
                >
                  먼저 카테고리를 등록해주세요
                </Link>
                .
              </div>
            ) : (
              <Controller
                name="category_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {form.formState.errors.category_id && (
              <p className="text-sm text-red-600">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-id">영상 ID</Label>
              <Input
                id="edit-id"
                {...form.register("id")}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                영상 ID는 수정할 수 없습니다.
              </p>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">상태</Label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">난이도</Label>
              <Controller
                name="difficulty"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : Number(value))
                    }
                    value={field.value?.toString() || "none"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="난이도를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">선택 안함</SelectItem>
                      <SelectItem value="1">1단계 (초급)</SelectItem>
                      <SelectItem value="2">2단계 (초중급)</SelectItem>
                      <SelectItem value="3">3단계 (중급)</SelectItem>
                      <SelectItem value="4">4단계 (중고급)</SelectItem>
                      <SelectItem value="5">5단계 (고급)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.difficulty && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.difficulty.message}
                </p>
              )}
            </div>
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
            <Button type="submit" disabled={isPending || !hasCategories}>
              {isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
