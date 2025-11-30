"use client";

import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";
import type { SubtitleRow } from "./types";
import { SubtitleRow as SubtitleRowComponent } from "./SubtitleRow";

type SubtitleEditorTableProps = {
  subtitles: SubtitleRow[];
  youtubePlayer: YouTubePlayerType | null;
  onSubtitleChange: (
    id: number,
    field: keyof SubtitleRow,
    value: string | number
  ) => void;
  onPlay: (startTime: number, endTime: number) => void;
  onAdd: (afterId: number) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
};

export const SubtitleEditorTable = memo(function SubtitleEditorTable({
  subtitles,
  youtubePlayer,
  onSubtitleChange,
  onPlay,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SubtitleEditorTableProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16 text-center">재생</TableHead>
            <TableHead className="w-32">시작 시간</TableHead>
            <TableHead className="w-32">끝나는 시간</TableHead>
            <TableHead>원본 텍스트</TableHead>
            <TableHead>번역 텍스트</TableHead>
            <TableHead>빈칸 텍스트</TableHead>
            <TableHead>설명</TableHead>
            <TableHead className="w-32 text-center">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subtitles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-gray-500"
              >
                자막이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            subtitles.map((subtitle, index) => (
              <SubtitleRowComponent
                key={subtitle.id}
                subtitle={subtitle}
                index={index}
                totalCount={subtitles.length}
                youtubePlayer={youtubePlayer}
                onSubtitleChange={onSubtitleChange}
                onPlay={onPlay}
                onAdd={onAdd}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

