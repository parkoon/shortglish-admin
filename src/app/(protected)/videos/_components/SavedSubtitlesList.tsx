"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Subtitle } from "@/api";
import { formatTime } from "./utils";

/**
 * 빈칸 처리된 텍스트를 렌더링 (연한 배경으로 표시)
 */
function renderBlankedText(blankedText: string) {
  if (!blankedText) return null;

  // {word} 패턴을 찾아서 연한 배경으로 표시
  const pattern = /\{([^}]+)\}/g;
  const parts: Array<{ text: string; isBlanked: boolean }> = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(blankedText)) !== null) {
    // {word} 이전의 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({
        text: blankedText.slice(lastIndex, match.index),
        isBlanked: false,
      });
    }

    // {word} 패턴의 내용 추가 (연한 배경)
    parts.push({
      text: match[1],
      isBlanked: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // 남은 텍스트 추가
  if (lastIndex < blankedText.length) {
    parts.push({
      text: blankedText.slice(lastIndex),
      isBlanked: false,
    });
  }

  return (
    <span className="inline">
      {parts.map((part, idx) => {
        if (part.isBlanked) {
          return (
            <span key={idx} className="bg-blue-100 text-blue-700 px-1 rounded">
              {part.text}
            </span>
          );
        }
        return <span key={idx}>{part.text}</span>;
      })}
    </span>
  );
}

type SavedSubtitlesListProps = {
  subtitles: Subtitle[] | undefined;
  isLoading: boolean;
  onSubtitleClick: (startTime: number, endTime: number) => void;
  onEditSubtitle: (subtitle: Subtitle) => void;
  onDeleteSubtitle: (subtitleId: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreating: boolean;
  error: Error | null;
};

export function SavedSubtitlesList({
  subtitles,
  isLoading,
  onSubtitleClick,
  onEditSubtitle,
  onDeleteSubtitle,
  isUpdating,
  isDeleting,
  isCreating,
  error,
}: SavedSubtitlesListProps) {
  if (isLoading) {
    return <div className="text-sm text-gray-500">로딩 중...</div>;
  }

  const handleEditClick = (subtitle: Subtitle, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditSubtitle(subtitle);
  };

  const handleDeleteClick = (subtitleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSubtitle(subtitleId);
  };

  return (
    <>
      {!subtitles || subtitles.length === 0 ? (
        <div className="text-sm text-gray-500">
          자막이 없습니다. 위 버튼에서 자막을 추가하세요.
        </div>
      ) : (
        <div className="space-y-2">
          {subtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              className="rounded-lg border p-3 transition-colors cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    #{subtitle.index}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(subtitle.start_time)} -{" "}
                    {formatTime(subtitle.end_time)}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEditClick(subtitle, e)}
                    disabled={isUpdating || isDeleting || isCreating}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeleteClick(subtitle.id, e)}
                    disabled={isUpdating || isDeleting || isCreating}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div
                className="space-y-1"
                onClick={() => {
                  onSubtitleClick(subtitle.start_time, subtitle.end_time);
                }}
              >
                <p className="text-sm font-medium text-gray-900">
                  {subtitle.origin_text}
                </p>
                <p className="text-xs text-gray-600">
                  {renderBlankedText(subtitle.blanked_text)}
                </p>
                <p className="text-xs text-blue-600">{subtitle.translation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-2 text-xs text-red-800">
          에러: {error.message}
        </div>
      )}
    </>
  );
}
