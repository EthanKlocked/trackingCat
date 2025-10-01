/**
 * 시간 포맷팅 유틸리티
 */

/**
 * 밀리초를 HH:MM:SS 형식으로 변환
 * @param ms 밀리초
 * @returns "00:00:00" 형식의 문자열
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * 밀리초를 MM:SS 형식으로 변환 (1시간 미만용)
 * @param ms 밀리초
 * @returns "00:00" 형식의 문자열
 */
export function formatTimeShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return [minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * 밀리초를 읽기 쉬운 형식으로 변환
 * @param ms 밀리초
 * @returns "1시간 30분" 형식의 문자열
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

/**
 * Date 객체를 YYYY-MM-DD 형식으로 변환
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
