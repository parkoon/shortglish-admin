"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play } from "lucide-react";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";

type SubtitleRow = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation: string;
  description: string;
};

type SubtitleEditorTableProps = {
  subtitles: SubtitleRow[];
  youtubePlayer: YouTubePlayerType | null;
  onSubtitleChange: (
    id: number,
    field: keyof SubtitleRow,
    value: string | number
  ) => void;
  onPlay: (startTime: number, endTime: number) => void;
};

export function SubtitleEditorTable({
  subtitles,
  youtubePlayer,
  onSubtitleChange,
  onPlay,
}: SubtitleEditorTableProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16 text-center">재생</TableHead>
            <TableHead className="w-32">시작 시간</TableHead>
            <TableHead className="w-32">끝나는 시간</TableHead>
            <TableHead>자막 내용</TableHead>
            <TableHead>번역 내용</TableHead>
            <TableHead>추가 설명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subtitles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-gray-500"
              >
                자막이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            subtitles.map((subtitle) => (
              <TableRow key={subtitle.id}>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-blue-600"
                    onClick={() => onPlay(subtitle.startTime, subtitle.endTime)}
                    disabled={!youtubePlayer}
                    title={`${subtitle.startTime.toFixed(3)}초 ~ ${subtitle.endTime.toFixed(3)}초 재생`}
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
                    value={subtitle.startTime}
                    onChange={(e) =>
                      onSubtitleChange(
                        subtitle.id,
                        "startTime",
                        e.target.value
                      )
                    }
                    placeholder="0.000"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
                    value={subtitle.endTime}
                    onChange={(e) =>
                      onSubtitleChange(subtitle.id, "endTime", e.target.value)
                    }
                    placeholder="0.000"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
                    value={subtitle.text}
                    onChange={(e) =>
                      onSubtitleChange(subtitle.id, "text", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
                    placeholder="번역을 입력하세요..."
                    value={subtitle.translation}
                    onChange={(e) =>
                      onSubtitleChange(
                        subtitle.id,
                        "translation",
                        e.target.value
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
                    placeholder="설명 추가..."
                    value={subtitle.description}
                    onChange={(e) =>
                      onSubtitleChange(
                        subtitle.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

