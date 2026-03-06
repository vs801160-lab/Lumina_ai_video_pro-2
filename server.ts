import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  console.log(">>> [Server] Starting Lumina Backend...");
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware for development
  console.log(">>> [Server] Initializing Vite middleware...");
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: false,
      host: '0.0.0.0',
      port: 3000
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> [Server] Lumina is LIVE at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error(">>> [Server] CRITICAL ERROR:", err);
  process.exit(1);
});
