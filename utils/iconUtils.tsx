import React from "react";
import { MicromarketIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/MicromarketIcon";
import { ApartmentIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ApartmentIcon";
import { HandoverIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/HandoverIcon";
import { ConfigurationIcon } from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ConfigurationIcon";

//price
import { commissionTypeIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/commissionTypeIcon";
import { depositIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/depositIcon";
import { pricePerSqftIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/pricePerSqftIcon";
import { rentalIncomeIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/rentalIncomeIcon";
import { totalAskPriceIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/totalAskPriceIcon";
import { rentIcon } from "../assets/icons/svg/PropertyListing/PriceDetails/rentIcon";


//properties
import { ageOfTheBuildingIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/ageOfTheBuildingIcon";
import { carpetAreaIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/carpetAreaIcon";
import { extraRoomsIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/extraRoomsIcon";
import { facingIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/facingIcon";
import { floorNumberIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/floorNumberIcon";
import { furnishingIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/furnishingIcon";
import { MaintenanceIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/maintenanceIcon";
import { nonVegAllowedIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/nonVegAllowedIcon";
import { noOfBalconiesIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/noOfBalconiesIcon";
import { parkingIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/parkingIcon";
import { petsAllowedIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/petsAllowedIcon";
import { plotBreadthIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/plotBreadthIcon";
import { plotLengthIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/PlotLengthIcon";
import { preferredTenantsIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/preferredTenantsIcon";
import { sbuaIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/sbuaIcon";
import { udsIcon } from "../assets/icons/svg/PropertyListing/PropertyDetails/udsIcon";

//Steps of form

import Step1 from '../assets/icons/svg/AddInventory/StepIcons/step1.svg';
import Step2 from '../assets/icons/svg/AddInventory/StepIcons/step2.svg';
import Step3 from '../assets/icons/svg/AddInventory/StepIcons/step3.svg';
import Step4 from '../assets/icons/svg/AddInventory/StepIcons/step4.svg';
import Step5 from '../assets/icons/svg/AddInventory/StepIcons/step5.svg';

import Step1Gradient from '../assets/icons/svg/AddInventory/StepIcons/step1_gradient.svg';
import Step2Gradient from '../assets/icons/svg/AddInventory/StepIcons/step2_gradient.svg';
import Step3Gradient from '../assets/icons/svg/AddInventory/StepIcons/step3_gradient.svg';
import Step4Gradient from '../assets/icons/svg/AddInventory/StepIcons/step4_gradient.svg';
import Step5Gradient from '../assets/icons/svg/AddInventory/StepIcons/step5_gradient.svg';

import Step1Gray from '../assets/icons/svg/AddInventory/StepIcons/step1_gray.svg';
import Step2Gray from '../assets/icons/svg/AddInventory/StepIcons/step2_gray.svg';
import Step3Gray from '../assets/icons/svg/AddInventory/StepIcons/step3_gray.svg';
import Step4Gray from '../assets/icons/svg/AddInventory/StepIcons/step4_gray.svg';
import Step5Gray from '../assets/icons/svg/AddInventory/StepIcons/step5_gray.svg';



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

type StepType = "default" | "gradient" | "gray";

//Function for step icons in the form
export const getStepIcon = (step: number, type: StepType) => {
  const icons: Record<StepType, any[]> = {
    default: [Step1, Step2, Step3, Step4, Step5],
    gradient: [Step1Gradient, Step2Gradient, Step3Gradient, Step4Gradient, Step5Gradient],
    gray: [Step1Gray, Step2Gray, Step3Gray, Step4Gray, Step5Gray],
  };

  const IconComponent = icons[type][step - 1]; // steps are 1-based
  return IconComponent ? <IconComponent width={24} height={24} /> : null;
};
