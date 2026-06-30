# Food Corner

Food Corner is a local full-stack food delivery application:

- Frontend: React 18, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, JWT authentication
- Database: PostgreSQL with Prisma ORM
- Roles: customer, restaurant owner, rider, admin/super admin, staff, manager, cashier
- Payments: Cash on Delivery plus modular placeholders for Stripe, SSLCommerz, bKash, and Nagad

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 15+ installed locally, or Docker Desktop

## 1. Configure the frontend

From the project root:

```bash
copy frontend\.env.example frontend\.env
npm install --prefix frontend
```

The default frontend API URL is:

```env
VITE_API_URL=http://localhost:4000/api
```

## 2. Configure the backend

```bash
cd backend
copy .env.example .env
npm install
```

Change `JWT_SECRET` in `backend/.env` before deployment.

## 3. Start PostgreSQL

With Docker:

```bash
copy .env.example .env
docker compose up -d postgres
```

Without Docker, create a local PostgreSQL database named `foodcorner` and update
`DATABASE_URL` in `backend/.env`.

## 4. Create and seed the database

From `backend/`:

```bash
npm run prisma:generate
npm run db:deploy
npm run db:seed
```

Set `SEED_USER_PASSWORD` in `backend/.env` before running `npm run db:seed`.

For schema development, use:

```bash
npm run db:migrate
```

## 5. Run locally

Use two terminals:

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2, project root
npm run dev
```

Or run both from the project root:

```bash
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health check: http://localhost:4000/api/health

## Demo accounts

Seeded demo accounts use the password from `SEED_USER_PASSWORD`.

| Role | Email |
|---|---|
| Super Admin | `admin@foodcorner.local` |
| Admin | `platform-admin@foodcorner.local` |
| Store Owner | `owner@foodcorner.local` |
| Customer | `customer@foodcorner.local` |
| Rider | `rider@foodcorner.local` |
| Manager | `manager@foodcorner.local` |
| Cashier | `cashier@foodcorner.local` |

New local registrations use the value of `DEV_OTP`.

## API structure

- `/api/auth` — register, OTP verification, login, profile, password reset
- `/api/resources/:resource` — REST CRUD for users, restaurants, food, cart,
  orders, riders, inventory, suppliers, purchases, expenses, notifications,
  settings, and other application resources
- `/api/payments` — payment creation and future gateway webhooks
- `/api/dashboard` — admin and store dashboard aggregates

The frontend API layer is in `frontend/src/services/api/client.js`.

## Payment gateway integration

Cash on Delivery works as a local payment record. Stripe, SSLCommerz, bKash, and
Nagad are represented by isolated adapters in `backend/src/routes/payments.js`.
Add credentials to `backend/.env`, then replace the relevant placeholder adapter
with the provider SDK call and webhook signature verification.

## Production deployment

### Architecture

- **Frontend:** Vite React static build (nginx Docker image or any static host)
- **Backend:** Express API on Render (`https://your-render-backend.onrender.com`)
- **Database:** Supabase PostgreSQL via `DATABASE_URL` (Prisma only — no Supabase Auth client required)
- **Auth:** Custom JWT + bcrypt (tokens in `localStorage`)

### Render backend settings

| Setting | Value |
|---|---|
| Runtime | Docker |
| Dockerfile Path | `backend/Dockerfile` |
| Docker Context | `backend` |
| Health Check | `/api/health` |

The Docker image runs `prisma migrate deploy` before starting the server. Render sets `PORT` automatically.

**Required environment variables (Render):**

```env
NODE_ENV=production
DATABASE_URL=postgresql://...   # Supabase connection string (Session pooler recommended)
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Optional payment gateway secrets (backend only): `STRIPE_SECRET_KEY`, `SSLCOMMERZ_*`, `BKASH_*`, `NAGAD_*`

Do **not** put database URLs, JWT secrets, or payment keys in the frontend.

### Frontend deployment

Build with the production API URL baked in:

```bash
VITE_API_URL=https://your-render-backend.onrender.com/api npm run build
```

Or set `VITE_API_URL` in your static host build environment.

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

Deploy the `frontend/dist/` folder (or use `frontend/Dockerfile` with the repository root as the Docker context).

### Supabase

Use Supabase **only as PostgreSQL** for this project. Set `DATABASE_URL` in Render to your Supabase connection string. No `@supabase/supabase-js` client is required unless you add Supabase Auth later.

### Local Docker

```bash
# PostgreSQL only
docker compose up -d

# Backend image
docker build -t food-hub-api ./backend

# Frontend image
docker build -f frontend/Dockerfile --build-arg VITE_API_URL=http://localhost:4000/api -t food-hub-web .
```

### Post-deploy database setup

On first deploy to a fresh database:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```
