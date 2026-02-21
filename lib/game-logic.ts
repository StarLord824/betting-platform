/**
 * Game Logic utilities for the Betting Platform
 */

/**
 * Sorts a 3-digit Panna according to the game's specific rules:
 * - Digits 1-9 are in ascending order
 * - Digit 0 is treated as the highest value (10)
 *
 * Example:
 * 1, 4, 2 -> 124
 * 5, 0, 2 -> 250 (since 0 is technically 10, it goes at the end: 2, 5, 0)
 *
 * @param panna - The 3 digit string input
 * @returns The sorted 3 digit string
 */
export function sortPanna(panna: string): string {
  if (!/^\d{3}$/.test(panna)) {
    throw new Error("Panna must be exactly 3 digits");
  }

  // Convert string to array of numbers
  const digits = panna.split("").map(Number);

  // Custom sort function
  digits.sort((a, b) => {
    // Map 0 to 10 for comparison
    const valA = a === 0 ? 10 : a;
    const valB = b === 0 ? 10 : b;
    return valA - valB;
  });

  return digits.join("");
}

/**
 * Validates the game type and the corresponding number format.
 */
export function validateGameInput(gameType: string, number: string): boolean {
  switch (gameType) {
    case "single_digit":
      return /^\d{1}$/.test(number);
    case "jodi":
      return /^\d{2}$/.test(number);
    case "single_panna":
      if (!/^\d{3}$/.test(number)) return false;
      const spDigits = new Set(number.split(""));
      return spDigits.size === 3; // Must be 3 unique digits
    case "double_panna":
      if (!/^\d{3}$/.test(number)) return false;
      const dpDigits = new Set(number.split(""));
      return dpDigits.size === 2; // Must have exactly 2 unique digits (1 pair)
    case "triple_panna":
      if (!/^\d{3}$/.test(number)) return false;
      const tpDigits = new Set(number.split(""));
      return tpDigits.size === 1; // All 3 digits must be the same
    default:
      return false;
  }
}
