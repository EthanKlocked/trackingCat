/**
 * CatAnimation
 * 고양이 애니메이션 (Lottie 기반)
 * TODO: 추후 커스텀 스프라이트 프레임 애니메이션으로 교체 가능하도록 설계됨
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { TimerStatus } from '../../constants';

interface CatAnimationProps {
  status: TimerStatus;
}

// 애니메이션 타입
type AnimationType = 'lottie' | 'sprite' | 'emoji';

// 현재 사용 중인 애니메이션 타입
const ANIMATION_TYPE: AnimationType = 'lottie';

export const CatAnimation: React.FC<CatAnimationProps> = ({ status }) => {
  const walkingLottieRef = useRef<LottieView>(null);
  const playingLottieRef = useRef<LottieView>(null);
  const relaxingLottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (ANIMATION_TYPE === 'lottie') {
      if (status === TimerStatus.WALKING && walkingLottieRef.current) {
        walkingLottieRef.current.play();
      } else if (status === TimerStatus.RESTING && playingLottieRef.current) {
        playingLottieRef.current.play();
      } else if (status === TimerStatus.IDLE && relaxingLottieRef.current) {
        relaxingLottieRef.current.play();
      }
    }
  }, [status]);

  const renderCat = () => {
    if (status === TimerStatus.WALKING) {
      if (ANIMATION_TYPE === 'lottie') {
        return (
          <View style={styles.catContainer}>
            <LottieView
              ref={walkingLottieRef}
              source={require('../../../assets/animations/cat_walking.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        );
      }
      // TODO: sprite 타입 추가 가능
    }

    if (status === TimerStatus.RESTING) {
      if (ANIMATION_TYPE === 'lottie') {
        return (
          <View style={styles.catContainer}>
            <LottieView
              ref={playingLottieRef}
              source={require('../../../assets/animations/cat_playing.json')}
              autoPlay
              loop
              style={styles.lottieSmall}
            />
          </View>
        );
      }
      // Fallback to emoji
      return (
        <View style={styles.campingContainer}>
          <Text style={styles.tent}>⛺</Text>
          <Text style={styles.catEmoji}>🐱</Text>
        </View>
      );
    }

    // IDLE
    if (ANIMATION_TYPE === 'lottie') {
      return (
        <View style={styles.catContainer}>
          <LottieView
            ref={relaxingLottieRef}
            source={require('../../../assets/animations/cat_relaxing.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      );
    }
    // Fallback to emoji
    return (
      <View style={styles.catContainer}>
        <Text style={styles.catEmoji}>🐱</Text>
      </View>
    );
  };

  return <View style={styles.container}>{renderCat()}</View>;
};

/**
 * 모닥불 깜빡임 애니메이션
 */
const Campfire: React.FC = () => {
  const fireOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fireOpacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fireOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <Animated.View style={{ opacity: fireOpacity }}>
      <Text style={styles.fire}>🔥</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catContainer: {
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  lottieSmall: {
    width: 170,
    height: 170,
    marginTop: 20,
  },
  catEmoji: {
    fontSize: 80,
  },
  campingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tent: {
    fontSize: 60,
  },
  fire: {
    fontSize: 40,
  },
});
