import express from "express";
import { uploadStudentPdf } from "../middleware/upload.js";
import {
    getStudentDocs,
    createStudentDoc,
    updateStudentDoc,
    deleteStudentDoc
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getStudentDocs);
router.post("/", uploadStudentPdf.single("pdfFile"), createStudentDoc);
router.put("/:id", uploadStudentPdf.single("pdfFile"), updateStudentDoc);
router.delete("/:id", deleteStudentDoc);

export default router;