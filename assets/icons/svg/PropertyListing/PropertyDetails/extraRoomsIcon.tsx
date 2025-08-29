import Svg, { Path, G, Defs, ClipPath, Rect, Mask } from "react-native-svg";

export const extraRoomsIcon = () => (
  <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <Path
      d="M0 6C0 2.68629 2.68629 0 6 0H24C27.3137 0 30 2.68629 30 6V24C30 27.3137 27.3137 30 24 30H6C2.68629 30 0 27.3137 0 24V6Z"
      fill="#E0F7F4"
    />
    <G clipPath="url(#clip0)">
      <Mask
        id="mask0"
        maskType="luminance"
        maskUnits="userSpaceOnUse"
        x={6}
        y={6}
        width={18}
        height={19}
      >
        <Path d="M6 6.00147H24V24.0015H6V6.00147Z" fill="white" />
      </Mask>
      <G mask="url(#mask0)">
        <Path
          d="M8.22656 13.4082V9.4353C8.22656 8.74072 8.78973 8.17766 9.48442 8.17766H20.5166C21.2113 8.17766 21.7745 8.74072 21.7745 9.4353V13.4082"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22.8192 20.8271H7.18083C6.81991 20.8271 6.52734 20.5346 6.52734 20.1737V16.1665C6.52734 15.8056 6.81991 15.513 7.18083 15.513H22.8192C23.1801 15.513 23.4727 15.8056 23.4727 16.1665V20.1737C23.4727 20.5346 23.1801 20.8271 22.8192 20.8271Z"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22.5944 15.5127V14.6826C22.5944 13.9786 22.0236 13.4079 21.3195 13.4079H8.68109C7.97701 13.4079 7.40625 13.9786 7.40625 14.6826V15.5127"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.4635 13.4082C13.8231 13.4082 14.1147 13.1167 14.1147 12.7571V11.9545C14.1147 11.5949 13.8231 11.3034 13.4635 11.3034H10.6317C10.272 11.3034 9.98047 11.5949 9.98047 11.9545V12.7571C9.98047 13.1167 10.272 13.4082 10.6317 13.4082"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19.3678 13.4082C19.7274 13.4082 20.019 13.1167 20.019 12.7571V11.9545C20.019 11.5949 19.7274 11.3034 19.3678 11.3034H16.536C16.1764 11.3034 15.8848 11.5949 15.8848 11.9545V12.7571C15.8848 13.1167 16.1764 13.4082 16.536 13.4082"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.65039 20.8273V21.8267"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22.3496 20.8273V21.8267"
          stroke="#153E3B"
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width="18" height="18" fill="white" transform="translate(6 6)" />
      </ClipPath>
    </Defs>
  </Svg>
);
