import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getUpdates, saveUpdate, deleteUpdate, reorderUpdates } from "../controllers/newUpdatesController.js";

const router = express.Router();

// Setup dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Ensure the upload directory exists inside src/assets
const uploadDir = path.join(__dirname, "../assets/new_updates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Clean filename: timestamp-originalName.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 3. Define Routes
router.get("/", getUpdates);

// Reorder route must come before /:id delete route
router.put("/reorder", reorderUpdates);

// Use upload.any() to accept dynamically named files (tempId)
router.post("/", upload.any(), saveUpdate);

router.delete("/:id", deleteUpdate);

export default router;