import { useRef, useEffect } from "react";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";

/**
 * 자막 재생 로직을 관리하는 커스텀 훅
 */
export function useSubtitlePlayback(youtubePlayer: YouTubePlayerType | null) {
  const animationFrameRef = useRef<number | null>(null);

  const clearPlaybackAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return clearPlaybackAnimation;
  }, []);

  const playSubtitle = (startTime: number, endTime: number) => {
    if (!youtubePlayer) return;

    if (isNaN(startTime) || isNaN(endTime) || startTime < 0 || endTime <= startTime) {
      alert("올바른 시간을 입력해주세요");
      return;
    }

    clearPlaybackAnimation();

    youtubePlayer.seekTo(startTime, true);
    youtubePlayer.playVideo();

    const checkPlayback = () => {
      if (!youtubePlayer) {
        clearPlaybackAnimation();
        return;
      }

      const currentTime = youtubePlayer.getCurrentTime();
      if (currentTime >= endTime) {
        youtubePlayer.pauseVideo();
        clearPlaybackAnimation();
      } else {
        animationFrameRef.current = requestAnimationFrame(checkPlayback);
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkPlayback);
  };

  return { playSubtitle };
}

