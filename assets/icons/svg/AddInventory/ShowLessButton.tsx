import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface ShowLessButtonProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const ShowLessButton: React.FC<ShowLessButtonProps> = ({
  width = 24,
  height = 24,
  color = "#2B3034",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <Path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.53 13.26L12 9.74001L8.47 13.26"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ShowLessButton;
