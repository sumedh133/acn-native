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


//properties
import {ageOfTheBuildingIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/ageOfTheBuildingIcon";
import {carpetAreaIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/carpetAreaIcon";
import {extraRoomsIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/extraRoomsIcon";
import {facingIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/facingIcon";
import {floorNumberIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/floorNumberIcon";
import {furnishingIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/furnishingIcon";
import {MaintenanceIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/maintenanceIcon";
import {nonVegAllowedIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/nonVegAllowedIcon";
import {noOfBalconiesIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/noOfBalconiesIcon";
import {parkingIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/parkingIcon";
import {petsAllowedIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/petsAllowedIcon";
import {plotBreadthIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/plotBreadthIcon";
import {plotLengthIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/PlotLengthIcon";
import {preferredTenantsIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/preferredTenantsIcon";
import {sbuaIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/sbuaIcon";
import {udsIcon} from "../assets/icons/svg/PropertyListing/PropertyDetails/udsIcon";



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
  //price

  commissionType: commissionTypeIcon,
  deposit: depositIcon,
  pricePerSqft: pricePerSqftIcon,
  rentalIncome: rentalIncomeIcon,
  totalAskPrice: totalAskPriceIcon,
  rent: rentIcon,

  //property

  ageOfTheBuilding: ageOfTheBuildingIcon,
  carpetArea: carpetAreaIcon,
  extraRooms: extraRoomsIcon,
  facing: facingIcon,
  floorNumber: floorNumberIcon,
  furnishing: furnishingIcon,
  Maintenance: MaintenanceIcon,
  nonVegAllowed: nonVegAllowedIcon,
  noOfBalconies: noOfBalconiesIcon,
  parking: parkingIcon,
  petsAllowed: petsAllowedIcon,
  plotBreadth: plotBreadthIcon,
  plotLength: plotLengthIcon,
  preferredTenants: preferredTenantsIcon,
  sbua: sbuaIcon,
  uds: udsIcon,

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
