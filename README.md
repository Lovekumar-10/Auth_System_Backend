# 🔐 Scalable Authentication System – Backend

A production-level authentication system built with Node.js and Express, designed to handle secure, scalable, and multi-device user authentication.

This backend implements a complete authentication flow including access/refresh tokens, session management, role-based authorization, email verification, and security best practices.

---

## 🚀 Core Features

* User Registration & Login
* JWT Authentication (Access Token + Refresh Token)
* Refresh Token Rotation (secure session handling)
* Multi-Device Session Management
* Logout (Single Device)
* Logout from All Devices
* Role-Based Authorization (RBAC)
* Email Verification System
* Password Reset (Forgot / Reset Flow)
* Secure Password Hashing (bcrypt)
* Rate Limiting (API protection)
* Protected Routes with Middleware
* Cookie-based Authentication Support

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JSON Web Tokens (JWT)
* bcrypt
* Cookie Parser
* Express Rate Limit
* Nodemailer (Email Service)

---

## 📂 Project Structure

```
backend/
├── controllers/
├── routes/
├── models/
├── middleware/
├── utils/
├── config/
└── server.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:5173
```

---

## ▶️ Running the Server

Install dependencies:

```
npm install
```

Run the server:

```
npm run dev
```

Server will start on:

```
http://localhost:5000
```

---

## 🔐 Authentication Flow

1. User registers → email verification required
2. User logs in → receives access token + refresh token
3. Access token used for protected API requests
4. Refresh token used to generate new access tokens
5. Each login creates a session (multi-device support)
6. Logout removes current session
7. Logout all removes all active sessions

---

## 🛡️ Security Highlights

* Passwords hashed using bcrypt
* HTTP-only cookies support for tokens
* Refresh token rotation to prevent reuse attacks
* Rate limiting to prevent brute-force attacks
* Role-based middleware for access control
* Secure email-based verification & password reset

---

## 📡 API Overview

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `POST /api/auth/logout-all`
* `POST /api/auth/refresh-token`

### User & Security

* `GET /api/user/me`
* `POST /api/auth/verify-email`
* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password`

---

## 👨‍💻 Author

Love Kumar

---
