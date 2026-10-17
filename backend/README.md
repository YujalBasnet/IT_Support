# IT Support Backend

The backend service for the **IT Support** application. It provides REST APIs for employee requests, support ticket management, authentication, users, teams, categories, and file attachments.

## Features

- User authentication and authorization
- IT support ticket creation and management
- User and team management
- Ticket category management
- File attachment uploads
- MySQL database integration
- Security middleware with CORS and Helmet
- Email support with Nodemailer
- Interactive API documentation with Swagger
- Centralized error handling

## Technology Stack

- Node.js
- Express.js
- MySQL
- JSON Web Tokens (JWT)
- Multer for file uploads
- Swagger UI for API documentation

## Project Structure

```text
backend/
├── config/          # Application and Swagger configuration
├── controllers/     # Request and business logic controllers
├── database/        # Database connection and related code
├── middleware/      # Authentication and error-handling middleware
├── routes/          # API route definitions
├── services/        # Reusable application services
├── uploads/         # Uploaded attachments
├── index.js         # Application entry point
├── package.json     # Dependencies and scripts
└── .env             # Local environment variables (not committed)
```

## Prerequisites

- Node.js 18 or later
- npm
- MySQL 8 or later

## Installation

From the repository root, run:

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file inside the `backend` directory. Configure it with the values required by your local database, authentication, and email setup.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=it_support
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` or real credentials to the repository.

## Running the Server

Start the development server with Nodemon:

```bash
npm run dev
```

The server runs at:

- API: <http://localhost:5000>
- Swagger documentation: <http://localhost:5000/api-docs>

## Available API Areas

The backend currently exposes routes for:

- `/auth`
- `/tickets`
- `/users`
- `/teams`
- `/attachments`
- `/categories`

Refer to the Swagger documentation at `/api-docs` for available endpoints and request details.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the server with Nodemon |
| `npm test` | Placeholder test command |

## Security Notes

- Keep all secrets in environment variables.
- Do not commit uploaded files or sensitive user data.
- Use a strong, unique `JWT_SECRET` in non-development environments.
- Configure production CORS and security settings before deployment.
