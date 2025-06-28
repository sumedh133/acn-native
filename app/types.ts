export interface GeoLocation {
  lat: number | null;
  lng: number | null;
}

export interface Property {
  id: string;
  propertyId: string | null;
  cpId: string | null;
  propertyName: string | null;
  _geoloc: GeoLocation;
  area: string | null;
  builerName: string | null;
  builderCategory: string | null;
  micromarket: string | null;
  mapLocation: string | null;
  assetType: string | null;
  unitType: string | null;
  subType: string | null | undefined;
  sbua: number | null;
  carpet: number | null;
  plotSize: number | null;
  buildingAge: number | null;
  floorNo: string | null;
  facing: string | null;
  tenanted: boolean | null;
  totalAskPrice: number | null;
  askPricePerSqft: number;
  status: string | null;
  currentStatus: string | null;
  builderName: string | null;
  handoverDate: number | null;
  buildingKhata: string | null;
  landKhata: string | null;
  ocReceived: boolean | null;
  photo: string[];
  video: string[];
  document: string[];
  driveLink: string | null;
  dateOfInventoryAdded: number;
  dateOfStatusLastChecked: number;
  ageOfInventory: number;
  ageOfStatus: number;
  extraDetails: string | null;
}

export interface Budget {
  from?: number;
  to?: number;
}

export interface Requirement {
  requirementId: string;
  agentPhoneNumber: string;
  agentName: string;
  cpId: string;
  assetType:
    | "villa"
    | "apartment"
    | "plot"
    | "commercial"
    | "warehouse"
    | "office";
  configuration: "1 bhk" | "2 bhk" | "3 bhk" | "4 bhk" | "5+ bhk" | null;
  micromarket: string;
  budget: Budget;
  area: number;
  kamId: string;
  kamName: string;
  kamPhoneNumber: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  propertyName: string;
  extraDetails: string;
  marketValue: string;
  requirementStatus: "open" | "close";
  internalStatus: "found" | "not found" | "pending";
  added: number;
  lastModified: number;
  matchingProperties: string[];
}

// ==================== ENQUIRY TYPES ====================

export interface IReview {
  review: string;
  stars: number;
  timestamp: number;
}

export interface Enquiry {
  enquiryId: string;
  // property details
  propertyId: string;
  propertyName: string;
  // buyer agent details
  buyerCpId: string;
  buyerName: string;
  buyerNumber: string;
  // seller agent details
  sellerCpId: string;
  sellerName: string;
  sellerNumber: string;
  // enquiry details
  status: "site visit done" | "pending" | "not interested" | "interested";
  added: number;
  lastModified: number;
  reviews: IReview[];
}

export interface EnquiryWithProperty extends Enquiry {
  property?: Property | null;
}

export interface Coupon {
  name: string;
  code: string;
  description: string;
  discount_percent: number; // in percentage
  // discount: number; // in rupees
  active: boolean;
  plansApplicable: string[];
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
  firebaseUri?: string | null;
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
  eKhata?: boolean | null;
  exactFloor?: number | null;
  exclusive?: boolean | null;
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
  subType: string | null | undefined;
  uds?: number | null;
  unitNo?: string | null;
  lastModified?: number | null;
  extraRoom?: string[] | null;
  plotFacing?: string | null;
  // [key: string]: any;
}

export interface NotificationItem {
  id: string;
  addedTime: number;
  cpId: string;
  cta: string[];
  body: string;
  expiryTime: number;
  title: string;
  type: string;
  propertyId?: string;
  archived?: boolean;
  [key: string]: any;
}

export interface SubscriptionPlan {
  id: string;
  product: string;
  productDescription: string;
  productDescriptionDesktop: string;
  productName: string;
  productPrice: number;
  taxPercentage: number;
  validityPeriod: string;
}
