import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ChecklistIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const MyEnquiriesIcon: React.FC<ChecklistIconProps> = ({
  width = 32,
  height = 32,
  color = "#153E3B",
}) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
        <Path
          d="M14.667 26H28.0003"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.667 16.6666H28.0003"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M14.667 7.33331H28.0003"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 7.33335L5.33333 8.66669L9.33333 4.66669"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 16.6667L5.33333 18L9.33333 14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4 26L5.33333 27.3334L9.33333 23.3334"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default MyEnquiriesIcon;
