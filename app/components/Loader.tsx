import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

const Loader: React.FC = () => {
  // Animation values
  const jumpAnimation = new Animated.Value(0);
  const shadowAnimation = new Animated.Value(0);

  useEffect(() => {
    // Create animations
    const createAnimations = () => {
      // Jump animation
      Animated.loop(
        Animated.timing(jumpAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Shadow animation
      Animated.loop(
        Animated.timing(shadowAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    };

    createAnimations();

    // Cleanup animations on unmount
    return () => {
      jumpAnimation.stopAnimation();
      shadowAnimation.stopAnimation();
    };
  }, []);

  // Interpolate animation values
  const jumpInterpolation = {
    // translateY animation
    translateY: jumpAnimation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [0, 9, 18, 9, 0],
    }),
    // rotation animation
    rotate: jumpAnimation.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: ["0deg", "22.5deg", "45deg", "67.5deg", "90deg"],
    }),
    // scale animation (only affects Y during middle of animation)
    scaleY: jumpAnimation.interpolate({
      inputRange: [0, 0.4, 0.5, 0.6, 1],
      outputRange: [1, 1, 0.9, 1, 1],
    }),
    // Border radius change
    borderBottomRightRadius: jumpAnimation.interpolate({
      inputRange: [0, 0.15, 0.5, 1],
      outputRange: [4, 3, 40, 4],
    }),
  };

  // Shadow scale animation
  const shadowInterpolation = {
    scaleX: shadowAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.shadow,
          {
            transform: [{ scaleX: shadowInterpolation.scaleX }, { scaleY: 1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.loader,
          {
            transform: [
              { translateY: jumpInterpolation.translateY },
              { rotate: jumpInterpolation.rotate },
              { scaleX: 1 },
              { scaleY: jumpInterpolation.scaleY },
            ],
            borderBottomRightRadius: jumpInterpolation.borderBottomRightRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    alignSelf: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  loader: {
    width: 48,
    height: 48,
    backgroundColor: "#153E3B",
    borderRadius: 4,
    position: "absolute",
    bottom: 5,
  },
  shadow: {
    width: 48,
    height: 5,
    backgroundColor: "#153E3B50",
    borderRadius: 50,
    position: "absolute",
    top: 60,
  },
});

export default Loader;
