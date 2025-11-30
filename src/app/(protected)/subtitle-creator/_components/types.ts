/**
 * 자막 제작 관련 타입 정의
 */

export type SubtitleRow = {
  id: number;
  startTime: number;
  endTime: number;
  originText: string;
  translatedText: string;
  blankedText: string;
  explanation: string;
};

export type SubtitleJsonInput = {
  subtitles: Array<{
    startTime: number;
    endTime: number;
    originText: string;
    translatedText: string;
    blankedText: string;
    explanation: string;
  }>;
};

// 하위 호환성을 위한 타입 별칭
export type SubtitleRowV2 = SubtitleRow;

