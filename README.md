# UniMart – Smart Student Marketplace
**A Web-Based Campus Shop Platform for Student Skills and Academic Hardware**

**Department of Information and Communication Technology**  
**Faculty of Technology – Rajarata University of Sri Lanka**  
*Skill Development Project I – ICT 1108 | BICT (Honors)*  
*Group 05 – Sudo Six*  
*Supervisor: Mr. Nandika Tennakoon, Lecturer (Temp.)*

---

## 📌 Project Overview

**UniMart** is a closed, university-only campus marketplace engineered exclusively for undergraduate students. It provides a centralized repository where students can list and exchange:
- **Academic Prototyping Hardware**: Arduino Uno/Nano/Mega, ESP32 NodeMCU, Raspberry Pi, sensor packs (HC-SR04, DHT22, MQ-2), OLED/LCD displays, servo motors, breadboards, and lab equipment.
- **Digital Skills & Services**: Web Design & Development, Graphic Design & Event Posters, Video Editing for Academic Demonstrations, and Audio Cleanup / Voiceover Mastering.

### Key Architectural Constraints
1. **Institutional Access Gating**: Account creation is strictly restricted to students possessing valid university email addresses (e.g. `@student.rjt.ac.lk`).
2. **Unified Single-Catalog Model**: No artificial buyer/seller role separation. Any verified student can list, browse, and message directly.
3. **Campus Face-to-Face Exchanges**: No commercial online payment gateway fees or compliance overhead. All physical hardware exchanges and service reviews happen in-person on campus (e.g., FOT Electronics Lab 02, Library Lobby, Main Canteen).
4. **Peer Trust Engine**: Direct in-app messaging paired with a 5-star rating and review system.
5. **Mobile-First Responsive Web**: Accessible across desktop and mobile web browsers without requiring native mobile installation.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6 |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, CORS |
| **Database** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Data Adapter** | Dual-mode: Direct Supabase Cloud + Local In-Memory Fallback |
| **Deployment Target** | Vercel (Frontend) + Render / Supabase (Backend) |

---

## 📁 Repository Structure

```
unimart_web/
├── database/
│   ├── schema.sql             # Supabase PostgreSQL schema with RLS & indexes
│   └── seed.sql               # Seed data for Rajarata University hardware & skills
├── server/
│   ├── package.json           # Express backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── .env                   # Local configuration
│   ├── server.js              # Express application entrypoint
│   ├── config/
│   │   ├── constants.js       # Allowed domains, initial categories, mock seed
│   │   └── db.js              # Supabase client + reactive memory store fallback
│   ├── middleware/
│   │   ├── auth.js            # JWT bearer token verification
│   │   └── domainCheck.js     # University email domain validation
│   └── routes/
│       ├── auth.js            # Student registration, login, profile updates
│       ├── listings.js        # Unified catalog CRUD with multi-criteria filters
│       ├── categories.js      # Hardware & skill category endpoints
│       ├── messages.js        # Direct student-to-student in-app messaging
│       ├── reviews.js         # 5-star rating & review system
│       └── users.js           # Student public profiles & reputation stats
├── client/
│   ├── package.json           # Vite + React dependencies
│   ├── vite.config.js         # Vite config with API proxy to port 5000
│   ├── tailwind.config.js     # Campus color palette (Navy #0f172a, Teal #0d9488)
│   ├── index.html             # HTML entrypoint with Inter font
│   └── src/
│       ├── App.jsx            # Main app router & layout
│       ├── main.jsx           # React DOM render
│       ├── index.css          # Custom badges & Tailwind base
│       ├── context/
│       │   └── AuthContext.jsx# Authentication context & token management
│       ├── services/
│       │   └── api.js         # API request client
│       ├── components/
│       │   ├── Navbar.jsx     # Header with campus verification pill & nav
│       │   ├── Footer.jsx     # Faculty & project attribution
│       │   ├── ListingCard.jsx# Hardware & skill card component
│       │   └── Toast.jsx      # Feedback notifications
│       └── pages/
│           ├── Home.jsx           # Landing page with category shortcuts & rules
│           ├── Browse.jsx         # Unified catalog with filters (Hardware/Skills)
│           ├── ListingDetail.jsx  # Item detail, student seller card & chat CTA
│           ├── CreateListing.jsx  # Form to post hardware or digital skills
│           ├── EditListing.jsx    # Update listing price, location, or status
│           ├── Messages.jsx       # Direct in-app student chat threads
│           ├── Profile.jsx        # User profile, listings & received peer reviews
│           ├── Login.jsx          # Login with 1-click evaluation demo buttons
│           └── Register.jsx       # Domain-verified student registration
├── package.json               # Root scripts to orchestrate client & server
└── README.md                  # Project documentation & setup instructions
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`v20.x` recommended)
- **npm**: v9.x or higher

### 2. Install Dependencies
Run the installation command in both folders:
```bash
# In root folder:
npm run install:all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API - Port 5000):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client - Port 5173):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

> **Note on Zero-Config Offline Mode:**
> The server automatically boots with pre-seeded sample data (Arduino Uno, ESP32, sensor bundles, web design, video editing) if Supabase credentials are not yet configured in `server/.env`. This enables immediate evaluation without database setup blockers!

---

## 🔑 Demo Accounts for Evaluation

The login page (`/login`) includes **1-Click Quick Fill** buttons for immediate testing:

| Student Name | University Email | Password | Role / Items |
|---|---|---|---|
| **Kavindu Perera** | `kavindu.p@student.rjt.ac.lk` | `Password123` | Hardware: Arduino Uno R3, Web Design Skill |
| **Anuki De Silva** | `anuki.d@student.rjt.ac.lk` | `Password123` | Skills: Video Editing, Poster Graphic Design |
| **Dinuka Fernando** | `dinuka.f@student.rjt.ac.lk` | `Password123` | Hardware: ESP32 NodeMCU, Sensor Bundle |

---

## 🗄️ Supabase Cloud Database Setup (Optional for Production)

To connect to a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`database/schema.sql`](./database/schema.sql) to create tables, indexes, and Row Level Security policies.
4. Paste and run the contents of [`database/seed.sql`](./database/seed.sql) to populate initial campus categories, student accounts, and sample listings.
5. In `server/.env`, set your project credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
6. Restart `server.js`. The console will display: `✅ Connected to Supabase Cloud Database`.

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push this repository to your GitHub account (e.g. `https://github.com/<your-username>/unimart_web`).
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Set **Root Directory** to `client`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Set Environment Variable:
   - `VITE_API_URL`: Your deployed Render API URL (e.g. `https://unimart-api.onrender.com/api`)

### Backend (Render)
1. Go to [Render Dashboard](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Set Environment Variables in Render:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: A long random secret string
   - `ALLOWED_DOMAINS`: `@student.rjt.ac.lk,@rjt.ac.lk,@fot.rjt.ac.lk`
   - `CLIENT_URL`: Your deployed Vercel frontend URL
   - `SUPABASE_URL`: (Your Supabase project URL)
   - `SUPABASE_SERVICE_ROLE_KEY`: (Your Supabase service key)

---

## 👥 Project Team (Group 05 – Sudo Six)

- **Student Member 01** (BICT Honors &bull; Rajarata University)
- **Student Member 02** (BICT Honors &bull; Rajarata University)
- **Student Member 03** (BICT Honors &bull; Rajarata University)
- **Student Member 04** (BICT Honors &bull; Rajarata University)
- **Student Member 05** (BICT Honors &bull; Rajarata University)
- **Student Member 06** (BICT Honors &bull; Rajarata University)

**Coursework Module:** ICT 1108: Skill Development Project I, Department of Information and Communication Technology, Faculty of Technology, Rajarata University of Sri Lanka.
