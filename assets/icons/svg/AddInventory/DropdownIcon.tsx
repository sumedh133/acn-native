import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface MoreOptionsButtonProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const DropDownArrow: React.FC<MoreOptionsButtonProps> = ({ 
  width = 25, 
  height = 24, 
  color = '#2B3034',
  style 
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
        d="M8.97 10.74L12.5 14.26L16.03 10.74" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default DropDownArrow;