import express from "express";
import { 
  getFaculties, 
  saveFaculty, 
  reorderFaculties, 
  deleteFaculty 
} from "../controllers/faculty.controller.js"; 

const router = express.Router();

router.get("/", getFaculties);
router.post("/", saveFaculty);
router.post("/reorder", reorderFaculties); 
router.delete("/:id", deleteFaculty);

export default router;