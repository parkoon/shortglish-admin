"use client";

import type { YouTubePlayer as YouTubePlayerType } from "@/api";
import { useYouTubeInfoQuery, useCategoriesQuery } from "@/api/queries";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchVideos } from "@/api/endpoints";
import { queryKeys } from "@/api/query-keys";
import { VideoInfoCard } from "../_components/VideoInfoCard";
import { SubtitleEditorTable } from "../_components/SubtitleEditorTable";
import { useSubtitlePlayback } from "../_components/useSubtitlePlayback";
import { saveSubtitleData } from "../_components/saveSubtitleData";
import type { SubtitleRow } from "../_components/types";

export default function SubtitleCreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { data: videoInfo, isLoading, error } = useYouTubeInfoQuery(videoId);
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesQuery();
  const [subtitles, setSubtitles] = useState<SubtitleRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayerType | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { playSubtitle } = useSubtitlePlayback(youtubePlayer);

  // videoInfo가 변경될 때 상태 초기화
  useEffect(() => {
    if (!videoInfo) {
      setSubtitles([]);
      setTitle("");
      setDescription("");
      setCategoryId(null);
      return;
    }

    setTitle(videoInfo.title);
    setDescription("");
    setSubtitles(
      videoInfo.subtitles.map((sub, index) => ({
        id: index + 1,
        startTime: sub.startTime,
        endTime: sub.endTime,
        text: sub.en,
        translation: sub.ko || "",
        description: "",
      }))
    );

    // 기존 영상 정보 로드
    fetchVideos()
      .then((videos) => {
        const existingVideo = videos.find((v) => v.id === videoId);
        if (existingVideo?.category_id) {
          setCategoryId(existingVideo.category_id);
        }
      })
      .catch((error) => {
        console.error("기존 영상 정보 로드 실패:", error);
      });
  }, [videoInfo, videoId]);

  const handleSubtitleChange = (
    id: number,
    field: keyof SubtitleRow,
    value: string | number
  ) => {
    setSubtitles((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        if (field === "startTime" || field === "endTime") {
          return {
            ...sub,
            [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
          };
        }
        return { ...sub, [field]: value };
      })
    );
  };

  const handleSaveAll = async () => {
    if (!videoInfo || !title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await saveSubtitleData({
        videoId,
        videoData: {
          id: videoId,
          title: title.trim(),
          thumbnail: videoInfo.thumbnail,
          description: description.trim() || undefined,
          duration: videoInfo.duration,
          status: "draft",
          category_id: categoryId,
        },
        subtitles,
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.videos.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subtitles.byVideo(videoId),
      });

      alert("저장되었습니다.");
    } catch (error) {
      console.error("저장 중 오류:", error);
      alert(
        error instanceof Error
          ? `저장 중 오류가 발생했습니다: ${error.message}`
          : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">
            영상 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg text-red-600">
            {error instanceof Error
              ? error.message
              : "영상 정보를 불러올 수 없습니다."}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/subtitle-creator")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (!videoInfo) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div />
          <Button className="h-10" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장하기
              </>
            )}
          </Button>
        </div>

        <VideoInfoCard
          videoId={videoId}
          duration={videoInfo.duration}
          title={title}
          description={description}
          categoryId={categoryId}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onCategoryChange={setCategoryId}
          onPlayerReady={setYoutubePlayer}
        />

        <SubtitleEditorTable
          subtitles={subtitles}
          youtubePlayer={youtubePlayer}
          onSubtitleChange={handleSubtitleChange}
          onPlay={playSubtitle}
        />
      </div>
    </div>
  );
}
