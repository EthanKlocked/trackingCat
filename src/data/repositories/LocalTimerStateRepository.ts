/**
 * LocalTimerStateRepository 구현체
 * AsyncStorage를 사용한 TimerState 저장소
 */

import { TimerState } from '../../domain/models';
import { ITimerStateRepository } from '../../domain/repositories';
import { LocalStorage } from '../storage';
import { STORAGE_KEYS } from '../../constants';

export class LocalTimerStateRepository implements ITimerStateRepository {
  private readonly storageKey = STORAGE_KEYS.TIMER_STATE;

  /**
   * 타이머 상태 저장
   */
  async save(state: TimerState): Promise<void> {
    await LocalStorage.setItem(this.storageKey, state);
  }

  /**
   * 타이머 상태 조회
   */
  async get(): Promise<TimerState | null> {
    return await LocalStorage.getItem<TimerState>(this.storageKey);
  }

  /**
   * 타이머 상태 삭제
   */
  async clear(): Promise<void> {
    await LocalStorage.removeItem(this.storageKey);
  }
}
