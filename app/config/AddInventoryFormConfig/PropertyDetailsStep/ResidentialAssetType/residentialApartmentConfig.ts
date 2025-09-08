import { FormField } from "@/types/FormConfig";

export const residentialApartmentFields: FormField[] = [
  {
    id: "propertyName",
    label: "Project Name",
    type: "placesApi",
    required: true,
    placeholder: "Enter property name",
    colspan: 12,
    conditional: false,
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
  },

  {
    id: "apartmentType",
    label: "Apartment Type",
    type: "select",
    required: true,
    placeholder: "Select apartment type",
    options: [
      { label: "Simplex", value: "simplex" },
      { label: "Duplex", value: "duplex" },
      { label: "Triplex", value: "triplex" },
      { label: "Penthouse", value: "penthouse" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "sbua",
    label: "SBUA",
    type: "number",
    required: true,
    placeholder: "1500",
    validation: {
      min: 100,
      message: "SBUA must be at least 100 sqft",
    },
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    suffix: "Sqft",
    keyBoardType: "numeric",
    colspan: 12,
    conditional: true,
  },
  {
    id: "carpetArea",
    label: "Carpet Area",
    type: "number",
    required: false,
    placeholder: "1500",
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    suffix: "Sqft",
    keyBoardType: "numeric",
    colspan: 12,
    conditional: true,
  },

  {
    id: "facing",
    label: "Door Facing",
    type: "dropdown",
    required: true,
    placeholder: "Select facing direction",
    options: [
      { label: "North", value: "north" },
      { label: "East", value: "east" },
      { label: "South", value: "south" },
      { label: "West", value: "west" },
      { label: "North-East", value: "north-east" },
      { label: "North-West", value: "north-west" },
      { label: "South-West", value: "south-west" },
      { label: "South-East", value: "south-east" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },
  {
    id: "floorNumber",
    label: "Floor No.",
    footer: "Note: Exact floor will not be shown",
    type: "number",
    required: true,
    placeholder: "0000",
    validation: {
      min: 0,
      message: "Floor number must be 0 or higher",
    },
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    keyBoardType: "numeric",
    colspan: 6,
    conditional: true,
  },
  {
    id: "totalFloors",
    label: "Total Floors",
    type: "number",
    required: false,
    placeholder: "0000",
    validation: {
      min: 1,
      message: "Total floors must be at least 1",
    },
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    keyBoardType: "numeric",
    colspan: 6,
    conditional: true,
  },

  {
    id: "furnishing",
    label: "Furnishing",
    type: "select",
    required: true,
    placeholder: "Select furnishing status",
    options: [
      { label: "Unfurnished", value: "unfurnished" },
      { label: "Semi-Furnished", value: "semi-furnished" },
      { label: "Fully Furnished", value: "fully-furnished" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "noOfBedrooms",
    label: "No. of Bedrooms",
    type: "select",
    required: true,
    placeholder: "Select number of bedrooms",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "5", value: 5 },
      { label: "6", value: 6 },
      { label: "7", value: 7 },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    labelNote: "Note: This excludes study rooms and servant rooms.",
    colspan: 12,
    conditional: true,
  },

  {
    id: "extraRooms",
    label: "Extra Rooms",
    type: "multiselect",
    required: false,
    placeholder: "Select extra rooms",
    options: [
      { label: "Servant Room", value: "servant room" },
      { label: "Study Room", value: "study room" },
      { label: "Pooja Room", value: "pooja room" },
      { label: "Other", value: "other" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "noOfBathrooms",
    label: "No. of Bathrooms",
    type: "select",
    required: true,
    placeholder: "Select number of bathrooms",
    options: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "5", value: 5 },
      { label: "5+", value: "5+" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "noOfBalconies",
    label: "No. of Balconies",
    type: "select",
    required: true,
    placeholder: "Select number of balconies",
    options: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
      { label: "5", value: 5 },
      { label: "5+", value: "5+" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "balconyFacing",
    label: "Balcony Facing",
    type: "select",
    required: false,
    placeholder: "Select balcony facing",
    options: [
      { label: "Inside", value: "inside" },
      { label: "Outside", value: "outside" },
    ],
    dependsOn: {
      field: "assetType",
      values: ["apartment"],
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "handoverDate",
    label: "Handover Date",
    type: "date",
    required: true,
    placeholder: "MM/YYYY",
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "possession",
    label: "Possession",
    type: "select",
    required: true,
    placeholder: "Select possession status",
    options: [
      { label: "Ready to Move", value: "ready to move" },
      { label: "Under Construction", value: "under construction" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "readyToMove",
    label: "Ready-To-Move",
    type: "boolean",
    required: true,
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "handoverDate",
    label: "Available From",
    type: "date",
    required: true,
    placeholder: "MM/YYYY",
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "possession",
          values: ["under construction"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "ageOfTheBuilding",
    label: "Age of Building",
    type: "select",
    required: true,
    placeholder: "Select building age",
    options: [
      { label: "New", value: "new" },
      { label: "1-5 years", value: "1-5 years" },
      { label: "6-10 years", value: "6-10 years" },
      { label: "11-15 years", value: "11-15 years" },
      { label: "15+ Years", value: "15+ years" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "possession",
          values: ["ready to move"],
        },
        {
          field: "listingType",
          values: ["resale"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },

  {
    id: "ageOfTheBuilding",
    label: "Age of Building",
    type: "select",
    required: true,
    placeholder: "Select building age",
    options: [
      { label: "New", value: "new" },
      { label: "1-5 years", value: "1-5 years" },
      { label: "6-10 years", value: "6-10 years" },
      { label: "11-15 years", value: "11-15 years" },
      { label: "15+ Years", value: "15+ years" },
    ],
    dependsOn: {
      conditions: [
        {
          field: "assetType",
          values: ["apartment"],
        },
        {
          field: "listingType",
          values: ["rental"],
        },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
    conditional: true,
  },
];
