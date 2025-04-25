import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface IndependentBuildingProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const IndependentBuilding: React.FC<IndependentBuildingProps> = ({
  width = 24,
  height = 25,
  color = "#00ADA0",
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
        d="M12.5 22.5001H4.07997C2.91997 22.5001 1.96997 21.5701 1.96997 20.4301V5.59011C1.96997 2.97011 3.91997 1.7801 6.30997 2.9501L10.75 5.13011C11.71 5.60011 12.5 6.8501 12.5 7.9101V22.5001Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.97 15.5602V19.3402C21.97 21.5002 20.97 22.5002 18.81 22.5002H12.5V10.9202L12.97 11.0202L17.47 12.0302L19.5 12.4802C20.82 12.7702 21.9 13.4502 21.96 15.3702C21.97 15.4302 21.97 15.4902 21.97 15.5602Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.49997 9.5H8.96997"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.49997 13.5H8.96997"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.47 12.03V15.25C17.47 16.49 16.46 17.5 15.22 17.5C13.98 17.5 12.97 16.49 12.97 15.25V11.02L17.47 12.03Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21.96 15.37C21.9 16.55 20.92 17.5 19.72 17.5C18.48 17.5 17.47 16.49 17.47 15.25V12.03L19.5 12.48C20.82 12.77 21.9 13.45 21.96 15.37Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default IndependentBuilding;
