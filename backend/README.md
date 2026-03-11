# Learning Management System — Backend

Node.js / Express / MongoDB REST API for the Learning Management System leave management system.

---

## Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Runtime    | Node.js v18+                     |
| Framework  | Express                          |
| Database   | MongoDB Atlas (via Mongoose)     |
| Auth       | JWT (jsonwebtoken) + bcryptjs    |
| Dev server | nodemon                          |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                     # MongoDB connection (Mongoose)
│   ├── controllers/
│   │   ├── authController.js         # signup, login
│   │   ├── leaveController.js        # apply, getMyLeaves, getAllLeaves, updateLeaveStatus
│   │   └── userController.js         # getLeaveBalance
│   ├── middlewares/
│   │   ├── authMiddleware.js         # protect — verifies JWT and attaches user to req
│   │   └── roleMiddleware.js         # authorize — enforces role-based access control
│   ├── models/
│   │   ├── User.js                   # User schema (employee / manager)
│   │   └── Leave.js                  # Leave request schema
│   ├── routes/
│   │   ├── authRoutes.js             # /api/auth/*
│   │   ├── leaveRoutes.js            # /api/leave/*
│   │   └── userRoutes.js             # /api/user/*
│   ├── services/
│   │   ├── authService.js            # Auth business logic
│   │   ├── leaveService.js           # Leave business logic
│   │   └── userService.js            # User business logic
│   └── app.js                        # Express entry point, middleware, route mounting
├── .env.example
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Learning Management System?retryWrites=true&w=majority
JWT_SECRET=choose_a_long_random_secret_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Getting your MONGO_URI:**
> 1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com)
> 2. Create a free cluster if you don't have one
> 3. Go to **Database → Connect → Drivers**
> 4. Copy the connection string and replace `<username>` / `<password>`
> 5. Whitelist your IP under **Network Access** (or use `0.0.0.0/0` for development)

---

## Setup & Running

```bash
cd backend
cp .env.example .env
npm install
npm run dev     # development with nodemon → http://localhost:5000
# or
npm start       # production
```

---

## Data Models

### User

| Field          | Type     | Notes                                                                          |
|----------------|----------|--------------------------------------------------------------------------------|
| `name`         | String   | Required                                                                       |
| `email`        | String   | Required, unique                                                               |
| `password`     | String   | Hashed with bcrypt (12 salt rounds)                                            |
| `role`         | String   | `"employee"` or `"manager"` — **not** `"employer"`                            |
| `department`   | String   | Lowercase enum: `"engineering"`, `"marketing"`, `"sales"`, `"hr"` — Required  |
| `leaveBalance` | Object   | `{ annual: 20, sick: 10, casual: 7 }` set as defaults on creation             |

> ⚠️ `department` must be **lowercase**. Existing users with capitalised department values (e.g. `"Engineering"`) will not match the manager's department filter and will be invisible to managers.

### Leave

| Field            | Type     | Notes                                                                                                               |
|------------------|----------|---------------------------------------------------------------------------------------------------------------------|
| `employee`       | ObjectId | Ref: User — populated with `name`, `email`, `department` on list queries                                           |
| `leaveType`      | String   | `"Annual Leave"`, `"Sick Leave"`, `"Casual Leave"`, `"Maternity Leave"`, `"Paternity Leave"`, `"Unpaid Leave"`     |
| `startDate`      | Date     | Required                                                                                                            |
| `endDate`        | Date     | Required                                                                                                            |
| `reason`         | String   | Required                                                                                                            |
| `status`         | String   | `"Pending"` (default), `"Approved"`, `"Rejected"` — **capitalized**                                               |
| `managerComment` | String   | Optional — set by manager when reviewing a request                                                                  |

---

## REST API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

#### `POST /api/auth/signup`
Register a new user.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "employee",
  "department": "engineering"
}
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "...", "department": "..." }
}
```

---

#### `POST /api/auth/login`
Login and receive a JWT.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": "...", "name": "...", "email": "...", "role": "...", "department": "..." }
}
```

---

### Leaves — `/api/leave`

#### `POST /api/leave/apply`
Submit a new leave request. **Role:** `employee`

**Request body:**
```json
{
  "leaveType": "Annual Leave",
  "startDate": "2025-08-01",
  "endDate": "2025-08-05",
  "reason": "Family holiday"
}
```

**Response `201`:**
```json
{
  "message": "Leave request submitted",
  "leave": { ...LeaveRequest }
}
```

---

#### `GET /api/leave/my`
Get the authenticated employee's own leave requests. **Role:** `employee`

**Query params:**

| Param   | Default | Description      |
|---------|---------|------------------|
| `page`  | `1`     | Page number      |
| `limit` | `10`    | Results per page |

**Response `200`:**
```json
{
  "message": "Leave requests fetched",
  "leaves": [ ...LeaveRequest[] ],
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### `GET /api/leave/all`
Get all leave requests for the manager's department. **Role:** `manager`

> Managers can only see leaves from employees in **their own department**.

**Query params:**

| Param   | Default | Description      |
|---------|---------|------------------|
| `page`  | `1`     | Page number      |
| `limit` | `10`    | Results per page |

**Response `200`:**
```json
{
  "message": "All leave requests fetched",
  "leaves": [ ...LeaveRequest[] ],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

Each leave object includes the populated `employee` field:
```json
"employee": {
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department": "engineering"
}
```

---

#### `PUT /api/leave/:id`
Approve or reject a leave request. **Role:** `manager`

**Request body:**
```json
{
  "status": "Approved",
  "managerComment": "Enjoy your time off!"
}
```

- `status` must be `"Approved"` or `"Rejected"` (capitalized)
- `managerComment` is optional

**Response `200`:**
```json
{
  "message": "Leave status updated",
  "leave": { ...updated LeaveRequest }
}
```

---

### User — `/api/user`

#### `GET /api/user/leave-balance`
Get the authenticated employee's remaining leave balance. **Role:** `employee`

**Response `200`:**
```json
{
  "message": "Leave balance fetched",
  "balance": {
    "annual": 15,
    "sick": 8,
    "casual": 5
  }
}
```

---

## Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** authentication with configurable expiry via `JWT_EXPIRES_IN`
- `authMiddleware.js` (`protect`) — verifies the token and attaches the decoded user to `req.user` on every protected route
- `roleMiddleware.js` (`authorize`) — checks `req.user.role` against the allowed roles for the route; returns `403` if unauthorized
- Managers are department-scoped — `getAllLeaves` filters by `req.user.department`, so managers cannot see or action leaves outside their department

---

## Leave Types

| Value             | Notes                              |
|-------------------|------------------------------------|
| `Annual Leave`    | Deducted from `leaveBalance.annual` |
| `Sick Leave`      | Deducted from `leaveBalance.sick`   |
| `Casual Leave`    | Deducted from `leaveBalance.casual` |
| `Maternity Leave` | No balance deduction               |
| `Paternity Leave` | No balance deduction               |
| `Unpaid Leave`    | No balance deduction               |

---

## Deployment

### Railway / Render / Fly.io
1. Set all environment variables from `.env.example` in your hosting provider's dashboard
2. Set `NODE_ENV=production`
3. Start command: `npm start`

### Frontend connection
Set `VITE_API_BASE_URL` in the frontend `.env` to your deployed backend URL:
```
VITE_API_BASE_URL=https://your-backend.railway.app
```