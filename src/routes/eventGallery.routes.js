import express from "express";
import { uploadEventGallery } from "../middleware/upload.js";
import * as eventCtrl from "../controllers/eventGallery.controller.js";

const router = express.Router();

router.get("/", eventCtrl.getAllEvents);
router.post("/", uploadEventGallery.array("images", 20), eventCtrl.addEvent);
router.put("/:id", uploadEventGallery.single("image"), eventCtrl.updateEvent);
router.delete("/:id", eventCtrl.deleteEvent);
router.post("/reorder", eventCtrl.reorderEvents);

export default router;