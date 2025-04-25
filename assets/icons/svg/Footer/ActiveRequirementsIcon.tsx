import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface GradientDocumentIconProps {
  width?: number;
  height?: number;
}

const ActiveRequirementsIcon: React.FC<GradientDocumentIconProps> = ({
  width = 25,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M16.5 4.25C16.5 5.49 15.49 6.5 14.25 6.5H10.75C10.13 6.5 9.57 6.25 9.16 5.84C8.75 5.43 8.5 4.87 8.5 4.25C8.5 3.01 9.51 2 10.75 2H14.25C14.87 2 15.43 2.25 15.84 2.66C16.25 3.07 16.5 3.63 16.5 4.25Z"
        fill="url(#paint0_linear_147_23039)"
      />
      <Path
        d="M19.33 4.47796C19.1 4.28796 18.84 4.13796 18.56 4.02796C18.27 3.91796 17.98 4.14796 17.92 4.44796C17.58 6.15796 16.07 7.44796 14.25 7.44796H10.75C9.75 7.44796 8.81 7.05796 8.1 6.34796C7.58 5.82796 7.22 5.16796 7.08 4.45796C7.02 4.15796 6.72 3.91796 6.43 4.03796C5.27 4.50796 4.5 5.56796 4.5 7.69796V17.448C4.5 20.448 6.29 21.448 8.5 21.448H16.5C18.71 21.448 20.5 20.448 20.5 17.448V7.69796C20.5 6.06796 20.05 5.06796 19.33 4.47796ZM8.5 11.698H12.5C12.91 11.698 13.25 12.038 13.25 12.448C13.25 12.858 12.91 13.198 12.5 13.198H8.5C8.09 13.198 7.75 12.858 7.75 12.448C7.75 12.038 8.09 11.698 8.5 11.698ZM16.5 17.198H8.5C8.09 17.198 7.75 16.858 7.75 16.448C7.75 16.038 8.09 15.698 8.5 15.698H16.5C16.91 15.698 17.25 16.038 17.25 16.448C17.25 16.858 16.91 17.198 16.5 17.198Z"
        fill="url(#paint1_linear_147_23039)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_147_23039"
          x1="11.0526"
          y1="2.60236"
          x2="17.1105"
          y2="7.31938"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_147_23039"
          x1="9.60517"
          y1="6.33555"
          x2="26.3634"
          y2="13.0664"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default ActiveRequirementsIcon;
