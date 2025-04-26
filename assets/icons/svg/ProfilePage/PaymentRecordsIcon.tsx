import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface BookmarkIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const PaymentRecordsIcons: React.FC<BookmarkIconProps> = ({
  width = 25,
  height = 25,
  color = "#292D32",
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
        d="M22.5 6.5V8.92C22.5 10.5 21.5 11.5 19.92 11.5H16.5V4.51C16.5 3.4 17.41 2.5 18.52 2.5C19.61 2.51 20.61 2.95 21.33 3.67C22.05 4.4 22.5 5.4 22.5 6.5Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 7.5V21.5C2.5 22.33 3.43998 22.8 4.09998 22.3L5.81 21.02C6.21 20.72 6.77 20.76 7.13 21.12L8.78998 22.79C9.17998 23.18 9.82002 23.18 10.21 22.79L11.89 21.11C12.24 20.76 12.8 20.72 13.19 21.02L14.9 22.3C15.56 22.79 16.5 22.32 16.5 21.5V4.5C16.5 3.4 17.4 2.5 18.5 2.5H7.5H6.5C3.5 2.5 2.5 4.29 2.5 6.5V7.5Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PaymentRecordsIcons;
