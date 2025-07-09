import { isString } from "highcharts";

export function formatNumber(num) {
  if (!num && num !== 0) return;

  num = String(num);
  let isNegative = false;

  if (num < 0) {
    isNegative = true;
    num = Math.abs(num);
  }

  // Convert the price to a string and remove any existing commas
  let numStr = num?.toString().replace(/,/g, "");

  // Split the number into integer and decimal parts
  let [integerPart, decimalPart] = numStr.split(".");

  // Add commas for lakhs and crores
  let lastThree = integerPart.substring(integerPart.length - 3);
  let otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  // Combine the formatted integer part with decimal part (if exists)
  let formattedPrice = `${otherNumbers}${lastThree}`;
  if (decimalPart) {
    formattedPrice += `.${decimalPart}`;
  }

  if (isNegative) formattedPrice = `-${formattedPrice}`;

  return formattedPrice;
}

export function formatCost(price) {
  if (!price && price !== 0) return;

  price = String(price);
  let isNegative = false;

  if (price < 0) {
    isNegative = true;
    price = Math.abs(price);
  }

  // Convert the price to a string and remove any existing commas
  let priceStr = price?.toString().replace(/,/g, "");

  // Split the number into integer and decimal parts
  let [integerPart, decimalPart] = priceStr.split(".");

  // Add commas for lakhs and crores
  let lastThree = integerPart.substring(integerPart.length - 3);
  let otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }

  otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  // Combine the formatted integer part with decimal part (if exists)
  let formattedPrice = `₹${otherNumbers}${lastThree}`;
  if (decimalPart) {
    formattedPrice += `.${decimalPart}`;
  }

  if (isNegative) formattedPrice = `-${formattedPrice}`;

  return formattedPrice;
}

export function formatCost2(cost) {
  return helper(cost / 100000);
}

export function helper(cost) {
  if (cost >= 100) {
    return `₹${(cost / 100).toFixed(2)} Cr`;
  } else {
    return `₹${cost} Lacs`;
  }
}

export const formatCostSuffix = (cost) => {
  let isNegative = false;

  if (cost < 0) {
    isNegative = true;
    cost = Math.abs(cost);
  }
  if (cost >= 10000000) {
    cost = `₹${(cost / 10000000).toFixed(2)} Cr`;
  } else if (cost >= 100000) {
    cost = `₹${(cost / 100000).toFixed(2)} L`;
  } else {
    cost = `₹${cost}`;
  }

  if (isNegative) cost = `-${cost}`;
  return cost;
};

export function camelCaseToCapitalizedWords(input) {
  // Handle array input
  if (Array.isArray(input)) {
    return input.map((str) => formatSingleString(str)).join(", ");
  }

  // Handle single string
  return formatSingleString(input);
}

function formatSingleString(str) {
  if (!str || !isString(str)) return "-";
  str = str?.trim();

  // Split on camelCase boundaries and spaces
  const words = str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(/\s+/);

  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return capitalizedWords.join(" ");
}

export function toCapitalizedWords(str) {
  if (!str || !isString(str)) return "NA";
  str = str?.trim();

  const words = str.split(/\s+/);

  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  return capitalizedWords.join(" ");
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

export const formatMonthYear = (dateString) => {
  const [month, year] = dateString.split("/");
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  const monthIndex = parseInt(month) - 1;
  return `${months[monthIndex]} ${year}`;
};
