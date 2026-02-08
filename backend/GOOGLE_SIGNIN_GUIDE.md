# Google Sign-In Backend Implementation

## ✅ Đã hoàn thành

Backend đã được cấu hình để hỗ trợ Google Sign-In với Firebase Authentication.

## 🔑 Cấu hình

### 1. Environment Variables

File `.env` đã được cập nhật với Google Client ID:

```env
GOOGLE_CLIENT_ID=763946919916-foqkc27a63a20mid7uvn51gcp0g8gg6d.apps.googleusercontent.com
```

### 2. API Endpoint

**POST** `/api/auth/google`

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU0M..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Google sign-in successful",
  "data": {
    "user": {
      "uid": "google-user-id",
      "name": "John Doe",
      "email": "john@gmail.com",
      "photoUrl": "https://lh3.googleusercontent.com/...",
      "role": "user",
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "authProvider": "google"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid Google token",
  "error": "AuthenticationError"
}
```

## 🔄 Flow hoạt động

1. **Client (Flutter)** thực hiện Google Sign-In và nhận được `idToken`
2. **Client** gửi `idToken` đến backend endpoint `/api/auth/google`
3. **Backend** verify token với Firebase Admin SDK
4. **Backend** kiểm tra user đã tồn tại chưa:
   - Nếu chưa: Tạo user mới trong Firestore
   - Nếu rồi: Cập nhật thông tin (online status, lastSeen, photoUrl)
5. **Backend** tạo JWT tokens (accessToken + refreshToken)
6. **Backend** trả về user info và tokens cho client

## 📝 Cách sử dụng từ Flutter

### 1. Cài đặt package

```yaml
dependencies:
  google_sign_in: ^6.3.0
  http: ^1.1.0
```

### 2. Implement Google Sign-In

```dart
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  Future<Map<String, dynamic>> signInWithGoogle() async {
    try {
      // 1. Trigger Google Sign-In
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        throw Exception('Google sign-in cancelled');
      }

      // 2. Get authentication details
      final GoogleSignInAuthentication googleAuth = 
          await googleUser.authentication;

      // 3. Get ID Token
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        throw Exception('Failed to get ID token');
      }

      // 4. Send to backend
      final response = await http.post(
        Uri.parse('http://YOUR_BACKEND_IP:3000/api/auth/google'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'idToken': idToken}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // 5. Save tokens
        final accessToken = data['data']['accessToken'];
        final refreshToken = data['data']['refreshToken'];
        final user = data['data']['user'];

        // Save to local storage (SharedPreferences, SecureStorage, etc.)
        
        return data['data'];
      } else {
        throw Exception('Backend authentication failed');
      }
    } catch (e) {
      print('Google Sign-In Error: $e');
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _googleSignIn.signOut();
  }
}
```

### 3. Sử dụng trong UI

```dart
ElevatedButton(
  onPressed: () async {
    try {
      final result = await AuthService().signInWithGoogle();
      print('Logged in: ${result['user']['name']}');
      
      // Navigate to home screen
      Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    }
  },
  child: Text('Sign in with Google'),
)
```

## 🔒 Bảo mật

- Backend verify ID token với Firebase Admin SDK
- Không cần gửi password
- JWT tokens được tạo sau khi verify thành công
- Access token có thời gian hết hạn (7 days)
- Refresh token để gia hạn (30 days)

## 🧪 Test API với Postman/cURL

```bash
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN_HERE"
  }'
```

## ⚠️ Lưu ý

1. **Firebase Configuration**: Đảm bảo `firebase-service-account.json` đã được cấu hình đúng
2. **Google Client ID**: Phải match với Client ID trong Google Cloud Console
3. **SHA-1 Fingerprint**: Phải thêm SHA-1 của debug/release keystore vào Firebase Console
4. **Package Name**: Phải match với `applicationId` trong `build.gradle.kts`

## 📚 Tài liệu tham khảo

- [Firebase Admin SDK - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Google Sign-In for Flutter](https://pub.dev/packages/google_sign_in)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## 🐛 Troubleshooting

### Lỗi: "Invalid Google token"
- Kiểm tra idToken có đúng không
- Kiểm tra Firebase service account đã được cấu hình chưa

### Lỗi: "Email not found in Google account"
- User phải cấp quyền email cho app

### Lỗi: "Google token has expired"
- ID token có thời gian hết hạn ngắn (1 giờ)
- Client cần lấy token mới và gửi lại
