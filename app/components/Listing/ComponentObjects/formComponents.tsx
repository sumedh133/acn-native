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
  Apartment: ["communityType", "subType"],
  Villa: ["furnishing", "unitNo"],
  Plot: ["subType"],
  Villament: ["cornerUnit"],
  "Row House": ["unitNo"],
  "Independent Building": ["handoverDate"],
};
