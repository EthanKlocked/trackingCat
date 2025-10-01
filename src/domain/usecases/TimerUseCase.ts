/**
 * TimerUseCase
 * 타이머의 핵심 비즈니스 로직
 */

import { Session, TimerState, INITIAL_TIMER_STATE } from '../models';
import { ISessionRepository, ITimerStateRepository } from '../repositories';
import { TimerStatus } from '../../constants';
import { generateUUID } from '../../utils';

export class TimerUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private timerStateRepository: ITimerStateRepository
  ) {}

  /**
   * 산책 시작
   */
  async startWalk(): Promise<TimerState> {
    const now = new Date();
    const newState: TimerState = {
      status: TimerStatus.WALKING,
      currentSessionId: generateUUID(),
      startedAt: now,
      totalWalkDuration: 0,
      totalRestDuration: 0,
      currentSegmentStartedAt: now,
      lastUpdatedAt: now,
    };

    await this.timerStateRepository.save(newState);
    return newState;
  }

  /**
   * 산책 일시정지 (휴식 시작)
   */
  async pauseWalk(currentState: TimerState): Promise<TimerState> {
    if (currentState.status !== TimerStatus.WALKING) {
      throw new Error('Cannot pause: not walking');
    }

    const now = new Date();
    const segmentDuration = this.calculateSegmentDuration(
      currentState.currentSegmentStartedAt!,
      now
    );

    const newState: TimerState = {
      ...currentState,
      status: TimerStatus.RESTING,
      totalWalkDuration: currentState.totalWalkDuration + segmentDuration,
      currentSegmentStartedAt: now,
      lastUpdatedAt: now,
    };

    await this.timerStateRepository.save(newState);
    return newState;
  }

  /**
   * 산책 재개 (휴식 종료)
   */
  async resumeWalk(currentState: TimerState): Promise<TimerState> {
    if (currentState.status !== TimerStatus.RESTING) {
      throw new Error('Cannot resume: not resting');
    }

    const now = new Date();
    const segmentDuration = this.calculateSegmentDuration(
      currentState.currentSegmentStartedAt!,
      now
    );

    const newState: TimerState = {
      ...currentState,
      status: TimerStatus.WALKING,
      totalRestDuration: currentState.totalRestDuration + segmentDuration,
      currentSegmentStartedAt: now,
      lastUpdatedAt: now,
    };

    await this.timerStateRepository.save(newState);
    return newState;
  }

  /**
   * 산책 완료
   */
  async completeWalk(currentState: TimerState): Promise<Session> {
    if (
      currentState.status !== TimerStatus.WALKING &&
      currentState.status !== TimerStatus.RESTING
    ) {
      throw new Error('Cannot complete: no active session');
    }

    const now = new Date();
    const segmentDuration = this.calculateSegmentDuration(
      currentState.currentSegmentStartedAt!,
      now
    );

    // 마지막 구간 시간 계산
    let finalWalkDuration = currentState.totalWalkDuration;
    let finalRestDuration = currentState.totalRestDuration;

    if (currentState.status === TimerStatus.WALKING) {
      finalWalkDuration += segmentDuration;
    } else {
      finalRestDuration += segmentDuration;
    }

    // 세션 생성
    const session: Session = {
      id: currentState.currentSessionId!,
      walkDuration: finalWalkDuration,
      restDuration: finalRestDuration,
      startedAt: currentState.startedAt!,
      completedAt: now,
    };

    // 세션 저장
    await this.sessionRepository.save(session);

    // 타이머 상태 초기화
    await this.timerStateRepository.clear();

    return session;
  }

  /**
   * 타이머 상태 복원 (앱 재시작 시)
   */
  async restoreState(): Promise<TimerState> {
    const savedState = await this.timerStateRepository.get();

    if (!savedState) {
      return INITIAL_TIMER_STATE;
    }

    // 백그라운드에 있던 시간 계산
    const now = new Date();
    const lastUpdated = new Date(savedState.lastUpdatedAt);
    const backgroundDuration = now.getTime() - lastUpdated.getTime();

    // 진행 중이었다면 시간 보정
    if (
      savedState.status === TimerStatus.WALKING ||
      savedState.status === TimerStatus.RESTING
    ) {
      const restoredState: TimerState = {
        ...savedState,
        // 백그라운드 시간을 현재 구간에 추가
        lastUpdatedAt: now,
      };

      return restoredState;
    }

    return savedState;
  }

  /**
   * 현재 경과 시간 계산 (UI 업데이트용)
   */
  calculateCurrentDuration(state: TimerState): {
    walkDuration: number;
    restDuration: number;
  } {
    const now = new Date();
    let currentSegmentDuration = 0;

    if (state.currentSegmentStartedAt) {
      currentSegmentDuration = this.calculateSegmentDuration(
        state.currentSegmentStartedAt,
        now
      );
    }

    return {
      walkDuration:
        state.status === TimerStatus.WALKING
          ? state.totalWalkDuration + currentSegmentDuration
          : state.totalWalkDuration,
      restDuration:
        state.status === TimerStatus.RESTING
          ? state.totalRestDuration + currentSegmentDuration
          : state.totalRestDuration,
    };
  }

  /**
   * 구간 시간 계산 (ms)
   */
  private calculateSegmentDuration(startTime: Date, endTime: Date): number {
    return endTime.getTime() - new Date(startTime).getTime();
  }
}
