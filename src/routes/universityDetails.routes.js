import express from "express";
import {
  getDetails,
  createDetail,
  updateDetail,
  deleteDetail,
  reorderDetails
} from "../controllers/universityDetails.controller.js";

const router = express.Router();

router.get("/", getDetails);
router.post("/", createDetail);
router.put("/reorder", reorderDetails); // Must be above /:id
router.put("/:id", updateDetail);
router.delete("/:id", deleteDetail);

export default router;