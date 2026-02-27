# 🧪 CodeSync — Complete Testing Guide

> Test all features with **6 users** using the exact inputs below. Open 6 browser tabs/windows to simulate 6 different users.

---

## 👥 Demo Users — Registration Data

| # | Username | Email | Password |
|---|---|---|---|
| **User 1** | `nitesh_dev` | `nitesh@test.com` | `Test@123` |
| **User 2** | `rahul_coder` | `rahul@test.com` | `Test@123` |
| **User 3** | `priya_js` | `priya@test.com` | `Test@123` |
| **User 4** | `amit_python` | `amit@test.com` | `Test@123` |
| **User 5** | `sneha_react` | `sneha@test.com` | `Test@123` |
| **User 6** | `vikram_node` | `vikram@test.com` | `Test@123` |

---

## 🖥️ Browser Setup for 6 Users

Since each browser shares the same localStorage, use these methods to simulate 6 users:

| User | How to Open |
|---|---|
| User 1 | **Chrome** — Normal tab → http://localhost:5173 |
| User 2 | **Chrome** — Incognito window → http://localhost:5173 |
| User 3 | **Edge** — Normal tab → http://localhost:5173 |
| User 4 | **Edge** — InPrivate window → http://localhost:5173 |
| User 5 | **Firefox** — Normal tab → http://localhost:5173 |
| User 6 | **Firefox** — Private window → http://localhost:5173 |

> **Tip:** Each browser/incognito session has its own localStorage, so each acts as a separate user.

---

## ✅ TEST 1: User Registration (All 6 Users)

**Test for:** Signup form validation, duplicate prevention, auto-redirect

### Steps — Repeat for ALL 6 users in their respective browser:

1. Go to `http://localhost:5173`
2. You should see the **Login page** → Click **"Create one"** link at the bottom
3. Fill in the registration form with the values from the table above
4. Click **"Create Account"**

### Expected Results:
- ✅ Toast notification: "Account created! Welcome! 🎉"
- ✅ Redirected to **Dashboard** page
- ✅ Dashboard shows "Welcome, [username]"
- ✅ No rooms listed yet (empty state with 🚀 icon)

### Error Tests (Do these with User 1 only):
| Test | Input | Expected Error |
|---|---|---|
| Empty fields | Leave all fields empty → click submit | "Please fill in all fields" toast |
| Short password | Username: `test`, Email: `test@test.com`, Password: `123` | "Password must be at least 6 characters" toast |
| Duplicate email | Username: `new_user`, Email: `nitesh@test.com`, Password: `Test@123` | "An account with this email already exists" toast |
| Duplicate username | Username: `nitesh_dev`, Email: `new@test.com`, Password: `Test@123` | "An account with this username already exists" toast |

---

## ✅ TEST 2: Login / Logout

### Steps (User 1):
1. Click **Logout** button (🚪 icon top-right on Dashboard)
2. You should be redirected to **Login** page
3. Enter: Email: `nitesh@test.com`, Password: `Test@123`
4. Click **"Sign In"**

### Expected Results:
- ✅ Toast: "Welcome back! 🚀"
- ✅ Redirected to Dashboard

### Error Tests:
| Test | Input | Expected |
|---|---|---|
| Wrong password | Email: `nitesh@test.com`, Password: `wrong123` | "Invalid email or password" |
| Non-existent email | Email: `nobody@test.com`, Password: `Test@123` | "Invalid email or password" |
| Empty fields | Leave empty → submit | "Please fill in all fields" |

---

## ✅ TEST 3: Create Rooms (Users 1, 2, 3)

### User 1 — Create Room 1:
1. On Dashboard, click **"New Room"** button
2. Room Name: `Algorithm Practice`
3. Language: **JavaScript**
4. Click **"Create Room"**

### User 2 — Create Room 2:
1. On Dashboard, click **"New Room"**
2. Room Name: `Python Data Structures`
3. Language: **Python**
4. Click **"Create Room"**

### User 3 — Create Room 3:
1. On Dashboard, click **"New Room"**
2. Room Name: `React Components`
3. Language: **JavaScript**
4. Click **"Create Room"**

### Expected Results:
- ✅ Toast: "Room created! 🎉"
- ✅ Redirected to the Editor page with Monaco Editor loaded
- ✅ Room name shown in navbar
- ✅ Room ID (like `#a1b2c3d4`) shown next to room name
- ✅ Your avatar visible in connected users area
- ✅ Green dot 🟢 showing "Connected"

---

## ✅ TEST 4: Join Room via Room ID (Users 4, 5, 6)

### Step 1 — Copy Room ID:
- **User 1**: In the editor navbar, click the Room ID (e.g., `#a1b2c3d4`) → Toast says "Room ID copied!"
- Note down this Room ID

### Step 2 — Users 4, 5, 6 join User 1's room:
1. Go back to Dashboard (click ← arrow in editor navbar)
2. Click **"Join Room"** button
3. Paste the Room ID from User 1's room
4. Click **"Join Room"**

### Expected Results:
- ✅ All 4 users (User 1, 4, 5, 6) see each other's avatars in the navbar
- ✅ Toast notifications: "amit_python joined", "sneha_react joined", "vikram_node joined"
- ✅ All users see the same code in the editor
- ✅ Connection status shows green dot 🟢 for all

---

## ✅ TEST 5: Real-Time Collaborative Editing

> This is the **CORE FEATURE** — test carefully!

### Test 5A — User 1 types code, others see it in real-time:

**User 1** types this in the editor:
```javascript
// Bubble Sort Algorithm
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
```

### Expected Results:
- ✅ Users 4, 5, 6 see the code appearing **character by character** as User 1 types (< 50ms delay)
- ✅ All editors show identical code at all times

### Test 5B — User 4 edits, all others see changes:

**User 4** adds this below the existing code:
```javascript

// Binary Search
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(binarySearch([11, 12, 22, 25, 34, 64, 90], 25));
```

### Expected Results:
- ✅ Users 1, 5, 6 all see User 4's additions in real-time
- ✅ No code corruption or overwriting

---

## ✅ TEST 6: Multi-Cursor Awareness

### Steps:
1. **User 1**: Click on **line 3** of the code
2. **User 4**: Click on **line 10** of the code
3. **User 5**: Click on **line 15** of the code

### Expected Results:
- ✅ Each user sees **colored cursor lines** at the positions of other users
- ✅ Small **username labels** appear above each remote cursor (e.g., "nitesh_dev", "amit_python")
- ✅ Each cursor has a **different color** (red, teal, blue, etc.)
- ✅ Cursor positions update as users click around

---

## ✅ TEST 7: Language Change

### Steps (User 1):
1. In the editor navbar, change the language dropdown from **JavaScript** to **Python**

### Expected Results:
- ✅ All users (4, 5, 6) see the language change simultaneously
- ✅ Syntax highlighting updates for all users (Python keywords highlighted differently)
- ✅ Language badge updates in navbar for all

### Now change back:
1. **User 5** changes language back to **JavaScript**
- ✅ Everyone sees the change instantly

---

## ✅ TEST 8: Code Execution

### Test 8A — Run JavaScript:
1. Make sure language is set to **JavaScript**
2. **User 1** clears the editor and types:
```javascript
const greet = (name) => `Hello, ${name}! Welcome to CodeSync!`;

for (let i = 1; i <= 5; i++) {
  console.log(`${i}. ${greet("User " + i)}`);
}

console.log("\n--- Array Methods ---");
const nums = [1, 2, 3, 4, 5];
console.log("Sum:", nums.reduce((a, b) => a + b, 0));
console.log("Doubled:", nums.map(n => n * 2));
console.log("Evens:", nums.filter(n => n % 2 === 0));
```
3. Click the **▶ Run** button

### Expected Results:
- ✅ Output panel slides up from bottom
- ✅ Shows green "Success" badge
- ✅ Output:
```
1. Hello, User 1! Welcome to CodeSync!
2. Hello, User 2! Welcome to CodeSync!
3. Hello, User 3! Welcome to CodeSync!
4. Hello, User 4! Welcome to CodeSync!
5. Hello, User 5! Welcome to CodeSync!

--- Array Methods ---
Sum: 15
Doubled: [ 2, 4, 6, 8, 10 ]
Evens: [ 2, 4 ]
```

### Test 8B — Run Python:
1. Change language to **Python**
2. Clear editor, type:
```python
# Fibonacci Generator
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Fibonacci(10):", fibonacci(10))
print("Sum:", sum(fibonacci(10)))

# List comprehension
squares = [x**2 for x in range(1, 11)]
print("Squares 1-10:", squares)
```
3. Click **▶ Run**

### Expected:
- ✅ Output:
```
Fibonacci(10): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
Sum: 88
Squares 1-10: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

### Test 8C — Error Handling:
1. Language: **JavaScript**, type:
```javascript
console.log(undefinedVariable.property);
```
2. Click **▶ Run**

### Expected:
- ✅ Red "Error" badge
- ✅ Shows: `ReferenceError: undefinedVariable is not defined`

### Test 8D — Infinite Loop Protection:
1. Type:
```javascript
while(true) { }
```
2. Click **▶ Run**

### Expected:
- ✅ After 10 seconds: "⏱️ Execution timed out (10s limit)"

---

## ✅ TEST 9: AI Code Review (Gemini)

### Steps (User 1):
1. Change language back to **JavaScript**
2. Clear editor, type this code with intentional issues:
```javascript
var password = "admin123";
var data = null;

function processData(input) {
  eval(input);
  var result = data.value;
  for (var i = 0; i < 1000000; i++) {
    console.log(i);
  }
  return result;
}

function getUserData() {
  var x = 1;
  var y = 2;
  var z = 3;
  return x;
}
```
3. Click the **🤖 AI Review** button (CPU icon in navbar)
4. In the panel that opens, click **"Analyze Code"**

### Expected Results:
- ✅ Loading spinner while analyzing (2-5 seconds)
- ✅ **Overall Score**: Should be low (3-5/10) due to intentional issues
- ✅ **Issues detected** (severity: error/warning/info):
  - ❌ `eval()` usage — security vulnerability
  - ⚠️ Hardcoded password
  - ⚠️ `console.log` in loop — performance issue
  - ⚠️ `var` instead of `const/let`
  - ℹ️ Unused variables `y` and `z`
  - ℹ️ Potential null reference on `data.value`
- ✅ **Suggestions** for improvement
- ✅ **Code Quality grid**: Readability, Performance, Best Practices, Security scores

### Test 9B — Good Code Review:
1. Replace with clean code:
```javascript
const calculateTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { total: 0, count: 0, average: 0 };
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const count = items.length;
  const average = total / count;

  return { total, count, average: Math.round(average * 100) / 100 };
};

const items = [
  { name: "Laptop", price: 999 },
  { name: "Mouse", price: 29 },
  { name: "Keyboard", price: 79 },
];

console.log(calculateTotal(items));
```
2. Click **"Analyze Code"** again

### Expected:
- ✅ **Higher score** (7-9/10)
- ✅ Fewer/no issues
- ✅ Positive feedback about input validation, clean naming, etc.

---

## ✅ TEST 10: Version History

### Step 1 — Save Version (User 1):
1. With the clean code from Test 9B in the editor
2. Click the **💾 Save** button (floppy disk icon in navbar)
3. ✅ Toast: "Version saved! 💾"

### Step 2 — Make Changes:
1. **User 4** deletes all the code and types:
```javascript
console.log("This is the NEW version");
```

### Step 3 — Save Another Version (User 4):
1. Click **💾 Save** again
2. ✅ Toast: "Version saved! 💾"

### Step 4 — View Version History:
1. Click the **🕐 Clock** button (history icon in navbar)
2. ✅ Sidebar opens showing "Version History"
3. ✅ Shows 2 versions:
   - "Version 2" — saved by amit_python — latest time
   - "Version 1" — saved by nitesh_dev — earlier time

### Step 5 — Restore Previous Version:
1. Click on **"Version 1"** in the sidebar
2. ✅ Toast: "Version loaded"
3. ✅ Editor code reverts to the clean code from Test 9B
4. ✅ ALL connected users (4, 5, 6) see the restored code immediately

---

## ✅ TEST 11: User Disconnect / Reconnect

### Steps:
1. **User 6** closes their browser tab
2. ✅ All remaining users see toast: "vikram_node left"
3. ✅ User 6's avatar disappears from connected users
4. **User 6** opens the room URL again in a new tab and logs in
5. ✅ All users see toast: "vikram_node joined"
6. ✅ User 6 sees the latest code (synced from server)

---

## ✅ TEST 12: Room Management on Dashboard

### Test 12A — View Rooms (User 1):
1. Go back to Dashboard (← arrow)
2. ✅ Room card shows: "Algorithm Practice"
3. ✅ Shows language badge, participant count, relative time
4. ✅ Participant avatars visible on card

### Test 12B — Copy Room ID:
1. Click the **📋 copy** icon on the room card
2. ✅ Toast: "Room ID copied!"
3. Paste somewhere to verify the ID is in clipboard

### Test 12C — Delete Room (Owner only):
1. **User 1** sees a **🗑️ delete** icon on their own room
2. **User 4** goes to Dashboard → should NOT see delete icon on User 1's room (only owner can delete)
3. **User 3** clicks delete on their "React Components" room  
4. ✅ Confirmation dialog: "Are you sure?"
5. Click OK → ✅ Room disappears from list

### Test 12D — Join Non-Existent Room:
1. Click **"Join Room"** → Enter: `invalidroomid`
2. ✅ Error toast: "Room not found"
3. ✅ Redirected back to Dashboard

---

## ✅ TEST 13: Concurrent Editing Stress Test

### Setup:
- Users 1, 2, 4, 5 all in the SAME room

### Steps:
1. All 4 users start typing simultaneously in different parts of the code
2. **User 1** types at the TOP: `// User 1 was here`
3. **User 2** types in the MIDDLE: `// User 2 added this`
4. **User 4** types at the BOTTOM: `// User 4 checking in`
5. **User 5** types a new function anywhere

### Expected:
- ✅ All changes appear for all users
- ✅ No crashes or freezing
- ✅ Code stays in sync (may have minor overwrite with rapid typing — this is expected for the MVP; production would use CRDTs)

---

## ✅ TEST 14: Responsive UI & Output Panel Toggle

### Steps:
1. In the editor, click **▶ Run** → Output panel slides up
2. Click the output header (or ▼ icon) → ✅ Panel collapses
3. Click again → ✅ Panel expands
4. Click **🤖** to open AI panel → ✅ Sidebar appears on right
5. Click **🕐** to switch to version history → ✅ AI panel closes, version panel opens
6. Click **🕐** again → ✅ Panel closes

---

## 📊 Testing Checklist Summary

| # | Test | Status |
|---|---|---|
| 1 | User Registration (6 users) | ⬜ |
| 2 | Login / Logout | ⬜ |
| 3 | Create Rooms (3 rooms) | ⬜ |
| 4 | Join Room via ID | ⬜ |
| 5 | Real-Time Collaborative Editing | ⬜ |
| 6 | Multi-Cursor Awareness | ⬜ |
| 7 | Language Change Sync | ⬜ |
| 8A | Code Execution — JavaScript | ⬜ |
| 8B | Code Execution — Python | ⬜ |
| 8C | Code Execution — Error Handling | ⬜ |
| 8D | Code Execution — Infinite Loop Timeout | ⬜ |
| 9A | AI Review — Bad Code (Low Score) | ⬜ |
| 9B | AI Review — Good Code (High Score) | ⬜ |
| 10 | Version History — Save & Restore | ⬜ |
| 11 | User Disconnect / Reconnect | ⬜ |
| 12A | Dashboard — View Rooms | ⬜ |
| 12B | Dashboard — Copy Room ID | ⬜ |
| 12C | Dashboard — Delete Room (Owner Only) | ⬜ |
| 12D | Dashboard — Join Invalid Room | ⬜ |
| 13 | Concurrent Editing Stress Test | ⬜ |
| 14 | UI Panel Toggle | ⬜ |

> Mark each ⬜ as ✅ after testing passes!
