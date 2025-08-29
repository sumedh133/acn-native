import { TouchableOpacity, Text, View } from "react-native";

interface MyBusinessHeaderProps {
  activeCard: "property" | "requirement";
  setActiveCard: (card: "property" | "requirement") => void;
}

const MyBusinessHeader = ({
  activeCard,
  setActiveCard,
}: MyBusinessHeaderProps) => {
  return (
    <View className="bg-white w-full h-[60px] flex flex-row items-center justify-between px-4">
      <Text>this is the header</Text>
    </View>
  );
};

export default MyBusinessHeader;
