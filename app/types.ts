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
  agentName: string | null;
  agentPhoneNumber: string | null;
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

type extraRooms =
  | ["Servant Room" | "Study Room" | "Pooja Room" | "Other"]
  | null;
type noOfBedrooms = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type noOfBathrooms = 1 | 2 | 3 | 4 | 5 | "5+";
type noOfBalconies = 0 | 1 | 2 | 3 | 4 | 5 | "5+";
type balconyFacing = "Inside" | "Outside";
type possession = "Ready to Move" | "Under Construction";
type ageOfTheBuilding =
  | "New"
  | "1-5 years"
  | "6-10 years"
  | "11-15 years"
  | "15+ Years";

type furnishing = "Unfurnished" | "Semi-Furnished" | "Furnished";
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
type commissionType = "Side by Side" | "Comission Sharing";
type preferedTenants = ["Anyone", "Family", "Bachelor Female", "Bachelor Male"];
type communityType = "Gated" | "Independent";
type landKhata = "A" | "B";

type PropertyType = "Office Space" | "Retail Space" | "Commercial Space";
type specificType = PropertyType extends "Office Space"
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

export interface BaseResidentialResale {
  // agent details
  cpId: string;
  agentName: string;
  agentPhoneNumber: string;

  // kam details
  kamId: string;
  kamName: string;

  added: number;
  assetType: string;
  communityType: communityType;

  // available hold sold
  dateOfLastChecked: number;
  lastModified: number;
  status: string;

  //qc flow
  kamStatus: string;
  dataStatus: string;
  stage: string;

  // from places API
  name: string;
  micromarket: string;
  area: string;
  zone: string;

  totalAskPrice: number;
  pricePerSqft: number;

  rented: boolean;
  rent: {
    rentalIncome: number;
    currentDeposit: number;
    startDate: number;
    endDate: number;
  } | null;

  type: {
    cornerUnit: boolean;
    exclusive: boolean;
  };

  khata: {
    landKhata: landKhata | null;
    eKhata: boolean;
    biappaApproved: boolean;
    bdaApproved: boolean;
  };

  // photos, videos and documents
  photos: string[] | [];
  videos: string[] | [];
  documents: string[] | [];

  unitNumber: string | null;
  extraDetails: string | null;
}

export interface ResaleResidentialApartment extends BaseResidentialResale {
  apartmentType: apartmentType;
  sbua: number;
  carpetArea: number | null;
  doorFacing: direction;
  exactFloorNo: number;
  floorNo: number;
  totalFloors: number | null;
  furnishing: furnishing;
  noOfBedrooms: noOfBedrooms;
  extraRooms: extraRooms;
  noOfBathrooms: noOfBathrooms;
  noOfBalconies: noOfBalconies;
  balconyFacing: balconyFacing | null;
  possession: possession;
  ageOfTheBuilding: ageOfTheBuilding;
  availableFrom: number;
  amenities: amenities | [];
  parking: number | null;
  uds: number | null;
  type: BaseResidentialResale["type"] & {
    ocReceived: boolean;
  };
}

export interface ResaleResidentialVilla extends BaseResidentialResale {
  sbua: number;
  carpetArea: number | null;
  plotArea: number | null;
  doorFacing: direction;
  structure: string;
  furnishing: furnishing;
  noOfBedrooms: noOfBedrooms;
  extraRooms: extraRooms;
  noOfBathrooms: noOfBathrooms;
  noOfBalconies: noOfBalconies;
  balconyFacing: balconyFacing | null;
  possession: possession;
  ageOfTheBuilding: ageOfTheBuilding;
  availableFrom: number;
  amenities: amenities | [];
  uds: number | null;
  type: BaseResidentialResale["type"] & {
    ocReceived: boolean;
  };
}

export interface ResaleResidentialPlot extends BaseResidentialResale {
  plotSize: number;
  facing: direction;
  plotNo: string | null;
  plotLength: number | null;
  plotBreadth: number | null;
  oddSized: boolean;
  handOverData: number | null;
  readyToMove: boolean;
}

export interface ResaleResidentialVillament extends ResaleResidentialVilla {}

export interface ResaleResidentialRowHouse extends ResaleResidentialVilla {}

export interface ResaleResidentialIndependentBuilding
  extends ResaleResidentialVilla {}

export interface BaseResidentialRental {
  // agent details
  cpId: string;
  agentName: string;
  agentPhoneNumber: string;

  // kam details
  kamId: string;
  kamName: string;

  added: number;
  assetType: string;
  communityType: communityType;

  // available hold sold
  dateOfLastChecked: number;
  lastModified: number;
  status: string;

  // qc flow
  kamStatus: string;
  dataStatus: string;
  stage: string;

  // from places API
  name: string;
  micromarket: string;
  area: string;
  zone: string;

  // area
  sbua: number;
  carpetArea: number | null;
  doorFacing: direction;
  furnishing: furnishing;
  noOfBedrooms: noOfBedrooms;
  extraRooms: extraRooms;
  noOfBathrooms: noOfBathrooms;
  noOfBalconies: noOfBalconies;
  balconyFacing: balconyFacing | null;
  handOverDate: number | null;
  readyToMove: boolean;
  ageOfTheBuilding: ageOfTheBuilding;
  rent: {
    rent: number;
    deposit: number;
    maintenance: maintenance;
    maintenanceAmount: number;
    commissionType: commissionType;
  };
  preferedTenants: preferedTenants;
  petsAllowed: boolean;
  nonVegAllowed: boolean;
  amenities: amenities | [];
  parking: number | null;
  extraDetails: string | null;
}

export interface RentalResidentialApartment extends BaseResidentialRental {
  floorNo: number;
  totalFloors: number | null;
}

export interface RentalResidentialVilla extends BaseResidentialRental {
  structure: string;
}
export interface RentalResidentialVillament extends BaseResidentialRental {
  structure: string;
}

export interface RentalResidentialRowHouse extends BaseResidentialRental {
  structure: string;
}

export interface RentalResidentialIndependentBuilding
  extends BaseResidentialRental {
  structure: string;
}

