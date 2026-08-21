import express from "express";
import {
  getDepartments,
  saveDepartment,
  deleteDepartment,
} from "../controllers/departments.controller.js";

import { uploadDeptAssets } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getDepartments);

router.post(
  "/",
  uploadDeptAssets.any(),
  saveDepartment
);

router.delete("/:id", deleteDepartment);

export default router;
