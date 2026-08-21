import express from "express";
import { 
  getAdmissions, 
  createAdmission, 
  updateAdmission, 
  deleteAdmission 
} from "../controllers/admissions.controller.js";
import { uploadAdmissionPdf } from "../middleware/upload.js"; // ya jahan bhi upload middleware hai

const router = express.Router();

router.get("/", getAdmissions);
router.post("/", uploadAdmissionPdf.single("pdfFile"), createAdmission);

// ⚠️ YEH DONO ROUTES HONE ZAROORI HAIN (ID WALE)
router.put("/:id", uploadAdmissionPdf.single("pdfFile"), updateAdmission);
router.delete("/:id", deleteAdmission);

export default router;