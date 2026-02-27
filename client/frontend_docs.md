# 💻 CodeSync Frontend Documentation

Hello! Is document mein hum CodeSync frontend (client) ke har file aur folder ko detail mein samjhenge. Hum dekhenge ki React hooks, Context API, aur external libraries kaise kaam kar rahi hain in simple layman language and Hindi.

---

## 📦 1. package.json
**What is it?** Ye frontend ki settings file hai. Isme bataya jata hai ki project ko run kaise karna hai aur kaunse tools (libraries) use ho rahe hain.

**Main Libraries:**
*   `vite`: Next-generation frontend build tool jo development ko fast banata hai.
*   `@monaco-editor/react`: VS Code wala editor browser mein use karne ke liye.
*   `socket.io-client`: Server ke saath real-time (live) baat karne ke liye.
*   `react-router-dom`: Website mein alag-alag pages (Login, Dashboard) banane ke liye.
*   `axios`: Backend ko API requests bhejne ke liye.
*   `react-hot-toast`: Sundar notifications (popups) dikhane ke liye.

---

## 🚀 2. main.jsx & App.jsx
**What is it?** Ye app ka brain aur skeletal structure hain.

**main.jsx:**
*   Yahan React app start hoti hai.
*   `BrowserRouter` pure app mein routing enable karta hai.
*   `AuthProvider` sabhi pages ko login/logout ki info deta hai.
*   `Toaster` notifications ko handle karta hai.

**App.jsx:**
*   Ye decide karta hai ki kaunsa URL pe kaunsa page dikhega.
*   **Protected Routes:** Agar user logged in nahi hai, toh use Dashboard ki jagah Login page pe bhej diya jata hai.
*   `SocketProvider` sirf tabhi load hota hai jab user logon ho jaye.

---

## 🧠 3. context/ (State Management)
App ka "Memory System" jahan global data store hota hai.

### A. AuthContext.jsx
*   **Purpose:** User ka profile aur login status manage karna.
*   **Logic:** Ye `useEffect` use karta hai check karne ke liye ki kya browser ke `localStorage` mein pehle se koi token hai. Agar hai, toh user ko automatically login kar deta hai.

### B. SocketContext.jsx
*   **Purpose:** Backend se constant connection bana ke rakhna.
*   **Logic:** Jab user dashboard ya editor pe hota hai, ye `io()` call karke backend se "Pipe" (Socket) connect karta hai taaki live updates mil sakein.

---

## 🏠 4. pages/ (Application Screens)

### A. Login.jsx & Signup.jsx
*   Simple forms hain jo user se email/password lekar `AuthContext` ke functions call karte hain.

### B. Dashboard.jsx
*   **Purpose:** Saare coding rooms ki list dikhana.
*   **Features:** Room create karna, join karna, aur purane rooms browse karna. Ye `api.get('/rooms')` call karke data fetch karta hai.

### C. EditorRoom.jsx (Core Workspace)
*   *Note: Ye file workspace ka controller hai.*
*   Ye `CodeEditor` aur `AIReviewPanel` ko connect karta hai.
*   Jab koi type karta hai, ye socket se message bhejta hai `code-change`.

---

## 🛠️ 5. components/ (UI Building Blocks)

### A. CodeEditor.jsx
*   **What it does:** Monaco Editor ko screen pe load karta hai.
*   **Special Feature:** `deltaDecorations` function ka use karke doosre users ke cursor positions ko live light aur color ke saath dikhata hai.

### B. AIReviewPanel.jsx
*   **What it does:** Ek sidebar jo AI se code analyze karwata hai.
*   **Logic:** Button click pe ye current code backend (Gemini) ko bhejta hai aur formatted response dikhata hai.

---

## 🔧 6. utils/api.js
**What is it?** Ek helper file jo Axios ko configure karti hai.

**Logic:**
*   Ye automatically har request ke saath `Authorization: Bearer <token>` bhejti hai taaki server ko pata chale ki request valid user se hai.
*   Agar server `401 (Expired Token)` bhejta hai, toh ye user ko logout karke Login page pe bhej deta hai.

---

## 💡 Summary for Beginners
Frontend ek "TV Screen" ki tarah hai:
*   **React:** Screen par content dikhane wala system.
*   **Context:** Channel memory (Login info).
*   **Socket.io:** Live broadcast (Naya news achanak se aana).
*   **Monaco:** Typing machine (Editor).
*   **Axios:** Remote control jo backend box se baat karta hai.

Umeed hai ye guide aapko CodeSync frontend samajhne mein help karegi! ✨
