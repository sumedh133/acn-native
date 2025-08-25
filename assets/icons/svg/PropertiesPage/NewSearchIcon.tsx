import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface SearchIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  style?: ViewStyle;
}

const NewSearchIcon: React.FC<SearchIconProps> = ({
  width = 20,
  height = 20,
  strokeColor = "#2B7E78",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      style={style}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M9.13201 17.1471C13.2985 17.1471 16.6761 13.7695 16.6761 9.60295C16.6761 5.43645 13.2985 2.05884 9.13201 2.05884C4.96551 2.05884 1.58789 5.43645 1.58789 9.60295C1.58789 13.7695 4.96551 17.1471 9.13201 17.1471Z"
        stroke={strokeColor}
        strokeWidth={1.42941}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.4701 17.9413L15.8818 16.353"
        stroke={strokeColor}
        strokeWidth={1.42941}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default NewSearchIcon;
