/**
 * Session Repository 인터페이스
 * 세션 데이터 접근 계약 정의
 */

import { Session, CreateSessionInput } from '../models';

export interface ISessionRepository {
  /**
   * 세션 저장
   */
  save(session: Session): Promise<void>;

  /**
   * 세션 조회 (ID로)
   */
  getById(id: string): Promise<Session | null>;

  /**
   * 모든 세션 조회
   */
  getAll(): Promise<Session[]>;

  /**
   * 날짜 범위로 세션 조회
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;

  /**
   * 세션 삭제
   */
  delete(id: string): Promise<void>;

  /**
   * 모든 세션 삭제 (개발/테스트용)
   */
  deleteAll(): Promise<void>;
}
