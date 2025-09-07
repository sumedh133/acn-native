export function getUnixDateTime() {
  return Math.floor(Date.now() / 1000);
}

export function getNextDayUnixDateTime() {
  const secondsInADay = 24 * 60 * 60; // 24 hours in seconds
  return Math.floor(Date.now() / 1000) + secondsInADay;
}

export const formatUnixDate = (unix) => {
  if (!unix) {
    return;
  }

  const timestamp = unix * 1000;
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
};

// Returns the difference in days between two unix timestamps
export const getDaysDifference = (unix1, unix2) => {
  // if (!unix1 || !unix2) {
  //   return;
  // }
  const diffInSeconds = Math.abs(unix1 - unix2);
  return Math.floor(diffInSeconds / (24 * 60 * 60));
};

export const formatUnixDateWithMonth = (unix) => {
  if (!unix) {
    return;
  }

  const timestamp = unix * 1000;
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][date.getMonth()];
  // const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}/${monthShort}/${year}`;
};

export const formatUnixTime = (unix) => {
  if (!unix) {
    return;
  }

  const timestamp = unix * 1000;
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formattedTime;
};

export const formatUnixDateTime = (unix) => {
  const date = new Date(unix * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedDateTime = `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  return formattedDateTime;
};


