"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  description: string | null;
  duration: number;
  created_at: string;
  updated_at: string;
};

async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await supabase.from("video").select("*").order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export default function VideosPage() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

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

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">비디오 목록</h1>
          <p className="mt-1 text-sm text-gray-600">
            총 {videos?.length || 0}개의 비디오가 있습니다.
          </p>
        </div>

        <div className="rounded-lg bg-white border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-[100px] font-semibold text-gray-700">썸네일</TableHead>
                <TableHead className="font-semibold text-gray-700">제목</TableHead>
                <TableHead className="font-semibold text-gray-700">설명</TableHead>
                <TableHead className="w-[100px] font-semibold text-gray-700">재생시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos && videos.length > 0 ? (
                videos.map((video) => (
                  <TableRow key={video.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                    <TableCell className="font-medium text-gray-900 py-3">{video.title}</TableCell>
                    <TableCell className="max-w-md truncate text-gray-600 py-3">
                      {video.description || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-3">{formatDuration(video.duration)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
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

