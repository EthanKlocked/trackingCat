/**
 * 테마 통합 export
 * 앱 전체에서 사용할 디자인 시스템
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, elevation } from './spacing';

/**
 * 통합 테마 객체
 */
export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  elevation,
} as const;

export type Theme = typeof theme;
