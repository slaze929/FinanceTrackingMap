import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { checkContent, getErrorMessage } from './contentFilter.js';
import { moderateContent, isObviouslyClean } from './aiModerator.js';
import { scheduleDataUpdates, runStartupUpdate } from './cronJobs.js';
import { updateCongressData } from './dataUpdater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database file path
const DB_FILE = join(__dirname, 'comments.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ comments: [] }, null, 2));
}

// Helper functions for database operations
const readDB = () => {
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Comment board API is running' });
});

// Get all comments for a specific congressperson
app.get('/api/comments/:personKey', (req, res) => {
  try {
    const { personKey } = req.params;
    const db = readDB();
    const comments = db.comments
      .filter(comment => comment.personKey === personKey)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get all comments (grouped by person)
app.get('/api/comments', (req, res) => {
  try {
    const db = readDB();
    const comments = db.comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Group by person_key
    const grouped = comments.reduce((acc, comment) => {
      if (!acc[comment.personKey]) {
        acc[comment.personKey] = [];
      }
      acc[comment.personKey].push(comment);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Post a new comment
app.post('/api/comments', async (req, res) => {
  try {
    const { personKey, name, text, timestamp } = req.body;

    // Validation
    if (!personKey || !text) {
      return res.status(400).json({ error: 'personKey and text are required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment text must be 1000 characters or less' });
    }

    const finalName = (name && name.trim()) || 'Anonymous';

    // LAYER 1: Basic regex filtering (fast, catches obvious PII)
    const nameCheck = checkContent(finalName);
    if (!nameCheck.isClean) {
      console.warn('Blocked comment - PII in name (regex):', nameCheck.violations);
      return res.status(400).json({
        error: getErrorMessage(nameCheck.violations),
        violations: nameCheck.violations
      });
    }

    const textCheck = checkContent(text);
    if (!textCheck.isClean) {
      console.warn('Blocked comment - PII in text (regex):', textCheck.violations);
      return res.status(400).json({
        error: getErrorMessage(textCheck.violations),
        violations: textCheck.violations
      });
    }

    // LAYER 2: AI-powered semantic analysis (catches obfuscated PII)
    // Only run AI check if content seems suspicious or API key is configured
    if (!isObviouslyClean(text + ' ' + finalName)) {
      const aiCheck = await moderateContent(text, finalName);

      if (!aiCheck.isClean) {
        console.warn('Blocked comment - PII detected by AI:', {
          violations: aiCheck.violations,
          reasoning: aiCheck.reasoning
        });
        return res.status(400).json({
          error: 'Your comment appears to contain personal information. ' + aiCheck.violations.join(', ') + '. Please remove any identifying information.',
          violations: aiCheck.violations,
          reasoning: aiCheck.reasoning
        });
      }
    }

    const finalTimestamp = timestamp || new Date().toISOString();

    const db = readDB();
    const newComment = {
      id: Date.now(),
      personKey,
      name: finalName,
      text,
      timestamp: finalTimestamp
    };

    db.comments.push(newComment);
    writeDB(db);

    console.log('Comment posted successfully:', { personKey, name: finalName });
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get comment count for a specific congressperson
app.get('/api/comments/:personKey/count', (req, res) => {
  try {
    const { personKey } = req.params;
    const db = readDB();
    const count = db.comments.filter(comment => comment.personKey === personKey).length;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching comment count:', error);
    res.status(500).json({ error: 'Failed to fetch comment count' });
  }
});

// ==========================================
// DATA UPDATE ENDPOINTS
// ==========================================

// Manual trigger for data update (protected endpoint)
app.post('/api/update-data', async (req, res) => {
  try {
    // Simple API key protection
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey || apiKey !== process.env.UPDATE_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
    }

    console.log('🔄 Manual data update triggered via API');

    // Run update in background and return immediately
    res.json({
      status: 'started',
      message: 'Data update started. Check logs for progress.',
      timestamp: new Date().toISOString()
    });

    // Execute update asynchronously
    updateCongressData()
      .then(result => {
        console.log('✅ Manual update completed:', result);
      })
      .catch(error => {
        console.error('❌ Manual update failed:', error);
      });

  } catch (error) {
    console.error('Error triggering update:', error);
    res.status(500).json({ error: 'Failed to trigger update' });
  }
});

// Get last update status/timestamp
app.get('/api/update-status', (req, res) => {
  try {
    const dataPath = join(__dirname, '..', 'src', 'data', 'congressData.json');

    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

      res.json({
        lastUpdated: data.lastUpdated,
        totalStates: data.totalStates,
        totalCongresspeople: data.totalCongresspeople,
        totalMoney: data.totalMoney,
        source: data.source
      });
    } else {
      res.status(404).json({ error: 'Data file not found' });
    }
  } catch (error) {
    console.error('Error fetching update status:', error);
    res.status(500).json({ error: 'Failed to fetch update status' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Comment board API server running on http://localhost:${PORT}`);
  console.log(`📝 Database: ${DB_FILE}`);

  // Initialize automated data updates
  console.log('\n📅 Initializing automated data updates...');

  // Schedule weekly updates
  scheduleDataUpdates();

  // Run startup update if enabled
  await runStartupUpdate();

  console.log('\n✅ Server fully initialized');
});
