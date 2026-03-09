# Leave Management System — Frontend

The frontend for the Leave Management System, built with **Vue 3**, **TypeScript**, and **Tailwind CSS**. It connects to the Node.js/Express/MongoDB backend and provides separate dashboards for employees and employers.

---

## Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Framework    | Vue 3 (Composition API, `<script setup>`)   |
| Language     | TypeScript (strict mode)                    |
| Styling      | Tailwind CSS v3                             |
| State Management | Pinia                                   |
| Routing      | Vue Router 4                                |
| HTTP Client  | Axios                                       |
| Build Tool   | Vite                                        |

---

## Features

### Employee
- Sign up and log in as an employee
- Apply for leave by selecting leave type, dates, and a reason
- View all personal leave requests with live status tracking (Pending, Approved, Rejected)
- Filter requests by status

### Employer
- Sign up and log in as an employer
- View all employee leave requests in a central dashboard
- Approve or reject pending requests with a single click
- Filter requests by status

### General
- JWT-based authentication persisted across sessions
- Role-based access control — employees and employers see different pages
- Automatic redirect to login on session expiry (401 response)
- Fully typed with TypeScript throughout

---

## Project Structure

```
frontend/
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── env.d.ts
├── .env.example
│
└── src/
    │
    ├── main.ts                  # App entry point
    ├── App.vue                  # Root component
    ├── style.css                # Tailwind directives + global component classes
    │
    ├── api/
    │   └── axios.ts             # Axios instance with JWT interceptor and 401 handler
    │
    ├── components/
    │   ├── Navbar.vue           # Sticky top nav, role-aware links, logout button
    │   ├── Spinner.vue          # Reusable animated loading spinner
    │   └── StatusBadge.vue      # Coloured badge for Pending / Approved / Rejected
    │
    ├── router/
    │   └── index.ts             # Route definitions and navigation guards
    │
    ├── store/
    │   └── auth.ts              # Pinia store — login, signup, logout, user state
    │
    ├── types/
    │   └── index.ts             # TypeScript interfaces matching the backend API
    │
    └── views/
        ├── LoginView.vue            # POST /api/auth/login
        ├── SignupView.vue           # POST /api/auth/signup
        ├── ApplyLeave.vue           # POST /api/leaves/apply  (Employee only)
        ├── EmployeeDashboard.vue    # GET  /api/leaves/my     (Employee only)
        ├── EmployerDashboard.vue    # GET  /api/leaves/all    (Employer only)
        │                            # PUT  /api/leaves/:id    (Employer only)
        └── NotFound.vue             # 404 fallback page
```

---

## Backend API Endpoints Used

| Method | Endpoint             | View                  | Description                        |
|--------|----------------------|-----------------------|------------------------------------|
| POST   | `/api/auth/signup`   | SignupView            | Register a new user                |
| POST   | `/api/auth/login`    | LoginView             | Log in and receive a JWT           |
| POST   | `/api/leaves/apply`  | ApplyLeave            | Submit a leave request             |
| GET    | `/api/leaves/my`     | EmployeeDashboard     | Get the logged-in employee's leaves |
| GET    | `/api/leaves/all`    | EmployerDashboard     | Get all employee leave requests    |
| PUT    | `/api/leaves/:id`    | EmployerDashboard     | Approve or reject a request        |

> Status values sent to `PUT /api/leaves/:id` are `"Approved"` and `"Rejected"` (capitalized), matching the backend schema.

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- The backend server running on `http://localhost:5000`

---

## Installation & Setup

### 1. Navigate to the frontend folder

```bash
cd leave-management-system/frontend
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

The default `.env` requires no changes for local development. The Vite dev server automatically proxies all `/api` requests to the backend at `http://localhost:5000`.

### 3. Install dependencies

```bash
npm install
```

---

## Running the App

Make sure the backend is running first, then start the frontend:

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## Available Scripts

| Script                  | Description                                    |
|-------------------------|------------------------------------------------|
| `npm run dev`           | Start the Vite development server              |
| `npm run build`         | Compile TypeScript and build for production    |
| `npm run preview`       | Preview the production build locally           |
| `npm run type-check`    | Run TypeScript type checking without building  |

---

## Authentication Flow

1. User signs up or logs in via the auth forms
2. The backend returns a JWT token and user object
3. Both are saved to `localStorage`
4. Every subsequent API request automatically includes the token via an Axios request interceptor (`Authorization: Bearer <token>`)
5. If the server returns a `401 Unauthorized` response, the token is cleared and the user is redirected to `/login`

---

## Role-Based Access Control

Navigation guards in `router/index.ts` enforce the following rules:

| Condition                               | Redirect                   |
|-----------------------------------------|----------------------------|
| Not logged in, accessing a private page | `/login`                   |
| Logged in, accessing `/login` or `/signup` | Role-appropriate dashboard |
| Employee accessing an employer route    | `/employee/dashboard`      |
| Employer accessing an employee route    | `/employer/dashboard`      |

---

## Pages & Routes

| Route                    | View                  | Access    |
|--------------------------|-----------------------|-----------|
| `/login`                 | LoginView             | Public    |
| `/signup`                | SignupView            | Public    |
| `/employee/dashboard`    | EmployeeDashboard     | Employee  |
| `/employee/apply`        | ApplyLeave            | Employee  |
| `/employer/dashboard`    | EmployerDashboard     | Employer  |

---

## Production Build & Deployment

### Build

```bash
npm run build
```

This compiles TypeScript and outputs static files to the `dist/` folder.

### Deploy

The `dist/` folder can be deployed to any static hosting service such as **Vercel**, **Netlify**, or **GitHub Pages**.

#### Netlify

Add a `_redirects` file inside the `public/` folder to handle client-side routing:

```
/* /index.html 200
```

#### Environment variables for production

Before building, update your `.env` to point to your deployed backend:

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

And update the `baseURL` in `src/api/axios.ts` accordingly if not using a proxy.

---

## Environment Variables

| Variable            | Default                        | Description                       |
|---------------------|--------------------------------|-----------------------------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api`    | Base URL for the backend API      |

> In development, the Vite proxy handles API requests so this variable only applies to production builds.

---

## Author

Developed as part of a technical assignment demonstrating full-stack development using Vue 3, TypeScript, and a Node.js REST API.