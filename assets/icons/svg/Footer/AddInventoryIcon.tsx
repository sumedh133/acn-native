import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

interface HouseStarIconProps {
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  accentColor?: string;
}

const AddInventoryIcon: React.FC<HouseStarIconProps> = ({
  width = 25,
  height = 25,
  color = "#292D32",
  backgroundColor = "#F2F2F2",
  accentColor = "#FFFFFF",
}) => {
  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
        <Path
          d="M9.02 2.83992L3.63 7.03992C2.73 7.73992 2 9.22992 2 10.3599V17.7699C2 20.0899 3.89 21.9899 6.21 21.9899H17.79C20.11 21.9899 22 20.0899 22 17.7799V10.4999C22 9.28992 21.19 7.73992 20.2 7.04992L14.02 2.71992C12.62 1.73992 10.37 1.78992 9.02 2.83992Z"
          fill={backgroundColor}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M23.5 18.25C23.5 19.23 23.22 20.17 22.74 20.95C22.46 21.43 22.11 21.85 21.7 22.19C20.78 23.01 19.58 23.5 18.25 23.5C17.1 23.5 16.04 23.13 15.18 22.5C14.61 22.09 14.13 21.56 13.76 20.95C13.28 20.17 13 19.23 13 18.25C13 16.6 13.76 15.11 14.97 14.16C15.87 13.43 17.02 13 18.25 13C19.48 13 20.61 13.42 21.5 14.13C22.72 15.09 23.5 16.58 23.5 18.25Z"
          fill={accentColor}
          stroke={color}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.5 21C18.5 19.62 19.62 18.5 21 18.5C19.62 18.5 18.5 17.38 18.5 16C18.5 17.38 17.38 18.5 16 18.5C17.38 18.5 18.5 19.62 18.5 21Z"
          fill={color}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default AddInventoryIcon;
