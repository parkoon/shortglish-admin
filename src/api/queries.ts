/**
 * React Query Hooks
 *
 * 모든 useQuery 훅을 도메인별로 관리
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchVideos,
  fetchSubtitles,
  fetchCategories,
  fetchUsers,
  fetchPushMessages,
  fetchActiveUsers,
} from "./endpoints";
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

// ============================================
// User Queries
// ============================================

/**
 * 유저 목록 조회 hook (Admin용 - 페이지네이션 포함)
 */
export const useUsersQuery = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: queryKeys.users.all(page, pageSize),
    queryFn: () => fetchUsers(page, pageSize),
  });
};

/**
 * 활성 유저 목록 조회 hook (Admin용 - deleted_at이 null인 모든 유저)
 */
export const useActiveUsersQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.active,
    queryFn: fetchActiveUsers,
  });
};

// ============================================
// Push Message Queries
// ============================================

/**
 * 푸시 메시지 목록 조회 hook (Admin용)
 */
export const usePushMessagesQuery = () => {
  return useQuery({
    queryKey: queryKeys.pushMessages.all,
    queryFn: fetchPushMessages,
  });
};
