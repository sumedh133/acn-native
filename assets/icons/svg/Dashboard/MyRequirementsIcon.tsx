import React from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { ViewStyle } from "react-native";

interface LayersIconProps {
  width?: number;
  height?: number;
  // backgroundColor?: string;
  layerColor: string;
  style?: ViewStyle;
}

const MyRequirementIcon: React.FC<LayersIconProps> = ({
  width = 36,
  height = 36,
  // backgroundColor = '#E6F2F0', // Matching the background color from the image
  layerColor, // Matching the layer color from the image
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
      style={style}
    >
      <Rect
        width={36}
        height={36}
        rx={8}
        // fill={backgroundColor}
      />
      <Path
        d="M18 11.25L12 14.625L18 18L24 14.625L18 11.25Z"
        stroke={layerColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24 18L18 21.375L12 18"
        stroke={layerColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M24 21.375L18 24.75L12 21.375"
        stroke={layerColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MyRequirementIcon;
