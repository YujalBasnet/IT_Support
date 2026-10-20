# IT Service Desk & Support Management System
## Entity-Relationship (ER) Diagram & Database Design

This document details the database architecture and entity relationships required by the **IT Service Desk & Support Management System** specification (Sections 27 & 34).

---

### Mermaid ER Diagram

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    USERS ||--o{ TICKETS : "creates (requester)"
    USERS ||--o{ TICKETS : "assigned as (agent)"
    SUPPORT_TEAMS ||--o{ TICKETS : "handles"
    CATEGORIES ||--o{ TICKETS : "classifies"
    SUPPORT_TEAMS ||--|{ TEAM_MEMBERS : "has"
    USERS ||--|{ TEAM_MEMBERS : "belongs to"
    TICKETS ||--o{ COMMENTS : "contains"
    USERS ||--o{ COMMENTS : "authors"
    TICKETS ||--o{ ATTACHMENTS : "includes"
    USERS ||--o{ ATTACHMENTS : "uploads"
    TICKETS ||--o{ TICKET_HISTORY : "tracks"
    USERS ||--o{ TICKET_HISTORY : "triggers"
    USERS ||--o{ AUDIT_LOGS : "performed by"

    ROLES {
        int id PK
        varchar name "EMPLOYEE | SUPPORT_AGENT | ADMIN"
        varchar description
        timestamp created_at
    }

    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar profile_image
        int role_id FK
        enum account_status "ACTIVE | INACTIVE"
        timestamp created_at
        timestamp updated_at
    }

    SUPPORT_TEAMS {
        int id PK
        varchar name UK
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TEAM_MEMBERS {
        int id PK
        int team_id FK
        int user_id FK
        timestamp joined_at
    }

    CATEGORIES {
        int id PK
        varchar name UK
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TICKETS {
        int id PK
        varchar ticket_number UK "e.g. IIC-2026-001284"
        varchar title
        text description
        int requester_id FK
        int assigned_agent_id FK
        int team_id FK
        int category_id FK
        enum priority "LOW | MEDIUM | HIGH | URGENT"
        enum status "OPEN | ASSIGNED | IN_PROGRESS | WAITING_FOR_USER | RESOLVED | CLOSED | REOPENED"
        timestamp created_at
        timestamp updated_at
        timestamp resolved_at
        timestamp closed_at
    }

    COMMENTS {
        int id PK
        int ticket_id FK
        int user_id FK
        text comment
        boolean is_internal "Hidden from Employees"
        timestamp created_at
        timestamp updated_at
    }

    ATTACHMENTS {
        int id PK
        int ticket_id FK
        int uploaded_by FK
        varchar original_name
        varchar stored_name
        varchar file_path
        varchar file_type
        bigint file_size
        timestamp created_at
    }

    TICKET_HISTORY {
        int id PK
        int ticket_id FK
        int user_id FK
        varchar action
        text previous_value
        text new_value
        timestamp created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        varchar action
        varchar resource_type
        int resource_id
        json changes
        timestamp created_at
    }
```

---

### Entity Descriptions & Relationships

1. **`roles`**:
   - `id = 1`: `EMPLOYEE` — can create tickets, view own tickets, add public comments, upload attachments, reopen resolved tickets.
   - `id = 2`: `SUPPORT_AGENT` — can view assigned tickets and team tickets, change status/priority, add internal comments.
   - `id = 3`: `ADMIN` — can manage users, support teams, categories, reassign tickets, and view audit logs.

2. **`users`**:
   - Authenticated via Google OAuth 2.0 or Email/Password with JWT.
   - Tied to a single role (`roles.id`).
   - Account status can be toggled (`ACTIVE` or `INACTIVE`).

3. **`support_teams` & `team_members`**:
   - Support teams group agents (e.g., Tier 1 Helpdesk, Infrastructure, Applications).
   - Many-to-many relationship with `users` through `team_members` (`team_id`, `user_id`).

4. **`categories`**:
   - Ticket classification (`Hardware`, `Software`, `Network`, `Account Access`, `Email`, `Security`, `Other`).
   - Can be enabled, disabled, created, and updated by Admins.

5. **`tickets`**:
   - Primary operational entity. Each ticket has a unique human-readable ticket number (e.g., `IIC-2026-001284`).
   - Tracks status transitions through the lifecycle: `OPEN` -> `ASSIGNED` -> `IN_PROGRESS` -> `WAITING_FOR_USER` -> `RESOLVED` -> `CLOSED` (or `REOPENED`).
   - Captures `resolved_at` and `closed_at` timestamps for SLA/metrics.

6. **`comments`**:
   - Collaboration trail.
   - `is_internal` boolean: when `1`, the comment is strictly isolated to Support Agents and Admins, completely hidden from the ticket requester.

7. **`attachments`**:
   - Stores metadata for uploaded files (screenshots, logs, PDFs).
   - File validation ensures allowed MIME types and size constraints before saving to `uploads/`.

8. **`ticket_history`**:
   - Immutable historical timeline of all status changes, assignments, and priority changes on each ticket.

9. **`audit_logs`**:
   - System audit trail for administrative actions (role changes, account deactivations, team changes, category edits).
