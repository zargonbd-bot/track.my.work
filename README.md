# ⚡ Zargon Production Tracker

A premium video editing production tracking system — built for tracking creatives, editors, and payments.

---

## 🚀 One-Click Setup

```bash
npm install
npm run dev
```

**Default credentials (Demo Mode):**
- Email: `admin@zargon.com`
- Password: `zargon2024`

> **Demo Mode** uses localStorage — no Firebase setup needed to run instantly!

---

## 📦 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI Framework |
| Vite 5 | Build Tool |
| Tailwind CSS 3 | Styling |
| Framer Motion | Animations |
| Recharts | Charts |
| Firebase 10 | Database (optional) |
| React Router 6 | Routing |
| React Hot Toast | Notifications |
| PapaParse | CSV Export |

---

## 🔥 Firebase Setup (Optional — for Production)

### Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it (e.g. `zargon-tracker`)
3. Disable Google Analytics (optional) → **"Create project"**

### Step 2: Enable Firestore
1. In your project, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a region → **"Enable"**

### Step 3: Enable Authentication
1. Go to **Authentication** → **"Get started"**
2. Click **Email/Password** → Enable → Save
3. Go to **Users** tab → **"Add user"**
4. Enter: `admin@zargon.com` + your secure password

### Step 4: Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → click **Web** (`</>`)
3. Register app with a name → copy the config object

### Step 5: Configure .env
```bash
cp .env.example .env
```

Edit `.env` with your Firebase values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_ADMIN_EMAIL=admin@zargon.com
VITE_ADMIN_PASSWORD=your-secure-password
# Remove or set to false:
# VITE_DEMO_MODE=true
```

### Step 6: Firestore Security Rules
In Firebase Console → Firestore → **Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /records/{recordId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📁 Project Structure

```
zargon-production-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── hooks/
│   │   └── useRecords.js       # Data hooks + stats helpers
│   ├── lib/
│   │   ├── firebase.js         # Firebase + demo mode service
│   │   └── AuthContext.jsx     # Auth context
│   ├── pages/
│   │   ├── LoginPage.jsx       # Admin login
│   │   ├── DashboardLayout.jsx # Sidebar + layout
│   │   ├── DashboardHome.jsx   # Overview dashboard
│   │   ├── DataPage.jsx        # CRUD data management
│   │   ├── PaymentPage.jsx     # Payment calculations
│   │   └── AnalyticsPage.jsx   # Charts & analytics
│   ├── styles/
│   │   └── index.css           # Tailwind + custom styles
│   ├── App.jsx                 # Routes
│   └── main.jsx               # Entry point
├── .env                        # Environment variables
├── .env.example               # Template
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 💡 Features

### Dashboard
- Total products, edited videos, hook edits
- Pending vs completed works
- Total payments overview
- Daily production chart
- Editor performance summary
- Recent records table

### Data Manager
- Add / Edit / Delete records
- Search by product ID or editor name
- Filter by editor and photoshoot status
- Sortable table columns
- CSV export

### Payment System
- Auto-calculates: Edit Creative × ৳30 + Hook Edit × ৳10
- Per-editor payment breakdown
- Monthly & daily earnings
- Payment split pie chart

### Analytics
- Monthly production trends
- Daily payment bar chart
- Editor performance comparison
- Completion rate KPI
- Monthly summary table

---

## 🎨 Design

- **Black & White Minimal** aesthetic with glassmorphism
- **Dark mode first** with toggle
- **Syne** (display) + **DM Sans** (body) + **JetBrains Mono** fonts
- Smooth Framer Motion animations
- Fully responsive — mobile, tablet, desktop

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```
Add your env variables in Vercel dashboard.

### Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📊 Payment Rates

| Work Type | Rate |
|-----------|------|
| Edit Creative | ৳30 per video |
| Hook Edit | ৳10 per hook |

---

## 👥 Editors

- **Hamim Hossain**
- **Abdullahil Kafi**

---

Made with ⚡ for Zargon Production
