import Svg, { Path, G, Defs, ClipPath, Rect, Mask } from "react-native-svg";

export const DefaultPropertyIcon = () => (
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
        height={18}
      >
        <Rect x={6} y={6} width={18} height={18} fill="white" />
      </Mask>
      <G mask="url(#mask0)">
        {/* Outer Rectangle */}
        <Rect
          x={8}
          y={8}
          width={14}
          height={14}
          rx={2}
          stroke="#153E3B"
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lines representing generic info */}
        <Path
          d="M11 11H19"
          stroke="#153E3B"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <Path
          d="M11 14H17"
          stroke="#153E3B"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <Path
          d="M11 17H15"
          stroke="#153E3B"
          strokeWidth={1}
          strokeLinecap="round"
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
