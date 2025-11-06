/**
 * Content Filter - Blocks doxxing and PII (Personally Identifiable Information)
 *
 * This filter is intentionally strict to prevent leaking of personal information.
 */

// Patterns for detecting various forms of PII
const patterns = {
  // Phone numbers (US and international formats)
  phone: [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // 123-456-7890, 123.456.7890, 123 456 7890
    /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // (123) 456-7890
    /\b\d{10}\b/g, // 1234567890
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International
  ],

  // Email addresses
  email: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  ],

  // Social Security Numbers
  ssn: [
    /\b\d{3}-\d{2}-\d{4}\b/g, // 123-45-6789
    /\b\d{9}\b/g, // 123456789 (also catches phone numbers, but better safe)
  ],

  // Credit card numbers (basic pattern)
  creditCard: [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // 1234-5678-9012-3456
  ],

  // Street addresses (common patterns)
  address: [
    /\b\d{1,5}\s+([A-Z][a-z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Way|Place|Pl|Circle|Cir)\b/gi,
    /\b(P\.?\s?O\.?\s?Box|PO Box)\s+\d+\b/gi, // PO Box
  ],

  // ZIP codes (when combined with other location info)
  zipCode: [
    /\b\d{5}(-\d{4})?\b/g, // 12345 or 12345-6789
  ],

  // IP addresses (can be used for doxxing)
  ipAddress: [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IPv4
    /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g, // IPv6
  ],

  // URLs with suspicious keywords (doxxing sites, pastebins, etc.)
  suspiciousUrls: [
    /\b(dox|doxx|leak|dump|paste|bin)\w*\.(com|org|net|io)/gi,
  ],
};

// Keywords that might indicate doxxing attempts
const suspiciousKeywords = [
  'lives at',
  'home address',
  'phone number is',
  'real name is',
  'social security',
  'credit card',
  'bank account',
  'license plate',
  'drivers license',
  'passport number',
];

/**
 * Check if text contains PII or doxxing information
 * @param {string} text - The text to check
 * @returns {object} - { isClean: boolean, violations: string[] }
 */
export function checkContent(text) {
  const violations = [];
  const lowerText = text.toLowerCase();

  // Check phone numbers
  for (const pattern of patterns.phone) {
    if (pattern.test(text)) {
      violations.push('Phone number detected');
      break;
    }
  }

  // Check emails
  for (const pattern of patterns.email) {
    if (pattern.test(text)) {
      violations.push('Email address detected');
      break;
    }
  }

  // Check SSN
  for (const pattern of patterns.ssn) {
    const matches = text.match(pattern);
    if (matches) {
      // Extra check: if it's exactly 9 digits, might be SSN
      const hasHyphens = /-/.test(text);
      if (hasHyphens || matches.some(m => m.length === 9)) {
        violations.push('Social Security Number or similar ID detected');
        break;
      }
    }
  }

  // Check credit cards
  for (const pattern of patterns.creditCard) {
    if (pattern.test(text)) {
      violations.push('Credit card number detected');
      break;
    }
  }

  // Check addresses
  for (const pattern of patterns.address) {
    if (pattern.test(text)) {
      violations.push('Physical address detected');
      break;
    }
  }

  // Check ZIP codes (only flag if combined with city/state keywords)
  const hasLocationContext = /\b(city|state|lives|located|residing|resident)\b/i.test(lowerText);
  if (hasLocationContext) {
    for (const pattern of patterns.zipCode) {
      if (pattern.test(text)) {
        violations.push('Location information detected');
        break;
      }
    }
  }

  // Check IP addresses
  for (const pattern of patterns.ipAddress) {
    if (pattern.test(text)) {
      violations.push('IP address detected');
      break;
    }
  }

  // Check suspicious URLs
  for (const pattern of patterns.suspiciousUrls) {
    if (pattern.test(text)) {
      violations.push('Suspicious URL detected');
      break;
    }
  }

  // Check suspicious keywords
  for (const keyword of suspiciousKeywords) {
    if (lowerText.includes(keyword)) {
      violations.push(`Suspicious phrase detected: "${keyword}"`);
      break;
    }
  }

  return {
    isClean: violations.length === 0,
    violations: violations,
  };
}

/**
 * Get a user-friendly error message
 * @param {string[]} violations - Array of violation messages
 * @returns {string} - User-friendly error message
 */
export function getErrorMessage(violations) {
  if (violations.length === 0) {
    return '';
  }

  return `Your comment was blocked to prevent doxxing or sharing of personal information. Issues found: ${violations.join(', ')}. Please remove any phone numbers, addresses, emails, or other personal identifiable information.`;
}
