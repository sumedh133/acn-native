export const formatUnixDate = (timestamp: number): string => {
    if (!timestamp) return '-'

    // Convert Unix timestamp to milliseconds
    const date = new Date(Number(timestamp) * 1000)

    // Check if date is valid
    if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp)
        return '-'
    }

    return date.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
    })
}

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
