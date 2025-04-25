import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface MoreOptionsButtonProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const ShowMoreButton: React.FC<MoreOptionsButtonProps> = ({ 
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
        d="M12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 6.47715 18.0228 2 12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
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

export default ShowMoreButton;