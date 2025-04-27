import React from "react";
import Svg, { Path } from "react-native-svg";

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const PlusIconWithCircle: React.FC<PlusIconProps> = ({
  width = 24,
  height = 24,
  color = "white",
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
      <Path
        d="M12.5 22.5C18 22.5 22.5 18 22.5 12.5C22.5 7 18 2.5 12.5 2.5C7 2.5 2.5 7 2.5 12.5C2.5 18 7 22.5 12.5 22.5Z"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M8.5 12.5H16.5"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M12.5 16.5V8.5"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default PlusIconWithCircle;
