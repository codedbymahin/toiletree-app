/**
 * Sanitize user input to prevent XSS attacks and enforce length limits
 * 
 * @param input - The input string to sanitize
 * @param maxLength - Maximum length of the input (default: 1000)
 * @returns Sanitized string with HTML tags removed and trimmed
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  // Strip HTML tags
  const sanitized = input.replace(/<[^>]*>/g, '').trim();

  // Limit length
  return sanitized.substring(0, maxLength);
}

