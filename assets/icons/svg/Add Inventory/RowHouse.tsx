import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface NotebookTwoIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const RowHouse: React.FC<NotebookTwoIconProps> = ({
  width = 31,
  height = 30,
  color = "#2B3034",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 31 30"
      fill="none"
      style={style}
    >
      <Path
        d="M8.87502 22.5H5.68753C3.90003 22.5 3 21.6 3 19.8125V5.18753C3 3.40003 3.90003 2.5 5.68753 2.5H11.0625C12.85 2.5 13.75 3.40003 13.75 5.18753V7.5"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.2125 10.525V24.475C22.2125 26.4875 21.2125 27.5 19.2 27.5H11.9C9.88748 27.5 8.875 26.4875 8.875 24.475V10.525C8.875 8.51248 9.88748 7.5 11.9 7.5H19.2C21.2125 7.5 22.2125 8.51248 22.2125 10.525Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.25 7.5V5.18753C17.25 3.40003 18.15 2.5 19.9375 2.5H25.3124C27.0999 2.5 28 3.40003 28 5.18753V19.8125C28 21.6 27.0999 22.5 25.3124 22.5H22.2125"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 13.75H18"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 17.5H18"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 27.5V23.75"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default RowHouse;
