#!/usr/bin/env node

const { newSeedData } = require("./src/utils/newSeedData");

console.log("🚀 Starting new seed data process...");
console.log(
  "⚠️  This will DELETE all existing data and create new seed data with departments!"
);
console.log("");

// Add a small delay to let user read the warning
setTimeout(async () => {
  try {
    await newSeedData();
    console.log("\n🎉 New seed data process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n💥 New seed data process failed:", error);
    process.exit(1);
  }
}, 2000);

