# IT Service Desk & Support Management System

A professional, full-stack IT service desk and support ticket management application built with **Node.js, Express.js, MySQL, React, and Tailwind CSS**. 

The system provides a centralized platform for employees to report IT issues and service requests, support agents to manage, triage, and resolve tickets, and administrators to oversee users, support teams, categories, audit logs, and system access.

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Technologies & Libraries](#technologies--libraries)
- [System Architecture & ER Diagram](#system-architecture--er-diagram)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup & Seeding](#database-setup--seeding)
- [Google OAuth Setup](#google-oauth-setup)
- [Running the Application](#running-the-application)
- [API Documentation (Swagger/OpenAPI)](#api-documentation-swaggeropenapi)
- [Postman Collection & Testing](#postman-collection--testing)
- [Required Deliverables Checklist](#required-deliverables-checklist)
- [Author & License](#author--license)

---

## Project Overview

The **IT Service Desk & Support Management System** is designed for organizations to manage internal technical support operations with strict role-based access control, comprehensive validation, audit trails, and automated email notifications.

### User Roles & Capabilities

1. **Employee (`Role 1`)**:
   - Log in using Google OAuth 2.0 or Email/Password.
   - View profile and personal ticket history.
   - Create IT support tickets with custom categories and priority levels.
   - Attach files (screenshots, logs, PDFs up to 10MB).
   - Add public comments to ticket discussion threads.
   - Reopen or close eligible resolved tickets.

2. **Support Agent (`Role 2`)**:
   - View tickets assigned directly to them or belonging to their support team.
   - Update ticket status workflow (`IN_PROGRESS`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`).
   - Change ticket priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
   - Post public comments or add **internal comments** (strictly hidden from ticket requesters).
   - Upload and review attachments.
   - View complete ticket history timeline.

3. **Administrator / Support Manager (`Role 3`)**:
   - Manage all users: change user roles and activate/deactivate accounts.
   - Manage support teams: create teams, add/remove member agents.
   - Manage ticket categories: create, edit, enable/disable, and delete categories.
   - Assign and reassign tickets to agents and teams.
   - Update ticket information and priority.
   - Inspect immutable **System Audit Logs** with date, action, and resource filtering.
   - Access comprehensive ticket metrics and analytics.

---

## Technologies & Libraries

### Backend
- **Runtime & Framework**: Node.js (v18+), Express.js 5
- **Database**: MySQL 8.0+ with `mysql2` (connection pooling and transactional support)
- **Authentication**: Google Auth Library (`google-auth-library`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **File Uploads**: `multer`, `file-type` (magic number MIME verification)
- **Email Delivery**: `nodemailer` (SMTP notifications)
- **API Documentation**: `swagger-ui-express`, `swagger-jsdoc` (OpenAPI 3.0)
- **Security**: `helmet`, `cors`, parameterized SQL queries (SQL injection prevention)

### Frontend
- **Framework**: React 19, Vite
- **Routing**: React Router DOM (v7)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT request interceptors

---

## System Architecture & ER Diagram

The database enforces a clean, normalized relational structure across 10 tables:
* `roles`, `users`, `support_teams`, `team_members`, `categories`, `tickets`, `comments`, `attachments`, `ticket_history`, and `audit_logs`.

For full entity attributes, foreign keys, and visual Mermaid diagrams, refer to [ER_DIAGRAM.md](file:///d:/IT_Support/backend/database/ER_DIAGRAM.md).

---

## Project Structure

```text
IT_Support/
├── backend/
│   ├── config/              # Swagger/OpenAPI configuration
│   ├── controllers/         # Business logic (tickets, auth, teams, users, categories, audit logs)
│   ├── database/            # Database schema, seed data, and initDb.js runner
│   │   ├── ER_DIAGRAM.md    # Complete Entity-Relationship documentation
│   │   ├── schema.sql       # MySQL table creation DDL
│   │   ├── seed.sql         # SQL seed data
│   │   └── initDb.js        # Automated database migration and seeder
│   ├── middleware/          # JWT auth, RBAC guards, multer, error handler
│   ├── routes/              # Modular REST API routes (/api/* and /*)
│   ├── services/            # Email notifications and audit logging service
│   ├── uploads/             # Secured attachment file storage
│   ├── .env.example         # Template configuration variables (Deliverable #6)
│   ├── index.js             # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Forms, navigation, protected routes
│   │   ├── layout/          # Shared dashboard layout with responsive sidebar
│   │   ├── pages/           # Dashboards (Employee, Agent, Admin) and Admin Audit Logs
│   │   ├── services/        # Axios API client
│   │   └── App.jsx          # Route definitions
│   └── package.json
├── postman/                 # Postman API Collection & Environment (Deliverable #3)
│   ├── IT_Service_Desk_API.postman_collection.json
│   └── IT_Support.postman_environment.json
└── README.md
```

---

## Prerequisites

Ensure you have the following installed locally:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL Server** (v8.0 or higher) running locally on port 3306

---

## Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
# 1. Clone repository
git clone https://github.com/YujalBasnet/IT_Support.git
cd IT_Support

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Configuration

Create a `.env` file inside the `backend/` directory based on the provided [`.env.example`](file:///d:/IT_Support/backend/.env.example):

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your local settings:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=it_support
DB_PORT=3306

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# SMTP Email Configuration (Gmail / SendGrid / Mailtrap)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password
EMAIL_FROM="IT Support <support@yourdomain.com>"
```

> [!NOTE]
> Never commit your real `.env` file containing secrets to version control.

---

## Database Setup & Seeding

You can initialize and seed the database with **one single automated command**:

```bash
cd backend
npm run db:init
```

### What this script does:
1. Connects to your local MySQL instance.
2. Creates the `it_support` database if it does not already exist.
3. Executes [`schema.sql`](file:///d:/IT_Support/backend/database/schema.sql) to build all 10 relational tables.
4. Pre-seeds essential default roles, categories, support teams, and pre-configured test users:

| Email | Default Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **`admin@itsupport.com`** | `Password@123` | **ADMIN** | Full administrative system access |
| **`agent@itsupport.com`** | `Password@123` | **SUPPORT_AGENT** | Assigned to Tier 1 Helpdesk team |
| **`employee@itsupport.com`** | `Password@123` | **EMPLOYEE** | Regular employee submitting tickets |

---

## Google OAuth Setup

To enable Google sign-in:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Configure the **OAuth Consent Screen** (User Type: External).
5. Click **Create Credentials > OAuth client ID**:
   - **Application type**: Web application
   - **Name**: IT Support System
   - **Authorized JavaScript origins**: `http://localhost:5173` and `http://localhost:5000`
   - **Authorized redirect URIs**: `http://localhost:5000/auth/google/callback` and `http://localhost:5000/api/auth/google/callback`
6. Copy the generated **Client ID** and **Client Secret** into your `backend/.env` file.

---

## Running the Application

### 1. Start the Backend API Server
```bash
cd backend
npm run dev
```
The server will start at: `http://localhost:5000`

### 2. Start the Frontend React Client
In a separate terminal window:
```bash
cd frontend
npm run dev
```
The Vite development server will open at: `http://localhost:5173`

---

## API Documentation (Swagger/OpenAPI)

Interactive API documentation generated with OpenAPI 3.0 is available directly from your browser:

* **URL**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

The Swagger documentation provides:
* All 29 REST endpoints categorized under Authentication, Tickets, Comments, Attachments, Categories, Teams, Users, and Audit Logs.
* Interactive **"Try it out"** feature for testing endpoints with JWT authorization.
* Complete data schemas and status code explanations (200, 201, 400, 401, 403, 404, 409, 500).

---

## Postman Collection & Testing

A complete, pre-configured Postman collection and environment are provided in the [`postman/`](file:///d:/IT_Support/postman/) directory.

### How to Import and Use:
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop the following two files:
   - [`postman/IT_Service_Desk_API.postman_collection.json`](file:///d:/IT_Support/postman/IT_Service_Desk_API.postman_collection.json)
   - [`postman/IT_Support.postman_environment.json`](file:///d:/IT_Support/postman/IT_Support.postman_environment.json)
4. In the top-right corner of Postman, select the active environment: **IT Support Environment**.
5. Open the folder **1. Authentication** and execute **Login as Admin**. The test script will automatically capture the returned JWT and store it in your collection variables.
6. Run the collection using the **Postman Collection Runner** to test all successful requests and failure cases.

### Mandatory Failure Cases Tested (Section 28):
The collection includes automated tests for all 7 required negative scenarios:
1. **Invalid Authentication (401)**: Sending a malformed or expired JWT.
2. **Missing Required Fields (400)**: Creating a ticket with blank title/description.
3. **Invalid Ticket ID (404)**: Accessing non-existent ticket ID `999999`.
4. **Unauthorized Access (401)**: Requesting protected routes without Bearer token.
5. **Forbidden Access (403)**: Employee attempting to access administrator endpoints.
6. **Invalid File Type (400)**: Uploading disallowed file extensions.
7. **Invalid Status Transition (400/403)**: Employee attempting to jump directly to `RESOLVED`.

---

## Required Deliverables Checklist

All deliverables mandated by **Section 34 (Page 21)** are fully completed and available in this repository:

| # | Deliverable | Location in Repository | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Source Code** | Complete backend in [`backend/`](file:///d:/IT_Support/backend/) and frontend in [`frontend/`](file:///d:/IT_Support/frontend/) | ✅ Complete |
| **2** | **Database** | [`schema.sql`](file:///d:/IT_Support/backend/database/schema.sql), [`ER_DIAGRAM.md`](file:///d:/IT_Support/backend/database/ER_DIAGRAM.md), [`initDb.js`](file:///d:/IT_Support/backend/database/initDb.js), [`seed.sql`](file:///d:/IT_Support/backend/database/seed.sql) | ✅ Complete |
| **3** | **Postman Collection** | [`postman/IT_Service_Desk_API.postman_collection.json`](file:///d:/IT_Support/postman/IT_Service_Desk_API.postman_collection.json) | ✅ Complete |
| **4** | **API Documentation** | Swagger UI at `http://localhost:5000/api-docs` via [`swagger.js`](file:///d:/IT_Support/backend/config/swagger.js) | ✅ Complete |
| **5** | **README** | This file ([`README.md`](file:///d:/IT_Support/README.md)) with full instructions | ✅ Complete |
| **6** | **Environment Example** | [`backend/.env.example`](file:///d:/IT_Support/backend/.env.example) | ✅ Complete |
| **7** | **Final Demonstration** | Pre-configured test accounts and frontend dashboard ready for live demo | ✅ Ready |

---

## Author & License

Developed for the **IT Service Desk & Support Management System** specification.
All rights reserved.
