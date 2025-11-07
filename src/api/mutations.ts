/**
 * API Mutations
 *
 * 데이터를 생성/수정/삭제하는 mutation 함수들
 */

import { createVideo, createSubtitles } from "./endpoints";
import type { VideoFormData, SubtitleFormData } from "./types";
import type { Video, Subtitle } from "./types";

// ============================================
// Video Mutations
// ============================================

/**
 * 비디오 생성 mutation 함수
 */
export const createVideoMutation = async (
  video: VideoFormData
): Promise<Video> => {
  return createVideo(video);
};

// ============================================
// Subtitle Mutations
// ============================================

/**
 * 자막 일괄 생성 mutation 함수
 */
export const createSubtitlesMutation = async (
  videoId: string,
  subtitles: SubtitleFormData[]
): Promise<Subtitle[]> => {
  return createSubtitles(videoId, subtitles);
};
