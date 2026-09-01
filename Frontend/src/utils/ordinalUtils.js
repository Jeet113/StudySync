/**
 * Centralized Ordinal Utility for StudySync
 * Generates correct English ordinal suffixes (1st, 2nd, 3rd, 4th, 11th, 12th, 21st, 22nd, 23rd, etc.)
 */

export const getOrdinal = (n) => {
  const num = parseInt(n, 10);
  if (isNaN(num)) return `${n}`;

  const lastTwo = Math.abs(num) % 100;
  const lastOne = Math.abs(num) % 10;

  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${num}th`;
  }

  switch (lastOne) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
};

/**
 * Returns formatted ordinal class label, e.g. "1st class", "2nd class", "12th class", "21st class"
 */
export const getOrdinalClassLabel = (n) => {
  return `${getOrdinal(n)} class`;
};

export default {
  getOrdinal,
  getOrdinalClassLabel
};
