/**
 * WalkScreen
 * 메인 산책 화면
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTimer } from '../contexts';
import { Button, TimerDisplay, BackgroundImage, CatAnimation } from '../components';
import { BackgroundImageRef } from '../components/BackgroundImage';
import { theme } from '../theme';
import { TimerStatus } from '../../constants';

export const WalkScreen: React.FC = () => {
  const backgroundRef = useRef<BackgroundImageRef>(null);

  const {
    timerState,
    currentWalkDuration,
    currentRestDuration,
    isLoading,
    startWalk,
    pauseWalk,
    resumeWalk,
    completeWalk,
  } = useTimer();

  const handleStart = async () => {
    try {
      await startWalk();
    } catch (error) {
      console.error('Failed to start walk:', error);
    }
  };

  const handlePause = async () => {
    try {
      await pauseWalk();
    } catch (error) {
      console.error('Failed to pause walk:', error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeWalk();
    } catch (error) {
      console.error('Failed to resume walk:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const session = await completeWalk();
      console.log('Walk completed:', session);

      // 배경 애니메이션 리셋
      backgroundRef.current?.reset();

      // TODO: 완료 애니메이션/이벤트 추가 가능
      // - 축하 메시지 표시
      // - 완료 사운드 재생
      // - 결과 화면으로 이동 등
    } catch (error) {
      console.error('Failed to complete walk:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 배경 (전체 화면) */}
      <BackgroundImage
        ref={backgroundRef}
        isScrolling={timerState.status === TimerStatus.WALKING}
      />

      {/* 헤더 (상단 고정) */}
      <View style={styles.header}>
        <Text style={styles.title}>🐱 산책하는 고양이</Text>
      </View>

      {/* 애니메이션 영역 (중앙 고정) */}
      <View style={styles.animationArea}>
        <CatAnimation status={timerState.status} />
        {timerState.status === TimerStatus.IDLE && (
          <Text style={styles.statusText}>산책을 시작해보세요!</Text>
        )}
      </View>

      {/* 하단 고정 영역 */}
      <View style={styles.bottomContainer}>
        {/* 타이머 표시 */}
        {timerState.status !== TimerStatus.IDLE && (
          <View style={styles.timerContainer}>
            <TimerDisplay
              duration={currentWalkDuration}
              label="산책 시간"
              color={theme.colors.walking}
            />
            <TimerDisplay
              duration={currentRestDuration}
              label="휴식 시간"
              color={theme.colors.resting}
            />
          </View>
        )}

        {/* 컨트롤 버튼 */}
        <View style={styles.controls}>
          {timerState.status === TimerStatus.IDLE && (
            <Button title="산책 시작" onPress={handleStart} variant="primary" />
          )}

          {timerState.status === TimerStatus.WALKING && (
            <>
              <Button title="잠깐 쉼" onPress={handlePause} variant="secondary" />
              <Button
                title="산책 완료"
                onPress={handleComplete}
                variant="outline"
                style={styles.buttonSpacing}
              />
            </>
          )}

          {timerState.status === TimerStatus.RESTING && (
            <>
              <Button title="산책 재개" onPress={handleResume} variant="primary" />
              <Button
                title="산책 완료"
                onPress={handleComplete}
                variant="outline"
                style={styles.buttonSpacing}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  animationArea: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  controls: {
    gap: 16,
  },
  buttonSpacing: {
    marginTop: 8,
  },
});
