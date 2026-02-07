/**
 * Seed more users for testing - creates visible users in app
 * Run: node scripts/seed-users.js
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

const db = admin.firestore();
const auth = admin.auth();

// Sample users
const sampleUsers = [
  {
    email: "demo1@test.com",
    password: "Demo123!",
    displayName: "Nguyen Van Demo",
  },
  {
    email: "demo2@test.com",
    password: "Demo123!",
    displayName: "Tran Thi Test",
  },
  {
    email: "demo3@test.com",
    password: "Demo123!",
    displayName: "Le Van Sample",
  },
  {
    email: "demo4@test.com",
    password: "Demo123!",
    displayName: "Pham Minh User",
  },
  {
    email: "demo5@test.com",
    password: "Demo123!",
    displayName: "Hoang Kim Friend",
  },
];

async function main() {
  console.log("\n🌱 Creating sample users...\n");

  for (const user of sampleUsers) {
    try {
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`✓ User exists: ${user.email}`);
      } catch (e) {
        userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
        });
        console.log(`✓ Created: ${user.email}`);
      }

      // Save to Firestore users collection
      await db.collection("users").doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email: user.email,
          displayName: user.displayName,
          name: user.displayName, // Some apps use 'name' instead
          photoURL: null,
          status: "online",
          lastSeen: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error(`✗ Error: ${user.email}:`, error.message);
    }
  }

  console.log("\n✅ Done! Users created:\n");
  sampleUsers.forEach((u) => console.log(`   ${u.email} / ${u.password}`));

  process.exit(0);
}

main().catch(console.error);
