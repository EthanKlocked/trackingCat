/**
 * Session 모델
 * 완료된 산책 세션의 데이터 구조
 */

export interface Session {
  /** 세션 고유 ID */
  id: string;

  /** 산책 시간 (ms) */
  walkDuration: number;

  /** 휴식 시간 (ms) */
  restDuration: number;

  /** 세션 시작 시간 */
  startedAt: Date;

  /** 세션 종료 시간 */
  completedAt: Date;

  // Phase 3에서 추가될 필드들 (미래 대비)
  /** 사용자 ID (Phase 3) */
  userId?: string;

  /** 고양이 ID (Phase 3) */
  catId?: string;

  /** 코스 ID (Phase 3) */
  courseId?: string;
}

/**
 * Session 생성을 위한 입력 데이터
 */
export interface CreateSessionInput {
  walkDuration: number;
  restDuration: number;
  startedAt: Date;
  completedAt: Date;
}
