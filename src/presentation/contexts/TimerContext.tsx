/**
 * TimerContext
 * 타이머 상태 및 액션을 전역으로 관리
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TimerState, Session, INITIAL_TIMER_STATE } from '../../domain/models';
import { TimerUseCase } from '../../domain/usecases';
import { LocalSessionRepository, LocalTimerStateRepository } from '../../data/repositories';
import { TimerStatus, TIMER_CONSTANTS } from '../../constants';

// Repository 인스턴스 생성 (싱글톤)
const sessionRepository = new LocalSessionRepository();
const timerStateRepository = new LocalTimerStateRepository();
const timerUseCase = new TimerUseCase(sessionRepository, timerStateRepository);

interface TimerContextValue {
  // 상태
  timerState: TimerState;
  currentWalkDuration: number;
  currentRestDuration: number;
  isLoading: boolean;

  // 액션
  startWalk: () => Promise<void>;
  pauseWalk: () => Promise<void>;
  resumeWalk: () => Promise<void>;
  completeWalk: () => Promise<Session>;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_TIMER_STATE);
  const [currentWalkDuration, setCurrentWalkDuration] = useState(0);
  const [currentRestDuration, setCurrentRestDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 앱 시작 시 상태 복원
   */
  useEffect(() => {
    const restoreState = async () => {
      try {
        const restoredState = await timerUseCase.restoreState();
        setTimerState(restoredState);
        updateCurrentDurations(restoredState);
      } catch (error) {
        console.error('[TimerContext] Error restoring state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreState();
  }, []);

  /**
   * 타이머 업데이트 (1초마다)
   */
  useEffect(() => {
    if (
      timerState.status === TimerStatus.WALKING ||
      timerState.status === TimerStatus.RESTING
    ) {
      // 인터벌 시작
      intervalRef.current = setInterval(() => {
        updateCurrentDurations(timerState);
      }, TIMER_CONSTANTS.UPDATE_INTERVAL);
    } else {
      // 인터벌 정지
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.status, timerState.currentSegmentStartedAt]);

  /**
   * 앱 백그라운드/포그라운드 상태 감지
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [timerState]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // 포그라운드로 복귀 시 상태 복원
      try {
        const restoredState = await timerUseCase.restoreState();
        setTimerState(restoredState);
        updateCurrentDurations(restoredState);
      } catch (error) {
        console.error('[TimerContext] Error restoring state on app resume:', error);
      }
    }
  };

  /**
   * 현재 경과 시간 업데이트
   */
  const updateCurrentDurations = (state: TimerState) => {
    const { walkDuration, restDuration } = timerUseCase.calculateCurrentDuration(state);
    setCurrentWalkDuration(walkDuration);
    setCurrentRestDuration(restDuration);
  };

  /**
   * 산책 시작
   */
  const startWalk = async () => {
    try {
      const newState = await timerUseCase.startWalk();
      setTimerState(newState);
      updateCurrentDurations(newState);
    } catch (error) {
      console.error('[TimerContext] Error starting walk:', error);
      throw error;
    }
  };

  /**
   * 산책 일시정지 (휴식)
   */
  const pauseWalk = async () => {
    try {
      const newState = await timerUseCase.pauseWalk(timerState);
      setTimerState(newState);
      updateCurrentDurations(newState);
    } catch (error) {
      console.error('[TimerContext] Error pausing walk:', error);
      throw error;
    }
  };

  /**
   * 산책 재개
   */
  const resumeWalk = async () => {
    try {
      const newState = await timerUseCase.resumeWalk(timerState);
      setTimerState(newState);
      updateCurrentDurations(newState);
    } catch (error) {
      console.error('[TimerContext] Error resuming walk:', error);
      throw error;
    }
  };

  /**
   * 산책 완료
   */
  const completeWalk = async (): Promise<Session> => {
    try {
      const session = await timerUseCase.completeWalk(timerState);
      setTimerState(INITIAL_TIMER_STATE);
      setCurrentWalkDuration(0);
      setCurrentRestDuration(0);
      return session;
    } catch (error) {
      console.error('[TimerContext] Error completing walk:', error);
      throw error;
    }
  };

  const value: TimerContextValue = {
    timerState,
    currentWalkDuration,
    currentRestDuration,
    isLoading,
    startWalk,
    pauseWalk,
    resumeWalk,
    completeWalk,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};

/**
 * TimerContext Hook
 */
export const useTimer = (): TimerContextValue => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
