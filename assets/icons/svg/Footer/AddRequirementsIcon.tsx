import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface FolderStarIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const AddRequirementsIcon: React.FC<FolderStarIconProps> = ({
  width = 24,
  height = 25,
  color = "#292D32",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      style={style}
    >
      <Path
        d="M3 7.18198C3 5.42462 4.42462 4 6.18198 4H6.30399C7.06978 4 7.80421 4.30421 8.3457 4.8457C8.77124 5.27124 9.31911 5.55318 9.91272 5.65212L11.3424 5.8904C11.7778 5.96297 12.2222 5.96297 12.6576 5.8904L14.0379 5.66035C14.67 5.55499 15.2676 5.29929 15.7803 4.91478L16.2 4.6C16.7193 4.21053 17.3509 4 18 4C19.6569 4 21 5.34315 21 7V18C21 20.2091 19.2091 22 17 22H7C4.79086 22 3 20.2091 3 18V7.18198Z"
        fill="#F2F2F2"
      />
      <Path
        d="M16 4.02002C19.33 4.20002 21 5.43002 21 10V15"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z"
        fill="#F2F2F2"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23 18.75C23 19.73 22.72 20.67 22.24 21.45C21.96 21.93 21.61 22.35 21.2 22.69C20.28 23.51 19.08 24 17.75 24C16.6 24 15.54 23.63 14.68 23C14.11 22.59 13.63 22.06 13.26 21.45C12.78 20.67 12.5 19.73 12.5 18.75C12.5 17.1 13.26 15.61 14.47 14.66C15.37 13.93 16.52 13.5 17.75 13.5C18.98 13.5 20.11 13.92 21 14.63C22.22 15.59 23 17.08 23 18.75Z"
        fill="white"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.75 21.25C17.75 19.87 18.87 18.75 20.25 18.75C18.87 18.75 17.75 17.63 17.75 16.25C17.75 17.63 16.63 18.75 15.25 18.75C16.63 18.75 17.75 19.87 17.75 21.25Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default AddRequirementsIcon;
