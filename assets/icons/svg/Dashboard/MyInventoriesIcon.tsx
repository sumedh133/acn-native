import React from 'react';
import Svg, { Path, Rect, G, Defs, ClipPath } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface HomeOutlineIconProps {
  width?: number;
  height?: number;
  // backgroundColor?: string;
  iconColor: string;
  style?: ViewStyle;
}

const MyInverntoriesIcon: React.FC<HomeOutlineIconProps> = ({
  width = 40,
  height = 40,
  // backgroundColor = '#E0F7F4', // Background color from the SVG
  iconColor, // Icon color from the SVG
  style
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 40 41"
      fill="none"
      style={style}
    >
      {/* Background path with opacity */}
      <Path
        opacity="0.3"
        d="M0 16.0833C0 7.61497 6.86497 0.75 15.3333 0.75H24.6667C33.135 0.75 40 7.61497 40 16.0833V25.4167C40 33.885 33.135 40.75 24.6667 40.75H15.3333C6.86497 40.75 0 33.885 0 25.4167V16.0833Z"
      // fill={backgroundColor}
      />
      <G clipPath="url(#clip0_1439_19637)">
        <Path
          d="M30.3982 17.8771L24.6469 13.2466C24.4147 13.0597 24.0838 13.0598 23.8516 13.2466L22.1086 14.6498L20.3659 13.2466C20.1337 13.0597 19.8027 13.0598 19.5706 13.2466L17.8276 14.6498L16.0848 13.2466C15.8526 13.0597 15.5217 13.0598 15.2896 13.2466L9.53773 17.8771C9.38823 17.9974 9.30127 18.1791 9.30127 18.371V27.7617C9.30127 28.1118 9.58519 28.3958 9.93535 28.3958H13.8844C14.2345 28.3958 14.5184 28.1118 14.5184 27.7617V24.9322C14.5184 24.2879 15.0426 23.7638 15.6869 23.7638C16.3312 23.7638 16.8554 24.2879 16.8554 24.9322V27.7617C16.8554 28.1118 17.1393 28.3958 17.4895 28.3958H17.8276H30.0005C30.3507 28.3958 30.6346 28.1118 30.6346 27.7617V18.371C30.6346 18.1791 30.5476 17.9974 30.3982 17.8771ZM20.8044 27.1276H19.1314V27.1276H18.4616H18.1235V24.9322C18.1235 23.5886 17.0304 22.4956 15.6869 22.4956C14.3432 22.4956 13.2502 23.5886 13.2502 24.9322V27.1276H10.5694V18.6746L15.6871 14.5545L20.8044 18.6745V27.1276ZM25.0854 27.1276H22.0726V18.371C22.0726 18.1791 21.9856 17.9975 21.8361 17.8771L18.8387 15.4638L19.9682 14.5546L25.0854 18.6746V27.1276ZM29.3664 27.1276H26.3536V18.371C26.3536 18.1791 26.2666 17.9975 26.1171 17.8771L23.1197 15.4638L24.2492 14.5545L29.3664 18.6745V27.1276Z"
          fill={iconColor}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1439_19637">
          <Rect
            width="21.3333"
            height="21.3333"
            fill="white"
            transform="translate(9.31348 10.0859)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default MyInverntoriesIcon;