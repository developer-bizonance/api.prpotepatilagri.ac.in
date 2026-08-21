import express from "express";
import {
  getHospital,
  saveHospital,
  deleteHospital,
} from "../controllers/hospital.controller.js";

import { uploadHospitalPdf } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getHospital);

router.post(
  "/",
  uploadHospitalPdf.any(),
  saveHospital
);

router.delete("/:id", deleteHospital);

export default router;
