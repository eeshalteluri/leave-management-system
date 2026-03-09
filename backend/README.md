# Leave Management System — Backend

This repository contains the **backend API** for the Leave Management System.
It provides REST APIs that allow employees to apply for leave and employers to approve or reject those requests.

The backend is built using **Node.js, Express, TypeScript, and MongoDB Atlas**, and follows a clean **Controller → Service → Model architecture** for better maintainability and scalability.

---

# Tech Stack

* **Node.js**
* **Express.js**
* **TypeScript**
* **MongoDB Atlas**
* **Mongoose**
* **JWT Authentication**
* **bcryptjs** for password hashing

---

# Architecture

The backend follows a layered architecture:

Route → Controller → Service → Model → Database

### Routes

Define API endpoints and map them to controllers.

### Controllers

Handle HTTP request/response logic and input validation.

### Services

Contain business logic and interact with models.

### Models

Define MongoDB schemas and interact with the database.

---

# Project Structure

```
backend
│
├── src
│
│   ├── config
│   │   └── db.ts
│
│   ├── controllers
│   │   ├── authController.ts
│   │   └── leaveController.ts
│
│   ├── services
│   │   ├── authService.ts
│   │   └── leaveService.ts
│
│   ├── middleware
│   │   ├── authMiddleware.ts
│   │   └── roleMiddleware.ts
│
│   ├── models
│   │   ├── User.ts
│   │   └── Leave.ts
│
│   ├── routes
│   │   ├── authRoutes.ts
│   │   └── leaveRoutes.ts
│
│   ├── types
│   │   └── auth.ts
│
│   └── server.ts
│
├── .env
├── package.json
└── tsconfig.json
```

---

# Authentication

Authentication is implemented using **JSON Web Tokens (JWT)**.

Workflow:

1. User logs in with email and password
2. Server verifies credentials
3. Server generates a JWT token
4. Token is returned to the client
5. Client sends the token in the `Authorization` header for protected routes

Example header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# Role-Based Access Control

The system supports two user roles:

* **employee**
* **employer**

Middleware ensures that users can only access routes permitted for their role.

Examples:

Employee routes:

* Apply for leave
* View their leave requests

Employer routes:

* View all leave requests
* Approve or reject leave requests

---

# API Endpoints

## Authentication

### Register User

POST /api/auth/signup

Request body:

```
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "employee"
}
```

---

### Login User

POST /api/auth/login

Request body:

```
{
  "email": "john@example.com",
  "password": "123456"
}
```

Response:

```
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {}
}
```

---

# Leave Management

## Apply for Leave (Employee)

POST /api/leave/apply

Body:

```
{
  "leaveType": "Sick Leave",
  "startDate": "2026-03-10",
  "endDate": "2026-03-12",
  "reason": "Medical leave"
}
```

---

## View Own Leave Requests (Employee)

GET /api/leave/my

Returns all leave requests created by the logged-in employee.

---

## View All Leave Requests (Employer)

GET /api/leave/all

Returns all leave requests submitted by employees.

---

## Update Leave Status (Employer)

PUT /api/leave/:id

Body:

```
{
  "status": "Approved"
}
```

or

```
{
  "status": "Rejected"
}
```

---

# Environment Variables

Create a `.env` file in the backend directory.

Example:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

---

# Installation

Clone the repository:

```
git clone https://github.com/your-username/leave-management-system.git
```

Navigate to the backend folder:

```
cd backend
```

Install dependencies:

```
npm install
```

---

# Running the Server

Start the development server:

```
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

# Database

The backend uses **MongoDB Atlas** as the database.

Collections used:

* **Users**
* **Leaves**

---

# Error Handling

Basic error handling is implemented using:

* try/catch blocks
* meaningful HTTP status codes
* descriptive error messages

Example response:

```
{
  "message": "Unauthorized"
}
```

---

# Future Improvements

Potential improvements for production readiness:

* Request validation using Zod or Joi
* Global error handling middleware
* Pagination for leave requests
* Logging system
* Unit and integration testing
* Rate limiting for API security

---

# Author

Developed as part of a technical assignment demonstrating backend development using modern Node.js and TypeScript practices.
