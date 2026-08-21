import express from "express";
import {
  getHighlightedEvents,
  saveHighlightedEvent,
  deleteHighlightedEvent,
} from "../controllers/highlightedEvents.controller.js";

import { uploadHighlight } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getHighlightedEvents);

router.post(
  "/",
  uploadHighlight.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  saveHighlightedEvent
);

router.delete("/:id", deleteHighlightedEvent);

export default router;
