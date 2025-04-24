import React from "react";

import Svg, { Path } from "react-native-svg";

import { ViewStyle } from "react-native";

interface HomeIconProps {
  width?: number;

  height?: number;

  color?: string;

  style?: ViewStyle;
}

const PropertyIcon: React.FC<HomeIconProps> = ({
  width = 18,

  height = 19,

  color = "#292D32",

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
        d="M1.5 17H16.5"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M2.21289 17L2.25039 7.97743C2.25039 7.51993 2.46789 7.08497 2.82789 6.79997L8.07789 2.71246C8.61789 2.29246 9.37539 2.29246 9.92289 2.71246L15.1729 6.79246C15.5404 7.07746 15.7504 7.51243 15.7504 7.97743V17"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinejoin="round"
      />

      <Path
        d="M9.75 13.25H8.25C7.6275 13.25 7.125 13.7525 7.125 14.375V17H10.875V14.375C10.875 13.7525 10.3725 13.25 9.75 13.25Z"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinejoin="round"
      />

      <Path
        d="M7.125 10.8125H5.625C5.2125 10.8125 4.875 10.475 4.875 10.0625V8.9375C4.875 8.525 5.2125 8.1875 5.625 8.1875H7.125C7.5375 8.1875 7.875 8.525 7.875 8.9375V10.0625C7.875 10.475 7.5375 10.8125 7.125 10.8125Z"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinejoin="round"
      />

      <Path
        d="M12.375 10.8125H10.875C10.4625 10.8125 10.125 10.475 10.125 10.0625V8.9375C10.125 8.525 10.4625 8.1875 10.875 8.1875H12.375C12.7875 8.1875 13.125 8.525 13.125 8.9375V10.0625C13.125 10.475 12.7875 10.8125 12.375 10.8125Z"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinejoin="round"
      />

      <Path
        d="M14.2502 5.75L14.2277 3.5H10.9277"
        stroke={color}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PropertyIcon;
