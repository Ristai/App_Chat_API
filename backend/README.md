# Chat Backend API

Backend API cho ứng dụng chat sử dụng Node.js, Express, Firebase Firestore và Socket.IO.

## Công nghệ sử dụng

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Firebase Firestore** - NoSQL database
- **Firebase Admin SDK** - Server-side Firebase operations
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd App_Chat_API/backend
npm install
```

### 2. Cấu hình Firebase

Xem hướng dẫn chi tiết trong [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Tóm tắt:**
1. Tạo Firebase Service Account từ Firebase Console
2. Tải file JSON về và lưu vào `firebase-service-account.json`
3. Cập nhật `.env` với đường dẫn file

### 3. Cấu hình môi trường

Copy file `.env.example` thành `.env`:

```bash
copy .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-here
REFRESH_TOKEN_EXPIRES_IN=30d

# Firebase
FIREBASE_PROJECT_ID=chatappfinal-620d3
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Zego (Video call)
ZEGO_APP_ID=872327054
ZEGO_APP_SIGN=9f51b89db7cefc82a011d91e70a7596314f199e4623f9e9dc6b70697989c0711
```

### 4. Chạy server

```bash
# Development mode với auto-reload
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất (requires auth)
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Lấy thông tin user hiện tại (requires auth)

### Users

- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật profile
- `POST /api/users/:id/photo` - Upload ảnh đại diện
- `GET /api/users/search?q=query` - Tìm kiếm users

### Friendships

- `POST /api/friendships/request` - Gửi lời mời kết bạn
- `POST /api/friendships/accept/:requestId` - Chấp nhận lời mời
- `POST /api/friendships/reject/:requestId` - Từ chối lời mời
- `GET /api/friendships/requests` - Lấy danh sách lời mời
- `GET /api/friendships/friends` - Lấy danh sách bạn bè
- `DELETE /api/friendships/:friendId` - Xóa bạn

### Rooms (Chat rooms)

- `POST /api/rooms` - Tạo room mới
- `GET /api/rooms` - Lấy danh sách rooms
- `GET /api/rooms/:id` - Lấy thông tin room
- `PUT /api/rooms/:id` - Cập nhật room
- `DELETE /api/rooms/:id` - Xóa room
- `POST /api/rooms/:id/members` - Thêm thành viên
- `DELETE /api/rooms/:id/members/:userId` - Xóa thành viên

### Messages

- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/:roomId` - Lấy lịch sử tin nhắn
- `PUT /api/messages/:id` - Sửa tin nhắn
- `DELETE /api/messages/:id` - Xóa tin nhắn
- `POST /api/messages/:id/read` - Đánh dấu đã đọc
- `GET /api/messages/unread/count` - Đếm tin nhắn chưa đọc

### Config

- `GET /api/config/firebase` - Lấy Firebase config cho client
- `GET /api/config/zego` - Lấy Zego config cho video call

## Socket.IO Events

### Client → Server

- `join_room` - Tham gia room
- `leave_room` - Rời room
- `send_message` - Gửi tin nhắn
- `typing` - Đang gõ
- `stop_typing` - Ngừng gõ

### Server → Client

- `connected` - Kết nối thành công
- `new_message` - Tin nhắn mới
- `message_updated` - Tin nhắn được cập nhật
- `message_deleted` - Tin nhắn bị xóa
- `user_typing` - User đang gõ
- `user_stop_typing` - User ngừng gõ
- `user_online` - User online
- `user_offline` - User offline

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/          # Cấu hình (Firebase, Socket.IO)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/          # Socket.IO handlers
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
├── FIREBASE_SETUP.md    # Firebase setup guide
└── README.md            # This file
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Linting

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix
```

## Bảo mật

- Passwords được hash bằng bcrypt
- JWT tokens cho authentication
- Rate limiting để chống spam
- Input validation với Zod
- CORS configuration
- Firebase Security Rules

## Troubleshooting

### Server không khởi động được

1. Kiểm tra Firebase service account đã được cấu hình chưa
2. Kiểm tra file `.env` có đầy đủ thông tin chưa
3. Kiểm tra port 3000 có bị chiếm dụng không

### Lỗi Firebase permission denied

1. Kiểm tra Firebase Security Rules
2. Kiểm tra service account có quyền truy cập không
3. Xem hướng dẫn trong [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### Socket.IO không kết nối được

1. Kiểm tra CORS configuration trong `.env`
2. Kiểm tra client có gửi đúng auth token không
3. Kiểm tra firewall/antivirus có chặn WebSocket không

## License

MIT
