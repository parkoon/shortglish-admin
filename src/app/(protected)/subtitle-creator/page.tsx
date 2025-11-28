"use client";

import { useState } from "react";
import { SubtitleCreatorAddDialog } from "./_components/SubtitleCreatorAddDialog";
import { SubtitleCreatorListTable } from "./_components/SubtitleCreatorListTable";
import { useVideosQuery } from "@/api";

export default function SubtitleCreatorPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: videos, isLoading, error } = useVideosQuery();

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

  return (
    <div className="bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">자막 제작</h1>
            <p className="mt-1 text-sm text-gray-600">
              총 {videos?.length || 0}개의 영상이 있습니다
            </p>
          </div>
          <SubtitleCreatorAddDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          />
        </div>

        <SubtitleCreatorListTable videos={videos || []} />
      </div>
    </div>
  );
}
