/**
 * 도메인 타입 정의
 *
 * 모든 도메인 타입을 한 곳에서 관리
 * 인프라에 독립적 (Supabase, Firebase 등 상관없이 사용)
 */

import { z } from "zod";

// ============================================
// Category Domain
// ============================================

export const categorySchema = z.object({
  name: z.string().min(1, "카테고리 이름을 입력하세요"),
  order: z
    .number()
    .nullable()
    .optional()
    .refine((val) => val === undefined || val === null || !isNaN(val), {
      message: "올바른 숫자를 입력하세요",
    }),
});

export type Category = {
  id: number;
  name: string;
  order: number | null;
  created_at: string;
  updated_at: string;
};

export type CategoryFormData = z.infer<typeof categorySchema>;

// ============================================
// Video Domain
// ============================================

// 폼 입력용 스키마 (category_id가 nullable/optional)
export const videoFormSchema = z.object({
  id: z.string().min(1, "영상 ID를 입력하세요"),
  title: z.string().min(1, "제목을 입력하세요"),
  thumbnail: z.string().url("올바른 URL을 입력하세요"),
  description: z.string().optional(),
  duration: z.number().min(1, "재생시간을 입력하세요"),
  status: z.enum(["draft", "published"]),
  category_id: z
    .union([z.number(), z.null(), z.undefined()])
    .refine((val) => val !== null && val !== undefined, {
      message: "카테고리를 선택해주세요",
    })
    .refine((val) => typeof val === "number" && val >= 1, {
      message: "카테고리를 선택해주세요",
    }),
  // 난이도: 1~5 단계 (나중에 확장 가능하도록 설정)
  difficulty: z
    .number()
    .int()
    .min(1, "난이도는 1 이상이어야 합니다")
    .max(5, "난이도는 5 이하여야 합니다")
    .nullable()
    .optional(),
});

// 최종 검증용 스키마 (transform 포함)
export const videoSchema = videoFormSchema.transform((data) => ({
  ...data,
  category_id: Number(data.category_id),
}));

// DB에 저장되는 자막 스키마 (has_subtitle 제외)
export const subtitleSchema = z.object({
  start_time: z.number().min(0, "시작 시간을 입력하세요"),
  end_time: z.number().min(0, "종료 시간을 입력하세요"),
  origin_text: z.string().min(1, "원본 텍스트를 입력하세요"),
  blanked_text: z.string().min(1, "빈칸 처리된 텍스트를 입력하세요"),
  translation: z.string().min(1, "번역을 입력하세요"),
});

// 폼 입력용 스키마 (has_subtitle 포함)
export const subtitleFormInputSchema = z.object({
  start_time: z.number().min(0, "시작 시간을 입력하세요"),
  end_time: z.number().min(0, "종료 시간을 입력하세요"),
  has_subtitle: z.boolean(),
  origin_text: z.string().optional(),
  blanked_text: z.string().optional(),
  translation: z.string().optional(),
});

// DB 저장용 스키마 (index 포함, has_subtitle 제외)
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
  category_id: number;
  category?: Category | null;
  difficulty: number | null;
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

// 폼 데이터 타입 (refine 검증 후 category_id는 항상 number)
export type VideoFormData = Omit<
  z.infer<typeof videoFormSchema>,
  "category_id"
> & {
  category_id: number;
};
export type SubtitleFormInput = z.infer<typeof subtitleFormInputSchema>;
export type SubtitleFormData = z.infer<typeof subtitleFormDataSchema>;

export type YouTubePlayer = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  destroy: () => void;
};
