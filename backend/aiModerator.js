import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
// For local dev, set ANTHROPIC_API_KEY environment variable
// For Railway, add it as an environment variable in the dashboard
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Use Claude AI to detect PII and doxxing attempts, including obfuscated information
 * @param {string} text - The text to analyze
 * @param {string} name - The user's name/username
 * @returns {Promise<object>} - { isClean: boolean, violations: string[], reasoning: string }
 */
export async function moderateContent(text, name) {
  // Skip if no API key (fallback to basic regex filter only)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set - AI moderation disabled, using basic filter only');
    return { isClean: true, violations: [], reasoning: 'AI moderation disabled' };
  }

  try {
    const prompt = `You are a content moderator for a political discussion platform. Your job is to detect personally identifiable information (PII) and doxxing attempts, including cleverly obfuscated information.

USER NAME: "${name}"
COMMENT TEXT: "${text}"

Analyze both the name and comment for any of the following, even if obfuscated with spaces, filler words, misspellings, or character substitutions:

1. Phone numbers (any format, including obfuscated like "65 haha 123 haha 7890")
2. Email addresses (including obfuscated like "john at gmail dot com")
3. Physical addresses (including partial addresses, street names with filler words)
4. Social Security Numbers or similar IDs
5. Credit card numbers
6. IP addresses
7. Location information (specific addresses, ZIP codes combined with streets)
8. Attempts to reveal someone's real identity, residence, workplace, or contact information
9. Links to doxxing sites or leaked information

IMPORTANT: Do NOT flag:
- General political locations (e.g., "Washington DC", "Congress", "Capitol")
- Public office addresses (e.g., "Senate Office Building")
- General criticism or strong political opinions
- Profanity or offensive language (we only care about PII)
- Company names, organization names

Respond in JSON format only:
{
  "contains_pii": true/false,
  "violations": ["list of specific violations found"],
  "reasoning": "brief explanation"
}

If the content is clean, respond: {"contains_pii": false, "violations": [], "reasoning": "No PII detected"}`;

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022', // Fast and cost-effective for moderation
      max_tokens: 500,
      temperature: 0, // Deterministic for moderation
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].text;
    const result = JSON.parse(responseText);

    return {
      isClean: !result.contains_pii,
      violations: result.violations || [],
      reasoning: result.reasoning || '',
    };
  } catch (error) {
    console.error('AI moderation error:', error);
    // On error, fail open (allow comment) but log for review
    // You might want to fail closed (block comment) for maximum safety
    return {
      isClean: true,
      violations: [],
      reasoning: `AI moderation error: ${error.message}`,
    };
  }
}

/**
 * Quick check if content is obviously clean (optimization to save API calls)
 * @param {string} text - The text to check
 * @returns {boolean} - true if obviously safe, false if needs AI check
 */
export function isObviouslyClean(text) {
  // If very short and no numbers, likely clean
  if (text.length < 20 && !/\d/.test(text)) {
    return true;
  }

  // Check for obvious number patterns that need AI review
  const hasMultipleNumbers = (text.match(/\d+/g) || []).length >= 3;
  const hasEmail = /@/.test(text);
  const hasSuspiciousWords = /\b(lives?|address|phone|email|contact|reach|call|text|dm|message)\b/i.test(text);

  if (hasMultipleNumbers || hasEmail || hasSuspiciousWords) {
    return false; // Needs AI check
  }

  return true; // Probably safe
}
