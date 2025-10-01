/**
 * 간격(Spacing) 시스템
 * 일관된 레이아웃을 위한 간격 값
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const elevation = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
} as const;
