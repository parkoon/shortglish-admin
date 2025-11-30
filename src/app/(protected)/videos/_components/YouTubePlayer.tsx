"use client";

import { useEffect, useRef } from "react";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: HTMLElement | string | null,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
          };
        }
      ) => YouTubePlayerType;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YouTubePlayerProps = {
  videoId: string;
  className?: string;
  onPlayerReady?: (player: YouTubePlayerType) => void;
};

export function YouTubePlayer({
  videoId,
  className,
  onPlayerReady,
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    let playerInstance: YouTubePlayerType | null = null;

    // YouTube iframe API 스크립트 로드
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (playerRef.current && window.YT) {
          const player = new window.YT.Player(playerRef.current, {
            videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
            },
          });
          playerInstance = player;
          onPlayerReady?.(player);
        }
      };
    } else if (window.YT) {
      const player = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
        },
      });
      playerInstance = player;
      onPlayerReady?.(player);
    }

    return () => {
      if (playerInstance) {
        playerInstance.destroy();
      }
    };
  }, [videoId, onPlayerReady]);

  return (
    <div
      ref={playerRef}
      className={cn("aspect-video w-full bg-black", className)}
    />
  );
}
