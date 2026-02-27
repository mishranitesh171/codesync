# 📄 CodeSync Backend Documentation

Welcome! Is document mein hum CodeSync backend ke har file aur folder ko detail mein samjhenge. We will explain what each file does, which NPM packages are used, and how the code works in simple layman language.

---

## 📦 1. package.json
**What is it?** Ye backend ki "Identity Card" hai. Isme project ka naam, version, aur saari dependencies (npm packages) listed hoti hain.

**Key Dependencies used:**
*   `express`: Web server banane ke liye.
*   `mongoose`: MongoDB se connect karne aur data manage karne ke liye.
*   `socket.io`: Real-time features (jaise live typing) ke liye.
*   `jsonwebtoken (JWT)`: Login aur security ke liye.
*   `bcryptjs`: Passwords ko hash (encrypt) karne ke liye.
*   `dotenv`: Environment variables (API keys, DB URLs) ko secure rakhne ke liye.
*   `cors`: Frontend aur Backend ke beech communication allow karne ke liye.
*   `@google/generative-ai`: Google Gemini AI use karne ke liye.

---

## 🚀 2. server.js
**What is it?** Ye backend ka **Starting Point (Entry File)** hai. Jab hum server start karte hain, toh sabse pehle yahi file run hoti hai.

**Main Functions:**
*   **Environment Setup:** `dotenv.config()` se `.env` file se saari secrets load ki jaati hain.
*   **Database Connection:** `connectDB()` function call karke MongoDB pe server connect hota hai.
*   **Middleware Setup:** 
    *   `express.json()` use hota hai taaki server JSON data samajh sake.
    *   `cors()` allow karta hai ki frontend backend se baat kar sake.
*   **Routes Registration:** Saari API endpoints (jaise `/api/auth`, `/api/rooms`) yahan register ki gayi hain.
*   **Socket.io Setup:** Real-time communication start kiya gaya hai.
*   **Port Listening:** Server ko ek port (jaise 5000) pe start kiya jata hai.

---

## 🗄️ 3. config/db.js
**What is it?** Iska kaam sirf **Database Connection** handle karna hai.

**Code Logic:**
*   `mongoose.connect()` use karke MongoDB Atlas ya Local DB se connection banaya jata hai.
*   Agar connection success hota hai, toh message dikhta hai: `✅ MongoDB Connected`.
*   Agar fail hota hai, toh error print hota hai aur server band ho jata hai.

---

## 🔐 4. middleware/auth.js
**What is it?** Ye ek **Chowkidar (Security Guard)** ki tarah hai. Ye check karta hai ki user logged in hai ya nahi.

**How it works:**
*   Frontend jab koi secure data maangta hai (jaise private rooms), toh woh ek `Token` bhejta hai.
*   Ye middleware us token ko `jwt.verify()` se check karta hai.
*   Agar token valid hai, toh request aage jaati hai. Agar nahi, toh `401 Unauthorized` error return karta hai.

---

## 🏗️ 5. models/ (Data Structure)
Is folder mein hum batate hain ki hamara data database mein kaisa dikhega.

### A. User.js
*   **Purpose:** User ki details (username, email, password) save karne ke liye.
*   **Middleware:** Password save karne se pehle use `bcrypt` se encrypt kiya jata hai security ke liye.
*   **Method:** `comparePassword` function user ke entered password ko database wale encrypted password se match karta hai.

### B. Version.js
*   **Purpose:** Code ki history save karne ke liye.
*   **Fields:** Isme `roomId`, `code`, `language`, aur `savedBy` (kisne save kiya) store hota hai.

*(Note: Room.js model contains details about the rooms created by users.)*

---

## 🛣️ 6. routes/ (API Endpoints)
Yahan saari logic store hoti hai ki kis URL pe kya hona chahiye.

### A. auth.js
*   **/register:** Naya user banane ke liye.
*   **/login:** User ko authenticate karke `JWT Token` dene ke liye.
*   **/me:** Abhi logged-in user ki details report karne ke liye.

### B. rooms.js
*   **POST /:** Naya room create karne ke liye (uuid generate karta hai).
*   **GET /:** User ke saare rooms ki list dikhane ke liye.
*   **GET /:roomId:** Kisi specific room mein join karne ke liye.

### C. ai.js
*   **Purpose:** Google Gemini AI ko use karke code review dena.
*   **Logic:** Ye aapka code Gemini API ko bhejta hai aur wahan se structured JSON review (score, issues, suggestions) lekar aapko deta hai.

### D. execute.js
*   **Purpose:** Code ko server pe run karke output dikhana.
*   **Logic:** Ye aapke code ki ek temporary file banata hai aur use ek "Child Process" mein run karta hai taaki server crash na ho (sandbox approach). Isme 10-second ka timeout hota hai.

### E. versions.js
*   **Purpose:** Code versions manage karna.
*   **Logic:** Jab aap "Save" click karte hain, ye code ko `Version` collection mein save karta hai. Aap purane versions dekh aur restore bhi kar sakte hain.

---

## 🔌 7. socket/ (Real-time Handler)
**What is it?** Ye server ka woh hissa hai jo "Always Open" connection banake rakhta hai.

**Events:**
*   `join-room`: Jab koi user room mein aata hai.
*   `code-change`: Jab koi character type karta hai, toh baki sabko turant dikh jata hai.
*   `cursor-move`: Doosre users ke cursor ki position live dikhane ke liye.
*   `disconnect`: Jab user tab band kar deta hai.

---

## 💡 Summary for Beginners
Backend ek kitchen ki tarah hai. 
*   `server.js` Manager hai.
*   `routes/` Menu items hain.
*   `models/` Recipes (structure) hain.
*   `config/` Grocery store (Database) connection hai.
*   `middleware/` Entry guard hai.
*   `npm packages` Kitchen tools (tools) hain.

Hope ye guide aapko backend samajhne mein help karegi! 🚀
