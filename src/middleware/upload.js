import multer from "multer";
import path from "path";
import fs from "fs";

// Always points to the root 'uploads' folder of your project
const BASE_UPLOAD_PATH = path.join(process.cwd(), "uploads");

/* ------------- ENSURE FOLDER EXISTS ------------- */
const ensureFolder = (folderName) => {
  const fullPath = path.join(BASE_UPLOAD_PATH, folderName);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
};

/* ------------- CLEAN FILE NAME ------------- */
const cleanFileName = (name) => {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext);
  const cleanedBase = base
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return cleanedBase + ext;
};

/* ------------- MULTER FACTORY ------------- */
const createUploader = (folderName, options = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = ensureFolder(folderName);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}_${cleanFileName(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

  return multer({
    storage,
    limits: {
      fileSize: options.fileSize || 20 * 1024 * 1024, // Default 20MB
    },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      if (
        ALLOWED_MIME_TYPES.includes(file.mimetype) &&
        ALLOWED_EXTENSIONS.includes(ext)
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid file type. Allowed: JPG, PNG, WEBP, PDF. Received: ${ext}`
          )
        );
      }
    },
  });
};


/* ------------- EXPORT ALL UPLOADERS ------------- */
export const uploadAdminCardImg = createUploader("admin_cards");
export const uploadAdmissionPdf = createUploader("admissions");
export const uploadDeptAssets = createUploader("departments");
export const uploadNcismPdf = createUploader("ncism");
export const uploadNews = createUploader("news");
export const uploadEvent = createUploader("events");
export const uploadEventGallery = createUploader("event-gallery");
export const uploadMuhsPdf = createUploader("muhs"); // 👈 Ye wali line check kar le
export const uploadHospitalPdf = createUploader("hospital");
export const uploadHighlight = createUploader("highlighted_events");
export const uploadGallery = createUploader("gallery");
export const uploadInstitute = createUploader("institutes");
export const uploadAuthority = createUploader("authorities");
export const uploadCommittee = createUploader("college_committees");
export const uploadCommitteePdf = createUploader("college_committee");
export const uploadCollegePrincipal = createUploader("college_principal");
export const uploadSlider = createUploader("sliders");
export const uploadAdministrationPdf = createUploader("administration");
export const uploadStudentPdf = createUploader("students");
export const uploadFacilityImg = createUploader("facilities");
export const uploadGalleryImg = createUploader("image_gallery");
export const facultyImageUpload = createUploader("faculty_images");