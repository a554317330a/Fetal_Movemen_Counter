import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ records: [], settings: null }));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", (req, res) => {
    try {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/records", (req, res) => {
    try {
      const { record } = req.body;
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      
      const existingIndex = data.records.findIndex((r: any) => r.id === record.id);
      if (existingIndex !== -1) {
        data.records[existingIndex] = record;
      } else {
        data.records.unshift(record);
      }
      
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, record });
    } catch (error) {
      res.status(500).json({ error: "Failed to save record" });
    }
  });

  app.delete("/api/records/:id", (req, res) => {
    try {
      const { id } = req.params;
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      data.records = data.records.filter((r: any) => r.id !== id);
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete record" });
    }
  });

  app.post("/api/settings", (req, res) => {
    try {
      const { settings } = req.body;
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      data.settings = settings;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, settings });
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
