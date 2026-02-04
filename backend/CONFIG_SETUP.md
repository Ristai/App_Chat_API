# Configuration Setup Guide

## 🔐 API Keys Management

Tất cả API keys được quản lý tập trung ở backend để bảo mật.

## Setup Instructions

### 1. Copy Environment File

```bash
cd App_Chat_API/backend
cp .env.example .env
```

### 2. Update .env File

Mở file `.env` và cập nhật các giá trị:

#### Firebase Configuration
```env
FIREBASE_PROJECT_ID=chatappfinal-620d3
FIREBASE_API_KEY=AIzaSyDDdtP5JE4z6gGCqqR79_KeA-ne9cloGeo
FIREBASE_AUTH_DOMAIN=chatappfinal-620d3.firebaseapp.com
FIREBASE_STORAGE_BUCKET=chatappfinal-620d3.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=713648515500
FIREBASE_APP_ID=1:713648515500:web:eb9168b0bb91ed53d2f209
FIREBASE_MEASUREMENT_ID=G-CWMR96TZVZ
```

#### Zego Cloud Configuration
Lấy từ: https://console.zego.im/

```env
ZEGO_APP_ID=872327054
ZEGO_APP_SIGN=9f51b89db7cefc82a011d91e70a7596314f199e4623f9e9dc6b70697989c0711
ZEGO_SERVER_SECRET=your-zego-server-secret
```

#### JWT Secrets
Tạo random strings mạnh:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
JWT_SECRET=your-generated-secret-here
REFRESH_TOKEN_SECRET=your-generated-refresh-secret-here
```

### 3. Start Backend Server

```bash
npm install
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints for Config

### Get Firebase Config
```
GET /api/config/firebase
```

Response:
```json
{
  "success": true,
  "data": {
    "apiKey": "...",
    "authDomain": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "...",
    "appId": "...",
    "measurementId": "..."
  }
}
```

### Get Zego Config
```
GET /api/config/zego
```

Response:
```json
{
  "success": true,
  "data": {
    "appId": 123456789,
    "appSign": "..."
  }
}
```

### Generate Zego Token (Authenticated)
```
POST /api/config/zego/token
Authorization: Bearer <access_token>

Body:
{
  "roomId": "room123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "userId": "...",
    "roomId": "room123"
  }
}
```

## Frontend Integration

Flutter app sẽ tự động lấy config từ backend khi khởi động:

```dart
// In main.dart
final configService = ConfigService();
final firebaseConfig = await configService.getFirebaseConfig();
final zegoConfig = await configService.getZegoConfig();
```

## Security Notes

⚠️ **QUAN TRỌNG:**

1. **KHÔNG commit file `.env`** vào git
2. File `.env` đã được thêm vào `.gitignore`
3. Chỉ share `.env.example` với team
4. Mỗi developer tự tạo `.env` local của mình
5. Production environment sử dụng environment variables riêng

## Troubleshooting

### Backend không start được
- Kiểm tra file `.env` đã tồn tại chưa
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra port 3000 có bị chiếm không

### Flutter không lấy được config
- Kiểm tra backend đã chạy chưa
- Kiểm tra URL trong `config_service.dart` đúng chưa
- Kiểm tra network connection

### Firebase initialization failed
- Kiểm tra Firebase config trong `.env` đúng chưa
- Kiểm tra backend API `/api/config/firebase` có trả về data không
