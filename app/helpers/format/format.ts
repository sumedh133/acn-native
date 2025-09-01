export const formatUnixDate = (timestamp: number): string => {
  if (!timestamp) return "-";

  // Convert Unix timestamp to milliseconds
  const date = new Date(Number(timestamp) * 1000);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", timestamp);
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

export const getDaysDifference = (from: number, to: number): number => {
  if (!from || !to) return 0;
  const fromDate = new Date(Number(from) * 1000);
  const toDate = new Date(Number(to) * 1000);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return 0;

  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // days
};

export const getDaysFrom = (timestamp: number): string => {
  if (!timestamp) return "-";
  const date = new Date(Number(timestamp) * 1000);
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
};

export const convertMonthYearToUnix = (input: string): number => {
  if (!input) return 0;

  const [monthStr, yearStr] = input.split("/");
  const month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
  const year = parseInt(yearStr, 10);

  if (isNaN(month) || isNaN(year)) {
    console.warn("Invalid handoverDate format:", input);
    return 0;
  }

  const date = new Date(year, month, 1); // first day of month
  console.log("dtae", Math.floor(date.getTime() / 1000));
  return Math.floor(date.getTime() / 1000); // convert ms -> seconds
};

export const formatPrice = (value?: number | string) => {
  if (!value) return "-";

  const num = Number(value);
  if (isNaN(num)) return value.toString();

  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakh`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)} K`;
  } else {
    return `${num}`;
  }
};
