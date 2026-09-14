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


## 👥 Project Team (Group 05 – Sudo Six)

- **Student Member 01** (BICT Honors &bull; Rajarata University)
- **Student Member 02** (BICT Honors &bull; Rajarata University)
- **Student Member 03** (BICT Honors &bull; Rajarata University)
- **Student Member 04** (BICT Honors &bull; Rajarata University)
- **Student Member 05** (BICT Honors &bull; Rajarata University)
- **Student Member 06** (BICT Honors &bull; Rajarata University)

**Coursework Module:** ICT 1108: Skill Development Project I, Department of Information and Communication Technology, Faculty of Technology, Rajarata University of Sri Lanka.
