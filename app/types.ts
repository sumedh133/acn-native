export interface Property {
  propertyId: string;
  title?: string;
  nameOfTheProperty?: string;
  micromarket?: string;
  assetType?: string;
  unitType?: string;
  facing?: string;
  totalAskPrice?: number;
  askPricePerSqft?: number;
  sbua?: number;
  plotSize?: number;
  carpet?: number;
  floorNo?: string;
  handoverDate?: string;
  buildingKhata?: string;
  landKhata?: string;
  buildingAge?: string;
  tenanted?: boolean;
  area?: string;
  dateOfInventoryAdded?: number;
  extraDetails?: string;
  driveLink?: string;
  photo?: string[];
  video?: string[];
  mapLocation?: string;
  cpId?: string;
  cpCode?: string;
  description?: string;
  status?: string;
  objectID?: string;
  dateOfStatusLastChecked?: number;
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
