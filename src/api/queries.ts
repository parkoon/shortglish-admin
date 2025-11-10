/**
 * React Query Hooks
 *
 * 모든 useQuery 훅을 도메인별로 관리
 */

import { useQuery } from "@tanstack/react-query";
import { fetchVideos, fetchSubtitles, fetchCategories } from "./endpoints";
import { queryKeys } from "./query-keys";

// ============================================
// Video Queries
// ============================================

/**
 * 영상 목록 조회 hook (Admin용)
 */
export const useVideosQuery = () => {
  return useQuery({
    queryKey: queryKeys.videos.all,
    queryFn: fetchVideos,
  });
};

// ============================================
// Subtitle Queries
// ============================================

/**
 * 자막 데이터 조회 hook (Admin용)
 */
export const useSubtitlesQuery = (
  videoId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: queryKeys.subtitles.byVideo(videoId!),
    queryFn: () => fetchSubtitles(videoId!),
    enabled: !!videoId && enabled,
  });
};

// ============================================
// Category Queries
// ============================================

/**
 * 카테고리 목록 조회 hook (Admin용)
 */
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: fetchCategories,
  });
};
