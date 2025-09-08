export interface GeoLocation {
  lat?: number | null;
  lng?: number | null;
}

// export interface Property {
//   id: string;
//   propertyId: string | null;
//   cpId: string | null;
//   propertyName: string | null;
//   _geoloc: GeoLocation;
//   area: string | null;
//   builerName: string | null;
//   builderCategory: string | null;
//   micromarket: string | null;
//   mapLocation: string | null;
//   assetType: string | null;
//   unitType: string | null;
//   subType: string | null | undefined;
//   sbua: number | null;
//   carpet: number | null;
//   plotSize: number | null;
//   buildingAge: number | null;
//   floorNo: string | null;
//   facing: string | null;
//   tenanted: boolean | null;
//   totalAskPrice: number | null;
//   askPricePerSqft: number;
//   status: string | null;
//   currentStatus: string | null;
//   builderName: string | null;
//   handoverDate: number | null;
//   buildingKhata: string | null;
//   landKhata: string | null;
//   ocReceived: boolean | null;
//   photo: string[];
//   video: string[];
//   document: string[];
//   driveLink: string | null;
//   dateOfInventoryAdded: number;
//   dateOfStatusLastChecked: number;
//   ageOfInventory: number;
//   ageOfStatus: number;
//   extraDetails: string | null;
// }

export interface Budget {
  from?: number;
  to?: number;
}

export interface Requirement {
  requirementId: string;
  agentPhoneNumber: string;
  agentName: string;
  cpId: string;
  assetType: string;
  configuration: "1 bhk" | "2 bhk" | "3 bhk" | "4 bhk" | "5+ bhk" | null;
  micromarket?: string;
  budget: Budget;
  area?: number;
  kamId: string;
  kamName: string;
  kamPhoneNumber: string;
  bedrooms?: string;
  bathrooms?: string;
  parking?: string;
  propertyName: string;
  marketValue: string;
  requirementStatus: "open" | "close";
  internalStatus: "found" | "not found" | "pending";
  added: number;
  lastModified: number;
  matchingProperties?: string[];
  requirementDetails?: string;
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
  isNew: boolean;
  isContactShared: boolean; //for checking whether seller has clicked get contact or not
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
  name?: string;
  size?: number | null;
  uri: string;
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

export interface ListingProperty {
  _geoloc: GeoLocation;
  id: string;
  address: string | null;
  ageOfInventory: number;
  agentName: string | null;
  agentPhoneNumber: string | null;
  ageOfStatus: number;
  area: string | null;
  askPricePerSqft: number;
  assetType: string | null;
  builerName: string | null;
  builderCategory: string | null;
  builderName: string | null;
  biappaApproved: boolean;
  bdaApproved: boolean;
  buildingAge: string | null;
  buildingKhata: string | null;
  carPark: number | null;
  carpet: number | null;
  communityType: string;
  cornerUnit: boolean;
  cpId: string | null;
  currentStatus: string | null;
  dateOfInventoryAdded: number;
  dateOfStatusLastChecked: number;
  driveLink: string | null;
  eKhata: boolean;
  exactFloor: number | null;
  extraRoom: string[] | null;
  exclusive: boolean;
  extraDetails: string | null;
  facing: string | null;
  floorNo: string | null;
  furnishing: string | null;
  handoverDate: string | number | null;
  balconyFacing: string | null;
  kamId: string | null;
  kamStatus: string | null;
  landKhata: string | null;
  mapLocation: string | null;
  micromarket: string | null;
  propertyName: string | null;
  noOfBalconies: number | null;
  noOfBathrooms: number | null;
  ocReceived: boolean;
  plotFacing: string | null;
  plotSize: number | null;
  propertyId: string | null;
  qcStatus: string | null;
  rentalIncome: number | null;
  sbua: number | null;
  stage: string | null;
  status: string | null;
  structure: string | null;
  subType: string | null;
  tenanted: boolean;
  totalAskPrice: number | null;
  uds: number | null;
  unitNo: string | null;
  unitType: string | null;
  photo: string[];
  video: string[];
  document: string[];
  lastModified?: number | null;
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
  isRead?: boolean;
  icon?: string;
  notificationId: string;
  meta?: {
    [key: string]: any;
  } | null;
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

// Base types remain the same
type assetType =
  // residential
  | "apartment"
  | "villa"
  | "villament"
  | "independent house"
  | "row house"
  | "plot"
  // commercial
  | "office space"
  | "retail space"
  | "commercial space";

type propertyType = "Residential" | "Commercial";
type listingType = "resale" | "rental";

type extraRooms =
  | ["Servant Room" | "Study Room" | "Pooja Room" | "Other"]
  | null;
type noOfBedrooms = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type noOfBathrooms = 1 | 2 | 3 | 4 | 5 | "5+";
type noOfBalconies = 0 | 1 | 2 | 3 | 4 | 5 | "5+";
type balconyFacing = "Inside" | "Outside";
type possession = "ready to move" | "under construction";
type ageOfTheBuilding =
  | "New"
  | "1-5 years"
  | "6-10 years"
  | "11-15 years"
  | "15+ Years";

type furnishing = "unfurnished" | "semi-furnished" | "fully-furnished";
type direction = "North" | "South" | "East" | "West";
type apartmentType = "Simple" | "Duplex" | "Triplex" | "Penthouse";
type amenities = [
  | "Gym"
  | "Lifts"
  | "Water Storage"
  | "Visitor Parking"
  | "Service Lifts"
  | "Pool"
  | "CCTV Surveillance"
  | "Security"
  | "Power Backup"
  | "Club-House"
];
type maintenance = "Included" | "Not Included";
type commissionType = "Side by Side" | "Commission Sharing";
type preferredTenants = [
  "Anyone",
  "Family",
  "Bachelor Female",
  "Bachelor Male"
];
type communityType = "Gated" | "Independent";
type landKhata = "A" | "B";

type PropertyType = "Office Space" | "Retail Space" | "Commercial Space";
type commercialSubType = PropertyType extends "Office Space"
  ? "Independent Office Space" | "IT Park" | "Co-Working Space"
  : PropertyType extends "Retail Space"
  ? "Commercial Shop" | "Showroom"
  : PropertyType extends "Commercial Space"
  ?
      | "PG/Guest-House"
      | "Warehouse"
      | "Commercial Plot"
      | "Industrial Shed"
      | "Factory"
      | "Other"
  : never;

type commercialAmenities = [
  | "Power Backup"
  | "Security"
  | "Lifts"
  | "Water Storage"
  | "CCTV Surveillance"
  | "Visitor Parking"
  | "Cafeteria / Food Court"
  | "Maintenance Staff"
  | "ATM"
  | "Wheel-Chair Accessibility"
];

type furnishingCommercial = "Bare Shell" | "Warm Shell" | "Plug & Play";

type suitableWarehouse =
  | "Godown"
  | "Dark Store"
  | "Industrial Warehouse"
  | "Cold Storage";

// Property Interface
export interface Property {
  // Core Identity
  propertyId: string;
  listingType: "resale" | "rental";
  propertyType: "residential" | "commercial";
  assetType: assetType;
  source: "app" | "web" | "crm";

  // Agent Information
  cpId: string;
  agentName: string;
  agentPhoneNumber: string;

  // KAM Information
  kamId: string;
  kamName: string;

  // Metadata
  added: number;
  dateOfLastChecked: number;
  lastModified: number;
  status: string;

  // QC Flow
  kamStatus: string;
  dataStatus: string;
  stage: string;

  // Location Information
  propertyName: string | null;
  micromarket: string | null;
  mapLocation: string | null;
  zone: string | null;
  communityType: communityType;
  _geoloc: GeoLocation;

  // Area Measurements (unified naming)
  sbua: number; // Renamed from sbua for clarity
  carpetArea?: number;
  plotArea?: number;

  // Orientation
  facing: direction; // Unified from doorFacing/facing

  // Residential Specific Fields
  apartmentType?: apartmentType;
  structure?: string; // For villas, villaments, etc.
  noOfBedrooms?: noOfBedrooms;
  extraRooms?: extraRooms;
  noOfBathrooms?: noOfBathrooms;
  noOfBalconies?: noOfBalconies;
  balconyFacing?: balconyFacing;

  // Floor Information
  floorNumber?: number; // Unified from floorNo/floor/exactFloorNo
  referredFloorNumber?: string | null; // String reference for floor (e.g., "Ground Floor", "Mezzanine", "Basement")
  totalFloors?: number;

  // Commercial Specific Fields
  noOfSeats?: number;
  waterSupply?: boolean;
  typeOfWaterSupply?: "Borewell" | "Cauvery";

  // Plot Specific Fields
  plotNo?: string;
  plotLength?: number;
  plotBreadth?: number;
  oddSized?: boolean;

  // Furnishing (unified)
  furnishing?: furnishing | furnishingCommercial;

  // Building Age & Possession
  ageOfTheBuilding?: ageOfTheBuilding;
  possession?: possession;
  availableFrom?: number; // Unified availability date
  readyToMove?: boolean;
  handOverDate?: number; // Unified from handOverData/handOverDate

  // Financial Information
  pricing?: {
    totalAskPrice?: number;
    pricePerSqft?: number;
  };

  sold: {
    soldPrice?: number;
    soldPlatform?: string;
  };

  // Rental Information (unified structure)
  rentalInfo?: {
    rent: number;
    deposit: number;
    maintenance: maintenance;
    maintenanceAmount: number;
    commissionType: commissionType;
    // For resale properties that are rented out
    rentalIncome?: number;
    currentDeposit?: number;
    startDate?: number;
    endDate?: number;

    isPreLeased?: boolean;
  };

  // Tenant Preferences (rental only)
  tenantPreferences?: {
    preferredTenants: preferredTenants;
    petsAllowed: boolean;
    nonVegAllowed: boolean;
  };

  // Property Features
  features?: {
    cornerUnit: boolean;
    exclusive: boolean;
    ocReceived?: boolean;
  };

  // Legal Documentation
  legalInfo?: {
    landKhata?: landKhata;
    buildingKhata?: landKhata; // For commercial properties
    eKhata: boolean;
    biappaApproved: boolean;
    bdaApproved: boolean;
  };

  // Amenities (unified)
  amenities: amenities | commercialAmenities | [];

  // Parking & Additional Info
  parking?: number;
  uds?: number; // Undivided share

  // Suitability (for specific property types)
  suitableFor?: string | suitableWarehouse;

  // Media & Documentation
  media?: {
    photos: string[];
    videos: string[];
    documents: string[];
  };
  driveLink: string;

  // Additional Information
  extraDetails?: string;
  unitNumber?: string;

  commercialSubType?: commercialSubType;
  commercialPropertyType?: PropertyType;
}
