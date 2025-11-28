"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, YouTubePlayer as YouTubePlayerType } from "@/api";
import { YouTubePlayer } from "@/app/(protected)/videos/_components/YouTubePlayer";
import { formatDuration } from "./utils";

type VideoInfoCardProps = {
  videoId: string;
  duration: number;
  title: string;
  description: string;
  categoryId: number | null;
  categories: Category[] | undefined;
  categoriesLoading: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onCategoryChange: (categoryId: number) => void;
  onPlayerReady: (player: YouTubePlayerType) => void;
};

export function VideoInfoCard({
  videoId,
  duration,
  title,
  description,
  categoryId,
  categories,
  categoriesLoading,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onPlayerReady,
}: VideoInfoCardProps) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="w-full md:w-80 aspect-video shrink-0 order-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <YouTubePlayer videoId={videoId} onPlayerReady={onPlayerReady} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 order-2">
          <div className="flex flex-col gap-4">
            <p className="text-gray-500 text-sm font-normal leading-normal">
              재생시간: {formatDuration(duration)}
            </p>
            <div className="space-y-2">
              <Label
                htmlFor="video-title"
                className="text-sm font-medium text-gray-700"
              >
                제목 *
              </Label>
              <Input
                id="video-title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-2xl font-bold"
                placeholder="영상 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="video-category"
                className="text-sm font-medium text-gray-700"
              >
                카테고리 *
              </Label>
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">카테고리 로딩 중...</div>
              ) : !categories || categories.length === 0 ? (
                <div className="text-sm text-gray-500">
                  카테고리가 없습니다.{" "}
                  <a
                    href="/categories"
                    className="font-semibold underline hover:text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    먼저 카테고리를 등록해주세요
                  </a>
                  .
                </div>
              ) : (
                <Select
                  value={categoryId?.toString() || ""}
                  onValueChange={(value) => onCategoryChange(Number(value))}
                >
                  <SelectTrigger id="video-category" className="w-full">
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="video-description"
                className="text-sm font-medium text-gray-700"
              >
                설명
              </Label>
              <Input
                id="video-description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="영상 설명을 입력하세요 (선택사항)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
