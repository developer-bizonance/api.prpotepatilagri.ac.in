import express from "express";
import {
  getPrincipal,
  upsertPrincipal,
} from "../controllers/principal.controller.js";

import { uploadCollegePrincipal } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getPrincipal);

router.put(
  "/",
  uploadCollegePrincipal.single("image"),
  upsertPrincipal
);

export default router;
