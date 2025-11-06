import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to parse money amounts
function parseAmount(amountStr) {
  if (!amountStr) return 0;

  // Remove dollar signs, commas, and whitespace
  const cleaned = amountStr.replace(/[$,\s]/g, '');

  // Handle K (thousands) and M (millions)
  if (cleaned.includes('K')) {
    return parseFloat(cleaned.replace('K', '')) * 1000;
  } else if (cleaned.includes('M')) {
    return parseFloat(cleaned.replace('M', '')) * 1000000;
  }

  return parseFloat(cleaned) || 0;
}

// Helper function to extract state name from various formats
function normalizeStateName(stateName) {
  if (!stateName) return null;
  return stateName.trim().replace(/[^a-zA-Z\s]/g, '');
}

// Main scraping function
async function scrapeTrackAIPAC() {
  try {
    console.log('Fetching data from trackAIPAC.com...');

    const response = await axios.get('https://www.trackaipac.com/congress', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    console.log('Data fetched successfully. Parsing HTML...');

    const $ = cheerio.load(response.data);
    const statesData = {};

    // The data is organized in sections by state
    // Each state has a header and list of congress members

    // Find all state sections
    const stateSections = [];

    // Look for common patterns in state organization
    // Based on the WebFetch analysis, data is in list structures

    // Try to find state headers and their associated congress members
    $('h2, h3').each((i, elem) => {
      const headerText = $(elem).text().trim();

      // Check if this looks like a state name
      const usStates = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
        'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
        'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
        'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming'];

      const matchedState = usStates.find(state =>
        headerText.toLowerCase().includes(state.toLowerCase())
      );

      if (matchedState) {
        stateSections.push({
          state: matchedState,
          element: elem
        });
      }
    });

    console.log(`Found ${stateSections.length} state sections`);

    // For each state, find the congress members
    stateSections.forEach(({ state, element }) => {
      const stateData = {
        totalAmount: 0,
        congresspeople: []
      };

      // Find the next list element after this header
      let currentElement = $(element).next();
      let foundList = false;

      // Search for the list within the next few siblings
      for (let i = 0; i < 5 && !foundList; i++) {
        if (currentElement.is('ul, ol') || currentElement.find('ul, ol').length > 0) {
          const list = currentElement.is('ul, ol') ? currentElement : currentElement.find('ul, ol').first();
          foundList = true;

          // Parse each list item as a congress person
          list.find('li').each((j, li) => {
            const $li = $(li);
            const text = $li.text();

            // Extract name (usually first line or bold text)
            const nameElem = $li.find('strong, b, h4, h5').first();
            const name = nameElem.length ? nameElem.text().trim() : text.split('\n')[0].trim();

            // Extract position (SEN or district number like AL-01)
            const positionMatch = text.match(/(SEN|[A-Z]{2}-\d{2})/);
            const position = positionMatch ? positionMatch[1] : '';

            // Extract party
            const partyMatch = text.match(/\[(R|D)\]/);
            const party = partyMatch ? partyMatch[1] : '';

            // Extract amount
            const amountMatch = text.match(/\$[\d,]+(?:\.\d{2})?[KM]?/);
            const lobbyTotal = amountMatch ? parseAmount(amountMatch[0]) : 0;

            // Extract organizations (look for common org names)
            const organizations = [];
            if (text.includes('AIPAC')) organizations.push('AIPAC');
            if (text.includes('RJC')) organizations.push('RJC');
            if (text.includes('DMFI')) organizations.push('DMFI');
            if (text.includes('JDCA')) organizations.push('JDCA');

            // Extract election info
            const electionMatch = text.match(/(?:Next Election:|Running for)\s*(\d{4}|[A-Za-z\s]+\d{4})/);
            const nextElection = electionMatch ? electionMatch[1] : '';

            const runningForMatch = text.match(/Running for\s+([A-Za-z\s]+)(?:\s+\d{4})?/);
            const runningFor = runningForMatch ? runningForMatch[1].trim() : '';

            // Extract photo URL
            const img = $li.find('img').first();
            const photo = img.length ? img.attr('src') || img.attr('data-src') : '';

            // Only add if we have at least a name
            if (name && name.length > 2) {
              const person = {
                name,
                photo,
                position,
                party,
                lobbyTotal,
                organizations,
                nextElection,
                runningFor
              };

              stateData.congresspeople.push(person);
              stateData.totalAmount += lobbyTotal;
            }
          });
        }

        currentElement = currentElement.next();
      }

      if (stateData.congresspeople.length > 0) {
        statesData[state] = stateData;
        console.log(`${state}: Found ${stateData.congresspeople.length} congress members, Total: $${stateData.totalAmount.toLocaleString()}`);
      }
    });

    console.log(`\nSuccessfully scraped data for ${Object.keys(statesData).length} states`);

    return statesData;

  } catch (error) {
    console.error('Error scraping data:', error.message);
    throw error;
  }
}

// Save data to JSON file
async function saveData(data) {
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'congressData.json');
  const outputDir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Add metadata
  const output = {
    lastUpdated: new Date().toISOString(),
    source: 'https://www.trackaipac.com/congress',
    states: data
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nData saved to: ${outputPath}`);

  // Calculate some statistics
  const totalStates = Object.keys(data).length;
  const totalCongresspeople = Object.values(data).reduce((sum, state) => sum + state.congresspeople.length, 0);
  const totalMoney = Object.values(data).reduce((sum, state) => sum + state.totalAmount, 0);
  const maxState = Object.entries(data).reduce((max, [state, data]) =>
    data.totalAmount > max.amount ? { state, amount: data.totalAmount } : max
  , { state: '', amount: 0 });

  console.log('\n=== STATISTICS ===');
  console.log(`Total States: ${totalStates}`);
  console.log(`Total Congresspeople: ${totalCongresspeople}`);
  console.log(`Total AIPAC Money: $${totalMoney.toLocaleString()}`);
  console.log(`Highest State: ${maxState.state} ($${maxState.amount.toLocaleString()})`);
}

// Run the scraper
console.log('Starting trackAIPAC data scraper...\n');
scrapeTrackAIPAC()
  .then(data => saveData(data))
  .then(() => console.log('\n✅ Scraping completed successfully!'))
  .catch(error => {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  });
