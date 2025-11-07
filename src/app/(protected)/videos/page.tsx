"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Plus } from "lucide-react";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  description: string | null;
  duration: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

const videoSchema = z.object({
  id: z.string().min(1, "비디오 ID를 입력하세요"),
  title: z.string().min(1, "제목을 입력하세요"),
  thumbnail: z.string().url("올바른 URL을 입력하세요"),
  description: z.string().optional(),
  duration: z.number().min(1, "재생시간을 입력하세요"),
  status: z.enum(["draft", "published"]).default("draft"),
});

type VideoFormData = z.infer<typeof videoSchema>;

async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from("video_dev")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

async function createVideo(video: VideoFormData): Promise<Video> {
  const { data, error } = await supabase
    .from("video_dev")
    .insert([video])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export default function VideosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: videos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const mutation = useMutation({
    mutationFn: createVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      status: "draft",
    },
  });

  const onSubmit = async (data: VideoFormData) => {
    mutation.mutate(data);
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: "draft" | "published") => {
    if (status === "published") {
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 rounded-full bg-green-300 opacity-60"></div>
            <div className="relative h-3 w-3 rounded-full bg-green-600 m-0.5"></div>
          </div>
          <span className="text-sm font-medium text-green-700">PUBLISHED</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-4 w-4">
          <div className="absolute inset-0 rounded-full bg-gray-300 opacity-60"></div>
          <div className="relative h-3 w-3 rounded-full bg-gray-500 m-0.5"></div>
        </div>
        <span className="text-sm font-medium text-gray-700">DRAFT</span>
      </div>
    );
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                      {...form.register("duration", { valueAsNumber: true })}
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
                {mutation.error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    에러: {(mutation.error as Error).message}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "추가 중..." : "추가"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg bg-white border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-[100px] font-semibold text-gray-700">
                  상태
                </TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-700">
                  썸네일
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  제목
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  설명
                </TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-700">
                  재생시간
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos && videos.length > 0 ? (
                videos.map((video) => (
                  <TableRow
                    key={video.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <TableCell className="py-3">
                      {getStatusBadge(video.status)}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="relative h-16 w-28 overflow-hidden rounded">
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 py-3">
                      {video.title}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-gray-600 py-3">
                      {video.description || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-3">
                      {formatDuration(video.duration)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    비디오가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
