import React from "react";
import Svg, { Path } from "react-native-svg";

interface HomeIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  fillColor?: string;
}

const PropertiesIcon: React.FC<HomeIconProps> = ({
  width = 25,
  height = 24,
  color = "#292D32",
  fillColor = "none",
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill={fillColor}>
      <Path
        d="M9.51982 2.83992L4.12982 7.03992C3.22982 7.73992 2.49982 9.22992 2.49982 10.3599V17.7699C2.49982 20.0899 4.38982 21.9899 6.70982 21.9899H18.2898C20.6098 21.9899 22.4998 20.0899 22.4998 17.7799V10.4999C22.4998 9.28992 21.6898 7.73992 20.6998 7.04992L14.5198 2.71992C13.1198 1.73992 10.8698 1.78992 9.51982 2.83992Z"
        stroke={fillColor !== "none" ? fillColor : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 17.99V14.99"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default PropertiesIcon;
