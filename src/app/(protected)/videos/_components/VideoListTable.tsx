"use client";

import type { Video } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { formatDuration } from "./utils";

type VideoListTableProps = {
  videos: Video[];
  onSubtitleManage: (video: Video) => void;
  onEdit: (video: Video) => void;
};

export function VideoListTable({
  videos,
  onSubtitleManage,
  onEdit,
}: VideoListTableProps) {
  return (
    <div className="rounded-lg bg-white border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="w-[100px] font-semibold text-gray-700">
              상태
            </TableHead>
            <TableHead className="font-semibold text-gray-700">
              카테고리
            </TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">
              썸네일
            </TableHead>
            <TableHead className="font-semibold text-gray-700">제목</TableHead>
            <TableHead className="font-semibold text-gray-700">설명</TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">
              재생시간
            </TableHead>
            <TableHead className="w-[100px] font-semibold text-gray-700">
              난이도
            </TableHead>
            <TableHead className="w-[200px] font-semibold text-gray-700" />
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
                  <StatusBadge status={video.status} />
                </TableCell>
                <TableCell className="text-gray-600 py-3">
                  {video.category?.name || "-"}
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
                <TableCell className="py-3">
                  {video.difficulty ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-700">
                        {video.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">단계</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(video)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubtitleManage(video)}
                    >
                      자막 관리
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                영상이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
