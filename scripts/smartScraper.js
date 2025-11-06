import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Parse congress member data from HTML description
function parseCongressMember(title, description, imageUrl) {
  if (!description) return null;

  const lines = description.split(/<\/p><p[^>]*>/).map(l =>
    l.replace(/<\/?p[^>]*>/g, '').replace(/<br\s*\/?>/gi, '\n').trim()
  );

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
    }

    // Lobby Total
    const lobbyMatch = line.match(/Lobby Total:\s*\$?([\d,\.KM]+)/i);
    if (lobbyMatch) {
      lobbyTotal = parseAmount(lobbyMatch[1]);
    }

    // Organizations (line that doesn't match other patterns)
    if (!line.match(/Lobby Total|Next Election|Running for|Donations|Expenditures|Up for Re-Election/i) &&
        line.length > 2 && line.length < 200 &&
        !posMatch) {
      organizations = extractOrganizations(line);
    }

    // Next Election
    const electionMatch = line.match(/Next Election:\s*(\d{4})/i);
    if (electionMatch) {
      nextElection = electionMatch[1];
    }

    // Running for
    const runningMatch = line.match(/Running for\s+([A-Za-z\s\.]+?)(?:\s+\d{4})?$/i);
    if (runningMatch) {
      runningFor = runningMatch[1].trim();
      const yearMatch = line.match(/(\d{4})/);
      if (yearMatch && !nextElection) {
        nextElection = yearMatch[1];
      }
    }

    // Up for Re-Election
    if (line.match(/Up for Re-Election/i) && !runningFor) {
      runningFor = 'Re-election';
    }
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
async function scrapeFromHTML() {
  try {
    console.log('Reading downloaded HTML file...');

    const htmlPath = path.join(__dirname, 'trackAIPAC_page.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    console.log('Parsing HTML with Cheerio...');
    const $ = cheerio.load(html);

    const statesData = {};
    let currentState = null;

    // Process each list item that contains congress member data
    $('.user-items-list-item-container').each((i, container) => {
      const $container = $(container);

      // Check if this container has a section title (state name)
      const sectionTitle = $container.find('.list-section-title p').first().text().trim();

      if (sectionTitle && sectionTitle.length > 0 && sectionTitle.length < 50) {
        // This is a state header
        currentState = sectionTitle;
        if (!statesData[currentState]) {
          statesData[currentState] = {
            totalAmount: 0,
            congresspeople: []
          };
        }
        console.log(`Found state: ${currentState}`);
      }

      // Look for congress member items
      $container.find('.list-item').each((j, item) => {
        const $item = $(item);

        // Extract title (name)
        const title = $item.find('.list-item-content__title').text().trim();

        // Extract description
        const descHtml = $item.find('.list-item-content__description').html();
        const description = descHtml ? descHtml.trim() : '';

        // Extract image
        const img = $item.find('img').first();
        let imageUrl = '';
        if (img.length) {
          imageUrl = img.attr('data-src') || img.attr('src') || '';
        }

        if (title && currentState && description) {
          const person = parseCongressMember(title, description, imageUrl);

          if (person && person.position) {
            statesData[currentState].congresspeople.push(person);
            statesData[currentState].totalAmount += person.lobbyTotal;

            console.log(`  ${person.name} (${person.position}) - $${person.lobbyTotal.toLocaleString()}`);
          }
        }
      });
    });

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
      fs.mkdirSync(outputDir, { recursive: true });
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

    console.log(`\nHighest State: ${maxState.state} ($${maxState.amount.toLocaleString()})`);

    return statesData;

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Run the scraper
console.log('Starting smart scraper...\n');
scrapeFromHTML()
  .then(() => console.log('\n✅ Scraping completed successfully!'))
  .catch(error => {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  });
