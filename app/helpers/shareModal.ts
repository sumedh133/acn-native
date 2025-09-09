import * as Linking from "expo-linking";
import axios from "axios";
import { formatUnixDate } from "./getUnixDateTime";
import { formatCost2 } from "./common";
import { Property } from "../types";
import { toCapitalize } from "./format/format";

const shortenUrl = async (longUrl: string) => {
  if (!longUrl) {
    console.warn("No URL provided to shorten.");
    return null;
  }

  // Array of URL shortening services to try
  const shortenerServices = [
    async (url: string) => {
      const response = await axios.get(
        `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`
      );
      return response.data.result.full_short_link;
    },
    async (url: string) => {
      const response = await axios.post(
        "https://tinyurl.com/api-create.php",
        null,
        {
          params: { url: url },
        }
      );
      return response.data;
    },
  ];

  // Try each service in sequence
  for (const shortener of shortenerServices) {
    try {
      const shortUrl = await shortener(longUrl);
      if (shortUrl) return shortUrl;
    } catch (error: any) {
      console.warn("URL shortening attempt failed:", error.message);
      continue;
    }
  }

  // If all services fail, return the original URL
  console.warn("All URL shortening services failed, using original URL");
  return longUrl;
};

export const createPropertyMessage = async (
  property: Property,
  agentNumber: string,
  agentName: string
) => {
  const projectName = property.propertyName || "Unnamed Project";

  const shortDriveLink = property?.driveLink
    ? await shortenUrl(property.driveLink)
    : null;

  const shortMapLocation = property?.mapLocation
    ? await shortenUrl(property.mapLocation)
    : null;

  const appendDetail = <T1, T2>(label: T1, value: T2): string | undefined =>
    value ? `*${label}*: ${value}` : undefined;

  console.log(property);

  const bedrooms = property?.noOfBedrooms ? `${property.noOfBedrooms}BHK` : "";
  const bathrooms = property?.noOfBathrooms ? `${property.noOfBathrooms}T` : "";
  const balconies = property?.noOfBalconies ? `${property.noOfBalconies}B` : "";

  const configParts = [bedrooms, bathrooms, balconies].filter(Boolean);

  const details = [
    appendDetail("Micromarket", property.micromarket),
    appendDetail(
      "Handover Date",
      property.handOverDate && formatUnixDate(property.handOverDate)
    ),
    appendDetail("Asset Type", toCapitalize(property.assetType)),
    appendDetail("Configuration", configParts),
    `${appendDetail("SBUA", property.sbua)} ${property.sbua ? `sqft` : ""}`,
    appendDetail("Facing", property.facing),
    appendDetail(
      "Total Ask Price",
      property.pricing?.totalAskPrice
        ? `${formatCost2(property.pricing.totalAskPrice)}`
        : null
    ),
    appendDetail("Photos/Videos", shortDriveLink),
    appendDetail("Location", shortMapLocation),
  ]
    .filter(Boolean)
    .join("\n");

  const message = encodeURIComponent(
    `Hi, 
I am sharing details about a property that suits your requirements.

*Project Name*: ${projectName}
${details}

For more details, please contact me at
${agentName}
${agentNumber}`
  );

  return message;
};

export const shareProperty = async (
  property: Property,
  agentNumber: string,
  agentName: string
) => {
  const message = await createPropertyMessage(property, agentNumber, agentName);
  const whatsappUrl = `https://wa.me/?text=${message}`;
  Linking.openURL(whatsappUrl);
};
