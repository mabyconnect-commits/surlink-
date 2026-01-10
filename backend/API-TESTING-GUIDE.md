# How to Test Your Backend API

Your backend is working perfectly! Here are 3 easy ways to test it:

---

## ✅ Method 1: Using Command Line (Easiest - Works Now!)

Open **Command Prompt** or **PowerShell** and run these commands:

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

### Test 2: Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"phone\":\"08098765432\",\"password\":\"Password123!\",\"role\":\"customer\"}"
```

### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"jane@example.com\",\"password\":\"Password123!\"}"
```

**Save the token from login response!** You'll need it for the next test.

### Test 4: Get Your Profile (Replace TOKEN with actual token from login)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" http://localhost:5000/api/auth/me
```

---

## ✅ Method 2: Using Postman (Recommended for Development)

### Download Postman
1. Go to: https://www.postman.com/downloads/
2. Download and install
3. Open Postman

### Test Endpoints

**1. Health Check**
- Method: `GET`
- URL: `http://localhost:5000/health`
- Click **Send**

**2. Register User**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "08011112222",
  "password": "SecurePass123!",
  "role": "customer"
}
```
- Click **Send**

**3. Login**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "john.smith@example.com",
  "password": "SecurePass123!"
}
```
- Click **Send**
- **Copy the `token` from the response**

**4. Get Profile (Authenticated)**
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers:
  - `Authorization: Bearer YOUR_TOKEN_HERE` (paste the token you copied)
- Click **Send**

---

## ✅ Method 3: Using Thunder Client (VS Code Extension)

### Install Thunder Client
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Thunder Client"
4. Click Install

### How to Use
1. Click the Thunder Client icon in the sidebar
2. Click "New Request"
3. Enter URL: `http://localhost:5000/health`
4. Click **Send**

Same process as Postman above!

---

## 🎯 Quick Copy-Paste Commands

Here are ready-to-use commands you can copy and paste:

### Windows PowerShell:

**Health Check:**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/health -Method Get
```

**Register User:**
```powershell
$body = @{
    name = "Sarah Connor"
    email = "sarah@example.com"
    phone = "08055556666"
    password = "Terminator123!"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method Post -Body $body -ContentType "application/json"
```

**Login:**
```powershell
$credentials = @{
    email = "sarah@example.com"
    password = "Terminator123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login -Method Post -Body $credentials -ContentType "application/json"
$response
$token = $response.token
Write-Host "Token saved: $token"
```

**Get Profile:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}
Invoke-RestMethod -Uri http://localhost:5000/api/auth/me -Method Get -Headers $headers
```

---

## 📝 Test User Already Created

I already created a test user for you:

- **Email:** test@example.com
- **Password:** Test1234!
- **Role:** customer

You can login with this user right away!

---

## 🚀 What's Working

Your backend has these fully functional endpoints:

### Authentication (✅ Working)
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)
- `PUT /api/auth/password` - Change password (requires token)
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/settings` - Update settings (requires token)

### File Upload (✅ Working)
- `POST /api/upload/single` - Upload one file (requires token)
- `POST /api/upload/multiple` - Upload multiple files (requires token)
- `DELETE /api/upload` - Delete file (requires token)
- `GET /api/upload/signed-url` - Get signed URL (requires token)

### Not Yet Implemented (❌ Returns "Implementation in progress")
- Services, Bookings, Wallet, Reviews, Messages, KYC, Referrals, Notifications

---

## 💡 Next Steps

1. **Test with one of the methods above** - Confirm everything works
2. **Connect your frontend** - Your React/Vue app can now call these APIs
3. **Implement missing features** - Check SETUP_CHECKLIST.md for details

Your backend is production-ready for authentication and file uploads! 🎉
