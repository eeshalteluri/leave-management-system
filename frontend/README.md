# LeaveDesk — Frontend

Vue 3 + TypeScript frontend for the LeaveDesk leave management system.  
Connects to the Node.js / Express / MongoDB backend via a proxied `/api` path.

---

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Framework  | Vue 3 (Composition API, `<script setup>`) |
| Language   | TypeScript (strict mode)                  |
| Styling    | Tailwind CSS v3 + custom design system    |
| State      | Pinia (auth store + theme store)          |
| Routing    | Vue Router 4 (with navigation guards)     |
| HTTP       | Axios (JWT interceptor, auto 401 logout)  |
| Build tool | Vite                                      |
| Fonts      | Sora (display), DM Sans (body), DM Mono  |

---

## Project Structure

```
src/
├── api/
│   └── axios.ts              # Axios instance — attaches JWT, handles 401 auto-logout
├── components/
│   ├── Navbar.vue            # Sticky top nav with role-aware links + theme toggle
│   ├── Spinner.vue           # Reusable loading spinner
│   └── StatusBadge.vue       # Pending / Approved / Rejected badge
├── router/
│   └── index.ts              # Routes + role-based navigation guards
├── store/
│   ├── auth.ts               # Pinia store: login, signup, logout, user state
│   └── theme.ts              # Pinia store: dark/light toggle, persists to localStorage
├── types/
│   └── index.ts              # All TypeScript interfaces and enums matching backend API
├── views/
│   ├── LoginView.vue
│   ├── SignupView.vue
│   ├── ApplyLeave.vue         # Employee: submit a new leave request
│   ├── EmployeeDashboard.vue  # Employee: view own leave history + balance
│   ├── EmployerDashboard.vue  # Manager: review all department leave requests
│   └── NotFound.vue
├── App.vue
├── main.ts                   # Initialises theme store before mount (prevents flash)
└── style.css                 # Tailwind directives + design system component classes
```

---

## Backend API Endpoints

| Method | Endpoint                  | Used in                               |
|--------|---------------------------|---------------------------------------|
| POST   | `/api/auth/signup`        | SignupView                            |
| POST   | `/api/auth/login`         | LoginView                             |
| GET    | `/api/leaves/my`          | EmployeeDashboard (paginated)         |
| GET    | `/api/leaves/all`         | EmployerDashboard (paginated)         |
| PUT    | `/api/leaves/:id`         | EmployerDashboard (approve / reject)  |
| GET    | `/api/user/leave-balance` | EmployeeDashboard (balance cards)     |

### Important backend conventions

- `User.role` is `"employee"` or `"manager"` (not `"employer"`)
- `User.department` is a **lowercase** enum: `"engineering"`, `"marketing"`, `"sales"`, `"hr"`
- `Leave.status` is capitalized: `"Pending"`, `"Approved"`, `"Rejected"`
- `GET /api/leaves/my` and `GET /api/leaves/all` both accept `page` and `limit` query params
- `GET /api/leaves/all` returns `{ message, leaves, pagination }` where `pagination` is `{ total, page, limit, totalPages }`
- A manager can only see and action leaves from their own department
- `PUT /api/leaves/:id` accepts `{ status, managerComment? }`

---

## Key Features

### Employee Dashboard
- **Leave balance cards** — annual, sick, and casual days remaining with progress bars, fetched from `/api/user/leave-balance`
- **Request summary stats** — total, pending, approved, and rejected counts across all requests (not just the current page)
- **Status filter tabs** — filter by All / Pending / Approved / Rejected, each tab shows its count
- **Paginated leave list** — 5 requests per page, client-side filtering + pagination over the full dataset
- **Colorful leave type badges** — each leave type has a distinct color identity
- **Manager comment display** — shown on reviewed cards with contextual green/red styling

### Manager Dashboard
- **Request summary stats** — accurate counts across all department requests
- **Status filter tabs** — with per-tab counts
- **Advanced filter panel** — filter by employee name, leave type, and date range, with active filter count badge and one-click clear
- **Paginated request list** — 10 per page, client-side filtering + pagination over the full dataset so filters work across all pages
- **Approve / Reject actions** — with optional comment (300 char limit), inline loading and error states
- **Live stat updates** — approving or rejecting a request immediately updates counts without a re-fetch

### General
- **Dark / light mode toggle** — persists to `localStorage`, initialised before mount to prevent flash
- **Responsive design** — mobile-first, collapses gracefully on small screens
- **JWT auth** — stored in `localStorage`, injected via Axios interceptor, auto-clears on 401
- **Role-based routing** — employees and managers are kept to their own views

---

## Setup & Running

### Prerequisites
- Node.js v18+
- Backend running on `http://localhost:5000`

### Install & start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`.  
Vite proxies all `/api/*` requests to `http://localhost:5000` automatically.

### Type check

```bash
npm run type-check
```

### Production build

```bash
npm run build
# output → dist/
```

---

## Design System

Global component classes are defined in `style.css` and composed with `@apply`:

| Class          | Description                          |
|----------------|--------------------------------------|
| `.card`        | Standard white/dark bordered panel   |
| `.card-sm`     | Compact card variant                 |
| `.stat-card`   | Stat summary tile                    |
| `.field`       | Text input / select / textarea       |
| `.field-label` | Form label                           |
| `.btn-brand`   | Primary teal action button           |
| `.btn-approve` | Green approve button                 |
| `.btn-reject`  | Red reject button                    |
| `.badge-*`     | Status badge variants                |
| `.alert-error` | Red error alert block                |

All classes carry both light and `dark:` Tailwind variants.

---

## Leave Type Colors

| Leave Type      | Color  |
|-----------------|--------|
| Annual Leave    | Teal   |
| Sick Leave      | Rose   |
| Casual Leave    | Violet |
| Maternity Leave | Pink   |
| Paternity Leave | Sky    |
| Unpaid Leave    | Orange |

---

## Notes

- All `.vue` files use `<script setup lang="ts">` with explicit TypeScript types throughout.
- The pagination strategy on both dashboards is **hybrid**: initial data is fetched server-side with `page` + `limit`, but a second `limit: 9999` fetch populates `allLeaves` for accurate stat counts and client-side filtering. Filtering and page slicing then run entirely on the client, so filters correctly span all pages without needing backend support for filter params.
- `watch(active/filters)` resets `currentPage` to 1 whenever a filter changes so you never land on an out-of-range page.
- After a manager approves or rejects a request, both `leaves` and `allLeaves` are updated in-memory so stats and filters reflect the change immediately without a re-fetch.