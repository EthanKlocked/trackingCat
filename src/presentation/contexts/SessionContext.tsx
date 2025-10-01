/**
 * SessionContext
 * 완료된 세션 기록 관리
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '../../domain/models';
import { LocalSessionRepository } from '../../data/repositories';

const sessionRepository = new LocalSessionRepository();

interface SessionContextValue {
  sessions: Session[];
  isLoading: boolean;
  refreshSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 세션 목록 로드
   */
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const allSessions = await sessionRepository.getAll();
      setSessions(allSessions);
    } catch (error) {
      console.error('[SessionContext] Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 초기 로드
   */
  useEffect(() => {
    loadSessions();
  }, []);

  /**
   * 세션 목록 새로고침
   */
  const refreshSessions = async () => {
    await loadSessions();
  };

  /**
   * 세션 삭제
   */
  const deleteSession = async (id: string) => {
    try {
      await sessionRepository.delete(id);
      await refreshSessions();
    } catch (error) {
      console.error('[SessionContext] Error deleting session:', error);
      throw error;
    }
  };

  const value: SessionContextValue = {
    sessions,
    isLoading,
    refreshSessions,
    deleteSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * SessionContext Hook
 */
export const useSessions = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessions must be used within SessionProvider');
  }
  return context;
};
