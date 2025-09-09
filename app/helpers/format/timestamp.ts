export const getTimeDifference = (
  unixTimestamp: number | undefined
): string | undefined => {
  if (!unixTimestamp) return;
  // Convert Unix timestamp (seconds) to milliseconds
  const pastDate = new Date(unixTimestamp * 1000);
  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const diffInMs = currentDate.getTime() - pastDate.getTime();

  // If the timestamp is in the future
  if (diffInMs < 0) {
    const futureDiffInMs = Math.abs(diffInMs);

    const futureMinutes = Math.floor(futureDiffInMs / (1000 * 60));
    const futureHours = Math.floor(futureDiffInMs / (1000 * 60 * 60));
    const futureDays = Math.floor(futureDiffInMs / (1000 * 60 * 60 * 24));
    const futureWeeks = Math.floor(futureDays / 7);
    const futureMonths = Math.floor(futureDays / 30.44); // Average days per month
    const futureYears = Math.floor(futureDays / 365.25); // Account for leap years

    if (futureYears > 0) {
      return futureYears === 1 ? "in 1 year" : `in ${futureYears} years`;
    } else if (futureMonths > 0) {
      return futureMonths === 1 ? "in 1 month" : `in ${futureMonths} months`;
    } else if (futureWeeks > 0) {
      return futureWeeks === 1 ? "in 1 week" : `in ${futureWeeks} weeks`;
    } else if (futureDays > 0) {
      return futureDays === 1 ? "in 1 day" : `in ${futureDays} days`;
    } else if (futureHours > 0) {
      return futureHours === 1 ? "in 1 hour" : `in ${futureHours} hours`;
    } else if (futureMinutes > 0) {
      return futureMinutes === 1
        ? "in 1 minute"
        : `in ${futureMinutes} minutes`;
    } else {
      return "in a few seconds";
    }
  }

  // Convert milliseconds to different time units
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44); // Average days per month
  const years = Math.floor(days / 365.25); // Account for leap years

  // Return appropriate format based on the time difference
  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (weeks > 0) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else if (seconds > 30) {
    return `${seconds} seconds ago`;
  } else {
    return "just now";
  }
};
