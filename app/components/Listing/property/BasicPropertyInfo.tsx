import React from "react";
import { View, Text } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";
import {
  formatUnixDate,
  getDaysDifference,
  getDaysFrom,
  formatPrice,
} from "../../../helpers/format/format";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

export const BasicPropertyInfo: React.FC<{ data: Partial<UIProperty>, previewType: string }> = ({
  data, previewType
}) => {

  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const communityOrCommercial =
    (typeof data.communityType === "string" && data.communityType.trim()) ||
    (typeof data.commercialSubType === "string" && data.commercialSubType) ||
    "";

  const propertyType =
    (typeof data.commercialPropertyType === "string" &&
      data.commercialPropertyType.trim()) ||
    (typeof data.assetType === "string" && data.assetType.trim()) ||
    "";

  const market =
    (typeof data.micromarket === "string" && data.micromarket.trim()) || "";

  let title = [communityOrCommercial, propertyType].filter(Boolean).join(" ");

  if (market) {
    title = `${title} in ${market}`;
  }

  let priceLabel = "";
  let showMonthSuffix = false;
  if (data?.pricing?.totalAskPrice) {
    priceLabel = formatPrice(data.pricing.totalAskPrice);
  } else if (data?.pricing?.pricePerSqft) {
    priceLabel = formatPrice(data.pricing.pricePerSqft);
  } else if (data?.rentalInfo?.rent) {
    priceLabel = formatPrice(data.rentalInfo.rent);
    showMonthSuffix = true;
  }

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

  let configurationLabel = "-";

  if (configParts.length > 0) {
    configurationLabel = configParts.join(" + ");
  } else if (data?.plotLength && data?.plotBreadth) {
    configurationLabel = `${data.plotLength} x ${data.plotBreadth} Sqft`;
  } else if (data?.noOfSeats) {
    configurationLabel = `${data.noOfSeats} Seats`;
  } else if (data?.sbua) {
    configurationLabel = `${data.sbua} Sqft`;
  }

  const basicInfo = [
    {
      key: "micromarket",
      label: data?.micromarket || "-",
    },
    {
      key: "assetType",
      label:
        data?.assetType?.trim() || data?.commercialPropertyType?.trim() || "-",
    },
    {
      key: "handover",
      label: data?.readyToMove ||data?.possession==="Ready to Move"
        ? "Ready to Move"
        : data?.handOverDate
          ? (() => {
            // convert "MM/YYYY" -> timestamp (seconds)
            const [mm, yyyy] = data.handOverDate.split("/");
            const parsedDate = new Date(Number(yyyy), Number(mm) - 1, 1);
            return formatUnixDate(Math.floor(parsedDate.getTime() / 1000));
          })()
          : "-",
    },
    {
      key: "configuration",
      label: configurationLabel,
    },
  ];

  return (
    <View className="px-5 py-4 bg-white border-b border-[#CFCECE]">
      {/* Property Title */}
      <Text className="text-base font-bold text-black font-montserrat leading-[150%] mb-4">
        {title}
      </Text>

      {/* Price + Updated Time */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-baseline">
          <Text className="text-[20px] font-bold text-[#153E3B] font-[Montserrat] leading-6">
            ₹ {priceLabel}
          </Text>
          {showMonthSuffix && (
            <Text className="text-[14px] font-[Lato] text-gray-500 ">
              /Month
            </Text>
          )}
        </View>
        {previewType === 'listing' && (
          daysSinceAdded > 10 ? (
            <Text className="text-[12px] font-[Lato] font-medium leading-[18px] text-brand-tertiary text-opacity-70 overflow-hidden">
              {updatedText}
            </Text>
          ) : (
            <View className="px-2 py-1 bg-[#E5F8F6] rounded-md">
              <Text className="text-[12px] font-[Lato] font-bold text-[#153E3B]">
                Newly Added
              </Text>
            </View>
          )
        )}

      </View>

      {/* Basic Info Grid */}
      <View className="flex-row flex-wrap">
        {basicInfo.map((item, index) => (
          <View
            key={index}
            className={`w-1/2 flex-row items-center mb-3 ${index % 2 === 0 ? "pr-6" : "pl-6"
              }`}
          >
            <View className="mr-2">{getIcon(item.key)}</View>
            <Text className="text-[12px] font-lato font-medium leading-[150%] text-[#433F3E]">
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
