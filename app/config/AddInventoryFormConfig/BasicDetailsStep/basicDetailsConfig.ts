import { FormStep } from "@/types/FormConfig";

export const basicDetailsStep: FormStep = {
  id: "basicDetails",
  title: "Basic Details",
  description: "Tell us what you're looking to do",
  fields: [
    {
      id: "listingType",
      label: "You're looking to?",
      type: "select",
      required: true,
      options: [
        { label: "Sell", value: "resale" },
        { label: "Rent", value: "rental" },
      ],
      colspan: 12,
      conditional: false,
    },
    {
      id: "propertyType",
      label: "What kind of property?",
      type: "select",
      required: true,
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
      ],
      colspan: 12,
      conditional: false,
    },
    {
      id: "assetType",
      label: "Select property type",
      type: "select",
      required: true,
      options: [
        { label: "Apartment", value: "apartment" },
        { label: "Villa", value: "villa" },
        { label: "Plot", value: "plot" },
        { label: "Row House", value: "row house" },
        { label: "Villament", value: "villament" },
        { label: "Independent Building", value: "independent house" },
      ],
      dependsOn: {
        conditions: [
          {
            field: "propertyType",
            values: ["residential"],
          },
          {
            field: "listingType",
            values: ["resale"],
          },
        ],
        logicOperator: "AND",
      },
      colspan: 12,
      
    },
    {
      id: "assetType",
      label: "Select property type",
      type: "select",
      required: true,
      options: [
        { label: "Apartment", value: "apartment" },
        { label: "Villa", value: "villa" },
        { label: "Row House", value: "row house" },
        { label: "Villament", value: "villament" },
        { label: "Independent Building", value: "independent house" },
      ],
      dependsOn: {
        conditions: [
          {
            field: "propertyType",
            values: ["residential"],
          },
          {
            field: "listingType",
            values: ["rental"],
          },
        ],
        logicOperator: "AND",
      },
      colspan: 12,
      
    },
    {
      id: "commercialPropertyType",
      label: "Select property type",
      type: "select",
      required: true,
      options: [
        { label: "Office Space", value: "office space" },
        { label: "Retail Space", value: "retail space" },
        { label: "Commercial Space", value: "commercial space" },
      ],
      dependsOn: {
        field: "propertyType",
        values: ["commercial"],
      },
      colspan: 12,
      
    },
    {
      id: "commercialSubType",
      label: "Select office space type",
      type: "select",
      required: true,
      options: [
        { label: "Independent Office Space", value: "independent office space" },
        { label: "IT Park", value: "it park" },
        { label: "Co-Working Space", value: "co-working space" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["office space"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialSubType",
      label: "Select retail space type",
      type: "select",
      required: true,
      options: [
        { label: "Commercial Shop", value: "commercial shop" },
        { label: "Showroom", value: "showroom" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["retail space"],
      },
      colspan: 12,
      conditional: true,
    },
    {
      id: "commercialSubType",
      label: "Select commercial space type",
      type: "select",
      required: true,
      options: [
        { label: "PG/Guest-House", value: "pg/guest-house" },
        { label: "Warehouse", value: "warehouse" },
        { label: "Commercial Plot", value: "commercial plot" },
        { label: "Industrial Shed", value: "industrial shed" },
        { label: "Factory", value: "factory" },
        { label: "Other", value: "other" },
      ],
      dependsOn: {
        field: "commercialPropertyType",
        values: ["commercial space"],
      },
      colspan: 12,
      
    },
    {
      id: "communityType",
      label: "Select community type",
      type: "select",
      required: true,
      options: [
        { label: "Gated", value: "gated" },
        { label: "Independent", value: "independent" },
      ],
      dependsOn: {
        field: "propertyType",
        values: ["residential"],
      },
      colspan: 12,
      
    },
  ],
};
