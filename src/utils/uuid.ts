/**
 * UUID 생성 유틸리티 (간단한 버전)
 */

/**
 * 간단한 UUID v4 생성
 * 참고: 프로덕션에서는 'uuid' 패키지 사용 권장
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
