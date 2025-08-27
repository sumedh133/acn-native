import { FilterChipItem } from "./FilterChipList";
import apartmentIcon from "@/assets/icons/propertiesMoreFilters/apartment.svg";
import villaIcon from "@/assets/icons/propertiesMoreFilters/villa.svg";
import villamentIcon from "@/assets/icons/propertiesMoreFilters/villament.svg";
import rowHouseIcon from "@/assets/icons/propertiesMoreFilters/apartment.svg";
import independentHouseIcon from "@/assets/icons/propertiesMoreFilters/apartment.svg";
import plotIcon from "@/assets/icons/propertiesMoreFilters/plot.svg";
import officeSpaceIcon from "@/assets/icons/propertiesMoreFilters/office-space.svg";
import retailSpaceIcon from "@/assets/icons/propertiesMoreFilters/retail-space.svg";
import commercialSpaceIcon from "@/assets/icons/propertiesMoreFilters/commercial-space.svg";
import React from "react";
import { DropdownOption } from "../../DropdownTailwind";


export const residentialPropertyTypes: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}[] = [
  {
    label: "Apartment",
    value: "apartment",
    icon: React.createElement(apartmentIcon, { width: 40, height: 40 }),
  },
  {
    label: "Villa",
    value: "villa",
    icon: React.createElement(villaIcon, { width: 40, height: 40 }),
  },
  {
    label: "Villament",
    value: "villament",
    icon: React.createElement(villamentIcon, { width: 40, height: 40 }),
  },
  {
    label: "Independent House",
    value: "independent house",
    icon: React.createElement(independentHouseIcon, { width: 40, height: 40 }),
  },
  {
    label: "Row House",
    value: "row house",
    icon: React.createElement(rowHouseIcon, { width: 40, height: 40 }),
  },
  {
    label: "Plot",
    value: "plot",
    icon: React.createElement(plotIcon, { width: 40, height: 40 }),
  },
];

export const commercialSubTypes: Record<string, FilterChipItem[]> = {
  "Office Space": [
    { label: "Independent Office Space", value: "Independent Office Space" },
    { label: "Co-Working", value: "Co-Working" },
    { label: "IT Park", value: "IT Park" },
  ],
  "Retail Space": [
    { label: "Commercial Shop", value: "Commercial Shop" },
    { label: "Showroom", value: "Showroom" },
  ],
  "Commercial Space": [
    { label: "Business Center", value: "Business Center" },
    { label: "Warehouse", value: "Warehouse" },
    { label: "Cold Storage", value: "Cold Storage" },
  ],
};

// ✅ Commercial options
export const commercialPropertyTypes: FilterChipItem[] = [
  {
    label: "Office Space",
    value: "Office Space",
    icon: React.createElement(officeSpaceIcon, { width: 40, height: 40 }),
  },
  {
    label: "Retail Space",
    value: "Retail Space",
    icon: React.createElement(retailSpaceIcon, { width: 40, height: 40 }),
  },
  {
    label: "Commercial Space",
    value: "Commercial Space",
    icon: React.createElement(commercialSpaceIcon, { width: 40, height: 40 }),
  },
];

export const apartmentTypes: FilterChipItem[] = [
  { label: "Simplex", value: "Simplex" },
  { label: "Duplex", value: "Duplex" },
  { label: "Triplex", value: "Triplex" },
  { label: "Quadplex", value: "Quadplex" },
];

export const bedroomOptions: FilterChipItem[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "6+", value: "6+" },
];

export const facingOptions: DropdownOption[] = [
  { label: "North", value: "North", count: 5 },
  { label: "South", value: "South", count: 3 },
  { label: "East", value: "East", count: 4 },
  { label: "West", value: "West", count: 2 },
];
export const floorOptions: DropdownOption[] = [
  { label: "Lower Floors", value: "Lower Floors"},
  { label: "Middle Floors", value: "Middle Floors"},
  { label: "Upper Floors", value: "Upper Floors"},
  { label: "Penthouse", value: "Penthouse"},
];
export const preferredTenantsOptions: DropdownOption[] = [
  { label: "Anyone", value: "Anyone"},
  { label: "Family", value: "Family"},
  { label: "Bachelor Male", value: "Bachelor Male"},
  { label: "Bachelor Female", value: "Bachelor Female"},
];
