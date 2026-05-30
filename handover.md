# Vexta Project Handover Guide

Welcome to the **Vexta** project handover documentation. This file provides all the technical details, credentials, and operational guides required to successfully deploy, configure, and maintain the Vexta platform.

---

## 1. System Overview & Tech Stack

Vexta is an automated arbitrage contract and unilevel investment network platform. It features an automated daily ROI distribution engine, a real-time High-Frequency Trading (HFT) simulated console, a P2P transfer network, and detailed administrative dashboards.

* **Framework:** Next.js 16 (App Router)
* **Frontend:** React 19, Tailwind CSS, Lucide Icons, Recharts
* **Database & ORM:** MongoDB Atlas, Prisma Client
* **Authentication:** JWT tokens via Edge-compatible middleware
* **Integrations:**
  * **Plisio:** Gateway for USDT BEP-20 automated payments and invoice processing
  * **Resend:** Email engine for OTP verifications and security logs
  * **Jest & ts-jest:** Unit testing suite for critical math models (ROI, referral calculations, auth)

---

## 2. Administrator Access & Credentials

The platform features a secure, protected administrative panel accessible at `/admin`. 

> [!IMPORTANT]
> **Primary Administrator Account:**
> * **Email:** `admin@vexta.app`
> * **Password:** `Admin@1234!`
> * **Role:** `admin`

### Security Audit Confirmation
A database audit has been executed on the MongoDB production dataset to confirm credentials compliance:
1. **No Hidden/Secondary Admins:** There is **exactly one** user account in the system with the role of `admin` (`admin@vexta.app`).
2. **Standard Accounts:** All other 13 active user accounts in the database are configured with the standard `user` role and do not have access to any `/admin` or `/api/admin` endpoints.
3. **Seed Integrity:** The Prisma seeding script (`prisma/seed.ts`) has been corrected to explicitly assign `role: 'admin'` to the primary admin account during environment initialization.

---

## 3. Environment Variables Configuration (`.env`)

A sample template is provided in [.env.example](file:///Users/admin/Github/vexta/.env.example). Ensure the following environment variables are set in your deployment environment:

```env
# ─── Database ─────────────────────────────────────────────────────────────────
# MongoDB connection string (Atlas recommended)
DATABASE_URL="mongodb+srv://..."

# ─── Authentication ───────────────────────────────────────────────────────────
# Secret key used for signing session tokens (must be at least 32 characters)
JWT_SECRET="vexta-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"

# Public URL of the frontend app (no trailing slash)
NEXT_PUBLIC_APP_URL="https://vexta.network"

# ─── Email Gateway (Resend) ───────────────────────────────────────────────────
# Key for sending OTP verification codes and withdrawal validation codes
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Vexta <noreply@vexta.network>"

# ─── Payment Gateway (Plisio) ─────────────────────────────────────────────────
# Plisio USDT BEP-20 API settings
PLISIO_SECRET_KEY="your-plisio-secret-key"
PLISIO_MASTER_WALLET="0xYourMasterWalletAddress"
PLISIO_CALLBACK_URL="https://yourdomain.com/api/plisio/webhook"

# ─── Security & Cron ──────────────────────────────────────────────────────────
# Secret key used to protect administrative cron triggers (e.g. daily ROI)
CRON_SECRET="your-long-random-cron-secret"
```

---

## 4. Key Commands & Operations

### Installation & Execution
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build production bundle
yarn build

# Start production server
yarn start
```

### Database Operations
```bash
# Push schema updates directly to MongoDB (re-generates Prisma Client)
npx prisma db push

# Initialize/seed plans and the main administrator account
npx prisma db seed

# Open local Prisma Studio GUI
npx prisma studio
```

### Clean / Reset Database
To clean up mock/test database records and reset the system for a fresh handover:
```bash
# Runs the clean script: clears all transactions, withdrawals, invoices, 
# and sets all active balances and active capitals back to 0.
npx ts-node scripts/reset-data.ts
```

### Verification & Testing
```bash
# Run Jest Unit Tests (ROI Engine, Referral bonuses, JWT Auth, Arbitrage math)
yarn test

# Run TypeScript Compilation Typecheck
npx tsc --noEmit
```

### ROI Daily Distribution Setup
Daily returns (1% Monday-Friday) are processed automatically by invoking the endpoint `/api/admin/run-daily-roi`.
* **Production Configuration:** Configure a cron scheduler (e.g., Vercel Cron) to hit the endpoint at midnight.
* **Authentication:** Protect this route by passing the `CRON_SECRET` inside the Authorization header:
  `Authorization: Bearer <CRON_SECRET>`

---

## 5. Core Business Logic & Contract Rules

1. **Simple Interest Only:** All compound interest mechanics have been removed. User operational capital remains flat and stable. Daily profits are sent directly to the withdrawable `availableBalance` wallet.
2. **Daily Return Rate:** 1% from Monday to Friday. ROI skips weekends.
3. **Contract Limit:** Max duration is **200 business days** (200% total return), after which the investment contract automatically expires.
4. **Activation Balance:** Users can activate plans using their withdrawable balance directly or by depositing fresh USDT BEP-20.
5. **Withdrawal Blocks:** Administrators can toggle a withdrawal block on a per-user basis. When blocked, the user is prevented from generating withdrawal OTP codes or submitting requests.
6. **Withdrawal Fee:** A transparent, flat fee of exactly $0.01 (1 cent) is applied to all external withdrawals. The net amount paid is calculated as `requested amount - $0.01`. P2P transfers remain 100% free with 0% fee.
