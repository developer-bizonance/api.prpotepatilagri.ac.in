import prisma from "../lib/prisma.js";

// --- GET ALL ACADEMIC DATA ---
// Ye function Calendar aur Timetable dono ka data ek sath bhejega
export const getAcademicData = async (req, res) => {
  try {
    const sections = await prisma.academicSection.findMany({
      include: {
        files: true, // Files bhi sath mein fetch hongi
      },
      orderBy: { orderIndex: "asc" },
    });

    // Frontend ke hisaab se data format karna
    const formattedData = {
      calendar: sections.filter((s) => s.type === "calendar"),
      timetable: sections.filter((s) => s.type === "timetable"),
    };

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching academic data:", error);
    res.status(500).json({ error: "Failed to fetch academic data" });
  }
};

// --- UPLOAD PDF FILE ---
// (Frontend se jo PDF multer ke through aayegi, use yahan handle karenge)
export const uploadPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    // Create the public path for the frontend to access
    const pdfPath = `/assets/academic/${req.file.filename}`;
    
    res.json({
      fileName: req.file.originalname,
      pdfPath: pdfPath,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};

// --- UPDATE WHOLE SECTION (Save Changes from Drawer) ---
export const saveAcademicData = async (req, res) => {
  const { type, sections } = req.body; // type = 'calendar' ya 'timetable', sections = array of sections

  try {
    // Transaction use karenge taaki ya toh sab save ho ya kuch nahi (safety)
    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing sections and files of this type
      await tx.academicSection.deleteMany({
        where: { type },
      });

      // 2. Re-create everything with the new data from frontend
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        await tx.academicSection.create({
          data: {
            type,
            title: section.sectionTitle,
            orderIndex: i,
            files: {
              create: section.files.map((file) => ({
                name: file.name,
                fileName: file.fileName,
                pdfPath: file.pdfPath || "", // Yeh abhi khali ho sakti hai, upload logic mein handle karenge
                uploadDate: file.uploadDate ? new Date(file.uploadDate) : new Date(),
              })),
            },
          },
        });
      }
    }, 
    // ✅ TIMEOUT FIX: Remote DB (500 Error P2028) ko solve karne ke liye timeout badhaya
    {
      maxWait: 10000, // 10 seconds DB connect wait
      timeout: 30000, // 30 seconds operation wait limit
    });

    res.json({ message: `${type} saved successfully` });
  } catch (error) {
    console.error("Error saving academic data:", error);
    res.status(500).json({ error: "Failed to save academic data" });
  }
};

// --- REORDER SECTIONS (Drag & Drop Save) ---
export const reorderAcademicSections = async (req, res) => {
  try {
    const { orderedIds } = req.body; // Frontend se aayega array of IDs naye order mein
    
    // Har ek id ke orderIndex ko uske naye index se update karenge
    const updates = orderedIds.map((id, index) =>
      prisma.academicSection.update({
        where: { id: parseInt(id) },
        data: { orderIndex: index },
      })
    );

    // ✅ Yahan bhi timeout badha diya hai taaki drag-and-drop save karte waqt error na aaye
    await prisma.$transaction(updates, {
      maxWait: 10000,
      timeout: 30000,
    });
    
    res.json({ message: "Sections reordered successfully" });
  } catch (error) {
    console.error("Error reordering sections:", error);
    res.status(500).json({ error: "Failed to save new order" });
  }
};