"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, AlertCircle } from "lucide-react";
import { parseSubtitleJson } from "./utils";
import type { SubtitleRow } from "./types";

type JsonFileUploaderProps = {
  onFileParsed: (subtitles: SubtitleRow[]) => void;
  onError?: (error: string) => void;
  onFileNameChange?: (fileName: string) => void;
  fileName?: string | null;
  error?: string | null;
};

export function JsonFileUploader({
  onFileParsed,
  onError,
  onFileNameChange,
  fileName,
  error,
}: JsonFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      onError?.("JSON 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      const text = await file.text();
      const subtitles = parseSubtitleJson(text);
      onFileNameChange?.(file.name);
      onFileParsed(subtitles);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "파일을 읽는 중 오류가 발생했습니다.";
      onError?.(errorMessage);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className="shrink-0"
      >
        <FileText className="mr-2 h-4 w-4" />
        JSON 파일 선택
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      {fileName && (
        <span className="text-sm text-green-600 font-medium ml-2">
          {fileName}
        </span>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 ml-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
