# NextDoor Backend

REST API for NextDoor, a neighbourhood platform where residents publish tasks, earn points by
helping their neighbours and redeem those points for products from partner establishments.

Developed for the Project and Software Development (PDS) course — LESI, 2nd year, 2nd semester,
IPCA (group G07PL). This repository keeps the original commit history and adds the maintenance
fixes listed under [Notes](#notes).

## Scope

The API supports the full neighbourhood cycle:

- Authentication and authorisation with JWT (registration, login, protected routes).
- Task creation, listing by neighbourhood and category, editing and deletion.
- Task realisation, including validation, point collection and abandonment penalties.
- Notifications per user.
- Product catalogue filtered by the user's neighbourhood, with pagination.
- Establishments, neighbourhoods, addresses, categories and status lookup tables.
- Redemption codes, complaints and task feedback.
- Administrative endpoints for users, products, establishments, categories and redemption codes.

## Tech stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| HTTP framework | Express 5 |
| ORM | Sequelize 6 |
| Database | SQL Server (`mssql`) |
| Authentication | `jsonwebtoken`, `bcrypt` |
| File uploads | `multer` |
| Testing | Jest, Supertest |

## Architecture

Requests go through four layers, each with a single responsibility:

```
routes/       route definition and middleware wiring
controllers/  request validation and HTTP response
services/     business rules and database access
models/       Sequelize model definitions and associations
```

No route holds business logic, no controller queries the database directly, and no service depends
on `req`/`res`.

```
src/
├── app.js                  entry point: global middleware, route mounting, listener
├── config/db.js            Sequelize instance built from environment variables
├── routes/                 15 routers, mounted under /api
├── controllers/            15 controllers
├── services/               business logic
├── models/                 Sequelize models, grouped by domain
│   └── association/associations.js
├── middlewares/            authenticateToken, imageUploads
└── tests/                  unit and integration suites
```

The API exposes 67 endpoints. Protected routes require `Authorization: Bearer <token>`; a missing
token returns `401` and an invalid token returns `403`.

Uploaded product images are written to `src/uploads/` (excluded from version control) and served
from `/uploads/<filename>`.

## Requirements

- Node.js 18 or later (tested with Node 22)
- npm 10
- SQL Server instance with TCP/IP enabled and a user with access to the target database

## Getting started

### 1. Database schema

Create the schema on the SQL Server instance (tables, primary keys and foreign keys). The project
does not use migrations or `sequelize.sync()`, so the tables must exist before the server starts.

### 2. Environment variables

Copy the example file and adjust the values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `DB_SERVER` | yes | SQL Server host, for example `localhost` |
| `DB_DATABASE` | yes | Database name |
| `DB_PORT` | yes | SQL Server port, for example `1433` |
| `DB_USER` | yes | Database user |
| `DB_PASSWORD` | yes | Database password |
| `SECRET_KEY` | yes | Key used to sign and verify JWT tokens |
| `PORT` | no | HTTP port, defaults to `3000` |

`SECRET_KEY` must be long and random, and cannot change while issued tokens are in use: a new
value invalidates every token already handed out.

### 3. Install and run

```bash
npm ci
node src/app.js
```

The server listens on `http://localhost:3000` (or on `PORT`). If the database connection fails, the
process logs the error and exits with code 1 instead of listening.

### 4. Tests

```bash
npm test
```

Four suites (35 tests) cover the product controller and service, the authentication middleware and
the product routes through Supertest. Models and services are mocked, so no database is required.

## API overview

All resources are mounted under `/api`.

| Resource | Prefix |
| --- | --- |
| Users | `/api/users` |
| Products | `/api/products` |
| Task creation | `/api/taskCreations` |
| Task realisation | `/api/taskRealizations` |
| Business processes | `/api/businessProcesses` |
| Notifications | `/api/notifications` |
| Establishments | `/api/establishments` |
| Neighbourhoods | `/api/neighborhoods` |
| Addresses | `/api/addresses` |
| Redemption codes | `/api/redemptionCodes` |
| Product types | `/api/product-types` |
| Product status | `/api/product-status` |
| Categories | `/api/categories` |
| Complaints | `/api/complaints` |
| Feedback | `/api/feedbacks` |

Errors use the response shape `{ "error": "..." }`.

## Notes

- CORS accepts a single origin, `http://localhost:5173` (the frontend development server). The
  origin is not configurable through environment variables yet.
- The database schema is created by hand; there are no migrations.
- Runtime uploads are not versioned; only the `.gitkeep` placeholder is tracked.
- Compared with the delivered version, this branch removes the `sqlInjectionGuard` middleware (a
  regex blacklist that rejected valid input while Sequelize already parameterises queries),
  removes a duplicated `multer` configuration, replaces debug `console.log` calls with
  `console.error` in the `catch` blocks, and fixes the HTTP status codes returned by
  `authenticateToken`, by the error paths of `productController` and by the awaited database
  connection in `app.js`.

## Authors

Group G07PL:

- João Paulo Carvalho — [@carvalhojp26](https://github.com/carvalhojp26)
- Pedro Alves
- David Pinheiro
- Alexandre Vilaça — [@AlexandreVilaca1](https://github.com/AlexandreVilaca1)

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2025 João Paulo Carvalho.
