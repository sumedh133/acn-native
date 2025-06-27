import { ListingProperty } from "@/app/types";
import { appartmentComponents } from "./appartmentComponents";
import { independentComponents } from "./independentComponents";
import { plotComponents } from "./plotComponents";
import { rowhouseComponents } from "./rowhouseComponents";
import { villaComponents } from "./villaComponents";
import { villamentComponents } from "./villamentComponents";

export const assetTypes: {
  Apartment: any;
  Villa: any;
  Plot: any;
  Villament: any;
  "Row House": any;
  "Independent Building": any;
} = {
  Apartment: appartmentComponents,
  Villa: villaComponents,
  Plot: plotComponents,
  Villament: villamentComponents,
  "Row House": rowhouseComponents,
  "Independent Building": independentComponents,
};

export const compulsoryFields: {
  Apartment: (keyof ListingProperty)[];
  Villa: (keyof ListingProperty)[];
  Plot: (keyof ListingProperty)[];
  Villament: (keyof ListingProperty)[];
  "Row House": (keyof ListingProperty)[];
  "Independent Building": (keyof ListingProperty)[];
} = {
  Apartment: [
    "communityType",
    "propertyName",
    "subType",
    "sbua",
    "exactFloor",
    "facing",
    "unitType",
    "totalAskPrice",
  ],
  Villa: [
    "communityType",
    "propertyName",
    "sbua",
    "structure",
    "facing",
    "unitType",
    "totalAskPrice",
  ],
  Plot: [
    "communityType",
    "propertyName",
    "plotSize",
    "facing",
    "totalAskPrice",
  ],
  Villament: [
    "communityType",
    "propertyName",
    "exactFloor",
    "sbua",
    "structure",
    "facing",
    "unitType",
    "totalAskPrice",
  ],
  "Row House": [
    "communityType",
    "propertyName",
    "sbua",
    "structure",
    "facing",
    "unitType",
    "totalAskPrice",
  ],
  "Independent Building": [
    "communityType",
    "propertyName",
    "sbua",
    "plotSize",
    "structure",
    "facing",
    "totalAskPrice",
  ],
};
