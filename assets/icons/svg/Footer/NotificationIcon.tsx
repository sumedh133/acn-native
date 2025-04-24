import React from "react";
import Svg, { Path } from "react-native-svg";

interface NotificationIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  width = 25,
  height = 24,
  color = "#292D32",
  strokeWidth = 1.5,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M12.52 2.90991C9.20997 2.90991 6.51997 5.59991 6.51997 8.90991V11.7999C6.51997 12.4099 6.25997 13.3399 5.94997 13.8599L4.79997 15.7699C4.08997 16.9499 4.57997 18.2599 5.87997 18.6999C10.19 20.1399 14.84 20.1399 19.15 18.6999C20.36 18.2999 20.89 16.8699 20.23 15.7699L19.08 13.8599C18.78 13.3399 18.52 12.4099 18.52 11.7999V8.90991C18.52 5.60991 15.82 2.90991 12.52 2.90991Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <Path
        d="M14.37 3.19994C14.06 3.10994 13.74 3.03994 13.41 2.99994C12.45 2.87994 11.53 2.94994 10.67 3.19994C10.96 2.45994 11.68 1.93994 12.52 1.93994C13.36 1.93994 14.08 2.45994 14.37 3.19994Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.52 19.0601C15.52 20.7101 14.17 22.0601 12.52 22.0601C11.7 22.0601 10.94 21.7201 10.4 21.1801C9.86002 20.6401 9.52002 19.8801 9.52002 19.0601"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit="10"
      />
    </Svg>
  );
};

export default NotificationIcon;
