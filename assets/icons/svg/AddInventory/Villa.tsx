import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface HomeIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const Villa: React.FC<HomeIconProps> = ({
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
        d="M3.44995 22.0003L3.49995 9.97023C3.49995 9.36023 3.78995 8.78029 4.26995 8.40029L11.27 2.95027C11.99 2.39027 12.9999 2.39027 13.7299 2.95027L20.73 8.39028C21.22 8.77028 21.5 9.35023 21.5 9.97023V22.0003"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 17H11.5C10.67 17 10 17.67 10 18.5V22H15V18.5C15 17.67 14.33 17 13.5 17Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M10 13.75H8C7.45 13.75 7 13.3 7 12.75V11.25C7 10.7 7.45 10.25 8 10.25H10C10.55 10.25 11 10.7 11 11.25V12.75C11 13.3 10.55 13.75 10 13.75Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M17 13.75H15C14.45 13.75 14 13.3 14 12.75V11.25C14 10.7 14.45 10.25 15 10.25H17C17.55 10.25 18 10.7 18 11.25V12.75C18 13.3 17.55 13.75 17 13.75Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinejoin="round"
      />
      <Path
        d="M19.4999 7L19.4699 4H15.0699"
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

export default Villa;
