-- ===============================================================
-- IT Service Desk & Support Management System
-- Initial Seed Data (Pure SQL)
-- ===============================================================

USE it_support;

-- 1. Insert Standard Roles
INSERT INTO roles (id, name) VALUES
  (1, 'EMPLOYEE'),
  (2, 'SUPPORT_AGENT'),
  (3, 'ADMIN')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Insert Standard Categories (Document Section 12)
INSERT INTO categories (name, description, is_active) VALUES
  ('Hardware', 'Laptops, monitors, workstations, printers, and peripheral devices', 1),
  ('Software', 'Operating systems, office software, engineering tools, and licensing', 1),
  ('Network', 'Office Wi-Fi, Ethernet, VPN connectivity, and DNS issues', 1),
  ('Account Access', 'Password resets, domain logins, SSO, and 2FA assistance', 1),
  ('Email', 'Outlook, Google Workspace, distribution lists, and mailbox quotas', 1),
  ('Security', 'Security alerts, phishing reports, and suspicious login notifications', 1),
  ('Other', 'General inquiries, miscellaneous IT requests, and suggestions', 1)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 3. Insert Support Teams
INSERT INTO support_teams (name, description) VALUES
  ('Tier 1 Helpdesk', 'First-line general support triage and initial troubleshooting'),
  ('Infrastructure & Network', 'Network engineers and systems administrators'),
  ('Application Support', 'Business applications and enterprise software specialists')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 4. Insert Default Users (Password for all: Password@123)
-- Bcrypt Hash: $2a$10$wT5dYj0w5fM9/qY8j8W8k.K7z4fWqYmN0O8vV0H1xI5xT1L0H1xI5 (or generated via initDb.js)
INSERT INTO users (name, email, password_hash, role_id, account_status) VALUES
  ('IT Administrator', 'admin@itsupport.com', '$2a$10$iI03V3.dFkM85D2b4q5aI.zP1M3U9D0P0m0w7M5E5k8U8j8W8k.K7', 3, 'ACTIVE'),
  ('Alex Support Agent', 'agent@itsupport.com', '$2a$10$iI03V3.dFkM85D2b4q5aI.zP1M3U9D0P0m0w7M5E5k8U8j8W8k.K7', 2, 'ACTIVE'),
  ('John Employee', 'employee@itsupport.com', '$2a$10$iI03V3.dFkM85D2b4q5aI.zP1M3U9D0P0m0w7M5E5k8U8j8W8k.K7', 1, 'ACTIVE')
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), account_status = VALUES(account_status);

-- 5. Team Membership
INSERT IGNORE INTO team_members (team_id, user_id)
SELECT t.id, u.id
FROM support_teams t, users u
WHERE t.name = 'Tier 1 Helpdesk' AND u.email = 'agent@itsupport.com';
