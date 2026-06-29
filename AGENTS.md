# Food Corner development notes

This repository is a local React, Express, Prisma, and PostgreSQL application.

- Frontend source: `frontend/src/`
- Frontend REST client: `frontend/src/services/api/client.js`
- Backend source: `backend/src/`
- Prisma schema and migrations: `backend/prisma/`
- Local PostgreSQL: `docker-compose.yml`

Keep API payloads in snake_case for frontend compatibility. The backend converts
them to Prisma camelCase fields at the REST boundary.
