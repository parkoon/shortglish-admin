/**
 * 자막 제작 관련 타입 정의
 */

export type SubtitleRow = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
  translation: string;
  description: string;
};

