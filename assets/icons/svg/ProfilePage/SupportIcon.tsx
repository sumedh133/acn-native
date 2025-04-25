import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface OrbitIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const SupportIcon: React.FC<OrbitIconProps> = ({
  width = 25,
  height = 25,
  color = "#252626",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 25 25"
      fill="none"
      style={style}
    >
      <Path
        d="M12.5 22.5C18.0228 22.5 22.5 18.0228 22.5 12.5C22.5 6.97715 18.0228 2.5 12.5 2.5C6.97715 2.5 2.5 6.97715 2.5 12.5C2.5 18.0228 6.97715 22.5 12.5 22.5Z"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M12.5 16.5C14.7091 16.5 16.5 14.7091 16.5 12.5C16.5 10.2909 14.7091 8.5 12.5 8.5C10.2909 8.5 8.5 10.2909 8.5 12.5C8.5 14.7091 10.2909 16.5 12.5 16.5Z"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M15.5 9.5L19.5 5.5M5.5 19.5L9.5 15.5M9.5 9.5L5.5 5.5M19.5 19.5L15.5 15.5"
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};

export default SupportIcon;
