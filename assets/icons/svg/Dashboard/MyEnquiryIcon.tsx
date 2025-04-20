import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface ChecklistIconProps {
  size?: number;
  iconColor: string;
  backgroundColor?: string;
}

const ChecklistIcon: React.FC<ChecklistIconProps> = ({
  size = 24,
  iconColor,
  // backgroundColor = '#E0F5F0',
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      {/* Background rounded square */}
      <Rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="8"
        // fill={backgroundColor}
      />
      
      {/* First checkmark and line */}
      <Path 
        d="M6 8l1.5 1.5L11 6" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path 
        d="M15 8h6" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Second checkmark and line */}
      <Path 
        d="M6 12l1.5 1.5L11 10" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path 
        d="M15 12h6" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      
      {/* Third checkmark and line */}
      <Path 
        d="M6 16l1.5 1.5L11 14" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path 
        d="M15 16h6" 
        stroke={iconColor}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default ChecklistIcon;

// Usage examples:
// <ChecklistIcon />
// or with custom props
// <ChecklistIcon 
//   size={32} 
//   color="#2D3C34" 
//   backgroundColor="#E0F5F0"
// />