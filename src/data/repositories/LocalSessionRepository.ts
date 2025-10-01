/**
 * LocalSessionRepository 구현체
 * AsyncStorage를 사용한 Session 저장소
 */

import { Session } from '../../domain/models';
import { ISessionRepository } from '../../domain/repositories';
import { LocalStorage } from '../storage';
import { STORAGE_KEYS } from '../../constants';

export class LocalSessionRepository implements ISessionRepository {
  private readonly storageKey = STORAGE_KEYS.SESSIONS;

  /**
   * 모든 세션을 메모리에 로드
   */
  private async loadSessions(): Promise<Session[]> {
    const sessions = await LocalStorage.getItem<Session[]>(this.storageKey);
    return sessions || [];
  }

  /**
   * 세션 배열을 저장소에 저장
   */
  private async saveSessions(sessions: Session[]): Promise<void> {
    await LocalStorage.setItem(this.storageKey, sessions);
  }

  /**
   * 세션 저장 (업데이트 또는 추가)
   */
  async save(session: Session): Promise<void> {
    const sessions = await this.loadSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      // 기존 세션 업데이트
      sessions[existingIndex] = session;
    } else {
      // 새 세션 추가
      sessions.push(session);
    }

    await this.saveSessions(sessions);
  }

  /**
   * ID로 세션 조회
   */
  async getById(id: string): Promise<Session | null> {
    const sessions = await this.loadSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  /**
   * 모든 세션 조회 (최신순)
   */
  async getAll(): Promise<Session[]> {
    const sessions = await this.loadSessions();
    // 최신순 정렬
    return sessions.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  /**
   * 날짜 범위로 세션 조회
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const sessions = await this.loadSessions();
    return sessions.filter((session) => {
      const completedAt = new Date(session.completedAt);
      return completedAt >= startDate && completedAt <= endDate;
    });
  }

  /**
   * 세션 삭제
   */
  async delete(id: string): Promise<void> {
    const sessions = await this.loadSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await this.saveSessions(filtered);
  }

  /**
   * 모든 세션 삭제
   */
  async deleteAll(): Promise<void> {
    await LocalStorage.removeItem(this.storageKey);
  }
}
