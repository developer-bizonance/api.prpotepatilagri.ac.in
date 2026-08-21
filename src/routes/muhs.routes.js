import express from "express";
import {
  getMuhs,
  saveMuhs,
  deleteMuhs,
} from "../controllers/muhs.controller.js";

import { uploadMuhsPdf } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getMuhs);

router.post(
  "/",
  uploadMuhsPdf.any(),
  saveMuhs
);

router.delete("/:id", deleteMuhs);

export default router;
