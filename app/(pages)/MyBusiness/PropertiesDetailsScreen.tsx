import { selectPropertyStateData } from "@/store/slices/propertySlice";
import { Text } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";

const PropertysDetailsScreen = () => {
  const property = useSelector(selectPropertyStateData);
  console.log(property, "chummmaaaaaa de deeeee");
  return (
    <View>
      <Text>jbadjigWAGBUIDAHIS</Text>
    </View>
  );
};

export default PropertysDetailsScreen;
