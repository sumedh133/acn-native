import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FilterIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({ 
  width = 20, 
  height = 20, 
  color = '#64748B' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 20 21" fill="none">
      <Path
        d="M5 10.5H15M2.5 5.5H17.5M7.5 15.5H12.5"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default FilterIcon;