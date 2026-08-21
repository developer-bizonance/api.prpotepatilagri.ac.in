import express from "express";
import {
  getGalleryImages,
  uploadGalleryImages,
  deleteGalleryImage,
} from "../controllers/galleryImage.controller.js";

import { uploadGallery } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getGalleryImages);

router.post(
  "/",
  uploadGallery.array("imageFiles"),
  uploadGalleryImages
);

router.delete("/:id", deleteGalleryImage);

export default router;
