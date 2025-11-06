# Auto-Update System Setup Guide

## Quick Start

This system automatically updates your website's AIPAC funding data from trackAIPAC.com every week.

---

## 🚀 Step-by-Step Setup

### 1. Create GitHub Personal Access Token

You need this for the system to automatically commit data updates.

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: `Railway Auto-Update`
4. Set expiration: `No expiration` (or 1 year)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
6. Click **"Generate token"**
7. **COPY THE TOKEN** - you'll only see it once!

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `@anthropic-ai/sdk` - Claude API for parsing
- `axios` - HTTP requests
- `node-cron` - Weekly scheduling

---

### 3. Configure Railway Environment Variables

Go to your Railway project → **Variables** tab and add:

```bash
# Already have this from comment moderation
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# New - Paste the GitHub token you created
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Your repository
GITHUB_REPO=slaze929/FinanceTrackingMap

# Random secret for manual updates (make this up)
UPDATE_API_KEY=my_secret_update_key_12345

# Enable updates
UPDATE_ENABLED=true

# Optional: run update when server starts (testing)
UPDATE_ON_STARTUP=false

# Schedule: every Sunday at 3AM UTC
UPDATE_CRON=0 3 * * 0
```

---

### 4. Deploy to Railway

Commit and push your changes:

```bash
git add .
git commit -m "Add automated weekly data update system"
git push
```

Railway will automatically redeploy with the new code.

---

### 5. Verify It's Working

**Check the logs:**

After Railway deploys, check the logs for:

```
📅 Initializing automated data updates...
✅ Cron job scheduled: 0 3 * * 0 (UTC)
   Next run: Sunday at 3:00 AM UTC
✅ Server fully initialized
```

**Test the update endpoint:**

Check last update status:

```bash
curl https://your-railway-url.up.railway.app/api/update-status
```

**Manually trigger an update (optional):**

```bash
curl -X POST https://your-railway-url.up.railway.app/api/update-data \
  -H "x-api-key: my_secret_update_key_12345"
```

---

## 📅 How It Works

### Automated Weekly Updates

1. **Every Sunday at 3:00 AM UTC**, the cron job triggers
2. Fetches latest HTML from trackAIPAC.com
3. Uses Claude AI to parse and extract data
4. Validates data (checks state count, congresspeople count, totals)
5. Detects changes (new people, funding changes)
6. Commits to GitHub with detailed changelog
7. Vercel auto-deploys updated frontend
8. Users see fresh data!

### Data Flow

```
Railway (cron) → trackAIPAC.com → Claude AI →
Validate → GitHub Commit → Vercel Deploy → Live Site ✨
```

---

## 🎛️ Configuration Options

### Change Update Schedule

Modify `UPDATE_CRON` variable:

- `0 3 * * 0` - Every Sunday at 3 AM UTC (default)
- `0 2 * * 1` - Every Monday at 2 AM UTC
- `0 0 * * *` - Every day at midnight UTC
- `0 */6 * * *` - Every 6 hours

[Cron expression helper](https://crontab.guru/)

### Disable Auto-Updates Temporarily

Set `UPDATE_ENABLED=false` in Railway

### Test Update on Startup

Set `UPDATE_ON_STARTUP=true` (will run when server starts)

---

## 🔍 Monitoring

### View Update Logs

Railway → Deployments → Logs

Look for:
- `🚀 Starting automated data update...`
- `✅ Data saved`
- `✅ Changes committed and pushed to GitHub`

### Check Last Update

Visit: `https://your-railway-url.up.railway.app/api/update-status`

Returns:
```json
{
  "lastUpdated": "2025-11-06T10:30:00.000Z",
  "totalStates": 49,
  "totalCongresspeople": 521,
  "totalMoney": 186958337,
  "source": "https://www.trackaipac.com/congress"
}
```

---

## 💰 Cost Breakdown

- **Claude API (Haiku)**: ~$0.50-2.00 per week
  - 1 request/week for parsing
  - ~8000 tokens per request
  - Cost: $0.0008-$0.002 per request

- **Railway**: Free tier or $5/month
  - Includes 500 hours/month free
  - Background cron jobs included

- **GitHub**: Free
- **Vercel**: Free

**Monthly Total**: ~$2-8/month

---

## 🛠️ Troubleshooting

### Updates Not Running?

1. **Check Railway logs** for errors
2. **Verify environment variables** are set correctly
3. **Check GITHUB_TOKEN** has correct permissions
4. **Ensure UPDATE_ENABLED=true**

### Data Not Committing to GitHub?

1. **GitHub token expired?** Regenerate
2. **Wrong repo name?** Check `GITHUB_REPO` format
3. **Token missing repo scope?** Recreate with `repo` permission

### Claude API Errors?

1. **Check API key** is valid
2. **Check API usage** at console.anthropic.com
3. **Billing issue?** Add payment method

### Manual Test

Run update script locally:

```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-...
export GITHUB_TOKEN=ghp_...
export GITHUB_REPO=slaze929/FinanceTrackingMap
npm run update-data
```

---

## 📧 Notifications (Future Enhancement)

You can add email/Discord notifications on updates by modifying `dataUpdater.js`:

```javascript
// After successful update
if (result.success) {
  await sendNotification({
    message: `Data updated! ${stats.totalCongresspeople} congresspeople tracked`,
    changes: changes.newCongresspeople.length
  });
}
```

---

## ✅ Checklist

Before going live:

- [ ] GitHub token created with `repo` scope
- [ ] Railway environment variables set
- [ ] Backend dependencies installed (`npm install`)
- [ ] Code deployed to Railway
- [ ] Update schedule confirmed in logs
- [ ] Test update endpoint works
- [ ] Verify data in `src/data/congressData.json` updates

---

## 🎉 You're Done!

Your website will now automatically stay up-to-date with the latest AIPAC funding data every week!

**Next update**: Check Railway logs on Sunday at 3:00 AM UTC

---

## Support

If you run into issues:
1. Check Railway logs
2. Test manually with `npm run update-data`
3. Verify all environment variables
4. Check GitHub token hasn't expired

Happy automating! 🚀
