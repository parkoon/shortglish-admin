"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Play, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";
import type { SubtitleRow as SubtitleRowType } from "./types";

type SubtitleRowProps = {
  subtitle: SubtitleRowType;
  index: number;
  totalCount: number;
  youtubePlayer: YouTubePlayerType | null;
  onSubtitleChange: (
    id: number,
    field: keyof SubtitleRowType,
    value: string | number
  ) => void;
  onPlay: (startTime: number, endTime: number) => void;
  onAdd: (afterId: number) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
};

export const SubtitleRow = memo(function SubtitleRow({
  subtitle,
  index,
  totalCount,
  youtubePlayer,
  onSubtitleChange,
  onPlay,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SubtitleRowProps) {
  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <TableRow>
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
            onSubtitleChange(subtitle.id, "startTime", e.target.value)
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
          value={subtitle.originText}
          onChange={(e) =>
            onSubtitleChange(subtitle.id, "originText", e.target.value)
          }
          placeholder="원본 텍스트"
        />
      </TableCell>
      <TableCell>
        <Input
          className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
          placeholder="번역 텍스트를 입력하세요..."
          value={subtitle.translatedText}
          onChange={(e) =>
            onSubtitleChange(subtitle.id, "translatedText", e.target.value)
          }
        />
      </TableCell>
      <TableCell>
        <Input
          className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
          placeholder="빈칸 텍스트를 입력하세요..."
          value={subtitle.blankedText}
          onChange={(e) =>
            onSubtitleChange(subtitle.id, "blankedText", e.target.value)
          }
        />
      </TableCell>
      <TableCell>
        <Input
          className="bg-transparent border-0 p-1 h-auto focus-visible:ring-1 focus-visible:ring-blue-500"
          placeholder="설명을 입력하세요..."
          value={subtitle.explanation}
          onChange={(e) =>
            onSubtitleChange(subtitle.id, "explanation", e.target.value)
          }
        />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-green-600"
            onClick={() => onAdd(subtitle.id)}
            title="아래에 추가"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-red-600"
            onClick={() => onDelete(subtitle.id)}
            title="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onMoveUp(subtitle.id)}
            disabled={isFirst}
            title="위로 이동"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-600 hover:text-blue-600 disabled:opacity-30"
            onClick={() => onMoveDown(subtitle.id)}
            disabled={isLast}
            title="아래로 이동"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수: subtitle 객체만 비교
  return (
    prevProps.subtitle.id === nextProps.subtitle.id &&
    prevProps.subtitle.startTime === nextProps.subtitle.startTime &&
    prevProps.subtitle.endTime === nextProps.subtitle.endTime &&
    prevProps.subtitle.originText === nextProps.subtitle.originText &&
    prevProps.subtitle.translatedText === nextProps.subtitle.translatedText &&
    prevProps.subtitle.blankedText === nextProps.subtitle.blankedText &&
    prevProps.subtitle.explanation === nextProps.subtitle.explanation &&
    prevProps.index === nextProps.index &&
    prevProps.totalCount === nextProps.totalCount &&
    prevProps.youtubePlayer === nextProps.youtubePlayer
  );
});

