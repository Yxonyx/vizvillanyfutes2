/**
 * Hungarian phone number formatting utility
 * Formats phone numbers as: +36 XX XXX XXXX or 06 XX XXX XXXX
 */

// Remove all non-digit characters except +
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

// Format Hungarian phone number as user types
export function formatHungarianPhone(value: string): string {
  // Remove all non-digit characters except +
  let cleaned = cleanPhoneNumber(value);
  
  // Handle different starting formats
  if (cleaned.startsWith('+36')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('36')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('06')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  
  // Limit to 9 digits (Hungarian mobile/landline after prefix)
  cleaned = cleaned.slice(0, 9);
  
  // Format the number
  let formatted = '+36 ';
  
  if (cleaned.length > 0) {
    // Area/operator code (2 digits)
    formatted += cleaned.slice(0, 2);
  }
  
  if (cleaned.length > 2) {
    // First group (3 digits)
    formatted += ' ' + cleaned.slice(2, 5);
  }
  
  if (cleaned.length > 5) {
    // Second group (4 digits)
    formatted += ' ' + cleaned.slice(5, 9);
  }
  
  return formatted.trim();
}

// Validate Hungarian phone number
export function isValidHungarianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  
  // Remove +36, 36, 06, or leading 0
  let number = cleaned;
  if (number.startsWith('+36')) {
    number = number.slice(3);
  } else if (number.startsWith('36')) {
    number = number.slice(2);
  } else if (number.startsWith('06')) {
    number = number.slice(2);
  } else if (number.startsWith('0')) {
    number = number.slice(1);
  }
  
  // Hungarian numbers should have 9 digits after the country code
  // Mobile: 20, 30, 31, 50, 70 prefixes
  // Landline: 1 (Budapest), 22-99 (other areas)
  if (number.length !== 9) {
    return false;
  }
  
  // Check valid prefixes
  const prefix = number.slice(0, 2);
  const validMobilePrefixes = ['20', '30', '31', '50', '70'];
  const validLandlinePrefixes = ['1']; // Budapest is just 1, but we take first 2 digits
  
  // Mobile prefixes
  if (validMobilePrefixes.includes(prefix)) {
    return true;
  }
  
  // Budapest (starts with 1)
  if (prefix.startsWith('1')) {
    return true;
  }
  
  // Other landline prefixes (22-99)
  const prefixNum = parseInt(prefix, 10);
  if (prefixNum >= 22 && prefixNum <= 99) {
    return true;
  }
  
  return false;
}

// Get phone number for submission (E.164 format)
export function getPhoneForSubmission(phone: string): string {
  const cleaned = cleanPhoneNumber(phone);
  
  let number = cleaned;
  if (number.startsWith('+36')) {
    return number;
  } else if (number.startsWith('36')) {
    return '+' + number;
  } else if (number.startsWith('06')) {
    return '+36' + number.slice(2);
  } else if (number.startsWith('0')) {
    return '+36' + number.slice(1);
  }
  
  // Assume it's already without prefix
  return '+36' + number;
}

