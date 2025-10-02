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
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    minWidth: 80,
  },
  label: {
    fontSize: 10,
    marginBottom: 2,
    color: '#000',
  },
  time: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#000',
  },
});
