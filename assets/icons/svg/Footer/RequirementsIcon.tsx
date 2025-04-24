import React from "react";
import Svg, { Path } from "react-native-svg";

interface DocumentIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const RequirementsIcon: React.FC<DocumentIconProps> = ({
  width = 25,
  height = 24,
  color = "#433F3E",
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M20.5 8.25V18C20.5 21 18.71 22 16.5 22H8.5C6.29 22 4.5 21 4.5 18V8.25C4.5 5 6.29 4.25 8.5 4.25C8.5 4.87 8.74997 5.43 9.15997 5.84C9.56997 6.25 10.13 6.5 10.75 6.5H14.25C15.49 6.5 16.5 5.49 16.5 4.25C18.71 4.25 20.5 5 20.5 8.25Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.5 4.25C16.5 5.49 15.49 6.5 14.25 6.5H10.75C10.13 6.5 9.56997 6.25 9.15997 5.84C8.74997 5.43 8.5 4.87 8.5 4.25C8.5 3.01 9.51 2 10.75 2H14.25C14.87 2 15.43 2.25 15.84 2.66C16.25 3.07 16.5 3.63 16.5 4.25Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 13H12.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 17H16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default RequirementsIcon;
