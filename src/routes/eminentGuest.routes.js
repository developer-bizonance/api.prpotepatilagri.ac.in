import express from "express";
import {
  getGuests,
  saveGuest,
  deleteGuest,
} from "../controllers/eminentGuest.controller.js";
import { uploadAuthority } from "../middleware/upload.js";

const router = express.Router();


router.get("/", getGuests);
router.post("/", uploadAuthority.single("image"), saveGuest);
router.delete("/:id", deleteGuest);

export default router;