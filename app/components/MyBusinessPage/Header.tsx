// react imports
import { RootState } from "@/store/store";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

// images imports
import Property from "@/assets/icons/MyBusinessPage/properties.svg";
import Requirement from "@/assets/icons/MyBusinessPage/requirements.svg";

interface MyBusinessHeaderProps {
  activeCard: "property" | "requirement";
  setActiveCard: (card: "property" | "requirement") => void;
}

const MyBusinessHeader = ({
  activeCard,
  setActiveCard,
}: MyBusinessHeaderProps) => {
  const propertyCount = useSelector(
    (state: RootState) => state?.agent?.docData.myInventories.length
  );
  const requirementCount = useSelector(
    (state: RootState) => state?.agent?.docData.myRequirements.length
  );

  const cards = [
    {
      key: "property",
      title: "My Properties",
      count: propertyCount,
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
    <View className="flex flex-row bg-white w-full h-[90px] gap-[14.54px] px-4 top-3 mb-[10px]">
      {cards?.map((item, idx) => {
        return (
          <View
            className={`${
              activeCard === item.key ? "bg-[#153E3B]" : "bg-white"
            } z-10 flex flex-row w-[100%] h-[74px] items-center rounded-[14px] border border-[#BDBDBD]`} // make the w-[100%] -> w-[48%] when adding requirements
          >
            <View className="flex flex-col pl-4">
              <Text
                className={`${
                  activeCard === item.key ? "text-[#B8C5C4]" : "text-[#929494]"
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
          </View>
        );
      })}
    </View>
  );
};

export default MyBusinessHeader;
