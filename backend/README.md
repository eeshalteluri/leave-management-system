# LeaveDesk — Backend

Node.js / Express / MongoDB REST API for the LeaveDesk leave management system.

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
│   │   └── db.js                 # MongoDB connection (Mongoose)
│   ├── controllers/
│   │   ├── authController.js     # signup, login
│   │   ├── leaveController.js    # apply, getMyLeaves, getAllLeaves, updateLeaveStatus
│   │   └── userController.js     # getLeaveBalance
│   ├── middleware/
│   │   └── auth.js               # protect (JWT verify) + authorize (role check)
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Leave.js              # Leave request schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth/*
│   │   ├── leave.js              # /api/leaves/*
│   │   └── user.js               # /api/user/*
│   └── app.js                    # Express entry point, middleware, route mounting
├── .env.example
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/leavedesk?retryWrites=true&w=majority
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

| Field         | Type     | Notes                                              |
|---------------|----------|----------------------------------------------------|
| `name`        | String   | Required                                           |
| `email`       | String   | Required, unique                                   |
| `password`    | String   | Hashed with bcrypt (12 salt rounds)                |
| `role`        | String   | `"employee"` or `"manager"`                        |
| `department`  | String   | Lowercase enum: `"engineering"`, `"marketing"`, `"sales"`, `"hr"` |
| `leaveBalance`| Object   | `{ annual: 20, sick: 10, casual: 7 }` (defaults)  |

### Leave

| Field            | Type     | Notes                                                             |
|------------------|----------|-------------------------------------------------------------------|
| `employee`       | ObjectId | Ref: User                                                         |
| `leaveType`      | String   | `"Annual Leave"`, `"Sick Leave"`, `"Casual Leave"`, `"Maternity Leave"`, `"Paternity Leave"`, `"Unpaid Leave"` |
| `startDate`      | Date     | Required                                                          |
| `endDate`        | Date     | Required                                                          |
| `reason`         | String   | Required                                                          |
| `status`         | String   | `"Pending"` (default), `"Approved"`, `"Rejected"` — capitalized  |
| `managerComment` | String   | Optional, set when manager reviews the request                    |

---

## REST API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

#### POST `/api/auth/signup`
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

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id", "name", "email", "role", "department" }
}
```

---

#### POST `/api/auth/login`
Login and receive a JWT.

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id", "name", "email", "role", "department" }
}
```

---

### Leaves — `/api/leaves`

#### POST `/api/leaves/apply`
Submit a new leave request. Role: `employee`.

**Request body:**
```json
{
  "leaveType": "Annual Leave",
  "startDate": "2025-08-01",
  "endDate": "2025-08-05",
  "reason": "Family holiday"
}
```

---

#### GET `/api/leaves/my`
Get the authenticated employee's own leave requests. Role: `employee`.

**Query params:**

| Param   | Default | Description          |
|---------|---------|----------------------|
| `page`  | `1`     | Page number          |
| `limit` | `10`    | Results per page     |

**Response:**
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

#### GET `/api/leaves/all`
Get all leave requests for the manager's department. Role: `manager`.

**Query params:**

| Param   | Default | Description          |
|---------|---------|----------------------|
| `page`  | `1`     | Page number          |
| `limit` | `10`    | Results per page     |

**Response:**
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

Each leave object in `leaves` includes the populated `employee` field:
```json
"employee": {
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department": "engineering"
}
```

---

#### PUT `/api/leaves/:id`
Approve or reject a leave request. Role: `manager`.

**Request body:**
```json
{
  "status": "Approved",
  "managerComment": "Enjoy your time off!"
}
```

`managerComment` is optional. `status` must be `"Approved"` or `"Rejected"` (capitalized).

**Response:**
```json
{
  "message": "Leave status updated",
  "leave": { ...updated LeaveRequest }
}
```

---

### User — `/api/user`

#### GET `/api/user/leave-balance`
Get the authenticated employee's remaining leave balance. Role: `employee`.

**Response:**
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
- **JWT** with configurable expiry (`JWT_EXPIRES_IN`)
- `protect` middleware verifies the token on every protected route
- `authorize(...roles)` middleware enforces role-based access control
- Managers are scoped to their own department — they cannot see or action leaves from other departments

---

## Deployment

### Railway / Render / Fly.io
1. Set all environment variables from `.env.example` in your hosting dashboard
2. Set `NODE_ENV=production`
3. Start command: `npm start`

### Frontend connection
Set `VITE_API_BASE_URL` in the frontend `.env` to your deployed backend URL, e.g.:
```
VITE_API_BASE_URL=https://your-backend.railway.app
```