# 📖 CodeSync — Project Documentation

> **Real-Time Collaborative Code Editor with AI Code Review**
> Last Updated: 28 Feb 2026

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Backend Details](#-backend-details)
- [Frontend Details](#-frontend-details)
- [Changes & Modifications Log](#-changes--modifications-log)
- [Environment Variables](#-environment-variables)
- [How to Run](#-how-to-run)

---

## 🚀 Project Overview

**CodeSync** is a full-stack MERN application that enables real-time collaborative code editing with AI-powered features. Multiple developers can write code together in the same room with live cursors, communicate via voice/video (WebRTC), get AI code reviews, execute code, and manage version history — all in real-time.

---

## 🛠️ Tech Stack

### Frontend

| Technology              | Version  | Purpose                                  |
|------------------------|----------|------------------------------------------|
| **React**              | ^18.2.0  | UI framework (SPA)                       |
| **Vite**               | ^5.1.0   | Build tool & dev server                  |
| **React Router DOM**   | ^6.22.0  | Client-side routing                      |
| **Axios**              | ^1.6.7   | HTTP client for API calls                |
| **Socket.io-client**   | ^4.7.4   | Real-time WebSocket communication        |
| **Monaco Editor**      | ^4.6.0   | VS Code-like code editor component       |
| **React Icons**        | ^5.0.1   | Icon library (Feather Icons)             |
| **React Hot Toast**    | ^2.4.1   | Toast notifications                      |
| **Vanilla CSS**        | —        | Custom styling (no Tailwind)             |
| **Canvas API**         | —        | Custom animations (AuthBackground, Hero) |

### Backend

| Technology               | Version  | Purpose                                  |
|-------------------------|----------|------------------------------------------|
| **Node.js + Express**   | ^4.18.2  | REST API server                          |
| **MongoDB + Mongoose**  | ^8.1.1   | NoSQL database & ODM                     |
| **Socket.io**           | ^4.7.4   | Real-time WebSocket server               |
| **JWT (jsonwebtoken)**  | ^9.0.2   | Authentication tokens                    |
| **bcryptjs**            | ^2.4.3   | Password hashing                         |
| **Google Generative AI**| ^0.21.0  | Gemini API for AI code review/chat       |
| **dotenv**              | ^16.4.5  | Environment variable management          |
| **cors**                | ^2.8.5   | Cross-Origin Resource Sharing            |
| **uuid**                | ^13.0.0  | Unique ID generation for rooms           |
| **Nodemon**             | ^3.0.3   | Auto-restart server on changes (dev)     |

### Dev / Root

| Technology       | Version | Purpose                          |
|-----------------|---------|----------------------------------|
| **concurrently** | ^8.2.2  | Run client + server simultaneously |

---

## 📁 Project Structure

```
CodeSync/
├── package.json                    # Root scripts (dev, install-all)
├── docs.md                         # This documentation
├── README.md                       # Project readme
│
├── server/                         # ───── BACKEND ─────
│   ├── server.js                   # Express + Socket.io server entry
│   ├── .env                        # Environment variables
│   ├── package.json                # Backend dependencies
│   │
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   │
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   │
│   ├── models/
│   │   ├── User.js                 # User schema (auth, password reset)
│   │   ├── Room.js                 # Room schema (collaborative rooms)
│   │   └── Version.js              # Version schema (code snapshots)
│   │
│   ├── routes/
│   │   ├── auth.js                 # Auth routes (register, login, forgot/reset password)
│   │   ├── rooms.js                # Room CRUD routes
│   │   ├── ai.js                   # AI review & chat routes (Gemini)
│   │   ├── execute.js              # Code execution route
│   │   └── versions.js             # Version history routes
│   │
│   └── socket/
│       └── socketHandler.js        # Socket.io events (join, code-change, cursors, WebRTC)
│
└── client/                         # ───── FRONTEND ─────
    ├── package.json                # Frontend dependencies
    ├── index.html                  # HTML entry point
    ├── vite.config.js              # Vite configuration
    │
    └── src/
        ├── main.jsx                # React entry (AuthProvider, Router, Toaster)
        ├── App.jsx                 # Route definitions
        ├── index.css               # All CSS styles (2000+ lines)
        │
        ├── context/
        │   ├── AuthContext.jsx      # Auth state management (login, register, logout)
        │   └── SocketContext.jsx    # Socket.io connection provider
        │
        ├── pages/
        │   ├── Home.jsx             # Landing page (hero, features, stats, CTA)
        │   ├── Login.jsx            # Login page with animated background
        │   ├── Signup.jsx           # Registration page with animated background
        │   ├── ForgotPassword.jsx   # Password reset page (2-step flow)
        │   ├── Dashboard.jsx        # Room management dashboard
        │   └── EditorRoom.jsx       # Main collaborative editor room
        │
        ├── components/
        │   ├── AuthBackground.jsx   # Canvas animation (3D balls + code tags → "CodeSync" text)
        │   ├── HeroIllustration.jsx # Canvas animation (4 devs with laptops)
        │   ├── CodeEditor.jsx       # Monaco Editor wrapper with live cursors
        │   ├── AIChatPanel.jsx      # AI chat sidebar (Gemini-powered)
        │   ├── AIReviewPanel.jsx    # AI code review panel
        │   ├── MediaManager.jsx     # Voice/Video call manager (WebRTC)
        │   ├── VideoBubble.jsx      # Floating video bubble for calls
        │   └── VersionHistory.jsx   # Code version history panel
        │
        └── utils/
            └── api.js               # Axios instance with JWT interceptor
```

---

## ✨ Features

### 🔐 Authentication
- **User Registration** — Username, email, password (bcrypt hashed, 12 salt rounds)
- **User Login** — JWT-based (7-day expiry)
- **Forgot Password** — 6-digit reset code, SHA-256 hashed, 1-hour expiry
- **Password Reset** — Verify code + set new password + auto-login
- **Auto-avatar** — Generated via `ui-avatars.com` from username

### 💻 Real-Time Code Editor
- **Monaco Editor** — VS Code-grade editor with syntax highlighting
- **8+ Languages** — JavaScript, Python, Java, C++, TypeScript, Go, Rust, PHP
- **Live Code Sync** — All users in a room see changes instantly via Socket.io
- **Live Cursors** — See other users' cursor positions with colored labels

### 🤖 AI Features (Gemini API)
- **AI Code Review** — Get intelligent feedback on your code
- **AI Chat** — Ask coding questions and get contextual answers
- **Powered by** Google Generative AI (Gemini)

### 📞 Voice & Video (WebRTC)
- **Peer-to-Peer** — Direct browser-to-browser connection
- **WebRTC Signaling** — Via Socket.io (call-user, answer-call, ice-candidate)
- **Floating Video Bubble** — Draggable video window during calls
- **Mic/Camera Controls** — Toggle on/off during calls

### 🏠 Room Management
- **Create Room** — Auto-generated unique room ID (UUID)
- **Join Room** — Enter room ID to join
- **Copy Room ID** — Share with collaborators
- **Delete Room** — Creator can delete their rooms

### 📜 Version History
- **Save Snapshots** — Save current code state with a label
- **View History** — Browse all saved versions
- **Restore** — Revert to any previous version

### ⚡ Code Execution
- **Run Code** — Execute code and see output in the editor
- **Multi-language** — Supports multiple programming languages

### 🎨 UI/UX
- **Dark Theme** — Consistent dark theme with purple/blue accents
- **Glassmorphism** — Modern glass-effect cards and panels
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Canvas Animations** — Custom animated backgrounds and illustrations
- **Micro-animations** — Hover effects, transitions, and loading states

---

## 🔧 Backend Details

### API Routes

| Method | Endpoint                    | Auth | Description                            |
|--------|-----------------------------|------|----------------------------------------|
| POST   | `/api/auth/register`        | ❌   | Register new user                      |
| POST   | `/api/auth/login`           | ❌   | Login & get JWT token                  |
| GET    | `/api/auth/me`              | ✅   | Get current user info                  |
| POST   | `/api/auth/forgot-password` | ❌   | Generate 6-digit reset code            |
| POST   | `/api/auth/reset-password`  | ❌   | Verify code & reset password           |
| POST   | `/api/rooms`                | ✅   | Create a new room                      |
| GET    | `/api/rooms`                | ✅   | Get user's rooms                       |
| GET    | `/api/rooms/:id`            | ✅   | Get room by ID                         |
| DELETE | `/api/rooms/:id`            | ✅   | Delete a room                          |
| POST   | `/api/ai/review`            | ✅   | AI code review (Gemini)                |
| POST   | `/api/ai/chat`              | ✅   | AI chat message (Gemini)               |
| POST   | `/api/execute`              | ✅   | Execute code                           |
| POST   | `/api/versions`             | ✅   | Save code version                      |
| GET    | `/api/versions/:roomId`     | ✅   | Get version history for room           |
| GET    | `/api/health`               | ❌   | Server health check                    |

### MongoDB Models

#### User Model (`models/User.js`)
| Field             | Type     | Details                                  |
|-------------------|----------|------------------------------------------|
| `username`        | String   | Required, unique, 3-30 chars             |
| `email`           | String   | Required, unique, lowercase              |
| `password`        | String   | Required, min 6 chars, bcrypt hashed, `select: false` |
| `avatar`          | String   | Auto-generated from username             |
| `resetToken`      | String   | SHA-256 hashed reset code (nullable)     |
| `resetTokenExpiry`| Date     | Token expiry time — 1 hour (nullable)    |
| `timestamps`      | Boolean  | Auto createdAt / updatedAt               |

#### Room Model (`models/Room.js`)
| Field       | Type     | Details                    |
|-------------|----------|----------------------------|
| `name`      | String   | Room name                  |
| `roomId`    | String   | Unique UUID                |
| `createdBy` | ObjectId | Ref to User                |
| `code`      | String   | Current code content       |
| `language`  | String   | Programming language       |
| `timestamps`| Boolean  | Auto createdAt / updatedAt |

#### Version Model (`models/Version.js`)
| Field     | Type     | Details              |
|-----------|----------|----------------------|
| `roomId`  | String   | Associated room      |
| `code`    | String   | Code snapshot        |
| `label`   | String   | Version label/name   |
| `savedBy` | ObjectId | Ref to User          |
| `timestamps`| Boolean| Auto createdAt / updatedAt |

### Socket.io Events

| Event            | Direction    | Data                              | Description                     |
|-----------------|--------------|-----------------------------------|---------------------------------|
| `join-room`     | Client → Server | roomId, username, avatar        | Join a collaboration room       |
| `room-info`     | Server → Client | users[]                         | Current room users list         |
| `user-joined`   | Server → Room   | socketId, username, avatar, users | New user joined notification  |
| `user-left`     | Server → Room   | socketId, username              | User left notification          |
| `code-change`   | Client → Server | roomId, code                    | Broadcast code change           |
| `code-update`   | Server → Room   | code                            | Receive code change             |
| `cursor-move`   | Client → Server | roomId, cursor                  | Send cursor position            |
| `cursor-update` | Server → Room   | socketId, username, cursor, color | Receive cursor position       |
| `send-message`  | Client → Server | roomId, message, username       | Send chat message               |
| `receive-message`| Server → Room  | username, message, timestamp    | Receive chat message            |
| `call-user`     | Client → Server | to, offer                       | WebRTC: Initiate call           |
| `call-made`     | Server → Client | offer, socketId                 | WebRTC: Incoming call           |
| `answer-call`   | Client → Server | to, answer                      | WebRTC: Accept call             |
| `answer-made`   | Server → Client | socketId, answer                | WebRTC: Call accepted           |
| `ice-candidate` | Bidirectional   | to, candidate                   | WebRTC: ICE candidate exchange  |

---

## 🎨 Frontend Details

### Pages

| Page                | Route              | Description                                              |
|---------------------|--------------------|----------------------------------------------------------|
| `Home.jsx`          | `/`                | Landing page — hero section, features, stats, CTA        |
| `Login.jsx`         | `/login`           | Login form with animated 3D ball background              |
| `Signup.jsx`        | `/signup`          | Registration form with animated background               |
| `ForgotPassword.jsx`| `/forgot-password` | 2-step password reset (email → code + new password)      |
| `Dashboard.jsx`     | `/dashboard`       | Room creation/management, join room, room list           |
| `EditorRoom.jsx`    | `/editor/:roomId`  | Full collaborative editor with all panels                |

### Components

| Component              | Description                                                         |
|------------------------|---------------------------------------------------------------------|
| `AuthBackground.jsx`   | Canvas animation: 3D red/white balls + code tags fall, form "CodeSync" text, explode, loop |
| `HeroIllustration.jsx` | Canvas animation: 4 developers at laptops with particles & connection lines |
| `CodeEditor.jsx`       | Monaco Editor wrapper with language selector and live cursor support |
| `AIChatPanel.jsx`      | AI chat sidebar powered by Gemini API                               |
| `AIReviewPanel.jsx`    | AI code review panel — analyzes code and gives feedback             |
| `MediaManager.jsx`     | WebRTC voice/video call manager with peer connections               |
| `VideoBubble.jsx`      | Floating draggable video bubble during calls                        |
| `VersionHistory.jsx`   | Sidebar showing saved code versions with restore option             |

### Context Providers

| Provider              | Purpose                                                     |
|-----------------------|-------------------------------------------------------------|
| `AuthContext.jsx`     | Global auth state — user, token, login, register, logout    |
| `SocketContext.jsx`   | Socket.io connection — auto-connects when user is authenticated |

### Routing

| Route              | Access      | Wrapper          |
|--------------------|-------------|------------------|
| `/`                | Public only | `PublicRoute`    |
| `/login`           | Public only | `PublicRoute`    |
| `/signup`          | Public only | `PublicRoute`    |
| `/forgot-password` | Public only | `PublicRoute`    |
| `/dashboard`       | Auth required | `ProtectedRoute` |
| `/editor/:roomId`  | Auth required | `ProtectedRoute` |
| `*`                | Any         | Redirects to `/` |

---

## 📝 Changes & Modifications Log

### ✅ Features Added

| Feature                        | Files Modified / Created                                    | Description                                                       |
|-------------------------------|-------------------------------------------------------------|-------------------------------------------------------------------|
| **Landing Page**              | `Home.jsx` (NEW), `index.css`                               | Premium landing page with hero, features, stats, footer CTA       |
| **Auth Background Animation** | `AuthBackground.jsx` (NEW), `index.css`                     | 3D bouncing red/white balls + falling code tags → form "CodeSync" text → explode → loop |
| **Hero Illustration**         | `HeroIllustration.jsx` (NEW), `index.css`                   | Canvas animation: 4 devs at laptops with particles & WiFi signals |
| **Login Page Animation**      | `Login.jsx`, `index.css`                                    | Integrated AuthBackground canvas behind login card                |
| **Signup Page Animation**     | `Signup.jsx`, `index.css`                                   | Integrated AuthBackground canvas behind signup card               |
| **Forgot Password**           | `ForgotPassword.jsx` (NEW), `Login.jsx`, `auth.js`, `User.js`, `App.jsx`, `index.css` | Full forgot/reset password flow with 6-digit code |
| **Responsive Design**         | `index.css`                                                 | Mobile/tablet/desktop breakpoints for all pages                   |
| **Header (Home)**             | `Home.jsx`                                                  | Logo + Sign In (ghost) + Get Started (glow) buttons               |

### 🔧 Backend Changes

| Change                          | File                | Details                                              |
|---------------------------------|---------------------|------------------------------------------------------|
| `resetToken` field added        | `models/User.js`    | SHA-256 hashed reset code, default null               |
| `resetTokenExpiry` field added  | `models/User.js`    | Date field, 1-hour expiry, default null               |
| `crypto` module imported        | `routes/auth.js`    | For hashing reset tokens                              |
| `POST /forgot-password` route   | `routes/auth.js`    | Generates 6-digit code, stores hash + expiry          |
| `POST /reset-password` route    | `routes/auth.js`    | Validates code, updates password, returns JWT token   |

### 🎨 CSS Changes

| Change                    | Section              | Details                                                     |
|--------------------------|----------------------|-------------------------------------------------------------|
| Auth page layout         | `.auth-page`         | Changed to `flex-end` alignment — card at bottom, animation above |
| Auth card compacted      | `.auth-card`         | Reduced padding (24px 30px), smaller logo/margins            |
| Auth background canvas   | `.auth-bg-canvas`    | Fixed positioning, full screen, z-index 0, pointer-events none |
| Hero illustration styles | `.hero-illustration` | Centered, glassmorphic border, responsive scaling            |
| Forgot password link     | `.forgot-password-link` | Small, right-aligned, purple on hover                     |
| Reset code display       | `.reset-code-display` | Glassmorphic card with large monospace code                 |
| Landing page sections    | `.landing-*`         | Hero, features grid, stats bar, footer CTA                  |

### 📦 New Files Created

| File                   | Type       | Purpose                                               |
|------------------------|------------|--------------------------------------------------------|
| `Home.jsx`             | Page       | Landing page                                           |
| `ForgotPassword.jsx`   | Page       | Password reset flow                                    |
| `AuthBackground.jsx`   | Component  | Canvas animation for auth pages                        |
| `HeroIllustration.jsx` | Component  | Canvas animation for landing page                      |

### ❌ Nothing Was Removed
All original functionality remains intact. Only additions and enhancements were made.

---

## 🔐 Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## ▶️ How to Run

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install-all
```

### 2. Setup Environment
```bash
# Create .env file in /server directory
cp server/.env.example server/.env
# Fill in your MongoDB URI, JWT secret, and Gemini API key
```

### 3. Run Development Server
```bash
# Run both client & server together (from root)
npm run dev

# Or run separately:
cd server && npm run dev     # Backend → http://localhost:5000
cd client && npm run dev     # Frontend → http://localhost:5173
```

### 4. Build for Production
```bash
cd client && npm run build
```

---

## 🎯 Key Design Decisions

| Decision                         | Reasoning                                                    |
|----------------------------------|--------------------------------------------------------------|
| **Vanilla CSS** over Tailwind    | Maximum flexibility, custom animations, no framework lock-in |
| **Canvas API** for animations    | Smooth 60fps physics-based animations without DOM overhead   |
| **JWT** over session-based auth  | Stateless, works with SPA, no server-side session storage    |
| **SHA-256** for reset tokens     | Never store plaintext tokens in DB, compare hashes           |
| **Monaco Editor**                | Same engine as VS Code — superior DX and syntax highlighting |
| **Socket.io** over raw WS       | Auto-reconnect, rooms, namespaces, fallback polling          |
| **WebRTC** for calls             | Peer-to-peer — no media server needed, low latency           |
| **bcrypt (12 rounds)**           | Industry standard password hashing, resistant to brute force |
| **Glassmorphism** design         | Modern, premium look that fits the developer aesthetic       |

---

> **Built with ❤️ by Nitesh Kumar**
