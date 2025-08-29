import { FormField } from "@/types/FormConfig";

export const rentalResidentialProperties: FormField[] = [
    {
    id: "tenantPreferences.prefferedTenants",
    label: "Preffered Tenants",
    type: "multiCheckbox",
    placeholder: "Please select preffered tenants",
    options: [
      { label: "Anyone", value: "Anyone" },
        { label: "Family", value: "Family" },
        { label: "Bachelor Female", value: "Bachelor Female" },
        { label: "Bachelor Male", value: "Bachelor Male" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  }
  ,
  {
    id: "tenantPreferences.petsAllowed",
    label: "Pets Allowed",
    type: "select",
    placeholder: "Please select whether pets are allowd or not",
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  
  {
    id: "tenantPreferences.nonVegAllowed",
    label: "Non Veg Allowed",
    type: "select",
    placeholder: "Please select whether Non-Veg food is allowd or not",
    options: [
      { label: "Yes", value: "Yes" },
      { label: "No", value: "No" },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },

  {
    id: "amenities",
    label: "Amenities",
    type: "multiselect",
    options: [
      { label: "Gym", value: "Gym" },
      { label: "Lifts", value: "Lifts" },
      { label: "Water Storage", value: "Water Storage" },
      { label: "Visitor Parking", value: "Visitor Parking" },
      { label: "Service Lifts", value: "Service Lifts" },
      { label: "Pool", value: "Pool" },
      { label: "CCTV Surveillance", value: "CCTV Surveillance" },
      { label: "Security", value: "Security" },

      { label: "Power Backup", value: "Power Backup" },

      {
        label: "Club-House",
        value: "Club-House",
      },
    ],
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
  {
    id: "parking",
    label: "Parking",
    type: "showStepper",
    placeholder: "Enter number of parking slots",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 6,
  },
  {
    id: "extraDetails",
    label: "Extra Details",
    type: "textarea",
    placeholder: "Enter any additional details",
    dependsOn: {
      conditions: [
        { field: "listingType", values: ["rental"] },
        { field: "propertyType", values: ["residential"] },
      ],
      logicOperator: "AND",
    },
    colspan: 12,
  },
];
