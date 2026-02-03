import cron from "node-cron";
import { syncAllFromNotion } from "./notion-sync";

export function startScheduler() {
  console.log("Starting scheduler for Notion sync...");
  
  cron.schedule("0 3 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled Notion sync...`);
    try {
      const result = await syncAllFromNotion();
      console.log(`[${new Date().toISOString()}] Scheduled sync completed:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled sync failed:`, error);
    }
  }, {
    timezone: "Asia/Tokyo"
  });
  
  console.log("Scheduler started: Notion sync runs daily at 3:00 AM JST");
}
