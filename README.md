<div align="center">

# ⏱️ AttendIQ — Check-in / Check-out Management System

**A full-stack employee attendance platform built with Laravel 12 + React 18**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

</div>

---
Working Link : https://check-in-check-out-h9vz.onrender.com/

## 📖 Overview

**AttendIQ** is a modern, production-ready attendance management system for teams and organisations. It replaces spreadsheets and manual registers with a clean SPA experience — employees clock in and out with a single click, while administrators monitor real-time presence, generate reports, and manage departments and shifts — all from one unified dashboard.

> The app name used in deployment is **TimeFlow-AD**; the internal codename is **AttendIQ**.

---

## ✨ Features

### 👤 Employee

- One-click **Check-in / Check-out** with duplicate-check protection
- Personal attendance history (last 30 records)
- Live check-in status and working-duration counter
- Profile management with avatar support

### 📊 Admin Dashboard

- Real-time KPI cards — total employees, present, absent, late today, attendance rate
- **7-day attendance bar chart** (Recharts)
- Live activity feed of the 10 most recent check-in / check-out events
- Full attendance log with **date, status, and name/ID search filters**

### 👥 Employee Management

- Create, view, and manage employee profiles
- Assign roles (`Admin` / `Employee`), departments, employee IDs
- Set and update employee status (active / inactive)

### 🏢 Departments & Shifts

- Create and manage departments
- Configure named shifts with start/end times, grace-minute buffers, and working days

### 📈 Reports

- Filterable attendance reports page
- CSV export

### ⚙️ Settings

- App-wide settings stored in a key-value `app_settings` table
- Late arrival threshold configurable (default: 09:15)

### 🌗 UI / UX

- Dark / light **theme toggle** with persistent preference
- React Hot Toast notifications
- Fully responsive with Tailwind CSS

---

## 🧠 Tech Stack

| Layer              | Technology                             |
|--------------------|----------------------------------------|
| Backend framework  | Laravel 12 (PHP 8.2)                   |
| Frontend framework | React 18 (Vite + JSX)                  |
| Routing (frontend) | React Router v6                        |
| Forms & validation | React Hook Form + Zod                  |
| Charts             | Recharts                               |
| Styling            | Tailwind CSS 3                         |
| Icons              | Lucide React                           |
| Notifications      | React Hot Toast                        |
| Date handling      | date-fns + Carbon                      |
| Database           | PostgreSQL (production) / SQLite (dev) |
| Auth               | Laravel session auth (cookie-based)    |
| Tests              | Pest PHP                               |
| Containerisation   | Docker                                 |
| CI / Deploy        | Render (`render.yaml` included)        |

---

## 📁 Project Structure

```
Check-in-Check-out/
├── app/
│   ├── Http/Controllers/     # AuthController, AttendanceController
│   ├── Models/               # User, Attendance, Department, Shift, AppSetting
│   ├── Providers/
│   └── Support/
│       └── AttendiqPayload.php  # Serialisers + late-status logic
├── database/
│   ├── migrations/           # Users, Attendances, Departments, Shifts, Settings
│   ├── factories/
│   └── seeders/
├── resources/js/
│   ├── pages/                # DashboardPage, AttendancePage, EmployeesPage,
│   │                         #   DepartmentsPage, ReportsPage, SettingsPage,
│   │                         #   ProfilePage, LoginPage, SignupPage
│   ├── components/           # Shared UI components + AppLayout
│   ├── context/              # AuthContext, ThemeContext
│   ├── services/             # Axios API service layer
│   └── utils/
├── routes/web.php            # All API routes (Laravel prefix: /api/*)
├── Dockerfile
├── render.yaml               # One-click Render deploy config
└── composer.json / package.json
```

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api`. Protected routes require an active session.

### Auth

| Method | Endpoint             | Description                           |
|--------|----------------------|---------------------------------------|
| POST   | `/api/auth/login`    | Login with email + password           |
| POST   | `/api/auth/register` | Register a new employee account       |
| GET    | `/api/auth/me`       | Get the authenticated user            |
| POST   | `/api/auth/logout`   | Logout (auto check-out if checked in) |

### Attendance

| Method | Endpoint                    | Description                                    |
|--------|-----------------------------|------------------------------------------------|
| GET    | `/api/attendance`           | All records (filterable by date, status, name) |
| GET    | `/api/attendance/today`     | Authenticated user's today status              |
| GET    | `/api/attendance/my`        | Personal history (last 30)                     |
| POST   | `/api/attendance/check-in`  | Check in (with optional location & notes)      |
| POST   | `/api/attendance/check-out` | Check out current session                      |
| DELETE | `/api/attendance/{id}`      | Delete a record **(Admin only)**               |

### Dashboard

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/dashboard/stats`        | KPI summary for today          |
| GET    | `/api/dashboard/activity`     | Last 10 check-in/out events    |
| GET    | `/api/dashboard/live`         | Current check-in state + count |
| GET    | `/api/dashboard/weekly-chart` | 7-day present/absent data      |

Employees, Departments, Shifts, and Settings also have full CRUD endpoints, all guarded by Admin middleware.

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+, Composer
- Node.js 20+, npm / yarn
- PostgreSQL **or** SQLite (for local dev)

### 1 — Clone & install

```bash
git clone https://github.com/pr0-gramm3r/Check-in-Check-out.git
cd Check-in-Check-out
```

The project ships a one-command setup script:

```bash
composer run setup
```

This runs `composer install`, copies `.env.example` to `.env`, generates the app key, runs migrations, and builds the frontend assets.

### 2 — Configure environment

```bash
cp .env.example .env
```

Update `.env` with your database credentials. For local SQLite:

```env
DB_CONNECTION=sqlite
```

For PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=checkin_checkout
DB_USERNAME=your_user
DB_PASSWORD=your_password
```

### 3 — Run in development

```bash
composer run dev
```

This concurrently starts the Laravel server, queue worker, and Vite dev server with HMR.

Visit **http://localhost:8000** — the React SPA is served from the single Laravel route.

---

## 🐳 Docker

Build and run the app as a container:

```bash
docker build -t attendiq .
docker run -p 8000:8000 \
  -e APP_KEY=base64:YOUR_KEY \
  -e DB_CONNECTION=pgsql \
  -e DB_HOST=your_db_host \
  -e DB_DATABASE=checkin_checkout \
  -e DB_USERNAME=your_user \
  -e DB_PASSWORD=your_password \
  attendiq
```

---

## ☁️ Deploy to Render

A `render.yaml` is included for zero-config deployment on [Render](https://render.com).

1. Fork / push this repo to your GitHub account.
2. In the Render dashboard, click **New > Blueprint** and point it at your repo.
3. Render automatically provisions a **PostgreSQL** database and a **web service** with all environment variables wired up.
4. The Docker build handles `composer install`, `yarn build`, migrations, and `php artisan serve`.

---

## 🧪 Testing

```bash
composer run test
# or directly:
php artisan test
```

Tests are written with **Pest PHP**. Feature and unit test suites live in `tests/Feature/` and `tests/Unit/`.

---

## 🔒 Role & Permission Model

| Role     | Access                                                                                 |
|----------|----------------------------------------------------------------------------------------|
| Employee | Own check-in/out, own attendance history, profile                                      |
| Admin    | All of the above + manage employees, departments, shifts, attendance records, settings |

Roles are stored on the `users` table. A dedicated `AdminMiddleware` guards all admin-only API routes, returning `403 Forbidden` to non-admins.

---

## ⏰ Late Arrival Logic

`AttendiqPayload::statusFor()` marks a record as **late** when `check_in` is after **09:15**. Status values: `present`, `late`, `absent`.

---

## 🗺️ Roadmap

- [ ] Email / push notifications for late arrivals
- [ ] Leave management module
- [ ] CSV / PDF report export
- [ ] Geolocation enforcement on check-in
- [ ] Mobile app (React Native)
- [ ] Webhook integrations (Slack, Teams)

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change, then submit a pull request.

---

## 🧑‍💻 Author

Made with ❤️ by **[pr0-gramm3r](https://github.com/pr0-gramm3r)**

---

## ⭐ Support

If AttendIQ saves you time:

- ⭐ Star the repo
- 🍴 Fork it and build on top of it
- 💬 Open an issue with feedback or ideas

---

## 📜 License

This project is open-source, available under the [MIT License](LICENSE).
