import React from "react";
import { MicromarketIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/MicromarketIcon";
import { ApartmentIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ApartmentIcon";
import { HandoverIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/HandoverIcon";
import { ConfigurationIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ConfigurationIcon";

//price
import {commissionTypeIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/commissionTypeIcon";
import {depositIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/depositIcon";
import {pricePerSqftIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/pricePerSqftIcon";
import {rentalIncomeIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/rentalIncomeIcon";
import {totalAskPriceIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/totalAskPriceIcon";
import {rentIcon} from "../assets/icons/svg/PropertyListing/PriceDetails/rentIcon";



import {plotBreadthIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/plotBreadthIcon";
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  micromarket: MicromarketIcon,
  location: MicromarketIcon, 
  assetType: ApartmentIcon,
  type: ApartmentIcon,
  handover: HandoverIcon,
  possession: HandoverIcon, 
  configuration: ConfigurationIcon,
  bedrooms: ConfigurationIcon, 
  plotBreadth: plotBreadthIcon,
  //price

  commissionType: commissionTypeIcon,
  deposit: depositIcon,
  pricePerSqft: pricePerSqftIcon,
  rentalIncome: rentalIncomeIcon,
  totalAskPrice: totalAskPriceIcon,
  rent: rentIcon

  //property

  

};

export const getIcon = (key: string): JSX.Element => {
  //const lower = key.toLowerCase();

  for (const mapKey in iconMap) {
    if (key.includes(mapKey)) {
      const Icon = iconMap[mapKey];
      return <Icon />; 
    }
  }

  return <></>; 
};
