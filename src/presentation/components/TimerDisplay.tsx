/**
 * TimerDisplay 컴포넌트
 * 타이머 시간 표시
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../../utils';
import { theme } from '../theme';

interface TimerDisplayProps {
  duration: number; // ms
  label: string;
  color?: string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  duration,
  label,
  color = theme.colors.textDark,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={[styles.time, { color }]}>{formatTime(duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing.xs,
  },
  time: {
    fontSize: 28, // 커스텀 크기 유지 (화면에 맞춤)
    fontWeight: theme.typography.fontWeight.bold,
  },
});
