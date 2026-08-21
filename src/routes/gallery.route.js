import express from "express";
import {
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
} from "../controllers/gallery.controller.js";
import { uploadGalleryImg } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getGalleryImages);
router.post("/", uploadGalleryImg.single("image"), addGalleryImage);
router.delete("/:id", deleteGalleryImage);

export default router;