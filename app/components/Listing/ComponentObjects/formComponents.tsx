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
    "subType",
    "sbua",
    "totalAskPrice",
    "exactFloor",
    "facing",
    "unitType",
  ],
  Villa: [
    "communityType",
    "sbua",
    "totalAskPrice",
    "facing",
    "unitType",
    "structure",
  ],
  Plot: ["communityType", "plotSize", "totalAskPrice", "facing"],
  Villament: [
    "communityType",
    "facing",
    "exactFloor",
    "structure",
    "totalAskPrice",
    "sbua",
    "unitType",
  ],
  "Row House": [
    "communityType",
    "sbua",
    "unitType",
    "totalAskPrice",
    "facing",
    "structure",
  ],
  "Independent Building": [
    "communityType",
    "plotSize",
    "sbua",
    "structure",
    "facing",
    "totalAskPrice",
  ],
};
