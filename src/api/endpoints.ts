/**
 * API Endpoints
 * 모든 API 호출 함수들을 도메인별로 관리
 */

import { supabase } from "@/lib/supabase";
import type { Video, Subtitle, VideoFormData, SubtitleFormData } from "./types";

// ============================================
// Video API
// ============================================

/**
 * 비디오 목록 조회 (Admin용 - 모든 상태 포함)
 */
export const fetchVideos = async (): Promise<Video[]> => {
  const { data, error } = await supabase
    .from("video_dev")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }

  return data || [];
};

/**
 * 비디오 생성 (Admin용)
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
 * 자막 일괄 생성 (Admin용)
 */
export const createSubtitles = async (
  videoId: string,
  subtitles: SubtitleFormData[]
): Promise<Subtitle[]> => {
  const { data, error } = await supabase
    .from("video_subtitle_dev")
    .insert(subtitles.map((subtitle) => ({ ...subtitle, video_id: videoId })))
    .select();

  if (error) {
    throw new Error(`Failed to create subtitles: ${error.message}`);
  }

  return data || [];
};
