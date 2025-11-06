import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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

/**
 * Fetch HTML from trackAIPAC
 */
async function fetchTrackAIPACHTML() {
  console.log('📥 Fetching data from trackAIPAC.com...');

  try {
    const response = await axios.get('https://www.trackaipac.com/congress', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    });

    console.log('✅ HTML fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching HTML:', error.message);
    throw error;
  }
}

/**
 * Use Claude to extract structured data from HTML
 */
async function extractDataWithClaude(html) {
  console.log('🤖 Processing data with Claude AI...');

  const prompt = `You are extracting data from the trackAIPAC website's congress page. The HTML contains information about US congress members and their AIPAC-related lobby funding.

Extract ALL congress members with the following information for EVERY state:
- State name (must be one of the 50 US states)
- Congress member full name
- Position (format: "STATE-SEN" for Senators or "STATE-##" for House members, e.g., "CA-SEN" or "CA-12")
- Party affiliation (single letter: "R" or "D")
- Total lobby amount received (numeric dollar amount)
- Organizations they received funding from (e.g., AIPAC, RJC, DMFI, JDCA, etc.)
- Next election year (4-digit year)
- What they're running for (if mentioned)
- Photo URL (full URL from images.squarespace-cdn.com if available)

IMPORTANT PARSING RULES:
1. Look for data-current-context attributes or structured JSON data in the HTML
2. Parse amounts carefully - convert "K" to thousands, "M" to millions
3. Extract ALL congresspeople for ALL states - there should be ~520 total
4. Position format must be consistent: "AL-SEN", "AL-01", "CA-SEN", "CA-12", etc.
5. Only include valid US states from the standard 50 states

Return ONLY a valid JSON object with this exact structure:
{
  "StateName": {
    "totalAmount": 0,
    "congresspeople": [
      {
        "name": "Full Name",
        "photo": "https://images.squarespace-cdn.com/...",
        "position": "STATE-SEN or STATE-##",
        "party": "R or D",
        "lobbyTotal": 123456,
        "organizations": ["AIPAC", "RJC"],
        "nextElection": "2026",
        "runningFor": "Senate"
      }
    ]
  }
}

Calculate totalAmount as the sum of all lobbyTotal values for each state.

HTML to parse:
${html.substring(0, 100000)}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 8000,
      temperature: 0,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Validate and calculate totals
    Object.keys(extractedData).forEach(state => {
      const stateData = extractedData[state];
      const calculatedTotal = stateData.congresspeople.reduce(
        (sum, person) => sum + (person.lobbyTotal || 0),
        0
      );
      stateData.totalAmount = calculatedTotal;
    });

    console.log('✅ Data extracted successfully');
    return extractedData;

  } catch (error) {
    console.error('❌ Claude extraction error:', error.message);
    throw error;
  }
}

/**
 * Validate extracted data
 */
function validateData(data) {
  console.log('🔍 Validating extracted data...');

  const states = Object.keys(data);
  const totalCongresspeople = Object.values(data).reduce(
    (sum, state) => sum + state.congresspeople.length,
    0
  );
  const totalMoney = Object.values(data).reduce(
    (sum, state) => sum + state.totalAmount,
    0
  );

  console.log(`📊 Validation Results:`);
  console.log(`   - States found: ${states.length}`);
  console.log(`   - Total congresspeople: ${totalCongresspeople}`);
  console.log(`   - Total money tracked: $${totalMoney.toLocaleString()}`);

  // Validation checks
  if (states.length < 40) {
    throw new Error(`Too few states found: ${states.length}. Expected at least 40.`);
  }

  if (totalCongresspeople < 400) {
    throw new Error(`Too few congresspeople found: ${totalCongresspeople}. Expected at least 400.`);
  }

  if (totalMoney < 100000000) {
    throw new Error(`Total money seems too low: $${totalMoney}. Expected at least $100M.`);
  }

  console.log('✅ Data validation passed');

  return {
    totalStates: states.length,
    totalCongresspeople,
    totalMoney
  };
}

/**
 * Compare with existing data to detect changes
 */
function detectChanges(oldData, newData) {
  console.log('🔄 Detecting changes...');

  const changes = {
    newCongresspeople: [],
    removedCongresspeople: [],
    amountChanges: [],
    totalDelta: 0
  };

  // Compare old vs new
  if (oldData && oldData.states) {
    Object.keys(newData).forEach(state => {
      const oldState = oldData.states[state];
      const newState = newData[state];

      if (oldState) {
        // Check for amount changes
        const delta = newState.totalAmount - oldState.totalAmount;
        if (Math.abs(delta) > 1000) {
          changes.amountChanges.push({
            state,
            oldAmount: oldState.totalAmount,
            newAmount: newState.totalAmount,
            delta
          });
          changes.totalDelta += delta;
        }

        // Check for new/removed people
        const oldNames = oldState.congresspeople.map(p => p.name);
        const newNames = newState.congresspeople.map(p => p.name);

        newNames.forEach(name => {
          if (!oldNames.includes(name)) {
            changes.newCongresspeople.push({ state, name });
          }
        });

        oldNames.forEach(name => {
          if (!newNames.includes(name)) {
            changes.removedCongresspeople.push({ state, name });
          }
        });
      }
    });
  }

  if (changes.newCongresspeople.length > 0 || changes.amountChanges.length > 0) {
    console.log('📝 Changes detected:');
    console.log(`   - New congresspeople: ${changes.newCongresspeople.length}`);
    console.log(`   - Removed congresspeople: ${changes.removedCongresspeople.length}`);
    console.log(`   - Amount changes: ${changes.amountChanges.length} states`);
    console.log(`   - Total money delta: $${changes.totalDelta.toLocaleString()}`);
  } else {
    console.log('ℹ️  No significant changes detected');
  }

  return changes;
}

/**
 * Commit and push changes to GitHub
 */
async function commitAndPush(stats, changes) {
  if (!process.env.GITHUB_TOKEN) {
    console.warn('⚠️  GITHUB_TOKEN not set - skipping git commit');
    return false;
  }

  console.log('📤 Committing changes to GitHub...');

  try {
    const repoPath = path.join(__dirname, '..');

    // Configure git
    execSync('git config user.name "Auto-Update Bot"', { cwd: repoPath });
    execSync('git config user.email "bot@wherearejew.com"', { cwd: repoPath });

    // Add changes
    execSync('git add src/data/congressData.json', { cwd: repoPath });

    // Check if there are changes to commit
    try {
      execSync('git diff --staged --quiet', { cwd: repoPath });
      console.log('ℹ️  No changes to commit');
      return false;
    } catch (error) {
      // There are changes, continue with commit
    }

    // Create commit message
    const timestamp = new Date().toISOString().split('T')[0];
    let commitMessage = `Auto-update: TrackAIPAC data (${timestamp})\n\n`;
    commitMessage += `📊 Stats:\n`;
    commitMessage += `- States: ${stats.totalStates}\n`;
    commitMessage += `- Congresspeople: ${stats.totalCongresspeople}\n`;
    commitMessage += `- Total Money: $${stats.totalMoney.toLocaleString()}\n`;

    if (changes.newCongresspeople.length > 0) {
      commitMessage += `\n✨ New: ${changes.newCongresspeople.length} congresspeople added\n`;
    }
    if (changes.amountChanges.length > 0) {
      commitMessage += `💰 Updated: ${changes.amountChanges.length} states with funding changes\n`;
    }

    commitMessage += `\n🤖 Generated with [Claude Code](https://claude.com/claude-code)`;

    // Commit
    execSync(`git commit -m "${commitMessage}"`, { cwd: repoPath });

    // Push using GITHUB_TOKEN
    const repo = process.env.GITHUB_REPO || 'slaze929/FinanceTrackingMap';
    const pushUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${repo}.git`;

    execSync(`git push ${pushUrl} main`, { cwd: repoPath });

    console.log('✅ Changes committed and pushed to GitHub');
    return true;

  } catch (error) {
    console.error('❌ Git commit/push error:', error.message);
    return false;
  }
}

/**
 * Main update function
 */
export async function updateCongressData() {
  console.log('\n🚀 Starting automated data update...');
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  try {
    // Check if updates are enabled
    if (process.env.UPDATE_ENABLED === 'false') {
      console.log('ℹ️  Updates are disabled (UPDATE_ENABLED=false)');
      return { success: false, message: 'Updates disabled' };
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set');
    }

    // Load existing data
    const dataPath = path.join(__dirname, '..', 'src', 'data', 'congressData.json');
    let oldData = null;

    if (fs.existsSync(dataPath)) {
      oldData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log(`📂 Loaded existing data (last updated: ${oldData.lastUpdated})`);

      // Backup old data
      const backupPath = path.join(__dirname, `congressData.backup.${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(oldData, null, 2));
      console.log(`💾 Backup created: ${backupPath}`);
    }

    // Fetch and parse new data
    const html = await fetchTrackAIPACHTML();
    const newStatesData = await extractDataWithClaude(html);

    // Validate
    const stats = validateData(newStatesData);

    // Detect changes
    const changes = detectChanges(oldData, newStatesData);

    // Create new data object
    const newData = {
      lastUpdated: new Date().toISOString(),
      source: 'https://www.trackaipac.com/congress',
      totalStates: stats.totalStates,
      totalCongresspeople: stats.totalCongresspeople,
      totalMoney: stats.totalMoney,
      states: newStatesData
    };

    // Save updated data
    const outputDir = path.dirname(dataPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2));
    console.log(`✅ Data saved to: ${dataPath}`);

    // Commit to GitHub
    const committed = await commitAndPush(stats, changes);

    console.log('\n✅ Update completed successfully!');

    return {
      success: true,
      stats,
      changes,
      committed,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('\n❌ Update failed:', error.message);
    console.error(error.stack);

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// If run directly (not imported)
if (import.meta.url === `file://${__filename}`) {
  updateCongressData()
    .then(result => {
      console.log('\n📋 Final result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
