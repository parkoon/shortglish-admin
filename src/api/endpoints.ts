/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Endpoints
 * 모든 API 호출 함수들을 도메인별로 관리
 */

import { supabase } from "@/lib/supabase";
import { getTableName } from "@/lib/table-names";
import type {
  Video,
  Subtitle,
  VideoFormData,
  SubtitleFormData,
  Category,
  CategoryFormData,
  User,
  UsersResponse,
  PushMessage,
  PushMessageFormData,
} from "./types";

// ============================================
// Video API
// ============================================

/**
 * 영상 목록 조회 (Admin용 - 모든 상태 포함)
 */
export const fetchVideos = async (): Promise<Video[]> => {
  const { data: videos, error: videosError } = await supabase
    .from(getTableName("video"))
    .select("*")
    .order("created_at", { ascending: false });

  if (videosError) {
    throw new Error(`Failed to fetch videos: ${videosError.message}`);
  }

  if (!videos || videos.length === 0) {
    return [];
  }

  // 카테고리 정보 조회
  const categoryIds = [
    ...new Set(videos.map((v) => v.category_id).filter(Boolean)),
  ];

  if (categoryIds.length === 0) {
    return videos.map((v) => ({ ...v, category: null }));
  }

  const { data: categories, error: categoriesError } = await supabase
    .from(getTableName("video_category"))
    .select("*")
    .in("id", categoryIds);

  if (categoriesError) {
    // 카테고리 조회 실패해도 비디오는 반환
    return videos.map((v) => ({ ...v, category: null }));
  }

  const categoryMap = new Map((categories || []).map((cat) => [cat.id, cat]));

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
    .from(getTableName("video"))
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
    .from(getTableName("video"))
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
    .from(getTableName("video_category"))
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
    .from(getTableName("video_category"))
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
    .from(getTableName("video_category"))
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
    .from(getTableName("video_category"))
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
    .from(getTableName("video_subtitle"))
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
    .from(getTableName("video_subtitle"))
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
    .from(getTableName("video_subtitle"))
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
    .from(getTableName("video_subtitle"))
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
    .from(getTableName("video_subtitle"))
    .delete()
    .eq("id", subtitleId);

  if (error) {
    throw new Error(`Failed to delete subtitle: ${error.message}`);
  }
};

// ============================================
// User API
// ============================================

/**
 * 유저 목록 조회 (Admin용 - 페이지네이션 포함)
 * Supabase auth.users 테이블에 접근
 *
 * 참고: auth.users는 직접 쿼리할 수 없으므로,
 * 별도의 public.users 테이블이 있거나 RLS 정책이 설정되어 있어야 합니다.
 * 또는 Supabase의 auth.users를 조회하려면 Admin API가 필요합니다.
 */
export const fetchUsers = async (
  page: number = 1,
  pageSize: number = 10
): Promise<UsersResponse> => {
  // 페이지네이션을 위한 offset 계산
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // auth.users는 직접 쿼리할 수 없으므로,
  // 별도의 public.users 테이블을 사용하거나
  // Supabase의 auth schema를 통해 접근해야 합니다.
  //
  // 일단 auth.users를 조회하려고 시도하되,
  // 작동하지 않으면 별도 테이블을 사용해야 합니다.

  // 방법 1: public.users 테이블이 있다고 가정
  const {
    data: usersData,
    error: usersError,
    count,
  } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (usersError) {
    // public.users 테이블이 없으면 auth.users를 조회하려고 시도
    // 하지만 일반 클라이언트로는 auth.users에 직접 접근할 수 없습니다.
    throw new Error(
      `Failed to fetch users: ${usersError.message}. Note: auth.users requires Admin API access.`
    );
  }

  // database.ts의 Tables<"users"> 타입으로 변환
  const users: User[] = (usersData || []) as User[];

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages,
  };
};

// ============================================
// Push Message API
// ============================================

/**
 * 푸시 메시지 목록 조회 (Admin용)
 */
export const fetchPushMessages = async (): Promise<PushMessage[]> => {
  const { data, error } = await supabase
    .from(getTableName("push_message"))
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch push messages: ${error.message}`);
  }

  return (data || []) as PushMessage[];
};

/**
 * 푸시 메시지 생성 (Admin용)
 */
export const createPushMessage = async (
  message: PushMessageFormData
): Promise<PushMessage> => {
  const { data, error } = await supabase
    .from(getTableName("push_message"))
    .insert({
      description: message.description || null,
      template_code: message.template_code,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create push message: ${error.message}`);
  }

  return data as PushMessage;
};

/**
 * 푸시 메시지 수정 (Admin용)
 */
export const updatePushMessage = async (
  id: string,
  message: Partial<PushMessageFormData>
): Promise<PushMessage> => {
  const { data, error } = await supabase
    .from(getTableName("push_message"))
    .update(message)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update push message: ${error.message}`);
  }

  return data as PushMessage;
};

/**
 * 푸시 메시지 삭제 (Admin용)
 */
export const deletePushMessage = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(getTableName("push_message"))
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete push message: ${error.message}`);
  }
};

/**
 * 푸시 메시지 발송 (Admin용)
 * status를 'sent'로 변경하고 sent_at을 현재 시간으로 설정
 */
export const sendPushMessage = async (id: string): Promise<PushMessage> => {
  const { data, error } = await supabase
    .from(getTableName("push_message"))
    .update({
      sent_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send push message: ${error.message}`);
  }

  return data as PushMessage;
};
