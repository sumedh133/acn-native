import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface GradientCategoryIconProps {
  width?: number;
  height?: number;
}

const ActiveDashboardIcon: React.FC<GradientCategoryIconProps> = ({
  width = 25,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
      <Path
        d="M7.74 2H5.84C3.65 2 2.5 3.15 2.5 5.33V7.23C2.5 9.41 3.65 10.56 5.83 10.56H7.73C9.91 10.56 11.06 9.41 11.06 7.23V5.33C11.07 3.15 9.92 2 7.74 2Z"
        fill="url(#paint0_linear_147_23062)"
      />
      <Path
        d="M19.17 2H17.27C15.09 2 13.94 3.15 13.94 5.33V7.23C13.94 9.41 15.09 10.56 17.27 10.56H19.17C21.35 10.56 22.5 9.41 22.5 7.23V5.33C22.5 3.15 21.35 2 19.17 2Z"
        fill="url(#paint1_linear_147_23062)"
      />
      <Path
        d="M19.17 13.4299H17.27C15.09 13.4299 13.94 14.5799 13.94 16.7599V18.6599C13.94 20.8399 15.09 21.9899 17.27 21.9899H19.17C21.35 21.9899 22.5 20.8399 22.5 18.6599V16.7599C22.5 14.5799 21.35 13.4299 19.17 13.4299Z"
        fill="url(#paint2_linear_147_23062)"
      />
      <Path
        d="M7.74 13.4299H5.84C3.65 13.4299 2.5 14.5799 2.5 16.7599V18.6599C2.5 20.8499 3.65 21.9999 5.83 21.9999H7.73C9.91 21.9999 11.06 20.8499 11.06 18.6699V16.7699C11.07 14.5799 9.92 13.4299 7.74 13.4299Z"
        fill="url(#paint3_linear_147_23062)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_147_23062"
          x1="5.23129"
          y1="3.14583"
          x2="13.9674"
          y2="6.97221"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_147_23062"
          x1="16.6713"
          y1="3.14583"
          x2="25.4074"
          y2="6.97217"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_147_23062"
          x1="16.6713"
          y1="14.5758"
          x2="25.4074"
          y2="18.4021"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.384615" stopColor="#003F3B" />
          <Stop offset="0.783654" stopColor="#00988F" />
          <Stop offset="1" stopColor="#00F2E2" />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_147_23062"
          x1="5.23129"
          y1="14.5771"
          x2="13.9707"
          y2="18.4005"
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

export default ActiveDashboardIcon;
