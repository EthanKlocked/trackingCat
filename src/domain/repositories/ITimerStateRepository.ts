/**
 * TimerState Repository 인터페이스
 * 타이머 상태 저장/복원 계약 정의
 */

import { TimerState } from '../models';

export interface ITimerStateRepository {
  /**
   * 현재 타이머 상태 저장
   */
  save(state: TimerState): Promise<void>;

  /**
   * 현재 타이머 상태 조회
   */
  get(): Promise<TimerState | null>;

  /**
   * 타이머 상태 삭제
   */
  clear(): Promise<void>;
}
