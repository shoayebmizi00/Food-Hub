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
copy .env.example .env
npm install
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

All seeded accounts use password `Password123!`.

| Role | Email |
|---|---|
| Super Admin | `admin@foodcorner.local` |
| Store Owner | `owner@foodcorner.local` |
| Customer | `customer@foodcorner.local` |
| Rider | `rider@foodcorner.local` |
| Manager | `manager@foodcorner.local` |
| Cashier | `cashier@foodcorner.local` |

New local registrations use development OTP `123456` unless `DEV_OTP` is changed.

## API structure

- `/api/auth` — register, OTP verification, login, profile, password reset
- `/api/resources/:resource` — REST CRUD for users, restaurants, food, cart,
  orders, riders, inventory, suppliers, purchases, expenses, notifications,
  settings, and other application resources
- `/api/payments` — payment creation and future gateway webhooks
- `/api/dashboard` — admin and store dashboard aggregates

The frontend API layer is in `src/services/api/client.js`.

## Payment gateway integration

Cash on Delivery works as a local payment record. Stripe, SSLCommerz, bKash, and
Nagad are represented by isolated adapters in `backend/src/routes/payments.js`.
Add credentials to `backend/.env`, then replace the relevant placeholder adapter
with the provider SDK call and webhook signature verification.

## Production deployment

- Deploy the frontend build produced by `npm run build` to a static host.
- Deploy `backend/` as a Node.js service and run `npm run db:deploy` during release.
- Use a managed PostgreSQL database and set `DATABASE_URL`.
- Set `FRONTEND_URL` to the deployed frontend origin.
- Set a strong `JWT_SECRET` and HTTPS-only gateway webhook URLs.
