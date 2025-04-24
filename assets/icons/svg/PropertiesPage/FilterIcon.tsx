import React from "react";
import Svg, { Rect, Path } from "react-native-svg";

interface SlidersIconProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  strokeColor?: string;
  borderColor?: string;
}

const FilterIcon: React.FC<SlidersIconProps> = ({
  width = 40,
  height = 40,
  backgroundColor = "white",
  strokeColor = "#2B2928",
  borderColor = "#B5B3B3",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 36" fill="none">
      <Rect
        x="0.529412"
        y="0.529412"
        width="34.9412"
        height="34.9412"
        rx="5.82353"
        fill={backgroundColor}
      />
      <Rect
        x="0.529412"
        y="0.529412"
        width="34.9412"
        height="34.9412"
        rx="5.82353"
        stroke={borderColor}
        strokeWidth="1.05882"
      />
      <Path
        d="M14.8242 17.9999V11.647M14.8242 24.3529V21.1764M20.383 14.0293V11.647M20.383 24.3529V17.2058"
        stroke={strokeColor}
        strokeWidth="1.58824"
        strokeLinecap="round"
      />
      <Path
        d="M14.8226 21.1765C15.6998 21.1765 16.4108 20.4654 16.4108 19.5882C16.4108 18.7111 15.6998 18 14.8226 18C13.9455 18 13.2344 18.7111 13.2344 19.5882C13.2344 20.4654 13.9455 21.1765 14.8226 21.1765Z"
        stroke={strokeColor}
        strokeWidth="1.58824"
        strokeLinecap="round"
      />
      <Path
        d="M20.3812 17.2058C21.2584 17.2058 21.9694 16.4947 21.9694 15.6175C21.9694 14.7404 21.2584 14.0293 20.3812 14.0293C19.504 14.0293 18.793 14.7404 18.793 15.6175C18.793 16.4947 19.504 17.2058 20.3812 17.2058Z"
        stroke={strokeColor}
        strokeWidth="1.58824"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default FilterIcon;

// Usage examples:
// <SlidersIcon />
// or with custom props
// <SlidersIcon
//   width={48}
//   height={48}
//   backgroundColor="#F0F0F0"
//   strokeColor="#000000"
//   borderColor="#CCCCCC"
// />
