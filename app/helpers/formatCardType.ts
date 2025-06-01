/**
 * Formats a card type string from uppercase with underscores to proper case with spaces
 * @param cardType - The card type string (e.g., "CREDIT_CARD", "DEBIT_CARD")
 * @returns Formatted card type string (e.g., "Credit Card", "Debit Card")
 */
export const formatCardType = (cardType: string): string => {
  if (!cardType) return "";

  // Split by underscore and convert to lowercase
  const words = cardType.toLowerCase().split("_");

  // Capitalize first letter of each word
  const formattedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );

  // Join words with space
  return formattedWords.join(" ");
};
