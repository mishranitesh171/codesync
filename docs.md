# ⚡ CodeSync — Real-Time Collaborative Code Editor with AI Code Review

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Socket.io Events](#socketio-events)
- [How to Run](#how-to-run)
- [Environment Variables](#environment-variables)
- [Interview Q&A](#interview-qa)
- [Upcoming Features / Roadmap](#upcoming-features--roadmap)
- [System Design Decisions](#system-design-decisions)
- [Scalability Considerations](#scalability-considerations)
- [Security Measures](#security-measures)

---

## 📌 Project Overview

**CodeSync** is a full-stack real-time collaborative code editor built with the MERN stack. It allows multiple developers to write, edit, and review code together in real-time — similar to Google Docs but for code. It includes an AI-powered code review system using Google Gemini, sandboxed code execution, version history, and multi-cursor awareness.

### Problem Statement
Developers often need to collaborate on code — during pair programming, interviews, teaching, or team debugging. Existing solutions are either expensive (VS Code Live Share requires VS Code), limited (CodePen doesn't support real-time collab), or overly complex (self-hosted Gitpod). CodeSync provides a lightweight, browser-based alternative with AI assistance.

### Target Users
- Development teams doing pair programming
- Technical interviewers conducting live coding rounds
- Coding bootcamp instructors teaching students
- Remote developers collaborating on snippets

---

## 🏗️ Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                       │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Auth     │  │  Dashboard   │  │   Editor Room       │    │
│  │  Pages    │  │  (Rooms)     │  │  ┌──────────────┐  │    │
│  └──────────┘  └──────────────┘  │  │ Monaco Editor │  │    │
│                                   │  └──────────────┘  │    │
│                                   │  ┌──────┐┌───────┐ │    │
│                                   │  │Output││AI Rev.│ │    │
│                                   │  └──────┘└───────┘ │    │
│                                   └────────────────────┘    │
└───────────────────┬─────────────────┬───────────────────────┘
                    │ REST API        │ WebSocket
                    │ (HTTP)          │ (Socket.io)
┌───────────────────▼─────────────────▼───────────────────────┐
│                    SERVER (Node.js + Express)                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (Express Router)               │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌──────────┐  │   │
│  │  │ Auth │ │Rooms │ │  AI  │ │Execute│ │ Versions │  │   │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └───┬───┘ └──┬───────┘  │   │
│  └─────┼────────┼────────┼─────────┼────────┼──────────┘   │
│        │        │        │         │        │              │
│  ┌─────▼────────▼────────┼─────────┼────────▼──────────┐   │
│  │         MongoDB        │         │                    │   │
│  │  ┌──────┐ ┌──────┐   │    ┌────▼─────┐ ┌─────────┐ │   │
│  │  │Users │ │Rooms │   │    │Child Proc│ │Versions │ │   │
│  │  └──────┘ └──────┘   │    │(Sandbox) │ └─────────┘ │   │
│  └───────────────────────┘    └──────────┘             │   │
│                          │                              │   │
│  ┌───────────────────────▼──────────────────────────┐   │   │
│  │           Socket.io Server                        │   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │   │
│  │  │join-room │ │code-chng │ │cursor-move       │  │   │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │   │   │
│  └──────────────────────────────────────────────────┘   │   │
│                          │                              │   │
│  ┌───────────────────────▼──────────────┐               │   │
│  │        Google Gemini API (Free)       │               │   │
│  │  AI Code Review & Analysis            │               │   │
│  └───────────────────────────────────────┘               │   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow**: Client → REST API → JWT Token → LocalStorage → All subsequent requests
2. **Room Creation Flow**: Client → POST /api/rooms → MongoDB → Redirect to editor
3. **Real-Time Editing Flow**: Client types → Socket.io emit → Server broadcast → All other clients update
4. **AI Review Flow**: Client → POST /api/ai/review → Gemini API → Structured JSON response → UI
5. **Code Execution Flow**: Client → POST /api/execute → Temp file → Child process → stdout/stderr → UI

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Why This? |
|---|---|---|
| **React 18** | UI Framework | Component-based, virtual DOM, huge ecosystem |
| **Vite** | Build Tool | 10x faster than CRA, HMR, ES modules |
| **Monaco Editor** | Code Editor | Same engine as VS Code, syntax highlighting, autocomplete |
| **Socket.io-client** | WebSocket Client | Reliable real-time bidirectional communication |
| **React Router v6** | Client Routing | Nested routes, protected routes, lazy loading |
| **Axios** | HTTP Client | Interceptors, automatic JSON, error handling |
| **React Hot Toast** | Notifications | Lightweight, beautiful, accessible |
| **React Icons** | Icon Library | Feather icons for consistent UI |

### Backend
| Technology | Purpose | Why This? |
|---|---|---|
| **Node.js** | Runtime | Non-blocking I/O, perfect for real-time apps |
| **Express.js** | HTTP Framework | Minimal, flexible, middleware-based |
| **Socket.io** | WebSocket Server | Room management, auto-reconnection, fallback to polling |
| **MongoDB + Mongoose** | Database | Document-based (perfect for flexible code storage), ODM |
| **JWT (jsonwebtoken)** | Authentication | Stateless auth, no session storage needed |
| **bcryptjs** | Password Hashing | Salt-based hashing, timing-attack resistant |
| **Google Generative AI** | AI Code Review | Free tier, powerful model (Gemini 1.5 Flash) |

### DevOps / Tools
| Technology | Purpose |
|---|---|
| **Concurrently** | Run client + server simultaneously |
| **Nodemon** | Auto-restart server on changes |
| **dotenv** | Environment variable management |
| **Git** | Version control |

---

## ✨ Features

### 1. 🔐 Authentication System
- **JWT-based auth** with 7-day token expiry
- Password hashing with bcrypt (12 salt rounds)
- Auto-generated user avatars (ui-avatars.com)
- Protected routes with automatic redirect
- Token auto-refresh on 401 errors

### 2. 🏠 Dashboard & Room Management
- Create collaborative coding rooms with custom names
- Choose programming language per room
- Join rooms via shareable Room ID
- View all your rooms with participant count
- Room owner can delete rooms (soft delete)
- Copy Room ID with one click

### 3. ✍️ Monaco Code Editor
- VS Code's actual editor engine in the browser
- Syntax highlighting for 8+ languages
- IntelliSense / Autocomplete
- Bracket pair colorization
- Custom dark theme matching app design
- Minimap, smooth scrolling, ligature support

### 4. ⚡ Real-Time Collaboration (Socket.io)
- Instant code synchronization across all connected users
- Changes appear in <50ms for all participants
- Room-based isolation (changes only affect your room)
- Auto-save code to database on every change
- Graceful handling of disconnections and reconnections

### 5. 👥 Multi-Cursor Awareness
- See other users' cursor positions in real-time
- Each user gets a unique color
- Cursor labels show username above the cursor
- Hover tooltip shows who is editing where
- Cursors automatically remove when user disconnects

### 6. 🤖 AI Code Review (Google Gemini)
- One-click AI analysis of your code
- Structured review with:
  - **Overall Score** (1-10)
  - **Issues** with severity (Error/Warning/Info)
  - **Line-specific feedback**
  - **Fix suggestions** for each issue
  - **Code Quality metrics**: Readability, Performance, Best Practices, Security
- Works without API key (provides demo review)
- Free tier: No credit card required

### 7. ▶️ Code Execution
- Run JavaScript and Python code directly in browser
- 10-second timeout protection
- Output size limit (50KB) to prevent abuse
- Sandboxed child process execution
- Shows stdout + stderr separately
- Collapsible output panel

### 8. 📜 Version History
- Save named snapshots of your code
- View all versions sorted by newest first
- One-click restore to any previous version
- Shows who saved each version + timestamp
- Version gets synced to all users on load

---

## 📁 Folder Structure

```
Real-Time Collaborative Code Editor with AI Code/
├── 📄 package.json              # Root — concurrently scripts
├── 📄 docs.md                   # This documentation file
├── 📄 .gitignore
│
├── 📂 server/                   # Backend
│   ├── 📄 package.json
│   ├── 📄 server.js             # Main entry — Express + Socket.io
│   ├── 📄 .env                  # Environment variables
│   │
│   ├── 📂 config/
│   │   └── 📄 db.js             # MongoDB connection
│   │
│   ├── 📂 middleware/
│   │   └── 📄 auth.js           # JWT verification middleware
│   │
│   ├── 📂 models/
│   │   ├── 📄 User.js           # User schema + password hashing
│   │   ├── 📄 Room.js           # Room schema + participants
│   │   └── 📄 Version.js        # Version history schema
│   │
│   ├── 📂 routes/
│   │   ├── 📄 auth.js           # Register, Login, Get Me
│   │   ├── 📄 rooms.js          # CRUD rooms
│   │   ├── 📄 ai.js             # AI code review (Gemini)
│   │   ├── 📄 execute.js        # Code execution sandbox
│   │   └── 📄 versions.js       # Save/load versions
│   │
│   └── 📂 socket/
│       └── 📄 socketHandler.js  # Real-time events handler
│
└── 📂 client/                   # Frontend
    ├── 📄 package.json
    ├── 📄 vite.config.js         # Vite + proxy config
    ├── 📄 index.html             # HTML entry + fonts
    │
    └── 📂 src/
        ├── 📄 main.jsx           # React entry + providers
        ├── 📄 App.jsx            # Router + protected routes
        ├── 📄 index.css          # Design system + all styles
        │
        ├── 📂 context/
        │   ├── 📄 AuthContext.jsx    # Auth state management
        │   └── 📄 SocketContext.jsx  # Socket.io connection
        │
        ├── 📂 utils/
        │   └── 📄 api.js            # Axios instance + interceptors
        │
        ├── 📂 pages/
        │   ├── 📄 Login.jsx         # Login page
        │   ├── 📄 Signup.jsx        # Register page
        │   ├── 📄 Dashboard.jsx     # Room listing + create/join
        │   └── 📄 EditorRoom.jsx    # Main editor page (core)
        │
        └── 📂 components/
            ├── 📄 CodeEditor.jsx       # Monaco Editor wrapper
            ├── 📄 AIReviewPanel.jsx    # AI review sidebar
            └── 📄 VersionHistory.jsx   # Version history sidebar
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, 3-30 chars),
  email: String (unique, lowercase),
  password: String (bcrypt hashed, select: false),
  avatar: String (auto-generated URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Rooms Collection
```javascript
{
  _id: ObjectId,
  roomId: String (unique, 8-char UUID),
  name: String (required),
  language: String (enum: js/py/ts/java/cpp/html/css/json),
  code: String (current code content),
  owner: ObjectId → Users,
  participants: [ObjectId → Users],
  isActive: Boolean (soft delete flag),
  createdAt: Date,
  updatedAt: Date
}
```

### Versions Collection
```javascript
{
  _id: ObjectId,
  roomId: String (indexed),
  code: String,
  language: String,
  label: String ("Version 1", "Version 2"...),
  savedBy: ObjectId → Users,
  createdAt: Date (compound index with roomId)
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & get JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |

### Rooms
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/rooms` | Create a new room | ✅ |
| `GET` | `/api/rooms` | Get all user's rooms | ✅ |
| `GET` | `/api/rooms/:roomId` | Get specific room + auto-join | ✅ |
| `DELETE` | `/api/rooms/:roomId` | Soft delete room (owner only) | ✅ |

### AI Code Review
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/ai/review` | AI-analyze code via Gemini | ✅ |

### Code Execution
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/execute` | Execute code in sandbox | ✅ |

### Version History
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/versions/:roomId` | Save code snapshot | ✅ |
| `GET` | `/api/versions/:roomId` | List all versions for room | ✅ |
| `GET` | `/api/versions/:roomId/:id` | Get specific version | ✅ |

### Health Check
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Server health status | ❌ |

---

## 📡 Socket.io Events

### Client → Server (Emit)
| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId, user }` | User joins a coding room |
| `code-change` | `{ roomId, code }` | User edited code |
| `cursor-move` | `{ roomId, cursor }` | User cursor position changed |
| `language-change` | `{ roomId, language }` | Language selector changed |
| `chat-message` | `{ roomId, message, user }` | Chat message sent |

### Server → Client (Broadcast)
| Event | Payload | Description |
|---|---|---|
| `room-state` | `{ code, language, users }` | Initial state when joining |
| `user-joined` | `{ user, users }` | New user joined the room |
| `user-left` | `{ socketId, username, users }` | User disconnected |
| `code-update` | `{ code }` | Code changed by another user |
| `cursor-update` | `{ socketId, username, cursor, color }` | Cursor moved by other user |
| `language-update` | `{ language }` | Language changed by other user |
| `chat-message` | `{ id, message, user, timestamp }` | Chat message received |

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally on port 27017
- **Git** installed

### Step 1: Clone & Install
```bash
cd "Real-Time Collaborative Code Editor with AI Code"

# Install all dependencies (root + server + client)
npm run install-all
```

### Step 2: Configure Environment
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/collab-code-editor
JWT_SECRET=collab_editor_super_secret_key_2026
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

**To get a free Gemini API key:**
1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy and paste it into `.env`

> The app works without the API key too — it provides a demo review.

### Step 3: Start Development
```bash
# Starts both server (:5000) and client (:5173)
npm run dev
```

### Step 4: Open in Browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|---|---|---|---|
| `PORT` | Server port | No | `5000` |
| `MONGO_URI` | MongoDB connection string | Yes | — |
| `JWT_SECRET` | Secret key for JWT signing | Yes | — |
| `GEMINI_API_KEY` | Google Gemini API key | No | Demo mode |

---

## 💼 Interview Q&A

### Architecture Questions

**Q: Why did you choose Socket.io over raw WebSockets?**
> Socket.io provides automatic reconnection, room management (joining/leaving rooms), fallback to HTTP long-polling when WebSocket isn't available, and built-in event-based communication. Raw WebSockets don't have room management, and you'd need to implement reconnection logic manually.

**Q: How does real-time sync work without conflicts when two users type simultaneously?**
> Currently, we use a "last write wins" approach where the latest code state is broadcast to all clients. Each keystroke emits a `code-change` event, and other clients replace their editor content. We use an `isRemoteUpdate` ref flag to prevent infinite loops — when receiving a remote update, we skip emitting a new change event. For production, I would implement Operational Transforms (OT) or CRDTs (Conflict-free Replicated Data Types) for proper conflict resolution, similar to what Google Docs uses.

**Q: Why MongoDB over PostgreSQL for this project?**
> MongoDB's document model is ideal here because: (1) Code content is unstructured text that fits naturally in documents, (2) Room schemas can evolve flexibly (adding features without migrations), (3) embedded arrays for participants avoid joins, and (4) Mongoose ODM provides excellent schema validation. PostgreSQL would be better if we needed complex relational queries or ACID transactions across tables.

**Q: How do you handle the case where a user disconnects and reconnects?**
> Socket.io has built-in reconnection with configurable attempts (we set 10 attempts with 1s delay). On reconnect, the client emits `join-room` again, which triggers the server to send the current `room-state` (latest code, language, connected users). The client then hydrates its state with the fresh data. We also clean up disconnected users from the in-memory `activeRooms` Map.

**Q: What's the in-memory store for, and what happens when the server restarts?**
> The `activeRooms` Map stores active user sessions and cursor positions — data that's ephemeral and doesn't need persistence. On server restart, all Socket.io connections drop and clients reconnect. The code itself is persisted in MongoDB, so no code is lost. The only thing lost is cursor positions, which get re-established on reconnection.

### Security Questions

**Q: How is code execution sandboxed?**
> We use Node.js `child_process.spawn()` with: (1) a 10-second timeout to prevent infinite loops, (2) 50KB output limit to prevent memory exhaustion, (3) code runs in a temp file in `os.tmpdir()` (not in the project directory), (4) a separate process with limited environment variables. For production, I would use Docker containers with ulimits for CPU/memory/network isolation.

**Q: How do you prevent JWT token theft?**
> JWTs are stored in localStorage (not cookies to avoid CSRF). We use 7-day expiry so stolen tokens have limited lifespan. The auth middleware validates tokens on every protected request. For production, I would add: HttpOnly secure cookies, refresh token rotation, IP-based token invalidation, and rate limiting.

**Q: What happens if someone sends malicious code through the AI review?**
> The AI review only sends code to Google Gemini API — it never executes the code. Gemini processes it as text and returns analysis. Even the code execution endpoint is protected by auth, timeout, and output limits. The prompt to Gemini is structured to only return JSON analysis, not execute commands.

### Performance Questions

**Q: How would you scale this for 10,000 concurrent users?**
> I would: (1) Use Redis as a Socket.io adapter for multi-server pub/sub, (2) Implement horizontal scaling with load balancer (sticky sessions for WebSocket), (3) Use Redis for caching room state instead of in-memory Maps, (4) Add connection pooling for MongoDB, (5) Implement code change debouncing (batch updates every 300ms instead of every keystroke), (6) Use CDN for static assets.

**Q: Why do you debounce/throttle code changes?**
> Currently, every keystroke sends a Socket.io event — fine for small teams. For scale, I would debounce code changes to batch multiple keystrokes into a single event (e.g., every 200-300ms). This reduces server load from ~300 events/minute/user to ~30 events/minute/user. The tradeoff is slightly higher latency, which is acceptable for collaborative editing.

**Q: What's the bottleneck in this architecture?**
> The main bottleneck is the single-server Socket.io in-memory store. Every room's state lives in one Node.js process. With multiple servers, separate instances don't share room state. The solution is Redis adapter for Socket.io, which enables pub/sub across server instances. Secondary bottleneck is MongoDB writes on every keystroke — this could be optimized with batch writes or a write-behind cache.

### Frontend Questions

**Q: Why Monaco Editor instead of CodeMirror or Ace?**
> Monaco is the actual engine powering VS Code — it provides the best IntelliSense, syntax highlighting, and developer experience. CodeMirror 6 is lighter but has less built-in language support. Ace is older and less maintained. Monaco's tradeoff is bundle size (~2MB), but for a code editor, the features justify it.

**Q: How do you handle remote cursor decorations?**
> Monaco Editor has a `deltaDecorations` API that allows overlaying visual markers on code. For each remote user, we create a decoration with: (1) a colored left border at their cursor position, (2) a CSS `::after` pseudo-element showing their username label above the cursor, (3) a semi-transparent line highlight. We dynamically inject CSS styles using a `<style>` tag with per-user colors.

**Q: How does the Auth flow work?**
> We use React Context (`AuthContext`) to manage auth state globally. On app load, if a JWT exists in localStorage, we call `GET /api/auth/me` to validate it and load user data. React Router's `ProtectedRoute` component checks `isAuthenticated` — if false, redirects to `/login`. The Axios interceptor automatically attaches the Bearer token to all API requests and redirects to login on 401 responses.

---

## 🔮 Upcoming Features / Roadmap

### Phase 2 — Enhanced Collaboration
- [ ] **Live Chat** — In-room messaging with typing indicators (Socket.io events already implemented on server)
- [ ] **Screen Sharing** — WebRTC-based screen share for pair programming
- [ ] **File System** — Multi-file support with a file tree sidebar
- [ ] **Terminal Sharing** — Shared terminal output visible to all users

### Phase 3 — AI Enhancements
- [ ] **AI Auto-Complete** — Inline code suggestions as you type (like GitHub Copilot)
- [ ] **AI Explain Code** — Select code → "Explain this" → AI breakdown
- [ ] **AI Fix Suggestions** — One-click auto-fix for detected issues
- [ ] **AI Chat Assistant** — Chat with AI about your code context

### Phase 4 — Production Hardening
- [ ] **Docker Containerization** — Dockerized server + client + MongoDB
- [ ] **CRDT/OT Implementation** — Conflict-free real-time editing (Yjs or Automerge)
- [ ] **Rate Limiting** — express-rate-limit for API protection
- [ ] **OAuth 2.0** — Google/GitHub login
- [ ] **Redis Integration** — Caching + Socket.io adapter for horizontal scaling

### Phase 5 — Enterprise Features
- [ ] **Team Workspaces** — Multi-tenant organization support
- [ ] **RBAC** — Admin/Editor/Viewer role-based access
- [ ] **Audit Logs** — Track who edited what and when
- [ ] **Code Templates** — Pre-built starter templates per language
- [ ] **Export/Import** — Download code as files, import from GitHub Gist

---

## 🎯 System Design Decisions

### 1. Why In-Memory Room State + MongoDB Persistence?
We maintain room state (connected users, cursor positions) in an in-memory Map for speed (<1ms read/write). Cursor updates happen 10-30 times/second — writing each to MongoDB would be too slow. Code changes ARE persisted to MongoDB on each change because code is the valuable asset; cursor positions are ephemeral.

### 2. Why REST API + Socket.io (Hybrid)?
- **REST** for CRUD operations (auth, rooms, versions, AI review, code execution) — these are request-response patterns that fit HTTP perfectly.
- **Socket.io** for real-time sync (code changes, cursor moves, user presence) — these require persistent bidirectional connections.
- This separation keeps the codebase clean and makes each concern independently scalable.

### 3. Why JWT Instead of Session-Based Auth?
JWT enables stateless authentication — the server doesn't need to store session data. This is crucial for: (1) easy horizontal scaling (any server can validate any token), (2) Socket.io connections don't need session lookup, (3) simpler CORS handling.

### 4. Why Gemini Flash Instead of GPT-4?
- **Free tier**: Gemini offers generous free API usage; GPT-4 charges per token
- **Speed**: Gemini Flash is optimized for fast responses (ideal for real-time reviews)
- **Structured Output**: Gemini handles JSON output format reliably
- **No Credit Card**: Google AI Studio requires no payment method

---

## 📈 Scalability Considerations

| Component | Current (MVP) | Scaled (Production) |
|---|---|---|
| **WebSocket State** | In-memory Map (single server) | Redis Pub/Sub + Socket.io Adapter |
| **Database** | Local MongoDB | MongoDB Atlas (replica set, sharding) |
| **Code Execution** | Child process (same server) | Docker containers (isolated, auto-scaling) |
| **AI Review** | Direct Gemini API call | Queue-based (Bull/RabbitMQ) with caching |
| **File Storage** | In database | AWS S3 / Cloudinary |
| **Auth** | JWT in localStorage | HttpOnly cookies + refresh tokens |
| **Load Balancing** | Single server | Nginx/HAProxy with sticky sessions |
| **Monitoring** | Console logs | ELK Stack / Datadog / PM2 |

---

## 🔒 Security Measures

1. **Password Security**: bcrypt with 12 salt rounds (industry standard)
2. **JWT Tokens**: 7-day expiry, secret key in environment variables
3. **Input Validation**: Mongoose schema validation on all inputs
4. **CORS**: Restricted to specific origins (localhost:5173, localhost:3000)
5. **Code Execution Sandbox**: Child process with timeout (10s), output limit (50KB)
6. **Error Handling**: Generic error messages to client (detailed logs on server)
7. **MongoDB Injection**: Mongoose parameterized queries prevent NoSQL injection
8. **XSS Prevention**: React's built-in JSX escaping prevents script injection
9. **Rate Limiting**: (Planned) express-rate-limit for API endpoints

---

## 📊 Performance Metrics (Expected)

| Metric | Value |
|---|---|
| Socket.io latency (local) | < 5ms |
| Code sync delay | < 50ms (LAN) |
| AI Review response | 2-5 seconds |
| Code execution | < 10 seconds (with timeout) |
| Page load (with editor) | ~ 2-3 seconds |
| MongoDB query time | < 10ms (indexed) |
| Concurrent users per room | 10-20 (single server) |

---

*Built with ❤️ using the MERN Stack — MongoDB, Express, React, Node.js*
*AI Powered by Google Gemini*
