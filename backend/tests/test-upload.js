/**
 * Test script for Upload Images API
 * Run: node tests/test-upload.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = "http://localhost:3000/api";

// You need to get a valid token first by logging in
const AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE";

async function testUpload() {
  console.log("🧪 Testing Upload Images API...\n");

  // Create a test image if not exists
  const testImagePath = path.join(__dirname, "test-image.jpg");
  if (!fs.existsSync(testImagePath)) {
    console.log("⚠️  Please create a test image at:", testImagePath);
    console.log("   Or put any .jpg file and rename to test-image.jpg\n");
    return;
  }

  // Create form data
  const formData = new FormData();
  const imageBuffer = fs.readFileSync(testImagePath);
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("images", blob, "test-image.jpg");
  formData.append("roomId", "test-room-123");

  try {
    const response = await fetch(`${API_BASE}/upload/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Upload successful!");
      console.log("📷 Image URLs:", result.data.urls);
      console.log("📊 Count:", result.data.count);
    } else {
      console.log("❌ Upload failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// First test without auth to see error handling
async function testWithoutAuth() {
  console.log("🧪 Testing without authentication...");

  try {
    const response = await fetch(`${API_BASE}/upload/images`, {
      method: "POST",
    });
    const result = await response.json();
    console.log("Response:", result);
    console.log("✅ Auth middleware working correctly!\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

// Run tests
testWithoutAuth();
// testUpload(); // Uncomment after setting AUTH_TOKEN
