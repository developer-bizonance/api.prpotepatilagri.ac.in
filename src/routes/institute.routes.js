import express from "express";
import {
  getInstitutes,
  saveInstitute,
  deleteInstitute,
} from "../controllers/institute.controller.js";

import { uploadInstitute } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getInstitutes);

router.post(
  "/",
  uploadInstitute.single("imageFile"),
  saveInstitute
);

router.delete("/:id", deleteInstitute);

export default router;
