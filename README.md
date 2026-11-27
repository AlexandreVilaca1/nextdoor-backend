# NextDoor Backend Project

This project contains the backend of the NextDoor application: a neighbourhood platform where
users publish tasks, earn points by helping their neighbours and redeem those points for
products from partner establishments.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/AlexandreVilaca1/nextdoor-backend.git
cd nextdoor-backend
```

### 2. Create the Database

Create the schema in your SQL Server instance (tables, primary keys and foreign keys). The
project does not use migrations or `sequelize.sync()`, so the tables have to exist before you
start the server.

### 3. Create a `.env` File

In the **root of the project**, copy the example and adjust the values:

```bash
cp .env.example .env
```

The variables are:

```env
DB_SERVER=           # e.g., localhost
DB_DATABASE=         # e.g., NextDoor
DB_PORT=             # e.g., 1433
DB_USER=             # e.g., your_sql_user
DB_PASSWORD=         # e.g., your_password
SECRET_KEY=          # long random string, used to sign the JWT
PORT=                # optional, defaults to 3000
```

> ⚠️ Make sure your SQL Server instance has TCP/IP enabled and is listening on the specified port.

### 4. Install Dependencies

```bash
npm ci
```

### 5. Run the Project

```bash
node src/app.js
```

The API is served on `http://localhost:3000` (or on the port defined in `PORT`) and uploaded
images are served from `/uploads`. If the database connection fails, the process exits with
code 1 and prints the error.

### 6. Run the Tests

```bash
npm test
```

The suites use mocked models and services, so no database is required.

---

## ✅ Notes

- Ensure that your SQL Server instance is accessible via TCP/IP.
- The user specified in `.env` must have permission to access the target database.
- CORS only allows the frontend origin `http://localhost:5173` (the default Vite dev port).
- This setup is intended for local development.
