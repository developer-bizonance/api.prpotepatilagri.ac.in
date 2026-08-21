import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// 👇 Yahan controller file ka naya naam (governing-bodies) daalna hai
import {
    getGoverningBodies,
    createGoverningBody,
    updateGoverningBody,
    deleteGoverningBody
} from "../controllers/governing-bodies.controller.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/governing-bodies");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.get("/", getGoverningBodies);
router.post("/", upload.single("file"), createGoverningBody);
router.put("/:id", upload.single("file"), updateGoverningBody);
router.delete("/:id", deleteGoverningBody);

export default router;