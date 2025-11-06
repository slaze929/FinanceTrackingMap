# Backend API

Express.js backend with comment board and automated data updates from trackAIPAC.com.

## Security Features

**Two-Layer Anti-Doxxing Protection**:

**Layer 1 - Regex Filter (Always Active)**:
- Phone numbers (all formats)
- Email addresses
- Physical addresses
- Social Security Numbers
- Credit card numbers
- IP addresses
- Location information (ZIP codes with context)
- Suspicious phrases indicating doxxing attempts

**Layer 2 - AI Semantic Analysis (Optional, Recommended)**:
- Catches obfuscated PII (e.g., "65 haha 123 haha 7890")
- Detects intentional misspellings and character substitutions
- Understands context and intent
- Uses Claude 3.5 Haiku for fast, cost-effective moderation

**Free speech is preserved** - only personal information is blocked, not political opinions or criticism.

### Enabling AI Moderation

1. Get an API key from https://console.anthropic.com/
2. Copy `.env.example` to `.env`
3. Add your key: `ANTHROPIC_API_KEY=sk-ant-...`
4. Restart the server

Without an API key, the system falls back to basic regex filtering only.

## Local Development

### Install Dependencies
```bash
npm install
```

### Start the Server
```bash
npm run dev
```

The API will run on `http://localhost:3001`

### API Endpoints

**Comment Board:**
- `GET /api/health` - Health check
- `GET /api/comments` - Get all comments (grouped by person)
- `GET /api/comments/:personKey` - Get comments for a specific congressperson
- `POST /api/comments` - Post a new comment
- `GET /api/comments/:personKey/count` - Get comment count for a congressperson

**Data Updates:**
- `GET /api/update-status` - Get last update timestamp and stats
- `POST /api/update-data` - Manually trigger data update (requires API key)

### Database

Uses a simple JSON file (`comments.json`) for local development. When deploying to Railway, this can be easily swapped to PostgreSQL.

## Automated Data Updates

The backend automatically updates congress data from trackAIPAC.com weekly.

### How It Works

1. **Scheduled Updates**: Runs every Sunday at 3:00 AM UTC (configurable)
2. **Data Fetching**: Scrapes latest data from trackAIPAC.com
3. **AI Parsing**: Uses Claude API to intelligently extract structured data
4. **Validation**: Ensures data quality (state count, congresspeople count, totals)
5. **Change Detection**: Tracks new congresspeople and funding changes
6. **Auto-Commit**: Commits updated JSON to GitHub
7. **Auto-Deploy**: Vercel automatically redeploys frontend with new data

### Configuration

Set these environment variables:

```bash
# Required for updates
ANTHROPIC_API_KEY=sk-ant-...          # Claude API key
GITHUB_TOKEN=ghp_...                   # GitHub Personal Access Token
GITHUB_REPO=username/repo              # Your repository

# Optional
UPDATE_API_KEY=random_secret           # For manual trigger endpoint
UPDATE_ENABLED=true                     # Enable/disable auto-updates
UPDATE_ON_STARTUP=false                 # Run update on server startup
UPDATE_CRON=0 3 * * 0                  # Cron schedule (default: Sun 3AM UTC)
```

### Manual Updates

Trigger an update manually via API:

```bash
curl -X POST https://your-railway-url.up.railway.app/api/update-data \
  -H "x-api-key: your_update_api_key"
```

Or run locally:

```bash
npm run update-data
```

### GitHub Token Setup

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "Railway Auto-Update"
4. Select scope: `repo` (Full control of private repositories)
5. Generate and copy the token
6. Add to Railway environment variables as `GITHUB_TOKEN`

### Cost Estimate

- Claude API (Haiku): ~$0.50-2.00 per week
- Railway hosting: Free tier or $5/month
- GitHub/Vercel: Free

**Total**: ~$2-8/month

## Deployment to Railway

1. Push your code to GitHub
2. Create a new project on Railway from your GitHub repo
3. Add environment variables (see `.env.example`)
4. Railway will auto-deploy!

### Required Environment Variables for Railway

```
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
GITHUB_REPO=slaze929/FinanceTrackingMap
UPDATE_API_KEY=random_secret_key
UPDATE_ENABLED=true
UPDATE_CRON=0 3 * * 0
```

The backend is already configured in `railway.json` at the root of the project.
