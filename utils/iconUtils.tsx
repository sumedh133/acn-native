import React from "react";
import { MicromarketIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/MicromarketIcon";
import { ApartmentIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ApartmentIcon";
import { HandoverIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/HandoverIcon";
import { ConfigurationIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ConfigurationIcon";

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  micromarket: MicromarketIcon,
  location: MicromarketIcon, 
  apartment: ApartmentIcon,
  type: ApartmentIcon,
  handover: HandoverIcon,
  possession: HandoverIcon, 
  configuration: ConfigurationIcon,
  bedrooms: ConfigurationIcon, 
};

export const getIcon = (key: string): JSX.Element => {
  const lower = key.toLowerCase();

  for (const mapKey in iconMap) {
    if (lower.includes(mapKey)) {
      const Icon = iconMap[mapKey];
      return <Icon />; 
    }
  }

  return <></>; 
};
