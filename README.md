# IT Support System

A full-stack IT support ticket management application designed for organizations to streamline support requests, ticket tracking, user management, and team coordination.

Employees can submit support requests, support agents can update and resolve tickets, and administrators can manage users, teams, categories, roles, attachments, and access control.

## Overview

This project consists of:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MySQL
- Authentication: JWT + Google OAuth 2.0
- File handling: Multer
- Email notifications: Nodemailer
- API documentation: Swagger UI

## Features

- Secure authentication and authorization
- Role-based access control for employees, support agents, and admins
- Ticket creation, viewing, updating, and status tracking
- Team and category assignment for tickets
- Attachment upload support for support requests
- User and team management tools
- Google OAuth login support
- SMTP-based email notifications
- Responsive web interface
- REST API with centralized error handling

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express 5
- MySQL 8
- MySQL2
- JWT
- Google Auth Library
- bcryptjs
- Multer
- Nodemailer
- Helmet
- CORS
- Swagger UI

## Project Structure

```text
IT_Support/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── index.js
│   ├── package.json
│   └── .env.example (if present in your setup)
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.*
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or newer
- npm
- MySQL 8 or newer
- A Google Cloud OAuth 2.0 client ID and secret (optional if Google login is enabled)
- SMTP credentials for email sending (optional if email notifications are enabled)

## Clone the Repository

```bash
git clone https://github.com/YujalBasnet/IT_Support.git
cd IT_Support
```

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## Environment Setup

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=it_support
JWT_SECRET=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=your_sender_email@example.com
```

Important:

- Do not commit `.env` files to version control.
- Use strong credentials and secrets in local and production environments.
- Update Google OAuth redirect URIs to match your deployed or local app URLs.

## Database Setup

From the backend directory, initialize the database schema and seed data:

```bash
cd backend
npm run db:init
```

This should set up the required MySQL tables and starter data for roles, categories, teams, and users.

## Run the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend API runs on:

```text
http://localhost:5000
```

Swagger documentation is available at:

```text
http://localhost:5000/api-docs
```

### Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

## Main API Areas

The backend includes route groups such as:

- `/auth` — login, registration, and OAuth
- `/tickets` — ticket management
- `/users` — user APIs
- `/teams` — support team management
- `/attachments` — file upload handling
- `/categories` — ticket categories

## Scripts

### Backend

```bash
npm run dev
npm run db:init
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Security Notes

- Store secrets in `.env` files and never commit them
- Protect API routes with proper role checks
- Use HTTPS in production
- Restrict CORS for production deployment
- Validate uploaded files and limit file sizes
- Use secure database credentials in live environments

## Production Considerations

Before deploying, update the following:

- Frontend base URL
- Backend API URL
- Google OAuth redirect URIs
- CORS policies
- JWT secret
- Database credentials
- SMTP configuration

To build the frontend for production:

```bash
cd frontend
npm run build
```

## License

This repository does not currently specify a license.

## Authors

- [YujalBasnet](https://github.com/YujalBasnet)
- [YogeshPhuyal](https://github.com/yogeshphuyal85-dev)

## Contributing

Contributions are welcome. If you want to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Support

For questions or issues, open an issue in the GitHub repository or contact the project maintainer.
