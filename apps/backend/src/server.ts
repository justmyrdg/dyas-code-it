import http from "http";
import app from "./app";
import { sequelize } from "./config/database";
import { runMigrations } from "./config/migrator";
import { initRealtime } from "./realtime/io";
import { User } from "./models";

const PORT = process.env.PORT || 3000;

// Registration clamps role to student/teacher, so the first admin is promoted
// via env: set ADMIN_EMAIL to an existing account's email and restart.
async function promoteAdmin(): Promise<void> {
	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
	if (!adminEmail) return;

	const user = await User.findOne({ where: { email: adminEmail } });
	if (user && user.role !== "admin") {
		user.role = "admin";
		await user.save();
		console.log(`Promoted ${adminEmail} to admin.`);
	}
}

async function start(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log("Database connection established.");
		// Migrations are the default. DB_SYNC=true is an escape hatch for local
		// throwaway databases where syncing models directly is faster than writing
		// a migration for every in-flight schema tweak.
		if (process.env.DB_SYNC === "true") {
			await sequelize.sync({ alter: true });
			console.log("Database synced from models (DB_SYNC=true).");
		} else {
			await runMigrations();
		}
		await promoteAdmin();
	} catch (err) {
		console.error("Failed to connect to the database:", err);
		process.exit(1);
	}

	// Wrap Express in an explicit HTTP server so Socket.io can share the port.
	const server = http.createServer(app);
	initRealtime(server);

	server.listen(PORT, () => {
		console.log(`DyasCodeIT API running on http://localhost:${PORT}`);
		console.log(`Health check: http://localhost:${PORT}/api/health`);
	});
}

start();
