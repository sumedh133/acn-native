import React from "react";
import { Svg, Path } from "react-native-svg";

const Checkmark: React.FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 20, height = 21, color = "#153E3B" }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="M16.6673 5.5L7.50065 14.6667L3.33398 10.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Checkmark;
