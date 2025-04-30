import React from "react";
import Svg, { Path } from "react-native-svg";

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const PlusIcon: React.FC<PlusIconProps> = ({
  width = 24,
  height = 24,
  color = "white",
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 12H18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 18V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PlusIcon;
