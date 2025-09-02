import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface MoreOptionsButtonProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
  pointerDown?: boolean;
}

const DropDownArrow: React.FC<MoreOptionsButtonProps> = ({
  width = 25,
  height = 24,
  color = "#2B3034",
  style,
  pointerDown = true,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      style={style}
    >
      <Path
        d={
          pointerDown
            ? "M16.03 13.26L12.5 9.74L8.97 13.26"
            : "M8.97 10.74L12.5 14.26L16.03 10.74"
        } // Conditional path
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default DropDownArrow;
