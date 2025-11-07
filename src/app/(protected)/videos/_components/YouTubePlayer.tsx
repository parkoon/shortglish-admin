"use client";

import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer as YouTubePlayerType } from "@/api";

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
  onPlayerReady?: (player: YouTubePlayerType) => void;
};

export function YouTubePlayer({ videoId, onPlayerReady }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<YouTubePlayerType | null>(null);

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
          setPlayer(player);
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
      setPlayer(player);
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
      className="aspect-video w-full rounded-lg bg-black"
    />
  );
}

