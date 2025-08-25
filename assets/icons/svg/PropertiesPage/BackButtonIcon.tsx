import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface SearchIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  style?: ViewStyle;
}

const BackButtonIcon: React.FC<SearchIconProps> = ({
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
      viewBox="0 0 16 16"
      fill="none"
    >
      <Path
        d="M6.38065 3.95312L2.33398 7.99979L6.38065 12.0465"
        stroke="#292D32"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M13.6673 8H2.44727"
        stroke="#292D32"
        stroke-miterlimit="10"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default BackButtonIcon;
