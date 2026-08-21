import express from "express";
import { uploadAdministrationPdf } from "../middleware/upload.js";
import {
    getAdministrationDocs,
    createAdministrationDoc,
    updateAdministrationDoc,
    deleteAdministrationDoc
} from "../controllers/administration.controller.js";

const router = express.Router();

router.get("/", getAdministrationDocs);
router.post("/", uploadAdministrationPdf.single("pdfFile"), createAdministrationDoc);
router.put("/:id", uploadAdministrationPdf.single("pdfFile"), updateAdministrationDoc);
router.delete("/:id", deleteAdministrationDoc);

export default router;