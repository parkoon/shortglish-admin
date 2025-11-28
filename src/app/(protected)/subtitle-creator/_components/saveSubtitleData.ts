import { createVideo, createSubtitles, fetchVideos } from "@/api/endpoints";
import { getTableName } from "@/lib/table-names";
import { supabase } from "@/lib/supabase";
import type { SubtitleRow } from "./types";

type SaveSubtitleDataParams = {
  videoId: string;
  videoData: {
    id: string;
    title: string;
    thumbnail: string;
    description?: string;
    duration: number;
    status: "draft";
    category_id: number;
  };
  subtitles: SubtitleRow[];
};

/**
 * 자막 데이터 저장 유틸 함수
 */
export async function saveSubtitleData({
  videoId,
  videoData,
  subtitles,
}: SaveSubtitleDataParams): Promise<void> {
  // 1. 영상 정보 저장 (upsert)
  const existingVideos = await fetchVideos();
  const existingVideo = existingVideos.find((v) => v.id === videoId);

  if (existingVideo) {
    const { error: updateError } = await supabase
      .from(getTableName("video"))
      .update(videoData)
      .eq("id", videoId);

    if (updateError) {
      throw new Error(`영상 업데이트 실패: ${updateError.message}`);
    }
  } else {
    await createVideo(videoData);
  }

  // 2. 기존 자막 삭제
  const { error: deleteError } = await supabase
    .from(getTableName("video_subtitle"))
    .delete()
    .eq("video_id", videoId);

  if (deleteError) {
    throw new Error(`기존 자막 삭제 실패: ${deleteError.message}`);
  }

  // 3. 새 자막 저장
  const subtitlesToSave = subtitles
    .filter((sub) => {
      return (
        !isNaN(sub.startTime) &&
        !isNaN(sub.endTime) &&
        sub.startTime >= 0 &&
        sub.endTime > sub.startTime &&
        sub.text.trim().length > 0 &&
        sub.translation.trim().length > 0
      );
    })
    .map((sub, index) => ({
      video_id: videoId,
      index,
      start_time: sub.startTime,
      end_time: sub.endTime,
      origin_text: sub.text.trim(),
      blanked_text: sub.text.trim(),
      translation: sub.translation.trim(),
    }));

  if (subtitlesToSave.length > 0) {
    await createSubtitles(videoId, subtitlesToSave);
  }
}

