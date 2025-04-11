export function roundToMatchDecimals(baseNumber: number, targetNumber: number) {
  // Get decimal places from the first number's string representation [[1]][[3]]
  const decimalPlaces = (() => {
    const str = baseNumber.toString();
    const parts = str.split('.');
    return parts.length === 2 ? parts[1].length : 0;
  })();

  // Round using scaling to avoid floating-point inaccuracies [[1]][[4]]
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((targetNumber + Number.EPSILON) * factor) / factor;
}
