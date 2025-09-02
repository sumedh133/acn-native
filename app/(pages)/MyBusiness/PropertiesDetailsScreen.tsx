import { selectPropertyStateData } from "@/store/slices/propertySlice";
import { Text } from "react-native";
import { View } from "react-native";
import { useSelector } from "react-redux";
import { inventoryFormConfig } from "@/app/config/AddInventoryFormConfig/inventoryFormConfig";
import {
  FormPreview

} from "@/app/components/Listing/listingPropertyDetails";
const PropertysDetailsScreen = () => {
  const property = useSelector(selectPropertyStateData);

  return (
    <View className="flex-1 bg-white"><FormPreview config={inventoryFormConfig} data={property} previewType="listing" />

    </View>
  );
};

export default PropertysDetailsScreen;
