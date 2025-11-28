/**
 * 자막 제작 관련 유틸리티 함수
 */

/**
 * 재생시간을 MM:SS 형식으로 표시
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
