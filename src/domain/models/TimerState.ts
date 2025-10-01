/**
 * TimerState 모델
 * 현재 진행 중인 타이머의 상태
 */

import { TimerStatus } from '../../constants';

export interface TimerState {
  /** 현재 상태 */
  status: TimerStatus;

  /** 현재 세션 ID (진행 중일 때만) */
  currentSessionId: string | null;

  /** 산책 시작 시간 */
  startedAt: Date | null;

  /** 누적 산책 시간 (ms) */
  totalWalkDuration: number;

  /** 누적 휴식 시간 (ms) */
  totalRestDuration: number;

  /** 현재 구간 시작 시간 (산책 또는 휴식 시작 시간) */
  currentSegmentStartedAt: Date | null;

  /** 마지막 업데이트 시간 (상태 복원용) */
  lastUpdatedAt: Date;
}

/**
 * 초기 타이머 상태
 */
export const INITIAL_TIMER_STATE: TimerState = {
  status: TimerStatus.IDLE,
  currentSessionId: null,
  startedAt: null,
  totalWalkDuration: 0,
  totalRestDuration: 0,
  currentSegmentStartedAt: null,
  lastUpdatedAt: new Date(),
};
