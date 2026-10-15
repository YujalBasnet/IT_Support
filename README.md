# IT Support System

A full-stack IT support ticket management system built with React, Vite, Tailwind CSS, Node.js, Express, and MySQL.

The application provides a central place for employees to submit support tickets, support agents to manage and resolve requests, and administrators to manage users, teams, categories, and system access.

## Features

- User authentication with Google OAuth 2.0
- JWT-based authorization
- Role-based access control for:
  - Employees
  - Support agents
  - Administrators
- Create, view, update, and manage IT support tickets
- Ticket categories and team assignment
- File attachments for tickets
- User and team management
- Email notifications through SMTP
- MySQL database integration
- Centralized API error handling
- Responsive React frontend

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React
- Oxlint

### Backend

- Node.js
- Express 5
- MySQL with `mysql2`
- JSON Web Tokens
- Google Authentication Library
- `bcryptjs`
- Multer for file uploads
- Nodemailer for email delivery
- Helmet and CORS

## Project Structure

```text
IT_Support/
├── backend/
│   ├── controllers/       # Request and business logic controllers
│   ├── database/           # MySQL connection and database utilities
│   ├── middleware/         # Authentication and error-handling middleware
│   ├── routes/             # Authentication, ticket, user, team, category, and attachment routes
│   ├── services/           # Email and OAuth-related services
│   ├── uploads/            # Uploaded ticket attachments
│   ├── index.js            # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/             # Static frontend assets
│   ├── src/
│   │   ├── assets/         # Application assets
│   │   ├── components/     # Reusable React components
│   │   ├── layout/         # Shared page layouts
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API and frontend service modules
│   │   ├── App.jsx         # Application routes and root component
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js 18 or later
- npm
- MySQL 8 or later
- A Google Cloud OAuth 2.0 client, if Google login is enabled
- An SMTP account, if email notifications are enabled

## Installation

Clone the repository and install dependencies for both applications:

```bash
git clone https://github.com/YujalBasnet/IT_Support.git
cd IT_Support

cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside the `backend` directory. Do not commit this file to version control.

```env
# Server
PORT=5000

# MySQL database
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SMTP email configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=your_sender_email@example.com
```

Configure the Google OAuth redirect URI to match the backend callback used by the application:

```text
http://localhost:5000/auth/google/callback
```

If the frontend or backend URLs change, update the corresponding redirect and callback configuration in the application.

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The API server runs at:

```text
http://localhost:5000
```

To start the backend without Nodemon:

```bash
node index.js
```

### Start the frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will display the local development URL, normally:

```text
http://localhost:5173
```

## API Areas

The backend exposes route groups for:

- `/auth` - Authentication and Google OAuth
- `/tickets` - Ticket creation and ticket management
- `/users` - User-related operations
- `/teams` - Support team management
- `/attachments` - Ticket attachment uploads and access
- `/categories` - Ticket category management

The root endpoint can be used as a basic server health check:

```text
GET http://localhost:5000/
```

## Available Scripts

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build locally |

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express server with Nodemon |
| `node index.js` | Start the Express server directly |

## Email Configuration Test

The backend includes a utility for checking the SMTP connection and sending a test email:

```bash
cd backend
node testEmail.js
```

Make sure the SMTP environment variables are configured before running this command.

## Security Notes

- Keep `.env` files and credentials out of source control.
- Use a strong, unique value for `JWT_SECRET`.
- Configure production CORS origins instead of allowing unrestricted origins.
- Use HTTPS in production.
- Protect uploaded files and validate file types and sizes.
- Use production database credentials only in secure deployment environments.

## Production Considerations

Before deploying, update the application to use production-specific values for:

- Frontend and backend URLs
- Google OAuth redirect URIs
- CORS configuration
- Database credentials
- JWT secrets
- SMTP configuration
- File storage and upload handling

Build the frontend with:

```bash
cd frontend
npm run build
```

## License

No license has been specified for this repository yet.

## Author

Developed by [YujalBasnet](https://github.com/YujalBasnet) & [YogeshPhuyal](https://github.com/yogeshphuyal85-dev)
