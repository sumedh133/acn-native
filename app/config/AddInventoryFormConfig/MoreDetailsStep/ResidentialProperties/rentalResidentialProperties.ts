import { FormField } from "@/types/FormConfig";

export const rentalResidentialProperties: FormField[] = [
  {
    id: "tenantPreferences.prefferedTenants",
    label: "Preferred Tenants",
    type: "multiCheckbox",
    placeholder: "Please select preferred tenants",
    options: [
      { label: "Anyone", value: "anyone" },
      { label: "Family", value: "family" },
      { label: "Bachelor Female", value: "bachelor female" },
      { label: "Bachelor Male", value: "bachelor male" },
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
    id: "tenantPreferences.petsAllowed",
    label: "Pets Allowed",
    type: "select",
    placeholder: "Please select whether pets are allowed or not",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
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
    placeholder: "Please select whether Non-Veg food is allowed or not",
    options: [
     { label: "Yes", value: true },
      { label: "No", value: false },
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
      { label: "Gym", value: "gym" },
      { label: "Lifts", value: "lifts" },
      { label: "Water Storage", value: "water storage" },
      { label: "Visitor Parking", value: "visitor parking" },
      { label: "Service Lifts", value: "service lifts" },
      { label: "Pool", value: "pool" },
      { label: "CCTV Surveillance", value: "cctv surveillance" },
      { label: "Security", value: "security" },
      { label: "Power Backup", value: "power backup" },
      { label: "Club-House", value: "club-house" },
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
