# Project Structure

Food Hub is organized as a full-stack application with separate frontend and backend packages.

```text
.
├── frontend/        # Vite React application
├── backend/         # Express API and Prisma schema
├── shared/          # Cross-application contracts and constants
├── docs/            # Project documentation
├── scripts/         # Operational scripts
├── docker/          # Docker and nginx support files
├── docker-compose.yml
└── render.yaml
```

The frontend keeps API payloads in snake_case for compatibility with the backend REST boundary.
