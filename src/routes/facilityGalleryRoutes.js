import express from "express";
import { uploadFacilityImg } from "../middleware/upload.js"; 
import * as facilityCtrl from "../controllers/facilityGalleryController.js";

const router = express.Router();

router.get("/", facilityCtrl.getAllFacilities);
router.post("/", uploadFacilityImg.array("images", 20), facilityCtrl.addFacility);
router.put("/:id", uploadFacilityImg.single("image"), facilityCtrl.updateFacility);
router.delete("/:id", facilityCtrl.deleteFacility);
router.post("/reorder", facilityCtrl.reorderFacilities);

export default router;