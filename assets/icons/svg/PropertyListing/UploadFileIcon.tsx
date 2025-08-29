import React from "react";
import Svg, { Path } from "react-native-svg";

export const UploadFileIcon = ({ size = 18, color = "white" }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <Path
        d="M12.3301 6.67578C15.0301 6.90828 16.1326 8.29578 16.1326 11.3333V11.4308C16.1326 14.7833 14.7901 16.1258 11.4376 16.1258H6.55511C3.20261 16.1258 1.86011 14.7833 1.86011 11.4308V11.3333C1.86011 8.31828 2.94761 6.93078 5.60261 6.68328"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11.2498V2.71484"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.5125 4.3875L9.00005 1.875L6.48755 4.3875"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
