"use client";

import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import type { SubtitleFormData } from "@/api";
import { formatTime } from "./utils";

type PendingSubtitlesListProps = {
  pendingSubtitles: SubtitleFormData[];
  onRemove: (index: number) => void;
  onSave: () => void;
  isSaving: boolean;
  error: Error | null;
};

export function PendingSubtitlesList({
  pendingSubtitles,
  onRemove,
  onSave,
  isSaving,
  error,
}: PendingSubtitlesListProps) {
  if (pendingSubtitles.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 shrink-0 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-orange-600">
          임시 자막 ({pendingSubtitles.length}개)
        </h3>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-3 w-3" />
          {isSaving ? "저장 중..." : "자막 저장"}
        </Button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {pendingSubtitles.map((subtitle, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between rounded-lg border border-orange-200 bg-orange-50 p-2"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-orange-700">
                  #{subtitle.index}
                </span>
                <span className="text-xs text-orange-600">
                  {formatTime(subtitle.start_time)} -{" "}
                  {formatTime(subtitle.end_time)}
                </span>
              </div>
              <p className="text-xs text-gray-700 line-clamp-1">
                {subtitle.origin_text}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(idx)}
              className="ml-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-800">
          에러: {error.message}
        </div>
      )}
    </div>
  );
}

