import express from "express";
import {
  getNcism,
  saveNcism,
  deleteNcismTab,
} from "../controllers/ncism.controller.js";

import { uploadNcismPdf } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getNcism);

router.post(
  "/",
  uploadNcismPdf.any(),
  saveNcism
);

router.delete("/:id", deleteNcismTab);

export default router;
