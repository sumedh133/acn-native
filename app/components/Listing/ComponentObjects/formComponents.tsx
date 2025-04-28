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
  Apartment: string[];
  Villa: string[];
  Plot: string[];
  Villament: string[];
  "Row House": string[];
  "Independent Building": string[];
} = {
  Apartment: ["communityType", "subType", "sbua", "totalAskPrice", "exactFloor", "facing", "unitType", "handoverDate"],
  Villa: ["communityType","sbua", "totalAskPrice", "facing", "unitType", "handoverDate", "structure"],
  Plot: ["communityType", "plotSize", "totalAskPrice", "facing", "handoverDate"],
  Villament: ["communityType", "facing", "exactFloor", "structure", "totalAskPrice", "sbua", "unitType", "handoverDate"],
  "Row House": ["communityType","sbua", "unitType", "totalAskPrice", "facing", "handoverDate", "structure"],
  "Independent Building": ["communityType", "plotSize", "sbua", "stucture", "facing", "totalAskPrice"],
};
