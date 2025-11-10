/**
 * API Mutations
 *
 * 데이터를 생성/수정/삭제하는 mutation 함수들
 */

import {
  createVideo,
  updateVideo,
  createSubtitles,
  createSubtitle,
  updateSubtitle,
  deleteSubtitle,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./endpoints";
import type {
  VideoFormData,
  SubtitleFormData,
  CategoryFormData,
} from "./types";
import type { Video, Subtitle, Category } from "./types";

// ============================================
// Video Mutations
// ============================================

/**
 * 영상 생성 mutation 함수
 */
export const createVideoMutation = async (
  video: VideoFormData
): Promise<Video> => {
  return createVideo(video);
};

/**
 * 영상 수정 mutation 함수
 */
export const updateVideoMutation = async (
  videoId: string,
  video: Partial<VideoFormData>
): Promise<Video> => {
  return updateVideo(videoId, video);
};

// ============================================
// Subtitle Mutations
// ============================================

/**
 * 자막 단일 생성 mutation 함수
 */
export const createSubtitleMutation = async (
  videoId: string,
  subtitle: SubtitleFormData
): Promise<Subtitle> => {
  return createSubtitle(videoId, subtitle);
};

/**
 * 자막 수정 mutation 함수
 */
export const updateSubtitleMutation = async (
  subtitleId: number,
  subtitle: Partial<SubtitleFormData>
): Promise<Subtitle> => {
  return updateSubtitle(subtitleId, subtitle);
};

/**
 * 자막 삭제 mutation 함수
 */
export const deleteSubtitleMutation = async (
  subtitleId: number
): Promise<void> => {
  return deleteSubtitle(subtitleId);
};

/**
 * 자막 일괄 생성 mutation 함수
 */
export const createSubtitlesMutation = async (
  videoId: string,
  subtitles: SubtitleFormData[]
): Promise<Subtitle[]> => {
  return createSubtitles(videoId, subtitles);
};

// ============================================
// Category Mutations
// ============================================

/**
 * 카테고리 생성 mutation 함수
 */
export const createCategoryMutation = async (
  category: CategoryFormData
): Promise<Category> => {
  return createCategory(category);
};

/**
 * 카테고리 수정 mutation 함수
 */
export const updateCategoryMutation = async (
  categoryId: number,
  category: Partial<CategoryFormData>
): Promise<Category> => {
  return updateCategory(categoryId, category);
};

/**
 * 카테고리 삭제 mutation 함수
 */
export const deleteCategoryMutation = async (
  categoryId: number
): Promise<void> => {
  return deleteCategory(categoryId);
};
