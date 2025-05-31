import React from "react";
import { Svg, Path } from "react-native-svg";

const DoubleCheck: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 24, height = 24, color = "#2D363C" }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13L7 17L13 9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* <Path
      d="M9 13L13 17L21 7"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    /> */}
  </Svg>
  
);

export default DoubleCheck;
