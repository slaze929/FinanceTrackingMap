import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadHTML() {
  try {
    console.log('Downloading HTML from trackAIPAC.com...');

    const response = await axios.get('https://www.trackaipac.com/congress', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const outputPath = path.join(__dirname, 'trackAIPAC_page.html');
    fs.writeFileSync(outputPath, response.data);

    console.log(`✅ HTML saved to: ${outputPath}`);
    console.log(`File size: ${(response.data.length / 1024).toFixed(2)} KB`);

    // Also save a small preview
    const preview = response.data.substring(0, 5000);
    fs.writeFileSync(path.join(__dirname, 'preview.html'), preview);
    console.log('Preview (first 5000 chars) saved to scripts/preview.html');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadHTML();
