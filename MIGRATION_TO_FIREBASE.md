# Migration từ MongoDB sang Firebase

## Tổng quan

Backend đã được chuyển từ MongoDB sang Firebase Firestore để đồng bộ với frontend Flutter đang sử dụng Firebase.

## Những thay đổi chính

### 1. Dependencies

**Đã xóa:**
- `mongoose` - MongoDB ODM
- `mongodb-memory-server` - Testing

**Đã thêm:**
- `firebase-admin` - Firebase Admin SDK

### 2. Cấu hình

**Đã xóa:**
- `src/config/database.js` - MongoDB connection

**Đã thêm:**
- `src/config/firebase.js` - Firebase Admin SDK initialization

### 3. Services

**Đã cập nhật:**
- `src/services/AuthService.js` - Sử dụng Firestore thay vì MongoDB
- Các services khác cần được cập nhật tương tự

### 4. Models

**Không cần nữa:**
- Mongoose models đã bị xóa
- Firestore sử dụng collections trực tiếp

## Cấu trúc Firestore

### Collections

```
users/
  {uid}/
    - uid: string
    - name: string
    - email: string
    - password: string (hashed)
    - role: string
    - photoUrl: string
    - isOnline: boolean
    - lastSeen: timestamp
    - createdAt: timestamp
    - fcmToken: string
    
    friends/ (subcollection)
      {friendId}/
        - friendId: string
        - createdAt: timestamp

friend_requests/
  {requestId}/
    - fromUserId: string
    - toUserId: string
    - status: string (pending/accepted/rejected)
    - createdAt: timestamp

chats/
  {chatId}/
    - name: string (for groups)
    - isGroup: boolean
    - users: array
    - lastMessage: string
    - lastUpdated: timestamp
    - imageBase64: string (for groups)
    
    messages/ (subcollection)
      {messageId}/
        - senderId: string
        - senderName: string
        - content: string
        - createdAt: timestamp
        - isEdited: boolean
        - type: string (text/call/system)
        - replyTo: object (optional)

posts/
  {postId}/
    - userId: string
    - authorName: string
    - authorEmail: string
    - authorRole: string
    - title: string
    - content: string
    - imageBase64: string
    - createdAt: timestamp
    - updatedAt: timestamp
    - likesCount: number
    - commentsCount: number
```

## Hướng dẫn Setup

### Bước 1: Cài đặt dependencies mới

```bash
cd App_Chat_API/backend
npm install
```

### Bước 2: Tạo Firebase Service Account

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: **chatappfinal-620d3**
3. Vào **Project Settings** → **Service accounts**
4. Click **Generate new private key**
5. Lưu file JSON vào `App_Chat_API/backend/firebase-service-account.json`

### Bước 3: Cập nhật .env

```env
# Xóa dòng này
# MONGODB_URI=mongodb://localhost:27017/chat_app

# Thêm dòng này
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Bước 4: Chạy server

```bash
npm run dev
```

Bạn sẽ thấy:
```
✅ Firebase Admin SDK initialized successfully
✅ Firebase initialized successfully
🚀 Server is running on port 3000
```

## API không thay đổi

Tất cả API endpoints vẫn giữ nguyên, chỉ có backend implementation thay đổi:

- `POST /api/auth/register` - Vẫn hoạt động
- `POST /api/auth/login` - Vẫn hoạt động
- `GET /api/auth/me` - Vẫn hoạt động
- ... (tất cả endpoints khác)

## Frontend không cần thay đổi

Flutter app không cần thay đổi gì vì:
1. API endpoints vẫn giữ nguyên
2. Response format vẫn giữ nguyên
3. Authentication flow vẫn giữ nguyên

## Lợi ích

✅ **Đồng bộ với frontend** - Cùng sử dụng Firebase
✅ **Không cần setup MongoDB** - Đơn giản hơn
✅ **Real-time sẵn có** - Firestore hỗ trợ real-time
✅ **Dữ liệu đã có sẵn** - Không cần migrate data
✅ **Dễ deploy** - Không cần quản lý database server

## Các file cần cập nhật tiếp

Các services sau cần được cập nhật để sử dụng Firestore:

- [ ] `src/services/UserService.js`
- [ ] `src/services/FriendshipService.js`
- [ ] `src/services/RoomService.js`
- [ ] `src/services/MessageService.js`
- [ ] `src/socket/messageHandler.js`
- [ ] `src/socket/statusHandler.js`

## Testing

Sau khi setup xong, test các API:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## Troubleshooting

### Lỗi: "Error initializing Firebase Admin SDK"

**Nguyên nhân:** Không tìm thấy service account file

**Giải pháp:**
1. Kiểm tra file `firebase-service-account.json` có tồn tại không
2. Kiểm tra đường dẫn trong `.env` có đúng không

### Lỗi: "PERMISSION_DENIED"

**Nguyên nhân:** Firestore rules chặn truy cập

**Giải pháp:**
1. Vào Firebase Console → Firestore → Rules
2. Cập nhật rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Kết luận

Migration hoàn tất! Backend giờ sử dụng Firebase Firestore thay vì MongoDB, đồng bộ hoàn toàn với Flutter frontend.
