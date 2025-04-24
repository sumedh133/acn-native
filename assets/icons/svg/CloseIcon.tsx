import React from "react";
import Svg, { Path } from "react-native-svg";

interface CloseIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  width = 28,
  height = 29,
  strokeColor = "#9F9C9C",
  strokeWidth = 2,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 28 29" fill="none">
      <Path
        d="M9.05078 9.47168L18.9503 19.3712"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.04972 19.3712L18.9492 9.47168"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CloseIcon;

// Usage examples:
// <CloseIcon />
// or with custom props
// <CloseIcon
//   width={36}
//   height={36}
//   strokeColor="#FF0000"
//   strokeWidth={3}
// />
