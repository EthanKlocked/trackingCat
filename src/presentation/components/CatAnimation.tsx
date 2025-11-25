/**
 * CatAnimation
 * 고양이 애니메이션 (Lottie 기반)
 * TODO: 추후 커스텀 스프라이트 프레임 애니메이션으로 교체 가능하도록 설계됨
 */

import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import { TimerStatus } from "../../constants";

interface CatAnimationProps {
  status: TimerStatus;
}

// 애니메이션 타입
type AnimationType = "lottie" | "sprite" | "gif" | "emoji";

// 현재 사용 중인 애니메이션 타입 (변경 가능)
const ANIMATION_TYPE: AnimationType = "gif" as AnimationType;

// 스프라이트 프레임 이미지 (expo-image로 최적화)
const SPRITE_FRAMES = [
  require("../../../assets/frames/black_walk_1.png"),
  require("../../../assets/frames/black_walk_2.png"),
  require("../../../assets/frames/black_walk_3.png"),
  require("../../../assets/frames/black_walk_4.png"),
  require("../../../assets/frames/black_walk_5.png"),
  require("../../../assets/frames/black_walk_6.png"),
  require("../../../assets/frames/black_walk_7.png"),
  require("../../../assets/frames/black_walk_8.png"),
  require("../../../assets/frames/black_walk_9.png"),
  require("../../../assets/frames/black_walk_10.png"),
  require("../../../assets/frames/black_walk_11.png"),
  require("../../../assets/frames/black_walk_12.png"),
];

// GIF 애니메이션
const GIF_WALKING = require("../../../assets/gifs/cat_running.gif");

// 정적 이미지
const IMAGE_SLEEPING = require("../../../assets/images/sleeping_cat.png");

// 프레임 전환 속도 (ms) - 12프레임 기준 적정 속도
const FRAME_DURATION = 83; // 약 12fps (1000ms / 12 = 83ms)

export const CatAnimation: React.FC<CatAnimationProps> = ({ status }) => {
  const walkingLottieRef = useRef<LottieView>(null);
  const playingLottieRef = useRef<LottieView>(null);
  const relaxingLottieRef = useRef<LottieView>(null);

  // 스프라이트 애니메이션용 현재 프레임 인덱스
  const [currentFrame, setCurrentFrame] = useState(0);

  // Lottie 애니메이션 제어
  useEffect(() => {
    if (ANIMATION_TYPE === "lottie") {
      if (status === TimerStatus.WALKING && walkingLottieRef.current) {
        walkingLottieRef.current.play();
      } else if (status === TimerStatus.RESTING && playingLottieRef.current) {
        playingLottieRef.current.play();
      } else if (status === TimerStatus.IDLE && relaxingLottieRef.current) {
        relaxingLottieRef.current.play();
      }
    }
  }, [status]);

  // 스프라이트 프레임 애니메이션 (requestAnimationFrame 기반)
  useEffect(() => {
    if (ANIMATION_TYPE === "sprite" && status === TimerStatus.WALKING) {
      let animationFrameId: number;
      let lastFrameTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - lastFrameTime;

        if (elapsed >= FRAME_DURATION) {
          setCurrentFrame((prev) => (prev + 1) % SPRITE_FRAMES.length);
          lastFrameTime = now;
        }

        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    } else {
      setCurrentFrame(0); // 첫 프레임으로 리셋
    }
  }, [status]);

  const renderCat = () => {
    if (status === TimerStatus.WALKING) {
      // 스프라이트 프레임 애니메이션
      if (ANIMATION_TYPE === "sprite") {
        return (
          <View style={styles.catContainer}>
            <Image
              source={SPRITE_FRAMES[currentFrame]}
              style={styles.sprite}
              contentFit="contain"
              cachePolicy="memory-disk"
              priority="high"
            />
          </View>
        );
      }

      // GIF 애니메이션
      if (ANIMATION_TYPE === "gif") {
        return (
          <View style={styles.catContainer}>
            <Image
              source={GIF_WALKING}
              style={styles.sprite}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        );
      }

      // Lottie 애니메이션
      if (ANIMATION_TYPE === "lottie") {
        return (
          <View style={styles.catContainer}>
            <LottieView
              ref={walkingLottieRef}
              source={require("../../../assets/lotties/cat_walking.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        );
      }
    }

    if (status === TimerStatus.RESTING) {
      if (ANIMATION_TYPE === "lottie") {
        return (
          <View style={styles.catContainer}>
            <LottieView
              ref={playingLottieRef}
              source={require("../../../assets/lotties/cat_playing.json")}
              autoPlay
              loop
              style={styles.lottieSmall}
            />
          </View>
        );
      }
      // 기본: 쉬는 고양이 이미지 (숨쉬기 애니메이션)
      return <BreathingCat />;
    }

    // IDLE
    if (ANIMATION_TYPE === "lottie") {
      return (
        <View style={styles.catContainer}>
          <LottieView
            ref={relaxingLottieRef}
            source={require("../../../assets/lotties/cat_relaxing.json")}
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
 * 숨쉬는 고양이 애니메이션 + Z Z Z
 */
const BreathingCat: React.FC = () => {
  const breathScale = useRef(new Animated.Value(1)).current;
  const zzzOpacity1 = useRef(new Animated.Value(0)).current;
  const zzzOpacity2 = useRef(new Animated.Value(0)).current;
  const zzzOpacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 숨쉬기 애니메이션
    const breathAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: 1.02, // 2% 커짐
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Z 애니메이션 (순차적으로 나타남)
    const zzzAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(zzzOpacity1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(zzzOpacity2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(zzzOpacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
        Animated.parallel([
          Animated.timing(zzzOpacity1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(zzzOpacity2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(zzzOpacity3, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1000),
      ])
    );

    breathAnimation.start();
    zzzAnimation.start();

    return () => {
      breathAnimation.stop();
      zzzAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.catContainer}>
      <Animated.View style={{ transform: [{ scale: breathScale }] }}>
        <Image
          source={IMAGE_SLEEPING}
          style={styles.sleepingCat}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      {/* Z Z Z 애니메이션 */}
      <Animated.Text
        style={[styles.zzz, styles.zzz1, { opacity: zzzOpacity1 }]}
      >
        z
      </Animated.Text>
      <Animated.Text
        style={[styles.zzz, styles.zzz2, { opacity: zzzOpacity2 }]}
      >
        Z
      </Animated.Text>
      <Animated.Text
        style={[styles.zzz, styles.zzz3, { opacity: zzzOpacity3 }]}
      >
        Z
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  catContainer: {
    alignItems: "center",
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
  sprite: {
    width: 250,
    height: 250,
  },
  sleepingCat: {
    width: 100,
    height: 100,
    marginTop: 40,
  },
  catEmoji: {
    fontSize: 80,
  },
  campingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tent: {
    fontSize: 60,
  },
  fire: {
    fontSize: 40,
  },
  zzz: {
    position: "absolute",
    fontSize: 30,
    color: "#7F8C8D",
  },
  zzz1: {
    top: 20,
    right: 20,
    fontSize: 20,
  },
  zzz2: {
    top: 5,
    right: 35,
    fontSize: 26,
  },
  zzz3: {
    top: -15,
    right: 50,
    fontSize: 32,
  },
});
