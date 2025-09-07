// react imports
import { RootState } from "@/store/store";
import {
  Text,
  View,
  Animated,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSelector } from "react-redux";
import { useContext, useEffect, useRef } from "react";

// images imports
import Property from "@/assets/icons/MyBusinessPage/properties.svg";
import Requirement from "@/assets/icons/MyBusinessPage/requirements.svg";

// scroll context for header hide
import { ScrollContext } from "@/app/ScrollContext";

interface MyBusinessHeaderProps {
  count: {
    requirement: number;
    property: number;
  };
  activeCard: "property" | "requirement";
  setActiveCard: (card: "property" | "requirement") => void;
}

interface Cards {
  key: "property" | "requirement";
  title: string;
  count: number;
  img: React.ReactNode;
}

const MyBusinessHeader = ({
  count,
  activeCard,
  setActiveCard,
}: MyBusinessHeaderProps) => {
  // const requirementCount = useSelector(
  //   (state: RootState) => state?.agent?.docData.myRequirements.length || 0
  // );

  // Use the scroll context
  const { secondaryHeaderHeight, setSecondaryHeaderHeight } =
    useContext(ScrollContext);
  const headerRef = useRef<View>(null);

  // Measure the header height on mount
  useEffect(() => {
    // Set the header height for the context to use
    // The height is 90px as per your original component
    setSecondaryHeaderHeight(75);
  }, [setSecondaryHeaderHeight]);

  const cards: Cards[] = [
    {
      key: "property",
      title: "My Properties",
      count: count.property,
      img: <Property />,
    },
    // {
    //   key: "requirement",
    //   title: "My Requirements",
    //   count: requirementCount,
    //   img: <Requirement />,
    // },
  ];

  return (
    <Animated.View
      ref={headerRef}
      style={{
        height: secondaryHeaderHeight,
        overflow: "hidden",
      }}
      className="mt-[10px]"
    >
      <View className="flex flex-row  w-full h-[90px] gap-[14.54px] px-4 mb-[10px]">
        {cards?.map((item, idx) => {
          return (
            <Pressable
              key={item.key}
              className={`${
                activeCard === item.key ? "bg-[#153E3B]" : "bg-white"
              } z-10 flex flex-row w-[100%] h-[74px] items-center rounded-[14px] border border-[#BDBDBD]`} // make the w-[100%] -> w-[48%] when adding requirements
              onPress={() => setActiveCard(item.key)}
            >
              <View className="flex flex-col pl-4">
                <Text
                  className={`${
                    activeCard === item.key
                      ? "text-[#B8C5C4]"
                      : "text-[#929494]"
                  }`}
                >
                  {item.title}
                </Text>
                <Text
                  className={`${
                    activeCard === item.key ? "text-white" : "text-black"
                  } text-xl font-bold leading-normal tracking-[1px]`}
                >
                  {item.count}
                </Text>
              </View>
              <View className="absolute bottom-0 right-[-1] z-[-5] overflow-hidden rounded-br-xl">
                {item.img}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default MyBusinessHeader;
