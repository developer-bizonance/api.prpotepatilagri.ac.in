import express from "express";
import {
  getNews,
  saveNews,
  deleteNews,
} from "../controllers/news.controller.js";

import { uploadNews } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getNews);

router.post(
  "/",
  uploadNews.single("file"),
  saveNews
);

router.delete("/:id", deleteNews);

export default router;
