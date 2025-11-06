import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Fetch the webpage HTML
async function fetchHTML() {
  console.log('Fetching HTML from trackAIPAC.com...');

  const response = await axios.get('https://www.trackaipac.com/congress', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  console.log('HTML fetched successfully');
  return response.data;
}

// Use Claude to extract structured data from HTML chunks
async function extractDataWithClaude(htmlChunk, stateContext = '') {
  const prompt = `You are extracting data from the trackAIPAC website about congress members and their AIPAC funding.

${stateContext ? `Focus on data for: ${stateContext}` : 'Extract all state and congress member data'}

From the HTML below, extract ALL congress members with the following information:
- State name
- Congress member name
- Position (SEN for Senator, or district like "AL-01" for House)
- Party affiliation (R or D)
- Total lobby amount received (in dollars)
- Organizations they receive from (AIPAC, RJC, DMFI, etc.)
- Next election year
- What they're running for (if mentioned)
- Photo URL (if available)

Return the data as a JSON object with this structure:
{
  "StateName": {
    "congresspeople": [
      {
        "name": "Full Name",
        "position": "SEN or district",
        "party": "R or D",
        "lobbyTotal": numeric amount,
        "organizations": ["AIPAC", "RJC"],
        "nextElection": "2028",
        "runningFor": "Senate",
        "photo": "url"
      }
    ]
  }
}

Only return valid JSON, no additional text.

HTML:
${htmlChunk}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};
  } catch (error) {
    console.error('Error with Claude extraction:', error.message);
    return {};
  }
}

// Split HTML into manageable chunks for Claude
function splitHTMLIntoChunks(html, chunkSize = 15000) {
  const chunks = [];
  let currentPos = 0;

  while (currentPos < html.length) {
    chunks.push(html.slice(currentPos, currentPos + chunkSize));
    currentPos += chunkSize;
  }

  return chunks;
}

// Calculate total amounts per state
function calculateStateTotals(statesData) {
  Object.keys(statesData).forEach(state => {
    const total = statesData[state].congresspeople.reduce(
      (sum, person) => sum + (person.lobbyTotal || 0),
      0
    );
    statesData[state].totalAmount = total;
  });

  return statesData;
}

// Main function
async function scrapeWithClaude() {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('\n❌ ANTHROPIC_API_KEY environment variable not set!');
      console.log('Please set your Claude API key:');
      console.log('  Windows: set ANTHROPIC_API_KEY=your-api-key');
      console.log('  Linux/Mac: export ANTHROPIC_API_KEY=your-api-key');
      process.exit(1);
    }

    const html = await fetchHTML();

    // Save raw HTML for reference
    const htmlPath = path.join(__dirname, 'trackAIPAC_raw.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`Raw HTML saved to: ${htmlPath}`);

    console.log('\nProcessing data with Claude AI...');

    // Split HTML into chunks and process
    const chunks = splitHTMLIntoChunks(html);
    console.log(`Processing ${chunks.length} HTML chunks...`);

    let allStatesData = {};

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}...`);

      const extractedData = await extractDataWithClaude(chunks[i]);

      // Merge extracted data
      Object.keys(extractedData).forEach(state => {
        if (!allStatesData[state]) {
          allStatesData[state] = { congresspeople: [] };
        }

        allStatesData[state].congresspeople.push(
          ...extractedData[state].congresspeople
        );
      });

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Calculate totals
    allStatesData = calculateStateTotals(allStatesData);

    // Save data
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'congressData.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const output = {
      lastUpdated: new Date().toISOString(),
      source: 'https://www.trackaipac.com/congress',
      states: allStatesData
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Data saved to: ${outputPath}`);

    // Statistics
    const totalStates = Object.keys(allStatesData).length;
    const totalCongresspeople = Object.values(allStatesData).reduce(
      (sum, state) => sum + state.congresspeople.length, 0
    );
    const totalMoney = Object.values(allStatesData).reduce(
      (sum, state) => sum + state.totalAmount, 0
    );

    console.log('\n=== STATISTICS ===');
    console.log(`Total States: ${totalStates}`);
    console.log(`Total Congresspeople: ${totalCongresspeople}`);
    console.log(`Total AIPAC Money: $${totalMoney.toLocaleString()}`);

    return allStatesData;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Run
console.log('Starting Claude-powered trackAIPAC scraper...\n');
scrapeWithClaude()
  .then(() => console.log('\n✅ Scraping completed!'))
  .catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
