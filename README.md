# Gorantla Grama Panchayat (GGP) - Digital Panchayat Portal

A modern, mobile-first, and multi-tenant administrative portal built to streamline civic services, staff registries, leave systems, and local demographics tracking for the **Gorantla Grama Panchayat (GGP)**.

---

## 🚀 Technology Stack

### 📱 Frontend (Mobile Application)
* **Framework**: React Native with **Expo SDK**
* **Navigation**: React Navigation (Native Stack & Bottom Tabs)
* **State Management**: React Context API (Authentication & Localization)
* **Styling**: Premium Custom Stylesheets (Vanilla CSS-in-JS style) with glassmorphic layouts & custom micro-animations
* **Hardware APIs**: `expo-image-picker` for profile avatars and ticket attachments

### ⚙️ Backend (REST API Server)
* **Runtime**: Node.js (TypeScript)
* **Framework**: Express.js
* **Database ORM**: Prisma ORM
* **Database engine**: PostgreSQL
* **Media Storage**: Cloudinary (for user profile photos, employee uploads, and ticket attachments)
* **Auth**: JSON Web Tokens (JWT) with password hashing via `bcrypt`

---

## 📂 Project Structure

```text
digital-gram-panchayat/
├── backend/                  # Express API Server (Node/TypeScript)
│   ├── prisma/               # Prisma Database Schema & Migrations
│   │   ├── migrations/       # Database Migration Scripts
│   │   ├── schema.prisma     # Main Database Schema definition
│   │   └── seed.ts           # Seeding Scripts (Dignitaries, Statistics, Admins)
│   ├── src/
│   │   ├── config/           # Database, Cloudinary config definitions
│   │   ├── middleware/       # Authentication & Multer upload middleware
│   │   ├── routes/           # Routes (Auth, Admin controls, Employees, Tickets)
│   │   ├── services/         # Services (Notification Engine, Mailers)
│   │   └── index.ts          # Server entry point
│   ├── package.json          # Backend Dependencies & Scripts
│   └── tsconfig.json         # TypeScript configuration
│
├── frontend/                 # React Native Mobile App (Expo SDK)
│   ├── assets/               # Logo and media assets
│   ├── src/
│   │   ├── components/       # Reusable UI Components
│   │   ├── context/          # State Contexts (Language, Auth, Snackbar)
│   │   ├── screens/          # Application Screens (Auth, Citizen, Employee, Admin)
│   │   └── styles/           # Global design tokens and styles
│   ├── App.tsx               # Root App layout and navigation
│   ├── package.json          # Frontend Dependencies & Scripts
│   └── tsconfig.json         # TypeScript configuration
│
└── .gitignore                # Root git ignores configuration
```

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PostgreSQL**: Running instance of PostgreSQL server
* **Cloudinary**: Active Cloudinary account credentials

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure your local environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/Panchayat2?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   ```
4. Run the database migrations to set up the tables:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with the official dignitaries, statistics, and admin records:
   ```bash
   npx prisma db seed
   ```
6. Start the backend developer server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install expo dependencies:
   ```bash
   npm install
   ```
3. Configure the backend API endpoint. Update `API_BASE_URL` in [AuthContext.tsx](file:///C:/Users/rehaa/OneDrive/Desktop/scratch/digital-gram-panchayat/frontend/src/context/AuthContext.tsx) to point to your backend IP:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
   ```
4. Launch Metro Bundler:
   ```bash
   npm run start
   ```
5. Open on emulator/device using the Expo Go application.

---

## 💻 Git & GitHub Development Workflow

To keep the codebase clean, clean commits and structured collaboration are critical.

### 🛑 What NOT to Commit (Ignored Files)
These are excluded from the repository using the root `.gitignore` file:
* **Secrets/Credentials** (`.env`, `.env.*`): Contains database passwords, Cloudinary API secrets, and JWT private keys. These must never be pushed to version control to prevent security vulnerabilities.
* **Dependencies** (`node_modules/`): Heavy and can be reconstructed cleanly using `npm install`.
* **Build Artifacts** (`dist/`, `build/`, `.expo/`): Machine-compiled outputs that change on every run.
* **Development backups** (`*.bak`, `*.backup`): Temporary code snapshots created during edits.

### 🟢 What SHOULD be Committed
* **Source Code** (`*.ts`, `*.tsx`): Source files representing components, routes, and styles.
* **Configurations** (`package.json`, `tsconfig.json`, `app.json`): Settings that define scripts, metadata, and dependencies.
* **Database migrations** (`backend/prisma/migrations/`): SQL scripts tracking structural database schema changes over time.
* **Asset files** (`frontend/assets/`): SVG, logos, and base assets used within layouts.

### 🔄 The Branching Workflow
1. **Sync Main Branch**:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Stage and Commit changes**:
   Write clear, semantic commit messages (e.g. `feat: add ticket closing status`, `fix: correct spelling in telugu forgot password`).
   ```bash
   git add .
   git commit -m "feat: add feature explanation"
   ```
4. **Push & Create Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Open the branch on GitHub to merge it into `main` after checks pass.
