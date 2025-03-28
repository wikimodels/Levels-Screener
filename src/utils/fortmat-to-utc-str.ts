export function formatToUTCString(
  timestamp: number,
  offsetHours: number = 0
): string {
  const date = new Date(timestamp);
  // Apply timezone offset if specified
  if (offsetHours !== 0) {
    date.setHours(date.getHours() + offsetHours);
  }
  return date
    .toLocaleString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', '')
    .replace(/\//g, '-'); // Adjust format
}
