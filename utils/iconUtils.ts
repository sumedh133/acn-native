export const getIcon = (key: string) => {
  const iconMap: Record<string, string> = {
    price: "💰",
    bedrooms: "🛏️",
    bathrooms: "🚿",
    area: "📐",
    type: "🏠",
    furnishing: "🪑",
    facing: "🧭",
    floor: "🏢",
    parking: "🚗",
    age: "📅",
    location: "📍",
    address: "🏠",
    default: "ℹ️",
  };
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(iconMap)) if (lower.includes(k)) return v;
  return iconMap.default;
};
