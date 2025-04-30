import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ArrowLeftIconProps {
  width?: number;
  height?: number;
  color?: string;
  paddingVertical?: number;
  paddingHorizontal?: number;
}

const ArrowLeftIcon: React.FC<ArrowLeftIconProps> = ({
  width = 18,
  height = 15,
  color = "black",
  paddingVertical = 9.56,
  paddingHorizontal = 8.5,
}) => {
  return (
    <View
      style={{
        paddingVertical: paddingVertical,
        paddingHorizontal: paddingHorizontal,
      }}
    >
      <Svg width={width} height={height} viewBox="0 0 18 15" fill="none">
        <Path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M17.5 7.5C17.5 7.78179 17.3881 8.05204 17.1888 8.2513C16.9895 8.45056 16.7193 8.5625 16.4375 8.5625H4.12737L8.68975 13.1228C8.78854 13.2215 8.8669 13.3388 8.92036 13.4679C8.97383 13.597 9.00134 13.7353 9.00134 13.875C9.00134 14.0147 8.97383 14.153 8.92036 14.2821C8.8669 14.4112 8.78854 14.5285 8.68975 14.6273C8.59096 14.726 8.47369 14.8044 8.34461 14.8579C8.21554 14.9113 8.07721 14.9388 7.9375 14.9388C7.79779 14.9388 7.65946 14.9113 7.53039 14.8579C7.40131 14.8044 7.28404 14.726 7.18525 14.6273L0.810249 8.25225C0.711304 8.15355 0.632799 8.0363 0.579237 7.90722C0.525673 7.77814 0.4981 7.63976 0.4981 7.5C0.4981 7.36025 0.525673 7.22186 0.579237 7.09278C0.632799 6.9637 0.711304 6.84645 0.810249 6.74775L7.18525 0.37275C7.28404 0.273963 7.40131 0.195601 7.53039 0.142137C7.65946 0.0886744 7.79779 0.0611572 7.9375 0.0611572C8.07721 0.0611572 8.21554 0.0886744 8.34461 0.142137C8.47369 0.195601 8.59096 0.273963 8.68975 0.37275C8.88926 0.572259 9.00134 0.842851 9.00134 1.125C9.00134 1.26471 8.97383 1.40304 8.92036 1.53212C8.8669 1.66119 8.78854 1.77846 8.68975 1.87725L4.12737 6.4375L16.4375 6.4375C16.7193 6.4375 16.9895 6.54944 17.1888 6.7487C17.3881 6.94796 17.5 7.21821 17.5 7.5Z"
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default ArrowLeftIcon;
