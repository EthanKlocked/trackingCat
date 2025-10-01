/**
 * 타이머 관련 상수
 */

export const TIMER_CONSTANTS = {
  // 타이머 업데이트 간격 (ms)
  UPDATE_INTERVAL: 1000,

  // 최소 산책 시간 (ms) - 너무 짧은 세션 방지
  MIN_WALK_DURATION: 60000, // 1분

  // 자동 저장 간격 (ms)
  AUTO_SAVE_INTERVAL: 5000, // 5초
} as const;

export const STORAGE_KEYS = {
  SESSIONS: 'sessions',
  CURRENT_SESSION: 'current_session',
  TIMER_STATE: 'timer_state',
} as const;

export enum TimerStatus {
  IDLE = 'IDLE',           // 시작 전
  WALKING = 'WALKING',     // 산책 중
  RESTING = 'RESTING',     // 휴식 중 (캠핑)
  COMPLETED = 'COMPLETED', // 완료됨
}
