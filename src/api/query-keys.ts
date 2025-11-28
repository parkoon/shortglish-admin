/**
 * Query Keys Factory
 *
 * React Query의 query key를 중앙에서 관리하는 factory 패턴
 * 타입 안전성과 재사용성을 보장합니다.
 */

export const queryKeys = {
  videos: {
    all: ["videos"] as const,
  },
  subtitles: {
    byVideo: (videoId: string) => ["subtitles", videoId] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  users: {
    all: (page: number, pageSize: number) => ["users", page, pageSize] as const,
    active: ["users", "active"] as const, // 활성 유저 목록 조회용
  },
  pushMessages: {
    all: ["pushMessages"] as const,
  },
  youtubeInfo: {
    byVideoId: (videoId: string) => ["youtubeInfo", videoId] as const,
  },
};
