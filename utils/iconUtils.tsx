// src/assets/icons/iconMap.ts
// BasicDetailsHeader
import MicromarketIcon from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/MicromarketIcon.svg";
import ApartmentIcon from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ApartmentIcon.svg";
import HandoverIcon from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/HandoverIcon.svg";
import ConfigurationIcon from "../assets/icons/svg/PropertyListing/BasicDetailsHeader/ConfigurationIcon.svg";

// PriceDetails
import CommissionTypeIcon from "../assets/icons/svg/PropertyListing/PriceDetails/commissionTypeIcon.svg";
import DepositIcon from "../assets/icons/svg/PropertyListing/PriceDetails/depositIcon.svg";
import PricePerSqftIcon from "../assets/icons/svg/PropertyListing/PriceDetails/pricePerSqftIcon.svg";
import RentalIncomeIcon from "../assets/icons/svg/PropertyListing/PriceDetails/rentalIncomeIcon.svg";
import TotalAskPriceIcon from "../assets/icons/svg/PropertyListing/PriceDetails/totalAskPriceIcon.svg";
import RentIcon from "../assets/icons/svg/PropertyListing/PriceDetails/rentIcon.svg";

// PropertyDetails
import AgeOfTheBuildingIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/ageOfTheBuildingIcon.svg";
import CarpetAreaIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/carpetAreaIcon.svg";
import ExtraRoomsIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/extraRoomsIcon.svg";
import FacingIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/facingIcon.svg";
import FloorNumberIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/floorNumberIcon.svg";
import FurnishingIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/furnishingIcon.svg";
import MaintenanceIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/maintenanceIcon.svg";
import NonVegAllowedIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/nonVegAllowedIcon.svg";
import NoOfBalconiesIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/noOfBalconiesIcon.svg";
import ParkingIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/parkingIcon.svg";
import PetsAllowedIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/petsAllowedIcon.svg";
import PlotBreadthIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/plotBreadthIcon.svg";
import PlotLengthIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/PlotLengthIcon.svg";
import PreferredTenantsIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/preferredTenantsIcon.svg";
import SbuaIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/sbuaIcon.svg";
import UdsIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/udsIcon.svg";

import ApartmentTypeIcon from "../assets/icons/svg/PropertyListing/PropertyDetails/apartmentTypeIcon.svg";
import { apartmentTypes } from "@/app/components/property/propertyMoreFilters/moreFilterOptions";

// map string keys to icon components
export const iconMap: Record<string, React.FC<any>> = {
  micromarket: MicromarketIcon,
  location: MicromarketIcon,
  assetType: ApartmentIcon,
  type: ApartmentIcon,
  handover: HandoverIcon,
  handOverDate: HandoverIcon,
  possession: HandoverIcon,
  configuration: ConfigurationIcon,
  bedrooms: ConfigurationIcon,

  // price
  commissionType: CommissionTypeIcon,
  deposit: DepositIcon,
  pricePerSqft: PricePerSqftIcon,
  rentalIncome: RentalIncomeIcon,
  totalAskPrice: TotalAskPriceIcon,
  rent: RentIcon,

  // property
  ageOfTheBuilding: AgeOfTheBuildingIcon,
  carpetArea: CarpetAreaIcon,
  extraRooms: ExtraRoomsIcon,
  facing: FacingIcon,
  floorNumber: FloorNumberIcon,
  furnishing: FurnishingIcon,
  maintenance: MaintenanceIcon,
  nonVegAllowed: NonVegAllowedIcon,
  noOfBalconies: NoOfBalconiesIcon,
  parking: ParkingIcon,
  petsAllowed: PetsAllowedIcon,
  plotBreadth: PlotBreadthIcon,
  plotLength: PlotLengthIcon,
  preferredTenants: PreferredTenantsIcon,
  sbua: SbuaIcon,
  uds: UdsIcon,

  apartmentType: ApartmentTypeIcon,
};



export const getIcon = (
  key: string,
  props?: { width?: number; height?: number; fill?: string }
): JSX.Element => {
  // extract last part after "."
  const cleanKey = key.split(".").pop() || key;

  // exact match
  const IconComponent = iconMap[cleanKey];
  if (IconComponent) {
    return <IconComponent {...props} />;
  }

  // fallback
  return <></>;
};
