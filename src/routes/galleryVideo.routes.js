import express from "express";
import {
  getGalleryVideos,
  saveGalleryVideo,
  deleteGalleryVideo,
} from "../controllers/galleryVideo.controller.js";

const router = express.Router();

router.get("/", getGalleryVideos);
router.post("/", saveGalleryVideo);
router.delete("/:id", deleteGalleryVideo);

export default router;