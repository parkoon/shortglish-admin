import type { SubtitleJsonInput, SubtitleRow } from "./types";

/**
 * JSON 파일 파싱 및 검증
 */
export function parseSubtitleJson(jsonText: string): SubtitleRow[] {
  try {
    const data: SubtitleJsonInput = JSON.parse(jsonText);

    if (!data.subtitles || !Array.isArray(data.subtitles)) {
      throw new Error("JSON 파일에 subtitles 배열이 없습니다.");
    }

    return data.subtitles.map((sub, index) => ({
      id: index + 1,
      startTime: sub.startTime,
      endTime: sub.endTime,
      originText: sub.originText || "",
      translatedText: sub.translatedText || "",
      blankedText: sub.blankedText || "",
      explanation: sub.explanation || "",
    }));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("유효하지 않은 JSON 형식입니다.");
    }
    throw error;
  }
}

/**
 * 편집된 자막을 JSON 형식으로 변환
 */
export function exportSubtitleJson(subtitles: SubtitleRow[]): string {
  const jsonData: SubtitleJsonInput = {
    subtitles: subtitles.map((sub) => ({
      startTime: sub.startTime,
      endTime: sub.endTime,
      originText: sub.originText,
      translatedText: sub.translatedText || "",
      blankedText: sub.blankedText || "",
      explanation: sub.explanation || "",
    })),
  };

  return JSON.stringify(jsonData, null, 2);
}

/**
 * JSON 파일 다운로드
 */
export function downloadJson(
  jsonText: string,
  filename: string = "subtitles.json"
): void {
  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
