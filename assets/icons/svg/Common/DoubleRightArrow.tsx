import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface DoubleChevronIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const DoubleRightArrowIcon: React.FC<DoubleChevronIconProps> = ({
  width = 20,
  height = 20,
  color = "#292D32",
  strokeWidth = 1.8,
}) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
        <Path
          d="M3.75 16.5997L9.87747 11.1391C10.6011 10.4942 10.6011 9.43892 9.87747 8.79403L3.75 3.33337"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M10.4131 16.6666L16.5406 11.206C17.2642 10.5611 17.2642 9.50581 16.5406 8.86092L10.4131 3.40027"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default DoubleRightArrowIcon;
