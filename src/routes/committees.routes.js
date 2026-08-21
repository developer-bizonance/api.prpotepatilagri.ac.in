import express from "express";
import {
  getCommittees,
  createCommittee,
  updateCommittee,
  deleteCommittee,
} from "../controllers/committees.controller.js";

import { uploadCommitteePdf } from "../middleware/upload.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getCommittees);

router.post(
  "/",
  uploadCommitteePdf.single("pdfFile"),
  createCommittee
);

router.put(
  "/:id",
  uploadCommitteePdf.single("pdfFile"),
  updateCommittee
);

router.delete("/:id", deleteCommittee);

export default router;
