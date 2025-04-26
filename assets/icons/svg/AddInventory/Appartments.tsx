import React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface NotebookIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const Appartments: React.FC<NotebookIconProps> = ({
  width = 25,
  height = 24,
  color = "#2B3034",
  style,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 25 24"
      fill="none"
      style={style}
    >
      <Path
        d="M13 22.0003H4.57997C3.41997 22.0003 2.46997 21.0703 2.46997 19.9303V5.09035C2.46997 2.47035 4.41997 1.28035 6.80997 2.45035L11.25 4.63035C12.21 5.10035 13 6.35035 13 7.41035V22.0003Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.47 15.0599V18.8399C22.47 20.9999 21.47 21.9999 19.31 21.9999H13V10.4199L13.47 10.5199L17.97 11.5299L20 11.9799C21.32 12.2699 22.4 12.9499 22.46 14.8699C22.47 14.9299 22.47 14.9899 22.47 15.0599Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 9H9.47"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 13H9.47"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.97 11.5305V14.7505C17.97 15.9905 16.96 17.0005 15.72 17.0005C14.48 17.0005 13.47 15.9905 13.47 14.7505V10.5205L17.97 11.5305Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22.46 14.8703C22.4 16.0503 21.42 17.0003 20.22 17.0003C18.98 17.0003 17.97 15.9903 17.97 14.7503V11.5303L20 11.9803C21.32 12.2703 22.4 12.9503 22.46 14.8703Z"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Appartments;
