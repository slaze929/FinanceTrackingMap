# Comment Board Backend API

Simple Express.js backend for storing and retrieving comments about congresspeople.

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

- `GET /api/health` - Health check
- `GET /api/comments` - Get all comments (grouped by person)
- `GET /api/comments/:personKey` - Get comments for a specific congressperson
- `POST /api/comments` - Post a new comment
- `GET /api/comments/:personKey/count` - Get comment count for a congressperson

### Database

Uses a simple JSON file (`comments.json`) for local development. When deploying to Railway, this can be easily swapped to PostgreSQL.

## Deployment to Railway

1. Create a new PostgreSQL database on Railway
2. Add environment variable: `DATABASE_URL`
3. Update `server.js` to use PostgreSQL instead of JSON file
4. Deploy!

The backend is already configured in `railway.json` at the root of the project.
