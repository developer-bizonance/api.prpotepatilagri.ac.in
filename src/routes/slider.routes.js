import express from "express";
import { uploadSlider } from "../middleware/upload.js";

// ✅ Yahan hum controller se functions import kar rahe hain
import {
  getSliderImages,
  addImage,
  deleteImage,
  reorderImages
} from "../controllers/slider.controller.js"; 

const router = express.Router();

// ✅ GET Route: Slider images dikhane ke liye
router.get("/", getSliderImages);

// ✅ POST Route: Drag & drop sequence update karne ke liye
router.post("/reorder", reorderImages);

// ✅ POST Route: Nayi image upload karne ke liye (Multer middleware ke sath)
router.post("/add", uploadSlider.single("imageFile"), addImage);

// ✅ DELETE Route: Image delete karne ke liye
router.delete("/:id", deleteImage);

export default router;