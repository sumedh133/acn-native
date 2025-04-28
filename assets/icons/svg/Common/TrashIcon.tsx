import React from "react";
import Svg, { Path } from "react-native-svg";

interface PlusIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const TrashIcon: React.FC<PlusIconProps> = ({
  width = 20,
  height = 20,
  color = "#292D32",
  strokeWidth = 1.25,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5 4.98307C14.725 4.70807 11.9333 4.56641 9.15 4.56641C7.5 4.56641 5.85 4.64974 4.2 4.81641L2.5 4.98307"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.08301 4.14199L7.26634 3.05033C7.39967 2.25866 7.49967 1.66699 8.90801 1.66699H11.0913C12.4997 1.66699 12.608 2.29199 12.733 3.05866L12.9163 4.14199"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.7087 7.61621L15.167 16.0079C15.0753 17.3162 15.0003 18.3329 12.6753 18.3329H7.32533C5.00033 18.3329 4.92533 17.3162 4.83366 16.0079L4.29199 7.61621"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.6084 13.75H11.3834"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.91699 10.417H12.0837"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default TrashIcon;
