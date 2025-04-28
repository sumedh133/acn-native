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
  buildingAge?: number | null;
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
  totalAskPrice?: number | null;
  unitType?: string | null;
  photo?: string[];
  video?: string[];
  document?: string[];

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

export interface UploadedFileUrls {
  [key: string]: string[];
  photo: string[];
  video: string[];
  document: string[];
}

export interface FileObject {
  name?: string | null;
  size?: number | null;
  uri?: string | null;
  type?: string | null;
}

export interface DocsToUpload {
  [key: string]: FileObject[];
  photo: FileObject[];
  video: FileObject[];
  document: FileObject[];
}

export interface IdGenerationResult {
  lastId: string;
  nextId: string;
}

export interface ListingProperty extends Property {
  address?: string | null;
  biappaApproved?: boolean | null;
  bdaApproved?: boolean | null;
  carPark?: number | null;
  communityType?: string | null;
  cornerUnit?: boolean | null;
  furnishing?: string | null;
  balconyFacing?: string | null;
  kamId?: string | null;
  kamStatus?: string | null;
  noOfBalconies?: number | null;
  noOfBathrooms?: number | null;
  qcStatus?: string | null;
  rentalIncome?: number | null;
  stage?: string | null; //stage
  structure?: number | null;
  subType?: string | null;
  uds?: number | null;
  unitNo?: string | null;
  lastModified?: number | null;
  [key: string]: any;
}
