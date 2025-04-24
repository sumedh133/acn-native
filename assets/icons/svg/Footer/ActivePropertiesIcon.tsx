import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface GradientHomeIconProps {
  width?: number;
  height?: number;
}

const ActivePropertiesIcon: React.FC<GradientHomeIconProps> = ({
  width = 25,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M20.54 6.81994L14.78 2.78994C13.21 1.68994 10.8 1.74994 9.28999 2.91994L4.27999 6.82994C3.27999 7.60994 2.48999 9.20994 2.48999 10.4699V17.3699C2.48999 19.9199 4.55999 21.9999 7.10999 21.9999H17.89C20.44 21.9999 22.51 19.9299 22.51 17.3799V10.5999C22.51 9.24994 21.64 7.58994 20.54 6.81994ZM13.25 17.9999C13.25 18.4099 12.91 18.7499 12.5 18.7499C12.09 18.7499 11.75 18.4099 11.75 17.9999V14.9999C11.75 14.5899 12.09 14.2499 12.5 14.2499C12.91 14.2499 13.25 14.5899 13.25 14.9999V17.9999Z"
        fill="url(#paint0_linear_152_23968)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_152_23968"
          x1="8.87783"
          y1="4.67906"
          x2="29.3024"
          y2="13.6348"
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

export default ActivePropertiesIcon;
