/**
 * Seed friendships between demo users
 * Run: node scripts/seed-friendships.js
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

const seedEmails = [
  "demo1@test.com",
  "demo2@test.com",
  "demo3@test.com",
  "demo4@test.com",
  "demo5@test.com",
];

async function main() {
  console.log("\n🤝 Creating friendships...\n");

  // 1. Get UIDs
  const users = [];
  for (const email of seedEmails) {
    try {
      const u = await auth.getUserByEmail(email);
      users.push({ uid: u.uid, email: u.email, name: u.displayName });
      console.log(`✓ Found: ${u.email}`);
    } catch (e) {
      console.log(`! Skipped ${email} (not found)`);
    }
  }

  if (users.length < 2) {
    console.log("Not enough users to create friends.");
    process.exit(1);
  }

  // 2. Make everyone friends with everyone
  // Or just make everyone friends with demo1 for simplicity
  const mainUser = users[0]; // demo1

  for (let i = 1; i < users.length; i++) {
    const friend = users[i];

    // Add friend to mainUser
    await db
      .collection("users")
      .doc(mainUser.uid)
      .collection("friends")
      .doc(friend.uid)
      .set({
        friendId: friend.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Add mainUser to friend
    await db
      .collection("users")
      .doc(friend.uid)
      .collection("friends")
      .doc(mainUser.uid)
      .set({
        friendId: mainUser.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`❤️  Linked: ${mainUser.name} <---> ${friend.name}`);
  }

  console.log("\n✅ Friendships created!");
  console.log(`\n👉 Login as ${mainUser.email} / Demo123!`);
  console.log(
    '   Go to "Tin nhắn" -> "Bạn bè" tab. You should see other demo users.',
  );

  process.exit(0);
}

main().catch(console.error);
