import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface HandOverIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const HandOverIcon: React.FC<HandOverIconProps> = ({
  width = 18,
  height = 18,
  color = "#433F3E",
  strokeWidth = 1.5,
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      style={style}
    >
      <Path
        d="M9.08984 2.33887C12.8158 2.33887 15.8398 5.36287 15.8398 9.08887C15.8398 12.8149 12.8158 15.8389 9.08984 15.8389C5.36384 15.8389 2.33984 12.8149 2.33984 9.08887C2.33984 5.36287 5.36384 2.33887 9.08984 2.33887Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 3"
      />
      <Path
        d="M14.9359 12.4637C13.0729 15.6905 8.94199 16.7974 5.71518 14.9344C2.48837 13.0714 1.38151 8.94052 3.24451 5.71371C4.4929 3.55144 6.75962 2.34109 9.09027 2.33838"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.3665 11.0271L9.39035 9.84779C9.04611 9.6438 8.76562 9.15294 8.76562 8.75133V6.1377"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HandOverIcon;
