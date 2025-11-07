"use client";

import type { Subtitle } from "@/api";
import { formatTime } from "./utils";

type SavedSubtitlesListProps = {
  subtitles: Subtitle[] | undefined;
  isLoading: boolean;
  onSubtitleClick: (startTime: number) => void;
};

export function SavedSubtitlesList({
  subtitles,
  isLoading,
  onSubtitleClick,
}: SavedSubtitlesListProps) {
  if (isLoading) {
    return <div className="text-sm text-gray-500">로딩 중...</div>;
  }

  if (!subtitles || subtitles.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        자막이 없습니다. 위 폼에서 자막을 추가하세요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subtitles.map((subtitle) => (
        <div
          key={subtitle.id}
          onClick={() => onSubtitleClick(subtitle.start_time)}
          className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              #{subtitle.index}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(subtitle.start_time)} - {formatTime(subtitle.end_time)}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {subtitle.origin_text}
            </p>
            <p className="text-xs text-gray-600">{subtitle.blanked_text}</p>
            <p className="text-xs text-blue-600">{subtitle.translation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

