# 🌐 CodeSync Deployment Guide (Live Kaise Karein?)

Apne project ko internet par live karne ke liye (Deployment), hume 3 things setup karni hongi:
1.  **Database:** MongoDB Atlas (Cloud)
2.  **Backend:** Render ya Railway (WebSockets support ke liye)
3.  **Frontend:** Vercel ya Netlify (React app ke liye)

---

## 🛠️ Step 1: MongoDB Atlas Setup (Database in the Cloud)
Local MongoDB internet par kaam nahi karega. Hume cloud database chahiye.

1.  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) par account banayein.
2.  Ek **Free Cluster** create karein.
3.  **Database User** banayein (Username/Password yaad rakhein).
4.  **Network Access** mein jaakar `0.0.0.0/0` (Allow Access from Anywhere) add karein.
5.  **Connect** par click karke `Connection String` copy karein. Ye kuch aisi dikhegi: `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/codesync`.

---

## ⚙️ Step 2: Backend Changes for Production
Production mein jaane se pehle backend mein kuch small changes karne honge:

### A. Environment Variables (.env)
Render ya Railway ke dashboard mein ye variables add karein:
*   `MONGO_URI`: (Jo string Atlas se mili)
*   `JWT_SECRET`: (Koi bhi strong random text)
*   `GEMINI_API_KEY`: (Aapki Google AI key)
*   `PORT`: (Render automatically handle karega)

### B. CORS Settings (`server.js`)
Frontend URL change hoga, isliye `server.js` mein CORS modify karna hoga:
```javascript
// server/server.js
const origin = process.env.NODE_ENV === 'production' 
  ? 'https://your-frontend-url.vercel.app' 
  : 'http://localhost:5173';

app.use(cors({ origin, credentials: true }));
```

---

## 🚀 Step 3: Hosting the Backend (on Render)
1.  Apne code ko **GitHub** par push karein.
2.  [Render.com](https://render.com) par jayein aur "New Web Service" select karein.
3.  Apna GitHub repo connect karein.
4.  **Build Command:** `npm install`
5.  **Start Command:** `node server.js`
6.  **Advanced:** Environment variables add karein (Step 2 wali list).

---

## 💻 Step 4: Hosting the Frontend (on Vercel)
Frontend build karne se pehle `api.js` check karein:

### A. API URL Change (`client/src/utils/api.js`)
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
```

### B. Deployment
1.  [Vercel.com](https://vercel.com) par jayein.
2.  GitHub repo connect karein.
3.  **Root Directory:** `client` select karein.
4.  **Environment Variables:** `VITE_API_URL` add karein (Render wali backend URL).
5.  **Deploy** click karein!

---

## 💡 Important Tips for Beginners (Hinglish)
*   **GitHub is Must:** Project live karne se pehle use GitHub pe upload karna sabse zaroori hai.
*   **Environment Variables:** Kabhi bhi `.env` file ko GitHub pe upload mat karna (`.gitignore` use karein). Render/Vercel ke dashboard mein settings hoti hain wahan values dalein.
*   **Socket URL:** Frontend mein `SocketContext.jsx` mein socket connection URL ko backend URL se replace karna na bhoolein.

### Summary Checklist:
- [ ] MongoDB Atlas string ready?
- [ ] Code pushed to GitHub?
- [ ] Render Service created (Backend)?
- [ ] Vercel Project created (Frontend)?
- [ ] All API URLs updated?

Agar koi error aaye, toh logs check karein! Render dashboard mein "Logs" tab hota hai wahan dikh jayega ki server kyun crash ho raha hai.

**Zaroori Note:** Gemini API key ko Render pe daltay waqt spelling dhyan se check karein! 🚀🔥
