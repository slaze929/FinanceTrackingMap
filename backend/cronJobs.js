import cron from 'node-cron';
import { updateCongressData } from './dataUpdater.js';

/**
 * Schedule weekly data updates
 * Runs every Sunday at 3:00 AM UTC
 */
export function scheduleDataUpdates() {
  console.log('📅 Scheduling weekly data updates...');

  // Cron expression: "0 3 * * 0" = Every Sunday at 3:00 AM UTC
  const cronSchedule = process.env.UPDATE_CRON || '0 3 * * 0';

  const job = cron.schedule(cronSchedule, async () => {
    console.log('\n⏰ Scheduled update triggered');
    console.log(`Time: ${new Date().toISOString()}`);

    try {
      const result = await updateCongressData();

      if (result.success) {
        console.log('✅ Scheduled update completed successfully');

        // Log summary
        if (result.stats) {
          console.log(`📊 Updated ${result.stats.totalCongresspeople} congresspeople across ${result.stats.totalStates} states`);
          console.log(`💰 Total money tracked: $${result.stats.totalMoney.toLocaleString()}`);
        }

        if (result.changes) {
          console.log(`📝 Changes: ${result.changes.newCongresspeople.length} new, ${result.changes.amountChanges.length} updated`);
        }
      } else {
        console.error('❌ Scheduled update failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Scheduled update error:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log(`✅ Cron job scheduled: ${cronSchedule} (UTC)`);
  console.log('   Next run: Sunday at 3:00 AM UTC');
  console.log('   Set UPDATE_CRON env var to change schedule');

  return job;
}

/**
 * Run update immediately on startup (optional)
 */
export async function runStartupUpdate() {
  const runOnStartup = process.env.UPDATE_ON_STARTUP === 'true';

  if (!runOnStartup) {
    console.log('ℹ️  Startup update disabled (UPDATE_ON_STARTUP not set)');
    return;
  }

  console.log('\n🚀 Running startup update...');

  try {
    const result = await updateCongressData();

    if (result.success) {
      console.log('✅ Startup update completed successfully');
    } else {
      console.error('❌ Startup update failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Startup update error:', error);
    return { success: false, error: error.message };
  }
}

export default {
  scheduleDataUpdates,
  runStartupUpdate
};
