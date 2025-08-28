import React from "react";
import { View, Text } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";
import {
  formatUnixDate,
  getDaysDifference,
  getDaysFrom,
} from "../../../helpers/format/format";

export const BasicPropertyInfo: React.FC<{ data: Partial<Property> }> = ({
  data,
}) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const communityOrCommercial =
    (typeof data.communityType === "string" && data.communityType.trim()) ||
    (typeof data.commercialSubType === "string" &&
      data.commercialSubType) ||
    "-";

  const propertyType =
    (typeof data.commercialPropertyType === "string" &&
      data.commercialPropertyType.trim()) ||
    (typeof data.assetType === "string" && data.assetType.trim()) ||
    "-";

  const market =
    (typeof data.micromarket === "string" && data.micromarket.trim()) || "-";

  const title = `${communityOrCommercial} ${propertyType} in ${market}`;

  const price = "1.34 Lakh";

  const daysSinceAdded = data?.dateOfLastChecked
    ? getDaysDifference(data.dateOfLastChecked, Math.floor(Date.now() / 1000))
    : 0;

  const updatedText =
    data?.dateOfLastChecked !== undefined
      ? `Updated ${getDaysFrom(data.dateOfLastChecked)} ago`
      : "-";

  const bedrooms = data?.noOfBedrooms ? `${data.noOfBedrooms}BHK` : "";
  const bathrooms = data?.noOfBathrooms ? `${data.noOfBathrooms}T` : "";
  const balconies = data?.noOfBalconies ? `${data.noOfBalconies}B` : "";

  const configParts = [bedrooms, bathrooms, balconies].filter(Boolean);
  const configurationLabel =
    configParts.length > 0 ? configParts.join(" + ") : "-";

  const basicInfo = [
    {
      key: "micromarket",
      label: data?.micromarket || "-",
    },
    {
      key: "assetType",
      label: data?.assetType || "-",
    },
    {
      key: "handover",
      label: data?.readyToMove
        ? "Ready to Move"
        : formatUnixDate(getFieldValue(data, "handOverDate")),
    },
    {
      key: "configuration",
      label: configurationLabel,
    },
  ];

  return (
    <View className="px-5 py-4 bg-white border-b border-gray-100">
      {/* Property Title */}
      <Text className="text-[18px] font-bold text-[#0A0B0A] font-[Montserrat] leading-6 mb-4">
        {title}
      </Text>

      {/* Price + Updated Time */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[20px] font-bold text-[#153E3B] font-[Montserrat] leading-6">
          ₹ {price}
        </Text>
        {daysSinceAdded > 10 ? (
          <Text className="text-[12px] font-[Lato] font-medium leading-[18px] text-brand-tertiary text-opacity-70 overflow-hidden">
            {updatedText}
          </Text>
        ) : (
          <View className="px-2 py-1 bg-[#E5F8F6] rounded-md">
            <Text className="text-[12px] font-[Lato] font-bold text-[#153E3B]">
              Newly Added
            </Text>
          </View>
        )}
      </View>

      {/* Basic Info Grid */}
      <View className="flex-row flex-wrap">
        {basicInfo.map((item, index) => (
          <View
            key={index}
            className={`w-1/2 flex-row items-center mb-3 ${
              index % 2 === 0 ? "pr-6" : "pl-6"
            }`}
          >
            <View className="mr-3">{getIcon(item.key)}</View>
            <Text className="text-[12px] font-[Lato] font-medium leading-[18px] text-[#433F3E]">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
