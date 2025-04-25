import React from "react";
import Svg, { Rect, Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface SearchIconProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
}

const SearchIcon: React.FC<SearchIconProps> = ({
  width = 40,
  height = 40,
  backgroundColor = "#153E3B",
  iconColor = "white",
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
      <Rect width={36} height={36} rx={4.23529} fill={backgroundColor} />
      <Path
        d="M17.5988 25.1473C21.7653 25.1473 25.1429 21.7697 25.1429 17.6032C25.1429 13.4367 21.7653 10.0591 17.5988 10.0591C13.4323 10.0591 10.0547 13.4367 10.0547 17.6032C10.0547 21.7697 13.4323 25.1473 17.5988 25.1473Z"
        stroke={iconColor}
        strokeWidth={1.42941}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M25.9359 25.9413L24.3477 24.353"
        stroke={iconColor}
        strokeWidth={1.42941}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SearchIcon;
