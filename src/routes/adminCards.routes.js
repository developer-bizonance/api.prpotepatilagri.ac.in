import express from "express";
import {
  getAdminCards,
  createAdminCard,
  updateAdminCard,
  deleteAdminCard,
} from "../controllers/adminCards.controller.js";

import { uploadAdminCardImg } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAdminCards);

router.post(
  "/",
  uploadAdminCardImg.single("image"),
  createAdminCard
);

router.put(
  "/:id",
  uploadAdminCardImg.single("image"),
  updateAdminCard
);

router.delete("/:id", deleteAdminCard);

export default router;
