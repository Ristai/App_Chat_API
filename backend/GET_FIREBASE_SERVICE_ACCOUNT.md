# Hướng dẫn lấy Firebase Service Account

## Bước 1: Truy cập Firebase Console

1. Mở trình duyệt và truy cập: https://console.firebase.google.com/
2. Đăng nhập bằng tài khoản Google của bạn
3. Chọn project: **chatappfinal-620d3**

## Bước 2: Vào Service Accounts

1. Click vào icon **⚙️ (Settings)** ở góc trên bên trái
2. Chọn **Project settings**
3. Chuyển sang tab **Service accounts**

## Bước 3: Generate Private Key

1. Trong tab Service accounts, bạn sẽ thấy phần **Firebase Admin SDK**
2. Click nút **Generate new private key**
3. Một popup sẽ hiện ra cảnh báo về bảo mật
4. Click **Generate key** để xác nhận

## Bước 4: Lưu file JSON

1. File JSON sẽ được tải xuống tự động
2. File có tên dạng: `chatappfinal-620d3-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`
3. **Đổi tên file thành:** `firebase-service-account.json`
4. **Di chuyển file vào:** `E:\Folder_Code\App_Chat\App_Chat_API\backend\firebase-service-account.json`

## Bước 5: Kiểm tra file

File JSON phải có cấu trúc như sau:

```json
{
  "type": "service_account",
  "project_id": "chatappfinal-620d3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@chatappfinal-620d3.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Bước 6: Chạy server

```bash
cd E:\Folder_Code\App_Chat\App_Chat_API\backend
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
✅ Firebase Admin SDK initialized successfully
✅ Firebase initialized successfully
🚀 Server is running on port 3000
```

## ⚠️ BẢO MẬT QUAN TRỌNG

- **KHÔNG BAO GIỜ** commit file `firebase-service-account.json` lên Git
- **KHÔNG BAO GIỜ** chia sẻ file này công khai
- File này cho phép truy cập TOÀN BỘ Firebase project của bạn
- Nếu bị lộ, hãy xóa service account ngay và tạo cái mới

## Troubleshooting

### Không tìm thấy nút "Generate new private key"

- Đảm bảo bạn đang ở tab **Service accounts**
- Đảm bảo bạn có quyền Owner hoặc Editor của project

### File JSON bị lỗi format

- Mở file bằng text editor (Notepad++, VS Code)
- Kiểm tra có đúng format JSON không
- Đảm bảo không có ký tự lạ ở đầu/cuối file

### Server báo lỗi "Error initializing Firebase Admin SDK"

- Kiểm tra file có tồn tại tại đúng đường dẫn không
- Kiểm tra tên file phải là `firebase-service-account.json`
- Kiểm tra file `.env` có dòng: `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`

## Liên hệ

Nếu gặp vấn đề, hãy kiểm tra:
1. File có đúng vị trí không
2. File có đúng format JSON không
3. Có quyền truy cập Firebase project không
