import express from "express";
import * as popupController from "../controllers/popupEventController.js";

const router = express.Router();

router.get("/", popupController.getAll);
router.post(
  "/",
  popupController.upload.array("images", 5),
  popupController.create
);
router.put(
  "/:id",
  popupController.upload.array("images", 5),
  popupController.update
);
router.delete("/:id", popupController.remove);

export default router;
