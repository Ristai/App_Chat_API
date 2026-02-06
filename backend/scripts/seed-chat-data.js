/**
 * Seed script to create sample users and chat conversations in Firestore
 * Run: node scripts/seed-chat-data.js
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

// Sample users
const sampleUsers = [
  {
    email: "user1@test.com",
    password: "Test123!",
    displayName: "Nguyen Van A",
  },
  { email: "user2@test.com", password: "Test123!", displayName: "Tran Thi B" },
];

async function createUsers() {
  const createdUsers = [];

  for (const user of sampleUsers) {
    try {
      // Check if user exists
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`✓ User exists: ${user.email} (${userRecord.uid})`);
      } catch (e) {
        // Create new user
        userRecord = await auth.createUser({
          email: user.email,
          password: user.password,
          displayName: user.displayName,
        });
        console.log(`✓ Created user: ${user.email} (${userRecord.uid})`);
      }

      // Save to Firestore users collection
      await db.collection("users").doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      createdUsers.push({ ...user, uid: userRecord.uid });
    } catch (error) {
      console.error(`✗ Error with user ${user.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function createChat(user1, user2) {
  // Create chat ID (sorted UIDs)
  const ids = [user1.uid, user2.uid].sort();
  const chatId = ids.join("_");

  // Create chat document
  await db
    .collection("chats")
    .doc(chatId)
    .set(
      {
        users: [user1.uid, user2.uid],
        userNames: {
          [user1.uid]: user1.displayName,
          [user2.uid]: user2.displayName,
        },
        lastMessage: "Xin chào! Hãy thử gửi ảnh nhé 📷",
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  console.log(`✓ Created chat: ${chatId}`);

  // Add sample messages
  const messages = [
    {
      senderId: user1.uid,
      senderName: user1.displayName,
      content: "Xin chào!",
    },
    {
      senderId: user2.uid,
      senderName: user2.displayName,
      content: "Chào bạn!",
    },
    {
      senderId: user1.uid,
      senderName: user1.displayName,
      content: "Bạn khỏe không?",
    },
    {
      senderId: user2.uid,
      senderName: user2.displayName,
      content: "Mình khỏe, cảm ơn bạn!",
    },
    {
      senderId: user1.uid,
      senderName: user1.displayName,
      content: "Hãy thử gửi ảnh nhé 📷",
    },
  ];

  for (const msg of messages) {
    await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .add({
        ...msg,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isEdited: false,
      });
  }

  console.log(`✓ Added ${messages.length} sample messages`);

  return chatId;
}

async function main() {
  console.log("\n🌱 Seeding sample data...\n");

  // Create users
  const users = await createUsers();

  if (users.length >= 2) {
    // Create chat between first 2 users
    await createChat(users[0], users[1]);
  }

  console.log("\n✅ Seed completed!");
  console.log("\n📱 Test accounts:");
  sampleUsers.forEach((u) => {
    console.log(`   Email: ${u.email}`);
    console.log(`   Password: ${u.password}\n`);
  });

  process.exit(0);
}

main().catch(console.error);
