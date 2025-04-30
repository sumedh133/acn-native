import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface LogoutIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const LogoutIcon: React.FC<LogoutIconProps> = ({
  width = 18,
  height = 18,
  color = "#DE1135",
}) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
        <Path
          d="M6.67529 5.66993C6.90779 2.96993 8.29529 1.86743 11.3328 1.86743H11.4303C14.7828 1.86743 16.1253 3.20993 16.1253 6.56243V11.4524C16.1253 14.8049 14.7828 16.1474 11.4303 16.1474H11.3328C8.31779 16.1474 6.93029 15.0599 6.68279 12.4049"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M11.2494 9H2.71436"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M4.3875 6.48755L1.875 9.00005L4.3875 11.5125"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default LogoutIcon;
