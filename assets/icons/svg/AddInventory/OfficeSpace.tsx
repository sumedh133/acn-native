import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface OfficeSpaceProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const OfficeSpace: React.FC<OfficeSpaceProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#2B3034',
  style 
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none"
      style={style}
    >
      <Path 
        d="M2 22H22" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M17 2H7C4 2 3 3.79 3 6V22H21V6C21 3.79 20 2 17 2Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M7 16.5H10" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M14 16.5H17" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M7 12H10" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M14 12H17" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M7 7.5H10" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M14 7.5H17" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default OfficeSpace;