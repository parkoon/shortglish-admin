/**
 * API 레이어 공통 유틸리티
 */

/**
 * snake_case를 camelCase로 변환
 */
export const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

/**
 * 객체의 모든 키를 snake_case에서 camelCase로 변환
 */
export const objectToCamel = <T = any>(obj: Record<string, any>): T => {
  const result: any = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[snakeToCamel(key)] = obj[key]
    }
  }

  return result as T
}

/**
 * 배열의 모든 객체를 camelCase로 변환
 */
export const arrayToCamel = <T = any>(arr: Record<string, any>[]): T[] => {
  return arr.map(objectToCamel)
}

