import express from "express";
import { uploadAdmissionPdf } from "../middleware/upload.js";
import { 
  getAdmissions, 
  createAdmission, 
  updateAdmission, 
  deleteAdmission 
} from "../controllers/admissions.controller.js";

const router = express.Router();

router.get("/", getAdmissions);
router.post("/", uploadAdmissionPdf.single("pdfFile"), createAdmission);
router.put("/:id", uploadAdmissionPdf.single("pdfFile"), updateAdmission);
router.delete("/:id", deleteAdmission);

export default router;