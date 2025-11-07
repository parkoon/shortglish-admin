"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Subtitle, SubtitleFormData } from "@/api";
import { formatTime } from "./utils";
import { SubtitleEditDialog } from "./SubtitleEditDialog";

type SavedSubtitlesListProps = {
  subtitles: Subtitle[] | undefined;
  isLoading: boolean;
  onSubtitleClick: (startTime: number, endTime: number) => void;
  onAddSubtitle: (data: Partial<SubtitleFormData>) => void;
  onUpdateSubtitle: (
    subtitleId: number,
    subtitle: Partial<SubtitleFormData>
  ) => void;
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
  onAddSubtitle,
  onUpdateSubtitle,
  onDeleteSubtitle,
  isUpdating,
  isDeleting,
  isCreating,
  error,
}: SavedSubtitlesListProps) {
  const [editingSubtitle, setEditingSubtitle] = useState<Subtitle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="text-sm text-gray-500">로딩 중...</div>;
  }

  const handleAddClick = () => {
    setEditingSubtitle(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (subtitle: Subtitle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubtitle(subtitle);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (subtitleId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSubtitle(subtitleId);
  };

  const handleSave = (
    subtitleId: number | null,
    data: Partial<SubtitleFormData>
  ) => {
    if (subtitleId === null) {
      // 추가 모드
      onAddSubtitle(data);
    } else {
      // 수정 모드
      onUpdateSubtitle(subtitleId, data);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">저장된 자막</h3>
        <Button
          size="sm"
          onClick={handleAddClick}
          disabled={isCreating || isUpdating || isDeleting}
        >
          <Plus className="h-4 w-4 mr-1" />
          자막 추가
        </Button>
      </div>

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
                <p className="text-xs text-gray-600">{subtitle.blanked_text}</p>
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

      <SubtitleEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subtitle={editingSubtitle}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </>
  );
}
