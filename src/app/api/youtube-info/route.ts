import { Innertube } from "youtubei.js";
import { NextResponse } from "next/server";

type CaptionTrack = {
  language_code?: string;
  kind?: string;
  name?: { text?: string };
};

type TranscriptSegment = {
  type?: string;
  start_ms?: string | number;
  end_ms?: string | number;
  snippet?: { text?: string };
};

type SubtitleItem = {
  startTime: number;
  endTime: number;
  text: string;
};

type Subtitle = {
  startTime: number;
  endTime: number;
  en: string;
  ko: string;
};

/**
 * 재생 시간을 초 단위로 추출
 */
function extractDuration(durationValue: unknown): number {
  if (typeof durationValue === "object" && durationValue !== null) {
    return (durationValue as { total_seconds?: number }).total_seconds || 0;
  }
  if (typeof durationValue === "number") {
    return durationValue;
  }
  return 0;
}

/**
 * 특정 언어의 자막 트랙 찾기
 */
function findCaptionTrack(
  captionTracks: CaptionTrack[],
  lang: "en" | "ko"
): CaptionTrack | undefined {
  // 일반 자막 우선 찾기
  const regularTrack = captionTracks.find(
    (track) =>
      track.language_code === lang || track.language_code?.startsWith(lang)
  );
  if (regularTrack) return regularTrack;

  // 자동생성 자막 찾기
  return captionTracks.find(
    (track) =>
      track.kind === "asr" &&
      (track.language_code === lang || track.language_code?.startsWith(lang))
  );
}

/**
 * 밀리초를 초로 변환
 */
function parseMilliseconds(value: string | number | undefined): number {
  if (typeof value === "string") {
    return parseInt(value, 10);
  }
  return value || 0;
}

/**
 * 트랜스크립트 세그먼트를 자막 형식으로 변환
 */
function parseTranscriptSegments(
  segments: TranscriptSegment[]
): Array<{ startTime: number; endTime: number; text: string }> {
  return segments
    .map((segment) => {
      // TranscriptSegment만 처리
      if (segment.type !== "TranscriptSegment") {
        return null;
      }

      const startMs = parseMilliseconds(segment.start_ms);
      const endMs = parseMilliseconds(segment.end_ms);
      const text = segment.snippet?.text?.trim() || "";

      // 빈 텍스트 제외
      if (!text) {
        return null;
      }

      return {
        startTime: startMs / 1000,
        endTime: endMs / 1000,
        text,
      };
    })
    .filter(
      (item): item is { startTime: number; endTime: number; text: string } =>
        item !== null
    );
}

/**
 * 특정 언어의 트랜스크립트 가져오기
 */
async function fetchTranscriptForLanguage(
  videoId: string,
  lang: "en" | "ko",
  location: string
): Promise<SubtitleItem[]> {
  try {
    const youtube = await Innertube.create({ lang, location });
    const info = await youtube.getInfo(videoId);
    const transcript = await info.getTranscript();

    const segments = transcript?.transcript?.content?.body?.initial_segments;
    if (!segments || segments.length === 0) {
      return [];
    }

    return parseTranscriptSegments(segments as TranscriptSegment[]);
  } catch (error) {
    console.warn(`Failed to fetch ${lang} transcript:`, error);
    return [];
  }
}

/**
 * 시간대별로 자막 병합
 */
function mergeSubtitlesByTime(
  enSubtitles: SubtitleItem[],
  koSubtitles: SubtitleItem[]
): Subtitle[] {
  const subtitleMap = new Map<
    string,
    { startTime: number; endTime: number; en: string; ko: string }
  >();

  // 영어 자막을 기준으로 맵 생성
  enSubtitles.forEach((sub) => {
    const key = `${sub.startTime}-${sub.endTime}`;
    subtitleMap.set(key, {
      startTime: sub.startTime,
      endTime: sub.endTime,
      en: sub.text,
      ko: "",
    });
  });

  // 한국어 자막 매칭 (1초 이내 차이면 같은 자막으로 간주)
  const TIME_THRESHOLD = 1;
  koSubtitles.forEach((koSub) => {
    let bestMatch: string | null = null;
    let minDiff = Infinity;

    subtitleMap.forEach((value, key) => {
      const timeDiff = Math.abs(value.startTime - koSub.startTime);
      if (timeDiff < minDiff && timeDiff < TIME_THRESHOLD) {
        minDiff = timeDiff;
        bestMatch = key;
      }
    });

    if (bestMatch) {
      const existing = subtitleMap.get(bestMatch);
      if (existing) {
        existing.ko = koSub.text;
      }
    } else {
      // 매칭되지 않으면 새로 추가
      const key = `${koSub.startTime}-${koSub.endTime}`;
      subtitleMap.set(key, {
        startTime: koSub.startTime,
        endTime: koSub.endTime,
        en: "",
        ko: koSub.text,
      });
    }
  });

  // 시간순 정렬하여 반환
  return Array.from(subtitleMap.values()).sort(
    (a, b) => a.startTime - b.startTime
  );
}

/**
 * 자막 정보 가져오기 (영어와 한국어 모두)
 */
async function fetchSubtitles(
  info: Awaited<ReturnType<typeof Innertube.prototype.getInfo>>,
  videoId: string
): Promise<Subtitle[]> {
  const captionTracks = info.captions?.caption_tracks;

  // Early return: 자막이 없는 경우
  if (!captionTracks || captionTracks.length === 0) {
    console.warn("No captions available for this video");
    return [];
  }

  // 영어와 한국어 자막 트랙 찾기
  const enTrack = findCaptionTrack(captionTracks, "en");
  const koTrack = findCaptionTrack(captionTracks, "ko");

  // Early return: 둘 다 없으면 빈 배열 반환
  if (!enTrack && !koTrack) {
    console.warn("No English or Korean captions found");
    return [];
  }

  // 각 언어별 트랜스크립트 병렬로 가져오기
  const [enSubtitles, koSubtitles] = await Promise.all([
    enTrack
      ? fetchTranscriptForLanguage(videoId, "en", "US")
      : Promise.resolve<SubtitleItem[]>([]),
    koTrack
      ? fetchTranscriptForLanguage(videoId, "ko", "KR")
      : Promise.resolve<SubtitleItem[]>([]),
  ]);

  // 시간대별로 병합
  return mergeSubtitlesByTime(enSubtitles, koSubtitles);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    // Early return: videoId 검증
    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parameter is required" },
        { status: 400 }
      );
    }

    // Innertube 인스턴스 생성
    const youtube = await Innertube.create({
      lang: "ko",
      location: "KR",
    });

    // 영상 기본 정보 조회
    const info = await youtube.getInfo(videoId);

    // 썸네일 URL 추출
    const thumbnail =
      info.basic_info?.thumbnail?.[0]?.url ||
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

    // 재생 시간 추출
    const duration = extractDuration(info.basic_info?.duration);

    // 자막 정보 조회
    const subtitles = await fetchSubtitles(info, videoId);

    // 응답 반환
    return NextResponse.json({
      title: info.basic_info?.title || "",
      thumbnail,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      duration: Number(duration),
      subtitles,
    });
  } catch (error) {
    console.error("Error fetching YouTube info:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube video information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
