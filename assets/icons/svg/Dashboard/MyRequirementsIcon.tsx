import React from "react";
import Svg, { Path } from "react-native-svg";

interface LayeredStackIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const MyRequirementIcon: React.FC<LayeredStackIconProps> = ({
  width = 32,
  height = 32,
  color = "#153E3B",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M17.3464 3.89335L25.213 7.38669C27.4797 8.38669 27.4797 10.04 25.213 11.04L17.3464 14.5334C16.453 14.9334 14.9864 14.9334 14.093 14.5334L6.22637 11.04C3.9597 10.04 3.9597 8.38669 6.22637 7.38669L14.093 3.89335C14.9864 3.49335 16.453 3.49335 17.3464 3.89335Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 14.6667C4 15.7867 4.84 17.08 5.86667 17.5333L14.92 21.56C15.6133 21.8667 16.4 21.8667 17.08 21.56L26.1333 17.5333C27.16 17.08 28 15.7867 28 14.6667"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 21.3333C4 22.5733 4.73333 23.6933 5.86667 24.2L14.92 28.2267C15.6133 28.5333 16.4 28.5333 17.08 28.2267L26.1333 24.2C27.2667 23.6933 28 22.5733 28 21.3333"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MyRequirementIcon;
