const cron = require("node-cron");
const deletePendingUsers = require("./deletePendingUsers");

// 🕛 Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily account cleanup job...");

  await deletePendingUsers();
});