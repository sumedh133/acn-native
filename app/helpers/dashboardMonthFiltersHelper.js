const formatDateToMonthYear = (dateInput) => {
  // Check if the input is a UNIX timestamp (number)
  if (typeof dateInput === "number") {
    // Convert seconds to milliseconds if needed
    const timestamp =
      dateInput.toString().length === 10 ? dateInput * 1000 : dateInput;
    const date = new Date(timestamp);

    if (isNaN(date)) {
      console.error("Invalid UNIX timestamp provided:", dateInput);
      return "Invalid Date";
    }

    return `${date.getMonth() + 1}-${date.getFullYear()}`; // Return formatted date
  }

  // Check if the input is a string
  if (typeof dateInput === "string") {
    try {
      // Parse date string in format "DD/MMM/YYYY"
      const [day, month, year] = dateInput.trim().split("/");
      const date = new Date(`${month}/${day}/${year}`);

      if (isNaN(date)) {
        console.error("Invalid date format:", dateInput);
        return "Invalid Date";
      }

      return `${date.getMonth() + 1}-${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  }

  // Handle any other unexpected input types
  console.error("Invalid dateInput type:", dateInput);
  return "Invalid Date";
};

export const generatePropertyMonths = (properties) => {
  const monthSet = new Set();
  properties.forEach((property) => {
    if (property.dateOfInventoryAdded) {
      const monthYear = formatDateToMonthYear(property.dateOfInventoryAdded);
      monthSet.add(monthYear);
    }
  });

  return Array.from(monthSet)
    .map((monthYear) => {
      const [month, year] = monthYear.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
        month: "long",
      });
      return { label: `${monthName} ${year}`, value: monthYear };
    })
    .sort((a, b) => {
      // Sort by most recent first
      const [monthA, yearA] = a.value.split("-");
      const [monthB, yearB] = b.value.split("-");
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
};

export const generateListingAndPropertyMonths = (listings, properties) => {
  const monthSet = new Set();
  listings.forEach((listing) => {
    if (listing.dateOfInventoryAdded) {
      const monthYear = formatDateToMonthYear(listing.dateOfInventoryAdded);
      monthSet.add(monthYear);
    }
  });

  properties.forEach((property) => {
    if (property.dateOfInventoryAdded) {
      const monthYear = formatDateToMonthYear(property.dateOfInventoryAdded);
      monthSet.add(monthYear);
    }
  });

  return Array.from(monthSet)
    .map((monthYear) => {
      const [month, year] = monthYear.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
        month: "long",
      });
      return { label: `${monthName} ${year}`, value: monthYear };
    })
    .sort((a, b) => {
      // Sort by most recent first
      const [monthA, yearA] = a.value.split("-");
      const [monthB, yearB] = b.value.split("-");
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
};

export const filterPropertiesByMonth = (properties, selectedMonth) => {
  if (!selectedMonth) return properties;

  return properties.filter((property) => {
    if (!property.dateOfInventoryAdded) return false;
    const monthYear = formatDateToMonthYear(property.dateOfInventoryAdded);
    return monthYear === selectedMonth;
  });
};

export const filterListingsByMonth = (listings, selectedMonth) => {
  if (!selectedMonth) return listings;

  return listings.filter((listing) => {
    if (!listing.dateOfInventoryAdded) return false;
    const monthYear = formatDateToMonthYear(listing.dateOfInventoryAdded);
    return monthYear === selectedMonth;
  });
};

export const generateRequirementMonths = (requirements) => {
  const monthSet = new Set();
  requirements.forEach((requirement) => {
    if (requirement.added) {
      const monthYear = formatDateToMonthYear(requirement.added);
      monthSet.add(monthYear);
    }
  });

  return Array.from(monthSet)
    .map((monthYear) => {
      const [month, year] = monthYear.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
        month: "long",
      });
      return { label: `${monthName} ${year}`, value: monthYear };
    })
    .sort((a, b) => {
      // Sort by most recent first
      const [monthA, yearA] = a.value.split("-");
      const [monthB, yearB] = b.value.split("-");
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
};

export const filterRequirementsByMonth = (requirements, selectedMonth) => {
  if (!selectedMonth) return requirements;

  return requirements.filter((requirement) => {
    if (!requirement.added) return false;
    const monthYear = formatDateToMonthYear(requirement.added);
    return monthYear === selectedMonth;
  });
};

export const generateEnquiryMonths = (enquiries) => {
  const monthSet = new Set();
  enquiries.forEach((enquiry) => {
    if (enquiry.added) {
      const monthYear = formatDateToMonthYear(enquiry.added);
      monthSet.add(monthYear);
    }
  });

  return Array.from(monthSet)
    .map((monthYear) => {
      const [month, year] = monthYear.split("-");
      const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
        month: "long",
      });
      return { label: `${monthName} ${year}`, value: monthYear };
    })
    .sort((a, b) => {
      // Sort by most recent first
      const [monthA, yearA] = a.value.split("-");
      const [monthB, yearB] = b.value.split("-");
      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
};

export const filterEnquiriesByMonth = (enquiries, selectedMonth) => {
  if (!selectedMonth) return enquiries;

  return enquiries.filter((enquiry) => {
    if (!enquiry.added) return false;
    const monthYear = formatDateToMonthYear(enquiry.added);
    return monthYear === selectedMonth;
  });
};
