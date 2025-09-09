import React from "react";
import { View, Text } from "react-native";
import { Property } from "@/app/types";
import { getIcon } from "../../../../utils/iconUtils";
import {
  formatUnixDate,
  getDaysDifference,
  getDaysFrom,
  formatPrice,
  toCapitalize,
} from "../../../helpers/format/format";
import { getUnixDateTime } from "@/app/helpers/getUnixDateTime";

type UIProperty = Omit<Property, "handOverDate"> & {
  handOverDate?: string;
};

const safeDaysFrom = (timestamp: any): number => {
  try {
    const result = getDaysFrom(timestamp);
    const match = String(result).match(/\d+/);

    if (match) {
      return parseInt(match[0], 10);
    }

    return 0;
  } catch (error) {
    console.warn("Error calculating days from:", error);
    return 0;
  }
};

const safeText = (value: any, fallback: string = "-"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "object") return fallback; // Don't render objects
  return String(value) || fallback;
};

export const BasicPropertyInfo: React.FC<{
  data: Partial<UIProperty>;
  previewType: string;
}> = ({ data, previewType }) => {
  const getFieldValue = (obj: any, path: string) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const communityOrCommercial =
    (typeof data.communityType === "string" && data.communityType.trim()) ||
    (typeof data.commercialSubType === "string" && data.commercialSubType) ||
    "";

  const propertyType =
    (typeof data.assetType === "string" && data.assetType.trim()) ||
    (typeof data.commercialPropertyType === "string" &&
      data.commercialPropertyType.trim()) ||
    "";

  const propertyName =
    (typeof data.propertyName === "string" && data.propertyName.trim()) || "";

  let title = propertyName
    ? propertyName
    : [communityOrCommercial, propertyType, `for ${data.listingType}`]
        .filter(Boolean)
        .join(" ");

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
    ? getDaysDifference(data.dateOfLastChecked, getUnixDateTime())
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

  function getHandoverLabel(data: any): string {
    const possession = data?.possession
      ? data.possession === "ready to move"
        ? "ready to move"
        : data?.handoverDate
        ? formatUnixDate(data.handoverDate)
        : "Unconfirmed"
      : "Unconfirmed";

    return possession;
  }

  console.log(getHandoverLabel(data));

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
      label: getHandoverLabel(data),
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
        {previewType === "listing" &&
          (() => {
            if (daysSinceAdded < 1) {
              return (
                <View className="px-2 py-1 bg-[#E5F8F6] rounded-md">
                  <Text className="text-[12px] font-[Lato] font-bold text-[#153E3B]">
                    Newly Added
                  </Text>
                </View>
              );
            } else if (daysSinceAdded < 10) {
              const daysFromAdded = safeDaysFrom(data.added);
              return (
                <Text className="text-[12px] font-[Lato] font-medium leading-[18px] text-brand-tertiary text-opacity-70 overflow-hidden">
                  Added {safeText(daysFromAdded)}{" "}
                  {daysFromAdded === 1 ? "day" : "days"} ago
                </Text>
              );
            } else {
              const daysFromLastChecked = safeDaysFrom(data.dateOfLastChecked);
              return (
                <Text className="text-[12px] font-[Lato] font-medium leading-[18px] text-brand-tertiary text-opacity-70 overflow-hidden">
                  Updated {safeText(daysFromLastChecked)}{" "}
                  {daysFromLastChecked === 1 ? "day" : "days"} ago
                </Text>
              );
            }
          })()}
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
            <View className="mr-2">{getIcon(item.key)}</View>
            <Text className="text-[12px] font-lato font-medium leading-[150%] text-[#433F3E]">
              {toCapitalize(item.label)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
