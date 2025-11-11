/**
 * 테이블 이름 유틸리티
 * 환경에 따라 적절한 테이블 이름을 반환합니다.
 *
 * 로컬 환경: baseName + "_dev"
 * 프로덕션 환경: baseName
 */

/**
 * 현재 환경이 프로덕션인지 확인
 */
function isProduction(): boolean {
  // NEXT_PUBLIC_ENV 환경 변수를 우선 확인
  const env = process.env.NEXT_PUBLIC_ENV;
  if (env === "production") return true;
  if (env === "development") return false;

  // NEXT_PUBLIC_ENV가 없으면 NODE_ENV 확인
  const nodeEnv = process.env.NODE_ENV;
  return nodeEnv === "production";
}

/**
 * 환경에 따라 테이블 이름을 반환합니다.
 *
 * @param baseName 기본 테이블 이름 (예: "video", "video_subtitle", "video_category")
 * @returns 환경에 맞는 테이블 이름
 *
 * @example
 * getTableName("video") // 로컬: "video_dev", 프로덕션: "video"
 * getTableName("video_subtitle") // 로컬: "video_subtitle_dev", 프로덕션: "video_subtitle"
 */
export function getTableName(baseName: string): string {
  if (isProduction()) {
    return baseName;
  }
  return `${baseName}_dev`;
}
