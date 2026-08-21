import express from "express";
import {
  getEvents,
  getEventById,
  saveEvent,
  deleteEvent,
} from "../controllers/events.controller.js";

import { uploadEvent } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);

router.post(
  "/",
  uploadEvent.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  saveEvent
);

router.delete("/:id", deleteEvent);

export default router;
