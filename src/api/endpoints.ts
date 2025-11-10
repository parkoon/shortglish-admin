/**
 * API Endpoints
 * 모든 API 호출 함수들을 도메인별로 관리
 */

import { supabase } from "@/lib/supabase";
import type {
  Video,
  Subtitle,
  VideoFormData,
  SubtitleFormData,
  Category,
  CategoryFormData,
} from "./types";

// ============================================
// Video API
// ============================================

/**
 * 영상 목록 조회 (Admin용 - 모든 상태 포함)
 */
export const fetchVideos = async (): Promise<Video[]> => {
  const { data: videos, error: videosError } = await supabase
    .from("video_dev")
    .select("*")
    .order("created_at", { ascending: false });

  if (videosError) {
    throw new Error(`Failed to fetch videos: ${videosError.message}`);
  }

  if (!videos || videos.length === 0) {
    return [];
  }

  // 카테고리 정보 조회
  const categoryIds = [...new Set(videos.map((v) => v.category_id).filter(Boolean))];
  
  if (categoryIds.length === 0) {
    return videos.map((v) => ({ ...v, category: null }));
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("video_category")
    .select("*")
    .in("id", categoryIds);

  if (categoriesError) {
    // 카테고리 조회 실패해도 비디오는 반환
    return videos.map((v) => ({ ...v, category: null }));
  }

  const categoryMap = new Map(
    (categories || []).map((cat) => [cat.id, cat])
  );

  return videos.map((v) => ({
    ...v,
    category: v.category_id ? categoryMap.get(v.category_id) || null : null,
  }));
};

/**
 * 영상 생성 (Admin용)
 */
export const createVideo = async (video: VideoFormData): Promise<Video> => {
  const { data, error } = await supabase
    .from("video_dev")
    .insert([video])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create video: ${error.message}`);
  }

  return data;
};

/**
 * 영상 수정 (Admin용)
 */
export const updateVideo = async (
  videoId: string,
  video: Partial<VideoFormData>
): Promise<Video> => {
  const { data, error } = await supabase
    .from("video_dev")
    .update(video)
    .eq("id", videoId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update video: ${error.message}`);
  }

  return data;
};

// ============================================
// Category API
// ============================================

/**
 * 카테고리 목록 조회 (Admin용)
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("video_category")
    .select("*")
    .order("order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return data || [];
};

/**
 * 카테고리 생성 (Admin용)
 */
export const createCategory = async (
  category: CategoryFormData
): Promise<Category> => {
  const { data, error } = await supabase
    .from("video_category")
    .insert([category])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }

  return data;
};

/**
 * 카테고리 수정 (Admin용)
 */
export const updateCategory = async (
  categoryId: number,
  category: Partial<CategoryFormData>
): Promise<Category> => {
  const { data, error } = await supabase
    .from("video_category")
    .update(category)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }

  return data;
};

/**
 * 카테고리 삭제 (Admin용)
 */
export const deleteCategory = async (categoryId: number): Promise<void> => {
  const { error } = await supabase
    .from("video_category")
    .delete()
    .eq("id", categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

// ============================================
// Subtitle API
// ============================================

/**
 * 자막 데이터 조회 (Admin용)
 */
export const fetchSubtitles = async (videoId: string): Promise<Subtitle[]> => {
  const { data, error } = await supabase
    .from("video_subtitle_dev")
    .select("*")
    .eq("video_id", videoId)
    .order("index", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch subtitles: ${error.message}`);
  }

  return data || [];
};

/**
 * 자막 단일 생성 (Admin용)
 */
export const createSubtitle = async (
  videoId: string,
  subtitle: SubtitleFormData
): Promise<Subtitle> => {
  const { has_subtitle, ...subtitleWithoutHasSubtitle } = subtitle as any;
  const subtitleToInsert = {
    ...subtitleWithoutHasSubtitle,
    video_id: videoId,
  };

  const { data, error } = await supabase
    .from("video_subtitle_dev")
    .insert([subtitleToInsert])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subtitle: ${error.message}`);
  }

  return data;
};

/**
 * 자막 일괄 생성 (Admin용)
 */
export const createSubtitles = async (
  videoId: string,
  subtitles: SubtitleFormData[]
): Promise<Subtitle[]> => {
  // has_subtitle 필드는 DB에 저장하지 않음 (폼에서만 사용)
  const subtitlesToInsert = subtitles.map((subtitle) => {
    const { has_subtitle, ...subtitleWithoutHasSubtitle } = subtitle as any;
    return {
      ...subtitleWithoutHasSubtitle,
      video_id: videoId,
    };
  });

  const { data, error } = await supabase
    .from("video_subtitle_dev")
    .insert(subtitlesToInsert)
    .select();

  if (error) {
    throw new Error(`Failed to create subtitles: ${error.message}`);
  }

  return data || [];
};

/**
 * 자막 수정 (Admin용)
 */
export const updateSubtitle = async (
  subtitleId: number,
  subtitle: Partial<SubtitleFormData>
): Promise<Subtitle> => {
  const { has_subtitle, ...subtitleWithoutHasSubtitle } = subtitle as any;
  const subtitleToUpdate = subtitleWithoutHasSubtitle;

  const { data, error } = await supabase
    .from("video_subtitle_dev")
    .update(subtitleToUpdate)
    .eq("id", subtitleId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subtitle: ${error.message}`);
  }

  return data;
};

/**
 * 자막 삭제 (Admin용)
 */
export const deleteSubtitle = async (subtitleId: number): Promise<void> => {
  const { error } = await supabase
    .from("video_subtitle_dev")
    .delete()
    .eq("id", subtitleId);

  if (error) {
    throw new Error(`Failed to delete subtitle: ${error.message}`);
  }
};
