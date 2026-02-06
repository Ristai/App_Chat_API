/**
 * Test Firebase Storage configuration
 */

import { initializeFirebase, getStorage } from "../src/config/firebase.js";

async function testStorage() {
  try {
    console.log("🔍 Testing Firebase Storage...\n");

    // Initialize Firebase
    initializeFirebase();
    console.log("✓ Firebase initialized\n");

    // Get storage
    const storage = getStorage();
    console.log("✓ Storage instance obtained\n");

    // Get bucket
    const bucket = storage.bucket();
    console.log("✓ Bucket name:", bucket.name);

    // Try to list files (test permission)
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log("✓ Bucket accessible! File count:", files.length);

    console.log("\n✅ Firebase Storage is configured correctly!");
  } catch (error) {
    console.error("\n❌ Firebase Storage Error:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
  }

  process.exit(0);
}

testStorage();
