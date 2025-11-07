/**
 * 도메인 타입 정의
 *
 * 모든 도메인 타입을 한 곳에서 관리
 * 인프라에 독립적 (Supabase, Firebase 등 상관없이 사용)
 */

import { z } from "zod";

// ============================================
// Video Domain
// ============================================

export const videoSchema = z.object({
  id: z.string().min(1, "비디오 ID를 입력하세요"),
  title: z.string().min(1, "제목을 입력하세요"),
  thumbnail: z.string().url("올바른 URL을 입력하세요"),
  description: z.string().optional(),
  duration: z.number().min(1, "재생시간을 입력하세요"),
  status: z.enum(["draft", "published"]),
});

export const subtitleSchema = z.object({
  start_time: z.number().min(0, "시작 시간을 입력하세요"),
  end_time: z.number().min(0, "종료 시간을 입력하세요"),
  has_subtitle: z.boolean().default(true),
  origin_text: z.string().optional(),
  blanked_text: z.string().optional(),
  translation: z.string().optional(),
});

export const subtitleFormDataSchema = subtitleSchema.extend({
  index: z.number().min(0),
});

export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  description: string | null;
  duration: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type Subtitle = {
  id: number;
  video_id: string;
  index: number;
  start_time: number;
  end_time: number;
  origin_text: string;
  blanked_text: string;
  translation: string;
  created_at: string;
  updated_at: string;
};

export type VideoFormData = z.infer<typeof videoSchema>;
export type SubtitleFormInput = z.infer<typeof subtitleSchema>;
export type SubtitleFormData = z.infer<typeof subtitleFormDataSchema>;

export type YouTubePlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
};
