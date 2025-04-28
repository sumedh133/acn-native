export const propertyUserStatus: {
  [slug: string]: {
    color?: string;
    displayName?: string;
    emptySubText?: string;
  };
} = {
  listed: { emptySubText: "No inventory is listed." },
  pending: {
    color: "#BFE9E6",
    displayName: "Pending QC",
    emptySubText: "There are no inventories currently under review.",
  },
  duplicate: {
    color: "#F6BC2F",
    displayName: "Duplicate",
    emptySubText: "No inventory is flagged as duplicate.",
  },
  primary: {
    color: "#F6BC2F",
    displayName: "Primary",
    emptySubText: "No inventory is flagged as primary.",
  },
  rejected: {
    color: "#FF8282",
    displayName: "Rejected",
    emptySubText: "No inventory is rejected.",
  },
};

export const locationRestriction = "circle:100000@12.9731,77.5945";
