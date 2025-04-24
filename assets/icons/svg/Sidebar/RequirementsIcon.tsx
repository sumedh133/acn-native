import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface EditIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

const RequirementIcon: React.FC<EditIconProps> = ({
  width = 18,
  height = 19,
  color = "#252626",
  strokeWidth = 1.25,
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 18 19"
      fill="none"
      style={style}
    >
      <Path
        d="M8.25 3.50017H3C2.60218 3.50017 2.22064 3.65821 1.93934 3.93951C1.65804 4.22081 1.5 4.60235 1.5 5.00017V15.5002C1.5 15.898 1.65804 16.2795 1.93934 16.5608C2.22064 16.8421 2.60218 17.0002 3 17.0002H13.5C13.8978 17.0002 14.2794 16.8421 14.5607 16.5608C14.842 16.2795 15 15.898 15 15.5002V10.2502M13.875 2.37517C14.1734 2.0768 14.578 1.90918 15 1.90918C15.422 1.90918 15.8266 2.0768 16.125 2.37517C16.4234 2.67354 16.591 3.07821 16.591 3.50017C16.591 3.92213 16.4234 4.3268 16.125 4.62517L9 11.7502L6 12.5002L6.75 9.50017L13.875 2.37517Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default RequirementIcon;
