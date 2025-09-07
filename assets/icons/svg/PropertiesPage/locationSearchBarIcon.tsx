import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface LocationSearchBarIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  style?: ViewStyle;
}

const LocationSearchBarIcon: React.FC<LocationSearchBarIconProps> = ({
  width = 20,
  height = 20,
  strokeColor = "#2B7E78",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      style={style}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M12.55 7.2998C12.55 7.89654 12.313 8.46884 11.891 8.89079C11.4691 9.31275 10.8968 9.5498 10.3 9.5498C9.70331 9.5498 9.13102 9.31275 8.70906 8.89079C8.2871 8.46884 8.05005 7.89654 8.05005 7.2998C8.05005 6.70307 8.2871 6.13077 8.70906 5.70881C9.13102 5.28686 9.70331 5.0498 10.3 5.0498C10.8968 5.0498 11.4691 5.28686 11.891 5.70881C12.313 6.13077 12.55 6.70307 12.55 7.2998Z"
        stroke="#726C6C"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M15.7004 17.2C15.7004 18.1945 13.283 19 10.3004 19C7.31783 19 4.90043 18.1945 4.90043 17.2M11.4317 14.9446C11.1277 15.2371 10.7223 15.4005 10.3004 15.4005C9.87858 15.4005 9.47313 15.2371 9.16913 14.9446C6.38903 12.2509 2.66393 9.2422 4.48013 4.8736C5.46383 2.5111 7.82183 1 10.3004 1C12.779 1 15.1379 2.512 16.1207 4.8736C17.9351 9.2359 14.219 12.2599 11.4317 14.9446Z"
        stroke="#726C6C"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default LocationSearchBarIcon;
