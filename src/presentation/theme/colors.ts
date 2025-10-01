/**
 * 색상 팔레트
 * 디자인 변경 시 이 파일만 수정하면 전체 앱에 반영됨
 */

export const colors = {
  // Primary Colors (메인 브랜드 컬러)
  primary: '#FF9A8B',      // 따뜻한 핑크 (고양이 테마)
  primaryLight: '#FFB5A7',
  primaryDark: '#E8897A',

  // Secondary Colors
  secondary: '#A8E6CF',    // 부드러운 민트 (자연/산책 테마)
  secondaryLight: '#C7F0DB',
  secondaryDark: '#8FD3B3',

  // Background
  background: '#FFF9F5',   // 따뜻한 오프화이트
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text
  text: '#2C3E50',         // 진한 그레이
  textSecondary: '#7F8C8D',
  textLight: '#BDC3C7',
  textInverse: '#FFFFFF',

  // Status Colors
  success: '#A8E6CF',      // 성공 (완료)
  warning: '#FFD93D',      // 경고
  error: '#FF6B6B',        // 에러
  info: '#74B9FF',         // 정보

  // Walking State (산책 중)
  walking: '#FFD93D',      // 활기찬 노랑

  // Resting State (휴식 중)
  resting: '#A8E6CF',      // 편안한 민트

  // UI Elements
  border: '#E8E8E8',
  disabled: '#BDC3C7',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ColorKey = keyof typeof colors;
