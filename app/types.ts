export interface Property {
  _geoloc?: {
    lat: number | null;
    lng: number | null;
  };
  ageOfInventory?: number | null;
  ageOfStatus?: number | null;
  area?: string | null;
  askPricePerSqft?: number | null;
  assetType?: string | null;
  buildingAge?: string | null;
  buildingKhata?: string | null;
  carpet?: number | null;
  cpCode?: string | null;
  currentStatus?: string | null;
  dateOfInventoryAdded?: number | null;
  dateOfStatusLastChecked?: number | null;
  driveLink?: string | null;
  eKhata?: boolean | null;
  exclusive?: boolean | null;
  extraDetails?: string | null;
  facing?: string | null;
  floorNo?: string | null;
  exactFloor?: number | null;
  handoverDate?: string | null;
  landKhata?: string | null;
  mapLocation?: string | null;
  micromarket?: string | null;
  nameOfTheProperty?: string | null;
  ocReceived?: boolean | null;
  plotSize?: number | null;
  propertyId?: string | null;
  sbua?: number | null;
  status?: string | null;
  tenanted?: boolean | null;
  totalAskPrice?: number | number;
  unitType?: string | null;
  photo?: string[] | null;
  video?: string[] | null;
  document?: string[] | null;

  objectID?: string;
}

export interface Budget {
  from?: number;
  to?: number;
}

export interface Requirement {
  id?: string;
  added?: number;
  agentCpid?: string;
  area?: number;
  assetType?: string;
  budget: Budget;
  configuration?: string;
  lastModified?: number;
  marketValue?: string;
  propertyName?: string;
  requirementDetails?: string;
  requirementId?: string;
  [key: string]: any;
}

export interface Enquiry {
  id: string;
  added?: number;
  cpId?: string;
  enquiryId?: string;
  lastModified?: number;
  propertyId?: string;
  status?: string;
  [key: string]: any; // for additional dynamic fields
}

export interface EnquiryWithProperty extends Enquiry {
  property?: Property | null;
}

export interface Coupon {
  name: string;
  code: string;
  description: string;
  discount: number; // in rupees
  active: boolean;
}

export interface Landmark {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export interface Places {
  name: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  mapLocation: string | null;
}

export interface ListingProperty extends Property {
  address: string | null;
  communityType: string | null;
  userStatus: string | null;
  [key: string]: any;
}
