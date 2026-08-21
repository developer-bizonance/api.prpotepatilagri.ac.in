import express from "express";
import {
  getContact,
  saveContact,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", getContact);

// No :id needed anymore
router.put("/", saveContact);

export default router;
