import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IT Service Desk & Support Management API",
      version: "1.0.0",
      description:
        "Comprehensive RESTful API for managing organizational IT support requests, tickets, categories, support teams, attachments, comments, and audit logging.",
      contact: {
        name: "IT Support Engineering",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    tags: [
      { name: "Authentication", description: "OAuth & JWT session management" },
      { name: "Tickets", description: "IT support ticket lifecycle and operations" },
      { name: "Comments", description: "Public and internal ticket discussion threads" },
      { name: "Attachments", description: "Secure file upload and download" },
      { name: "Categories", description: "Ticket category classification management" },
      { name: "Support Teams", description: "Support team groups and agent membership" },
      { name: "Users", description: "User directory, role assignment, and status controls" },
      { name: "Audit Logs", description: "Administrative activity tracking and audit trail" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login or Google OAuth exchange",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error description" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@itsupport.com" },
            profile_image: { type: "string", nullable: true, example: "https://example.com/avatar.jpg" },
            role: { type: "string", enum: ["EMPLOYEE", "SUPPORT_AGENT", "ADMIN"], example: "EMPLOYEE" },
            account_status: { type: "string", enum: ["ACTIVE", "INACTIVE"], example: "ACTIVE" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Ticket: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            ticket_number: { type: "string", example: "IIC-2026-001284" },
            title: { type: "string", example: "Laptop screen flickering when connected to external monitor" },
            description: { type: "string", example: "Dell Latitude 5440 external display flickers constantly." },
            requester_id: { type: "integer", example: 4 },
            assigned_agent_id: { type: "integer", nullable: true, example: 2 },
            team_id: { type: "integer", nullable: true, example: 1 },
            category_id: { type: "integer", example: 1 },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], example: "HIGH" },
            status: {
              type: "string",
              enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED", "REOPENED"],
              example: "OPEN",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            resolved_at: { type: "string", format: "date-time", nullable: true },
            closed_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            ticket_id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 2 },
            user_name: { type: "string", example: "Alex Agent" },
            comment: { type: "string", example: "Please provide the monitor model number." },
            is_internal: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            ticket_id: { type: "integer", example: 1 },
            uploaded_by: { type: "integer", example: 4 },
            original_name: { type: "string", example: "screenshot_error.png" },
            stored_name: { type: "string", example: "1729482910-screenshot_error.png" },
            file_type: { type: "string", example: "image/png" },
            file_size: { type: "integer", example: 245082 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Hardware" },
            description: { type: "string", example: "Physical computers, monitors, peripherals" },
            is_active: { type: "integer", example: 1 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        SupportTeam: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Tier 1 Helpdesk" },
            description: { type: "string", example: "First line support team" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", nullable: true, example: 3 },
            actor_name: { type: "string", example: "IT Administrator" },
            actor_email: { type: "string", example: "admin@itsupport.com" },
            action: { type: "string", example: "USER_ROLE_CHANGED" },
            resource_type: { type: "string", example: "USER" },
            resource_id: { type: "integer", nullable: true, example: 5 },
            changes: { type: "object" },
            created_at: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

export default swaggerJsdoc(options);
