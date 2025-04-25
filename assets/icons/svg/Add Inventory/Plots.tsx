import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface ClipboardIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const Plots: React.FC<ClipboardIconProps> = ({
  width = 25,
  height = 24,
  color = "#2B3034",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      style={style}
    >
      <Path
        d="M2.5 22H22.5"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.51 21.9898L3.51001 22.0099L3.5 7.06986C3.5 6.39986 3.84001 5.77983 4.39001 5.40983L8.39001 2.73984C9.06001 2.28984 9.93999 2.28984 10.61 2.73984L14.61 5.40983C15.17 5.77983 15.5 6.39986 15.5 7.06986L15.51 21.9898Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.48 22.01V18"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 12C19.4 12 18.5 12.9 18.5 14V16C18.5 17.1 19.4 18 20.5 18C21.6 18 22.5 17.1 22.5 16V14C22.5 12.9 21.6 12 20.5 12Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 14H15.5"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 22V18.25"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 10.5C10.3284 10.5 11 9.82843 11 9C11 8.17157 10.3284 7.5 9.5 7.5C8.67157 7.5 8 8.17157 8 9C8 9.82843 8.67157 10.5 9.5 10.5Z"
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

export default Plots;
