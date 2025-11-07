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
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { videoSchema, type VideoFormData } from "@/api";

type VideoAddDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VideoFormData) => void;
  isPending: boolean;
  error: Error | null;
};

export function VideoAddDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  error,
}: VideoAddDialogProps) {
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
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: VideoFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          비디오 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>비디오 추가</DialogTitle>
          <DialogDescription>
            새로운 비디오를 추가하세요. 기본 상태는 Draft입니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">비디오 ID *</Label>
              <Input
                id="id"
                {...form.register("id")}
                placeholder="예: ECXAFUmdJkI"
              />
              {form.formState.errors.id && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">재생시간 (초) *</Label>
              <Input
                id="duration"
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
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="비디오 제목을 입력하세요"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">썸네일 URL *</Label>
            <Input
              id="thumbnail"
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
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              {...form.register("description")}
              placeholder="비디오 설명 (선택사항)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
              {isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

