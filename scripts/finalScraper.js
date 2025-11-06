import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// US States list
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

// Helper to parse money amounts
function parseAmount(amountStr) {
  if (!amountStr) return 0;

  const cleaned = amountStr.replace(/[\$,\s]/g, '');

  if (cleaned.includes('K')) {
    return Math.round(parseFloat(cleaned.replace('K', '')) * 1000);
  } else if (cleaned.includes('M')) {
    return Math.round(parseFloat(cleaned.replace('M', '')) * 1000000);
  }

  return Math.round(parseFloat(cleaned) || 0);
}

// Extract organizations from text
function extractOrganizations(text) {
  const orgs = [];
  const orgPatterns = ['AIPAC', 'RJC', 'DMFI', 'JDCA', 'NORPAC', 'GCSC', 'J Street', 'JAC', 'AMP', 'USI', 'TPOH', 'COPAC', 'NATPAC', 'PIA'];

  orgPatterns.forEach(org => {
    if (text.includes(org)) orgs.push(org);
  });

  return orgs;
}

// Parse congress member data
function parseCongressMember(item) {
  const title = item.title || '';
  const descriptionHtml = item.description || '';

  // Remove HTML tags and split into lines
  const description = descriptionHtml
    .replace(/<\/p><p[^>]*>/g, '\n')
    .replace(/<\/?p[^>]*>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();

  const lines = description.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let position = '';
  let party = '';
  let lobbyTotal = 0;
  let organizations = [];
  let nextElection = '';
  let runningFor = '';

  for (const line of lines) {
    // Position and party: "AL-SEN [R]" or "AL-01 [D]"
    const posMatch = line.match(/([A-Z]{2}-(SEN|\d{2}))\s*\[([RD])\]/);
    if (posMatch) {
      position = posMatch[1];
      party = posMatch[3];
      continue;
    }

    // Lobby Total
    const lobbyMatch = line.match(/Lobby Total:\s*\$?([\d,\.KM]+)/i);
    if (lobbyMatch) {
      lobbyTotal = parseAmount(lobbyMatch[1]);
      continue;
    }

    // Next Election
    const electionMatch = line.match(/Next Election:\s*(\d{4})/i);
    if (electionMatch) {
      nextElection = electionMatch[1];
      continue;
    }

    // Running for
    const runningMatch = line.match(/Running for\s+([A-Za-z\s\.]+?)(?:\s+\d{4})?$/i);
    if (runningMatch) {
      runningFor = runningMatch[1].trim();
      const yearMatch = line.match(/(\d{4})/);
      if (yearMatch && !nextElection) {
        nextElection = yearMatch[1];
      }
      continue;
    }

    // Up for Re-Election
    if (line.match(/Up for Re-Election/i)) {
      runningFor = 'Re-election';
      continue;
    }

    // Donations/Expenditures line - skip
    if (line.match(/Donations:|Expenditures:/i)) {
      continue;
    }

    // Organizations (remaining lines that don't match other patterns)
    if (line.length > 2 && line.length < 200) {
      const orgsInLine = extractOrganizations(line);
      organizations = [...organizations, ...orgsInLine];
    }
  }

  // Remove duplicates from organizations
  organizations = [...new Set(organizations)];

  // Build image URL from systemDataId
  let imageUrl = '';
  if (item.image && item.image.systemDataId) {
    imageUrl = `https://images.squarespace-cdn.com/content/v1/67243caa6cdc511f819106d8/${item.image.systemDataId}/${item.image.filename}`;
  }

  return {
    name: title,
    photo: imageUrl,
    position,
    party,
    lobbyTotal,
    organizations,
    nextElection,
    runningFor
  };
}

// Main scraping function
async function scrapeData() {
  try {
    console.log('Reading HTML file...');

    const htmlPath = path.join(__dirname, 'trackAIPAC_page.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    console.log('Parsing HTML...');
    const $ = cheerio.load(html);

    const statesData = {};

    // Find all data-current-context attributes
    $('[data-current-context]').each((i, elem) => {
      const contextJson = $(elem).attr('data-current-context');

      if (!contextJson) return;

      try {
        // Parse the JSON (it's HTML-encoded)
        const decodedJson = contextJson
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');

        const data = JSON.parse(decodedJson);

        // Extract state name from sectionTitle
        let stateName = null;

        if (data.sectionTitle) {
          // sectionTitle is like "<p>Alabama</p>"
          const titleMatch = data.sectionTitle.match(/>([^<]+)</);
          if (titleMatch) {
            const titleText = titleMatch[1].trim();

            // Match against US states
            stateName = US_STATES.find(state =>
              titleText.toLowerCase() === state.toLowerCase() ||
              titleText.toLowerCase().includes(state.toLowerCase())
            );
          }
        }

        if (!stateName) return;

        console.log(`Processing state: ${stateName}`);

        if (!statesData[stateName]) {
          statesData[stateName] = {
            totalAmount: 0,
            congresspeople: []
          };
        }

        if (data.userItems && Array.isArray(data.userItems)) {
          data.userItems.forEach(item => {
            const person = parseCongressMember(item);

            if (person && person.position && person.name) {
              statesData[stateName].congresspeople.push(person);
              statesData[stateName].totalAmount += person.lobbyTotal;

              console.log(`  ${person.name} (${person.position} ${person.party}) - $${person.lobbyTotal.toLocaleString()}`);
            }
          });
        }
      } catch (parseError) {
        console.error(`Error parsing JSON:`, parseError.message);
      }
    });

    // Calculate statistics
    console.log('\n=== SCRAPING SUMMARY ===');
    console.log(`Total States Found: ${Object.keys(statesData).length}`);

    let totalCongresspeople = 0;
    let totalMoney = 0;

    Object.entries(statesData).forEach(([state, data]) => {
      console.log(`${state}: ${data.congresspeople.length} members, $${data.totalAmount.toLocaleString()}`);
      totalCongresspeople += data.congresspeople.length;
      totalMoney += data.totalAmount;
    });

    console.log(`\nTotal Congresspeople: ${totalCongresspeople}`);
    console.log(`Total AIPAC Money: $${totalMoney.toLocaleString()}`);

    // Save data
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'congressData.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true});
    }

    const output = {
      lastUpdated: new Date().toISOString(),
      source: 'https://www.trackaipac.com/congress',
      totalStates: Object.keys(statesData).length,
      totalCongresspeople,
      totalMoney,
      states: statesData
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n✅ Data saved to: ${outputPath}`);

    // Find highest state
    const maxState = Object.entries(statesData).reduce((max, [state, data]) =>
      data.totalAmount > max.amount ? { state, amount: data.totalAmount } : max
    , { state: '', amount: 0 });

    console.log(`Highest State: ${maxState.state} ($${maxState.amount.toLocaleString()})`);

    return statesData;

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run the scraper
console.log('Starting final scraper...\n');
scrapeData()
  .then(() => console.log('\n✅ Scraping completed successfully!'))
  .catch(error => {
    console.error('\n❌ Scraping failed:', error.message);
    process.exit(1);
  });
