import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

type CaptionTrack = {
  language_code?: string;
  kind?: string;
};

type TranscriptSegment = {
  type?: string;
  start_ms?: string | number;
  end_ms?: string | number;
  snippet?: { text?: string };
};

type Subtitle = {
  startTime: number;
  endTime: number;
  text: string;
};

/**
 * 영어 자막 트랙 찾기
 */
function findEnglishCaptionTrack(
  captionTracks: CaptionTrack[]
): CaptionTrack | undefined {
  // 일반 자막 우선 찾기
  const regularTrack = captionTracks.find(
    (track) =>
      track.language_code === "en" || track.language_code?.startsWith("en")
  );
  if (regularTrack) return regularTrack;

  // 자동생성 자막 찾기
  return captionTracks.find(
    (track) =>
      track.kind === "asr" &&
      (track.language_code === "en" || track.language_code?.startsWith("en"))
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
function parseTranscriptSegments(segments: TranscriptSegment[]): Subtitle[] {
  const result: Subtitle[] = [];
  const seen = new Set<string>();

  for (const segment of segments) {
    if (segment.type !== "TranscriptSegment") {
      continue;
    }

    const startMs = parseMilliseconds(segment.start_ms);
    const endMs = parseMilliseconds(segment.end_ms);
    const text = segment.snippet?.text?.trim() || "";

    if (!text) {
      continue;
    }

    // 중복 방지
    const key = `${startMs}-${endMs}-${text}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    result.push({
      startTime: startMs / 1000,
      endTime: endMs / 1000,
      text,
    });
  }

  return result.sort((a, b) => a.startTime - b.startTime);
}

/**
 * transcript 객체에서 segments 추출
 */
function extractSegments(transcript: unknown): TranscriptSegment[] {
  const transcriptData = transcript as {
    transcript?: {
      content?: {
        body?: {
          initial_segments?: TranscriptSegment[];
          segment_list?: TranscriptSegment[];
        };
      };
    };
  };

  const body = transcriptData.transcript?.content?.body;
  return body?.initial_segments || body?.segment_list || [];
}

/**
 * 영어 자막 가져오기
 */
async function fetchEnglishSubtitles(videoId: string): Promise<Subtitle[]> {
  try {
    const youtube = await Innertube.create({
      lang: "en",
      location: "US",
    });

    const info = await youtube.getInfo(videoId);
    const captionTracks = info.captions?.caption_tracks;

    if (!captionTracks || captionTracks.length === 0) {
      return [];
    }

    const track = findEnglishCaptionTrack(captionTracks);
    if (!track) {
      return [];
    }

    const transcript = await info.getTranscript();
    if (!transcript) {
      return [];
    }

    const segments = extractSegments(transcript);
    if (segments.length === 0) {
      return [];
    }

    return parseTranscriptSegments(segments);
  } catch (error) {
    console.error("Error fetching English subtitles:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId parameter is required" },
        { status: 400 }
      );
    }

    const subtitles = await fetchEnglishSubtitles(videoId);

    return NextResponse.json({ subtitles });
  } catch (error) {
    console.error("Error fetching YouTube subtitles:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube subtitles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
