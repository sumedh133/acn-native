import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface NotebookSmallIconProps {
  width?: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const Villaments: React.FC<NotebookSmallIconProps> = ({ 
  width = 25, 
  height = 25, 
  color = '#2B3034',
  style 
}) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 25 25" 
      fill="none"
      style={style}
    >
      <Path 
        d="M13 22.5003H4.57997C3.41997 22.5003 2.46997 21.5703 2.46997 20.4303V5.59035C2.46997 2.97035 4.41997 1.78035 6.80997 2.95035L11.25 5.13035C12.21 5.60035 13 6.85035 13 7.91035V22.5003Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M22.47 15.5599V19.3399C22.47 21.4999 21.47 22.4999 19.31 22.4999H13V10.9199L13.47 11.0199L17.97 12.0299L20 12.4799C21.32 12.7699 22.4 13.4499 22.46 15.3699C22.47 15.4299 22.47 15.4899 22.47 15.5599Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M6 9.5H9.47" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M6 13.5H9.47" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M17.97 12.0305V15.2505C17.97 16.4905 16.96 17.5005 15.72 17.5005C14.48 17.5005 13.47 16.4905 13.47 15.2505V11.0205L17.97 12.0305Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M22.46 15.3703C22.4 16.5503 21.42 17.5003 20.22 17.5003C18.98 17.5003 17.97 16.4903 17.97 15.2503V12.0303L20 12.4803C21.32 12.7703 22.4 13.4503 22.46 15.3703Z" 
        stroke={color} 
        strokeOpacity="0.7" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Villaments;