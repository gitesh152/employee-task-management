# Employee Task Management System

A full-stack web application for managing employee tasks with real-time notifications, role-based access control, and task assignment capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [License](#license)

## ✨ Features

### Core Functionality
- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Role-based access control (Admin, Employee)
  - Remember me functionality
  - Token refresh mechanism

- **Task Management**
  - Create, read, update, and delete tasks
  - Assign tasks to employees
  - Set task priority (Low, Medium, High)
  - Track task status (Pending, In Progress, Completed)
  - Add attachments to tasks
  - Task filtering and sorting

- **Notifications**
  - Real-time task notifications
  - Task assignment alerts
  - Task due date reminders
  - Task completion notifications
  - Scheduled notification system

- **Employee Management**
  - View employee list
  - Manage employee details
  - Department and designation management
  - Generate task reports

- **Security Features**
  - Rate limiting on API endpoints
  - CORS protection
  - CSRF protection with helmet
  - Request validation with Joi
  - Input sanitization

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5.x
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcrypt
- **Validation**: Joi
- **API Documentation**: Available via endpoint structure
- **Development**: ESLint, Prettier, Nodemon

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS 4.x
- **Package Manager**: npm

## 📁 Project Structure

```
employee-task-management/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── server.js              # Server entry point
│   │   ├── config/                # Configuration files
│   │   │   ├── database.config.js
│   │   │   └── env.config.js
│   │   ├── controllers/           # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── report.controller.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── user.route.js
│   │   │   ├── task.route.js
│   │   │   └── report.route.js
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── task.notification.service.js
│   │   │   └── task.notification.scheduler.js
│   │   ├── middlewares/           # Express middlewares
│   │   │   ├── authentication.middleware.js
│   │   │   ├── authorization.middleware.js
│   │   │   ├── error.handler.middleware.js
│   │   │   └── request.validation.middleware.js
│   │   ├── utils/                 # Utility functions
│   │   │   ├── token.util.js
│   │   │   ├── email.util.js
│   │   │   ├── logger.util.js
│   │   │   └── task.attachment.util.js
│   │   ├── validations/           # Input validation schemas
│   │   │   ├── auth.validation.js
│   │   │   ├── user.validation.js
│   │   │   └── task.validation.js
│   │   └── constants/             # Application constants
│   │       └── roles.constant.js
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # Database migrations
│   │   └── database.sql           # Database script
│   ├── scripts/
│   │   └── seed-users-tasks.js
│   ├── uploads/                   # Task attachments
│   │   └── tasks/
│   ├── package.json
│   ├── .env.example
│   └── prisma.config.ts
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Root component
│   │   ├── app/
│   │   │   ├── api.js             # API client
│   │   │   ├── store.js           # Redux store
│   │   │   └── uiSlice.js         # UI state management
│   │   ├── components/            # Reusable components
│   │   │   ├── AppShell.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── FormField.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   ├── features/              # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── employees/
│   │   │   └── reports/
│   │   └── utils/                 # Utility functions
│   │       └── format.js
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md (this file)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **MySQL Server** (v8.0 or higher) - [Download](https://www.mysql.com/downloads/)

Verify installations:
```bash
node --version
npm --version
git --version
mysql --version
```

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/gitesh152/employee-task-management.git
cd employee-task-management
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration (Railway)
# Get DATABASE_URL from your Railway dashboard: railway.app
DATABASE_URL=mysql://root:password@gateway.railway.app:port/railway_db

# JWT Secrets (Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"; )
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# JWT Expiration
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# JWT issuer and audience (claims inside JWT)

# issuer - ensure token was created by your service
JWT_ISSUER=myapp-jwt-auth

# audience - ensure token was meant for your app
JWT_AUDIENCE=myapp-jwt-auth-client

# Email Configuration (for notifications)
SMTP_HOST=smtp.domain.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Employee Task Management <admin@domain.com>

# seed password for seed script (for seeding users and their tasks - optional)
SEED_PASSWORD=Dummy@123
```

> NOTE: Since admin creates tasks and sends notifications, use the admin account's email address in `SMTP_FROM`.
>

> **IMPORTANT:** The first admin user is not created automatically. After registering a user, update that user's role to `ADMIN` directly in the database so it can access admin features.

### 3. Database Setup

#### Configure Railway MySQL
1. Create a database on [Railway](https://railway.app)
2. Copy the MySQL connection string from Railway dashboard
3. Update the `DATABASE_URL` in your `.env` file

#### Initialize and Migrate Database with Prisma

**Apply Migrations to Database:**
```bash
# From backend directory
cd backend

# Deploy all pending migrations to the database
npx prisma migrate deploy
```

This command will:
- Execute all migration files in `prisma/migrations/` folder
- Create all database tables, indexes, and constraints
- Track applied migrations in `_prisma_migrations` table
- Create a new Prisma Client for database operations

**Check Migration Status:**
```bash
# View which migrations have been applied
npx prisma migrate status
```

**Generate Prisma Client (if needed):**
```bash
# Regenerate Prisma Client after schema changes
npx prisma generate
```

**View Database in Prisma Studio (Optional):**
```bash
# Open interactive database browser
npx prisma studio
# Opens at http://localhost:5555
```

### 4. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=/api
```

## 🗄️ Database Setup

### Railway MySQL Connection
The application uses Railway for MySQL database hosting. The Prisma migrations will automatically create all required tables and schemas.

### Migration System

This project uses Prisma Migrations to manage database schema changes:

**Migration Files Location:** `backend/prisma/migrations/`

**Current Migrations:**
- `20260708095251_init/` - Initial schema setup

**How Migrations Work:**
1. Migration files contain SQL statements that define database changes
2. When you run `npx prisma migrate deploy`, it executes all pending migrations
3. Applied migrations are tracked in the `_prisma_migrations` table
4. This ensures your database schema stays in sync across environments

### Database Script
A complete SQL schema script (`database.sql`) is provided in the `backend/prisma/` directory for reference.

### Database Schema Overview

The application uses the following main tables:

- **User** - Stores user accounts and profiles
- **RefreshToken** - Manages JWT refresh tokens
- **Task** - Task records with assignments
- **Attachment** - File attachments for tasks
- **Notification** - User notifications

For detailed schema information, see [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

## ▶️ Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build (Frontend)
```bash
cd frontend
npm run build
npm run preview
```

### Database Commands Reference

**Common Prisma Commands:**
```bash
# Apply all pending migrations
npx prisma migrate deploy

# Check status of migrations
npx prisma migrate status

# View database in browser UI
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (development only - ⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Create a new migration (for schema changes)
npx prisma migrate dev --name migration_name
```

### 🌱 Utility Scripts

The application provides helper scripts for development and testing:

#### Seed Database with Test Users and Tasks
The `seed-users-tasks.js` script populates the database with test users and sample tasks for development and testing purposes.

**Prerequisites:**
- Set the `SEED_PASSWORD` environment variable in your `.env` file:
```env
SEED_PASSWORD=your_secure_password_here
```

**Run the Seed Script:**
```bash
cd backend
node scripts/seed-users-tasks.js
```

**What it creates:**
- Test users with various roles and departments (Engineering, Product, Design, QA)
- Sample tasks with different priorities and statuses
- Task assignments across multiple users
- Seed users are created with emails on `yopmail.com` (temporary email service for testing)

**Default Seed Users:**
- seed.user.one@yopmail.com (Engineering - Developer)
- seed.user.two@yopmail.com (Product - Product Manager)
- seed.user.three@yopmail.com (Design - Designer)
- seed.user.four@yopmail.com (QA - QA Engineer)

All seed users are created with the password specified in `SEED_PASSWORD`.

#### Send Test Email
The `send-test-email.js` script verifies that your SMTP email configuration is working correctly.

**Prerequisites:**
- Configure SMTP settings in your `.env` file:
```env
SMTP_HOST=smtp.domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=Employee Task Management <admin@domain.com>
```

**Run the Test Email Script:**
```bash
cd backend

# Send test email to default recipient (temp@yopmail.com)
node scripts/send-test-email.js

# Send test email to a specific recipient
node scripts/send-test-email.js your-email@example.com
```

**Output:**
The script will display the email sending result including message ID and any errors if the SMTP connection fails.

### Health Check
```bash
npm run health
```

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/upload` - Upload task attachment

### Report Endpoints
- `GET /api/reports/summary` - Get task summary report
- `GET /api/reports/employee/:id` - Get employee task report

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Redux Store (Auth, Tasks, UI State)               │   │
│  │  React Router (Page Navigation)                    │   │
│  │  Tailwind CSS (Styling)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Auth, Users, Tasks, Reports)          │  │
│  │  Controllers (Business Logic)                        │  │
│  │  Services (Task Notifications, Email, Auth)         │  │
│  │  Middlewares (Auth, Validation, Error Handling)     │  │
│  │  Utils (JWT, Email, Logger, File Upload)           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────┐       ┌─────────┐    ┌──────────┐
    │ MySQL  │       │ Email   │    │  File    │
    │Database│       │ Service │    │ Storage  │
    └────────┘       └─────────┘    └──────────┘
```

### Data Flow

```
User Input (Frontend)
        │
        ▼
Redux Action / Dispatch
        │
        ▼
API Request (HTTP/REST)
        │
        ▼
Express Middleware (Auth, Validation)
        │
        ▼
Route Handler / Controller
        │
        ▼
Service Layer (Business Logic)
        │
        ▼
Prisma ORM Query
        │
        ▼
MySQL Database
        │
        ▼
Response (JSON)
        │
        ▼
Redux State Update
        │
        ▼
React Component Re-render
        │
        ▼
Updated UI
```

## 📦 Build and Deployment

### Build Backend
```bash
cd backend
npm run lint
npm run format
```

### Build Frontend
```bash
cd frontend
npm run build
```

Production files will be in `frontend/dist/`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Bcrypt Hashing** - Password encryption
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Cross-origin resource sharing control
- **Helmet** - HTTP security headers
- **Input Validation** - Joi schema validation
- **CSRF Protection** - Token-based CSRF prevention
- **Secure Cookies** - HTTPOnly, SameSite flags
- **Authorization Middleware** - Role-based access control

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Verify DATABASE_URL in .env
# Format: mysql://username:password@host:port/database_name
```

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### Prisma Sync Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Check migration status
npx prisma migrate status

# Reset database (development only - ⚠️ DELETES ALL DATA!)
npx prisma migrate reset
```

### Migration Issues
```bash
# If migrations are stuck or conflicted:
# 1. Check status
npx prisma migrate status

# 2. View the failed migration details in prisma/migrations/ folder

# 3. Fix the migration file or contact the development team

# 4. Retry deployment
npx prisma migrate deploy
```

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributors

- gitesh152
- Hemant350 (Collaborator)

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Last Updated**: July 2026
**Version**: 1.0.0
