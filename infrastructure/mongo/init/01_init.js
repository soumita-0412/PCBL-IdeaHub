// ============================================================
// IDEAS PORTAL — MongoDB Initialisation Script
// Runs once on first container start.
// Creates the application database and a dedicated app user.
// ============================================================

db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || "ideas_portal");

// Create application-level user (least-privilege)
db.createUser({
  user: "ideas_app",
  pwd: process.env.APP_MONGO_PASSWORD || "changeme_app",
  roles: [
    { role: "readWrite", db: process.env.MONGO_INITDB_DATABASE || "ideas_portal" },
  ],
});

print("MongoDB initialised — ideas_portal database and app user created.");
