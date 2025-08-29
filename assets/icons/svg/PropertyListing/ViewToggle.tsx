// ChevronIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface ChevronIconProps {
  direction?: "up" | "down";
  size?: number;
  color?: string;
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  direction = "down",
  size = 9,
  color = "#153E3B",
}) => {
  const rotation = direction === "up" ? "180deg" : "0deg";

  return (
    <Svg
      width={size}
      height={(size * 6) / 10}
      viewBox="0 0 10 6"
      style={{ transform: [{ rotate: rotation }] }}
      fill="none"
    >
      <Path
        d="M1 5.09521L5.04667 0.999793L9.09333 5.09521"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
