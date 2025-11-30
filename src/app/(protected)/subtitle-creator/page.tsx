"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Check, Loader2 } from "lucide-react";
import { YouTubePlayer } from "@/app/(protected)/videos/_components/YouTubePlayer";
import { SubtitleEditorTable } from "./_components/SubtitleEditorTable";
import { useSubtitlePlayback } from "@/app/(protected)/subtitle-creator/_components/useSubtitlePlayback";
import { useYouTubeSubtitlesQuery } from "@/api/queries";
import { JsonFileUploader } from "./_components/JsonFileUploader";
import { exportSubtitleJson, downloadJson } from "./_components/utils";
import type { SubtitleRow } from "./_components/types";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";

export default function SubtitleCreatorPage() {
  const [inputVideoId, setInputVideoId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [subtitles, setSubtitles] = useState<SubtitleRow[]>([]);
  const [youtubePlayer, setYoutubePlayer] = useState<YouTubePlayerType | null>(
    null
  );
  const [fileName] = useState<string>("subtitles.json");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { playSubtitle } = useSubtitlePlayback(youtubePlayer);

  // React Query로 자막 가져오기
  const {
    data: subtitlesData,
    isLoading: isLoadingSubtitles,
    error: subtitleError,
  } = useYouTubeSubtitlesQuery(videoId);

  // API에서 가져온 자막 데이터를 SubtitleRowV2 형식으로 변환
  const convertedSubtitlesFromApi = useMemo(() => {
    if (!subtitlesData || subtitlesData.length === 0) {
      return null;
    }

    return subtitlesData.map((sub, index) => ({
      id: index + 1,
      startTime: sub.startTime,
      endTime: sub.endTime,
      originText: sub.text,
      translatedText: "",
      blankedText: "",
      explanation: "",
    }));
  }, [subtitlesData]);

  // API 데이터가 로드되면 subtitles 상태 업데이트 (JSON 파일 업로드 시에는 무시)
  useEffect(() => {
    // JSON 파일이 업로드된 경우 무시
    if (uploadedFileName) {
      return;
    }

    if (convertedSubtitlesFromApi) {
      setSubtitles(convertedSubtitlesFromApi);
    } else if (subtitlesData && subtitlesData.length === 0) {
      setSubtitles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convertedSubtitlesFromApi, subtitlesData]);

  const handleConfirmVideoId = () => {
    const trimmedId = inputVideoId.trim();
    if (!trimmedId) {
      alert("YouTube ID를 입력해주세요.");
      return;
    }
    setVideoId(trimmedId);
    setSubtitles([]); // 새 영상 로드 시 기존 자막 초기화
    setUploadedFileName(null); // 파일명도 초기화
  };

  const handleFileParsed = (parsedSubtitles: SubtitleRow[]) => {
    setSubtitles(parsedSubtitles);
    setUploadError(null);
  };

  const handleFileError = (error: string) => {
    setUploadError(error);
    setUploadedFileName(null);
  };

  const handleSubtitleChange = useCallback(
    (id: number, field: keyof SubtitleRow, value: string | number) => {
      setSubtitles((prev) =>
        prev.map((sub) => {
          if (sub.id !== id) return sub;
          if (field === "startTime" || field === "endTime") {
            return {
              ...sub,
              [field]:
                typeof value === "string" ? parseFloat(value) || 0 : value,
            };
          }
          return { ...sub, [field]: value };
        })
      );
    },
    []
  );

  const handleAddSubtitle = useCallback((afterId: number) => {
    setSubtitles((prev) => {
      const afterIndex = prev.findIndex((sub) => sub.id === afterId);
      if (afterIndex === -1) {
        const newId =
          prev.length > 0 ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
        return [
          ...prev,
          {
            id: newId,
            startTime: 0,
            endTime: 0,
            originText: "",
            translatedText: "",
            blankedText: "",
            explanation: "",
          },
        ];
      }

      const newId =
        prev.length > 0 ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      const newSubtitle: SubtitleRow = {
        id: newId,
        startTime: 0,
        endTime: 0,
        originText: "",
        translatedText: "",
        blankedText: "",
        explanation: "",
      };

      return [
        ...prev.slice(0, afterIndex + 1),
        newSubtitle,
        ...prev.slice(afterIndex + 1),
      ];
    });
  }, []);

  const handleDeleteSubtitle = useCallback((id: number) => {
    if (confirm("이 자막을 삭제하시겠습니까?")) {
      setSubtitles((prev) => prev.filter((sub) => sub.id !== id));
    }
  }, []);

  const handleMoveUp = useCallback((id: number) => {
    setSubtitles((prev) => {
      const index = prev.findIndex((sub) => sub.id === id);
      if (index <= 0) return prev;

      const newSubtitles = [...prev];
      [newSubtitles[index - 1], newSubtitles[index]] = [
        newSubtitles[index],
        newSubtitles[index - 1],
      ];
      return newSubtitles;
    });
  }, []);

  const handleMoveDown = useCallback((id: number) => {
    setSubtitles((prev) => {
      const index = prev.findIndex((sub) => sub.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const newSubtitles = [...prev];
      [newSubtitles[index], newSubtitles[index + 1]] = [
        newSubtitles[index + 1],
        newSubtitles[index],
      ];
      return newSubtitles;
    });
  }, []);

  const handleDownload = useCallback(() => {
    if (subtitles.length === 0) {
      alert("다운로드할 자막이 없습니다.");
      return;
    }

    const jsonText = exportSubtitleJson(subtitles);
    downloadJson(jsonText, fileName);
  }, [subtitles, fileName]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">자막 제작</h1>
          <p className="mt-1 text-sm text-gray-600">
            YouTube ID와 JSON 파일을 입력하여 자막을 편집하세요
          </p>
        </div>

        {/* 입력 영역 */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
          {/* YouTube ID 입력 */}
          <div className="space-y-2">
            <Label
              htmlFor="youtube-id"
              className="text-sm font-medium text-gray-700"
            >
              YouTube ID
            </Label>
            <div className="flex gap-2 max-w-md">
              <Input
                id="youtube-id"
                value={inputVideoId}
                onChange={(e) => setInputVideoId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmVideoId();
                  }
                }}
                placeholder="예: dQw4w9WgXcQ"
                className="flex-1"
              />
              <Button
                onClick={handleConfirmVideoId}
                disabled={!inputVideoId.trim() || isLoadingSubtitles}
                className="shrink-0"
              >
                {isLoadingSubtitles ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로딩 중...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    확인
                  </>
                )}
              </Button>
            </div>
            {subtitleError && (
              <p className="text-sm text-red-600 mt-1">
                {subtitleError instanceof Error
                  ? subtitleError.message
                  : "자막을 불러올 수 없습니다."}
              </p>
            )}
          </div>
        </div>

        {/* YouTube 플레이어 */}
        {videoId && (
          <div className="h-[120px] aspect-video fixed top-8 right-12 rounded-lg overflow-hidden z-10">
            <YouTubePlayer
              videoId={videoId}
              className="h-full w-full"
              onPlayerReady={setYoutubePlayer}
            />
          </div>
        )}

        {/* 자막 편집 테이블 */}
        {subtitles.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">자막 편집</h2>
              <div className="flex items-center gap-2">
                <JsonFileUploader
                  onFileParsed={handleFileParsed}
                  onError={handleFileError}
                  onFileNameChange={setUploadedFileName}
                  fileName={uploadedFileName}
                  error={uploadError}
                />
                <Button onClick={handleDownload} className="h-10">
                  <Download className="mr-2 h-4 w-4" />
                  JSON 다운로드
                </Button>
              </div>
            </div>
            <SubtitleEditorTable
              subtitles={subtitles}
              youtubePlayer={youtubePlayer}
              onSubtitleChange={handleSubtitleChange}
              onPlay={playSubtitle}
              onAdd={handleAddSubtitle}
              onDelete={handleDeleteSubtitle}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>
        )}

        {/* 안내 메시지 */}
        {subtitles.length === 0 && videoId && !isLoadingSubtitles && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center text-sm text-blue-700">
            {subtitleError
              ? "자막을 불러올 수 없습니다. JSON 파일을 업로드하여 자막을 편집할 수 있습니다."
              : "자막이 없습니다. JSON 파일을 업로드하거나 YouTube에서 자막을 가져오세요."}
          </div>
        )}
      </div>
    </div>
  );
}
