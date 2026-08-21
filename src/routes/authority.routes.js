import express from "express";
import {
  getAuthorities,
  saveSingleAuthority,
  savePillar,
  deletePillar,
} from "../controllers/authority.controller.js";

import { uploadAuthority } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAuthorities);

router.post(
  "/single",
  uploadAuthority.single("imageFile"),
  saveSingleAuthority
);

router.post(
  "/pillar",
  uploadAuthority.single("imageFile"),
  savePillar
);

router.delete("/pillar/:id", deletePillar);

export default router;
