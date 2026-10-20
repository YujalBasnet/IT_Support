import "dotenv/config";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  console.log("=== IT Support Database Initializer ===");

  const {
    DB_HOST = "localhost",
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_NAME = "it_support",
    DB_PORT = 3306,
  } = process.env;

  let connection;

  try {
    // 1. Connect without selecting database to ensure database exists
    console.log(`[1/4] Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
      multipleStatements: true,
    });

    // 2. Create and select database
    console.log(`[2/4] Ensuring database '${DB_NAME}' exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${DB_NAME}\`;`);

    // 3. Execute schema.sql
    console.log(`[3/4] Applying database schema from schema.sql...`);
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await connection.query(schemaSql);
    console.log("      Tables verified / created successfully.");

    // 4. Seed initial essential data
    console.log(`[4/4] Seeding initial data...`);

    // 4.1 Seed Roles (Fixed IDs matching business rules)
    const roles = [
      [1, "EMPLOYEE"],
      [2, "SUPPORT_AGENT"],
      [3, "ADMIN"],
    ];

    for (const [id, name] of roles) {
      await connection.query(
        `INSERT INTO roles (id, name)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name);`,
        [id, name]
      );
    }
    console.log("      ✓ Roles seeded (EMPLOYEE: 1, SUPPORT_AGENT: 2, ADMIN: 3)");

    // 4.2 Seed Standard Categories (from Section 12)
    const categories = [
      ["Hardware", "Laptops, monitors, workstations, printers, and peripheral devices"],
      ["Software", "Operating systems, office software, engineering tools, and licensing"],
      ["Network", "Office Wi-Fi, Ethernet, VPN connectivity, and DNS issues"],
      ["Account Access", "Password resets, domain logins, SSO, and 2FA assistance"],
      ["Email", "Outlook, Google Workspace, distribution lists, and mailbox quotas"],
      ["Security", "Security alerts, phishing reports, and suspicious login notifications"],
      ["Other", "General inquiries, miscellaneous IT requests, and suggestions"],
    ];

    for (const [name, desc] of categories) {
      await connection.query(
        `INSERT INTO categories (name, description, is_active)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE description = VALUES(description);`,
        [name, desc]
      );
    }
    console.log("      ✓ Standard categories seeded");

    // 4.3 Seed Default Support Teams
    const teams = [
      ["Tier 1 Helpdesk", "First-line general support triage and initial troubleshooting"],
      ["Infrastructure & Network", "Network engineers and systems administrators"],
      ["Application Support", "Business applications and enterprise software specialists"],
    ];

    for (const [name, desc] of teams) {
      await connection.query(
        `INSERT INTO support_teams (name, description)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description);`,
        [name, desc]
      );
    }
    console.log("      ✓ Support teams seeded");

    // 4.4 Seed Default Users for immediate testing
    // Default password for all seed accounts: "Password@123"
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash("Password@123", salt);

    const seedUsers = [
      {
        name: "IT Administrator",
        email: "admin@itsupport.com",
        password_hash: defaultPasswordHash,
        role_id: 3, // ADMIN
        account_status: "ACTIVE",
      },
      {
        name: "Alex Support Agent",
        email: "agent@itsupport.com",
        password_hash: defaultPasswordHash,
        role_id: 2, // SUPPORT_AGENT
        account_status: "ACTIVE",
      },
      {
        name: "Sarah Support Agent",
        email: "sarah@itsupport.com",
        password_hash: defaultPasswordHash,
        role_id: 2, // SUPPORT_AGENT
        account_status: "ACTIVE",
      },
      {
        name: "John Employee",
        email: "employee@itsupport.com",
        password_hash: defaultPasswordHash,
        role_id: 1, // EMPLOYEE
        account_status: "ACTIVE",
      },
    ];

    for (const user of seedUsers) {
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role_id, account_status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id), account_status = VALUES(account_status);`,
        [user.name, user.email, user.password_hash, user.role_id, user.account_status]
      );
    }
    console.log("      ✓ Test users seeded (Password: Password@123):");
    console.log("        - Admin: admin@itsupport.com");
    console.log("        - Agent: agent@itsupport.com");
    console.log("        - Employee: employee@itsupport.com");

    // 4.5 Link Support Agents to Teams
    const [agentRows] = await connection.query(
      "SELECT id FROM users WHERE email = 'agent@itsupport.com'"
    );
    const [teamRows] = await connection.query(
      "SELECT id FROM support_teams WHERE name = 'Tier 1 Helpdesk'"
    );

    if (agentRows.length > 0 && teamRows.length > 0) {
      await connection.query(
        `INSERT INTO team_members (team_id, user_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);`,
        [teamRows[0].id, agentRows[0].id]
      );
      console.log("      ✓ Support agent assigned to Tier 1 Helpdesk");
    }

    console.log("\n✅ Database initialization & seeding completed successfully!");
  } catch (error) {
    console.error("\n❌ Database initialization error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error(
        "   Check that your MySQL service is running and DB_HOST / DB_PORT in .env are correct."
      );
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
