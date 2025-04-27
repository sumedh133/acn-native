export const userStatus: {
  [slug: string]: { color: string; displayName: string };
} = {
  pending: { color: "#BFE9E6", displayName: "Pending QC" },
  duplicate: { color: "#F6BC2F", displayName: "Duplicate" },
  primary: { color: "#F6BC2F", displayName: "Primary" },
  rejected: { color: "#FF8282", displayName: "Rejected" },
};
