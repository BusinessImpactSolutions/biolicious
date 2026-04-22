import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "public", "uploads");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const BIOS_FILE = path.join(DATA_DIR, "biographies.json");

function readBios() {
  if (!fs.existsSync(BIOS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(BIOS_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeBios(bios: any[]) {
  fs.writeFileSync(BIOS_FILE, JSON.stringify(bios, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Static uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // API Routes
  app.get("/api/bios", (req, res) => {
    res.json(readBios());
  });

  app.post("/api/bios", (req, res) => {
    const bios = readBios();
    const newBio = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    bios.push(newBio);
    writeBios(bios);
    res.status(201).json(newBio);
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
