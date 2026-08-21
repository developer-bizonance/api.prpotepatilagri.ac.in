import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes Imports
import admissionsRoutes from "./src/routes/admissions.routes.js";
import authRoutes from "./src/routes/login.routes.js";
import linksRoutes from "./src/routes/links.routes.js";
import principalRoutes from "./src/routes/principal.routes.js";
import adminCardsRoutes from "./src/routes/adminCards.routes.js";
import ncismRoutes from "./src/routes/ncism.routes.js";
import muhsRoutes from "./src/routes/muhs.routes.js";
import hospitalRoutes from "./src/routes/hospital.routes.js";
import newsRoutes from "./src/routes/news.routes.js";
import eventsRoutes from "./src/routes/events.routes.js";
import highlightedRoutes from "./src/routes/highlightedEvents.routes.js";
import instituteRoutes from "./src/routes/institute.routes.js";
import getAuthoritiesRoutes from "./src/routes/authority.routes.js";
import contactRoutes from "./src/routes/contact.routes.js";
import sliderRoutes from "./src/routes/slider.routes.js";
import galleryVideoRoutes from "./src/routes/galleryVideo.routes.js";
import galleryImageRoutes from "./src/routes/galleryImage.routes.js";
import departmentRoutes from "./src/routes/departments.routes.js";
import committeeRoutes from "./src/routes/committees.routes.js";
import universityRoutes from "./src/routes/universityDetails.routes.js";
import eminentGuestRoutes from "./src/routes/eminentGuest.routes.js";
import academicRoutes from "./src/routes/academic.route.js";
import newUpdatesRoutes from "./src/routes/newUpdates.routes.js";
import administrationRoutes from "./src/routes/administration.routes.js";
import studentRoutes from "./src/routes/student.route.js"; 
import governingBodyRoutes from "./src/routes/governing-bodies.routes.js";
import facultyRoutes from "./src/routes/faculty.routes.js"; // 👈 Sirf ek baar yahan rahega
import facilityRoutes from "./src/routes/facilityGalleryRoutes.js"; 
import galleryRoute from "./src/routes/gallery.route.js";
import eventGalleryRoutes from "./src/routes/eventGallery.routes.js";
import popupEventRoutes from "./src/routes/popupEvent.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CORS & Middleware First
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 2. Static File Serving 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3. API Routes
app.use("/api", authRoutes);
app.use("/api/admissions", admissionsRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/principal", principalRoutes);
app.use("/api/admin-cards", adminCardsRoutes);
app.use("/api/ncism", ncismRoutes);
app.use("/api/muhs", muhsRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/news-notices", newsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/highlighted-events", highlightedRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/authorities", getAuthoritiesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/slider", sliderRoutes);
app.use("/api/gallery-videos", galleryVideoRoutes);
app.use("/api/gallery/images", galleryImageRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/committees", committeeRoutes);
app.use("/api/university-details", universityRoutes);
app.use("/api/eminent-guests", eminentGuestRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/new-updates", newUpdatesRoutes);
app.use("/api/administration", administrationRoutes);
app.use("/api/governing-bodies", governingBodyRoutes); 
app.use("/api/student", studentRoutes); 
app.use("/api/faculties", facultyRoutes);

 
app.use("/api/facilities", facilityRoutes);
app.use("/api/gallery", galleryRoute);
app.use("/api/eventGallery", eventGalleryRoutes);
app.use("/api/popup-events", popupEventRoutes);


const PORT = process.env.PORT || 4001;

app.get("/", (req, res) => {
  res.send(`<h1>🎯 PRPOTE Backend is Running</h1>`);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;