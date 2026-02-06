/**
 * Quick test for upload endpoint with Firebase token
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import FormData from "form-data";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase
const serviceAccountPath = join(
  __dirname,
  "..",
  "firebase-service-account.json",
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function testUpload() {
  try {
    // Get a test user
    const testEmail = "demo1@test.com";
    const userRecord = await admin.auth().getUserByEmail(testEmail);

    // Create a custom token for testing
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    console.log("✓ User UID:", userRecord.uid);
    console.log("✓ Custom token created");
    console.log(
      "\nNote: In the real app, use Firebase ID Token from user.getIdToken()",
    );
    console.log(
      "This test uses a custom token which might not work the same way.",
    );
    console.log(
      "\nTo properly test, check Flutter logs when you tap the upload button.",
    );
  } catch (error) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

testUpload();
