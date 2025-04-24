import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface GradientNotificationIconProps {
  width?: number;
  height?: number;
}

const ActiveNotificationIcon: React.FC<GradientNotificationIconProps> = ({
  width = 25,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M19.84 14.49L18.84 12.83C18.63 12.46 18.44 11.76 18.44 11.35V8.82C18.44 6.47 17.06 4.44 15.07 3.49C14.55 2.57 13.59 2 12.49 2C11.4 2 10.42 2.59 9.9 3.52C7.95 4.49 6.6 6.5 6.6 8.82V11.35C6.6 11.76 6.41 12.46 6.2 12.82L5.19 14.49C4.79 15.16 4.7 15.9 4.95 16.58C5.19 17.25 5.76 17.77 6.5 18.02C8.44 18.68 10.48 19 12.52 19C14.56 19 16.6 18.68 18.54 18.03C19.24 17.8 19.78 17.27 20.04 16.58C20.3 15.89 20.23 15.13 19.84 14.49Z"
        fill="url(#paint0_linear_147_23051)"
      />
      <Path
        d="M15.33 20.01C14.91 21.17 13.8 22 12.5 22C11.71 22 10.93 21.68 10.38 21.11C10.06 20.81 9.82 20.41 9.68 20C9.81 20.02 9.94 20.03 10.08 20.05C10.31 20.08 10.55 20.11 10.79 20.13C11.36 20.18 11.94 20.21 12.52 20.21C13.09 20.21 13.66 20.18 14.22 20.13C14.43 20.11 14.64 20.1 14.84 20.07C15 20.05 15.16 20.03 15.33 20.01Z"
        fill="url(#paint1_linear_147_23051)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_147_23051"
          x1="9.71911"
          y1="4.27559"
          x2="25.8907"
          y2="10.6852"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_147_23051"
          x1="11.4828"
          y1="20.2677"
          x2="14.1981"
          y2="23.6275"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default ActiveNotificationIcon;
