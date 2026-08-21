import prisma from "../lib/prisma.js";

/* ---------------- GET ALL FACULTIES (With Type Filter) ---------------- */
export const getFaculties = async (req, res) => {
  try {
    const { type } = req.query; // Frontend se pass hoga ?type=Teaching ya Non-Teaching

    let whereClause = {};
    if (type) {
      const formattedType = String(type).trim().toLowerCase();

      if (formattedType.includes("non")) {
        // Non-teaching ke saare possible variations ko match karega
        whereClause = {
          type: {
            in: ["Non-Teaching", "NonTeaching", "non-teaching", "Non Teaching", "non teaching"]
          }
        };
      } else {
        whereClause = {
          type: {
            in: ["Teaching", "teaching"]
          }
        };
      }
    }

    const faculties = await prisma.faculty.findMany({
      where: whereClause,
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });

    res.json(faculties);
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

/* ---------------- CREATE OR UPDATE FACULTY ---------------- */
export const saveFaculty = async (req, res) => {
  try {
    const { id, name, designation, degree, experience, existingImage, existingResume, role, order, type } = req.body;
    const imageUrl = existingImage || null;
    const resumeUrl = existingResume || null;

    const facultyRole = role || designation || "Faculty";
    const facultyOrder = order !== undefined && order !== "" ? Number(order) : 0;
    const facultyType = type || "Teaching";

    /* ---------- UPDATE ---------- */
    if (id && id !== "undefined" && id !== "null") {
      const existing = await prisma.faculty.findUnique({ where: { id: Number(id) } });
      if (!existing) return res.status(404).json({ error: "Faculty not found" });

      await prisma.faculty.update({
        where: { id: Number(id) },
        data: {
          name,
          degree,
          experience,
          imageUrl,
          resumeUrl,
          role: facultyRole,
          order: facultyOrder,
          type: facultyType
        },
      });
      return res.json({ success: true, message: "Faculty updated" });
    }

    /* ---------- CREATE ---------- */
    await prisma.faculty.create({
      data: {
        name,
        degree,
        experience,
        imageUrl,
        resumeUrl,
        role: facultyRole,
        order: facultyOrder,
        type: facultyType
      },
    });

    res.json({ success: true, message: "Faculty added" });
  } catch (err) {
    console.error("Faculty Save Error:", err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- BULK REORDER FACULTIES ---------------- */
export const reorderFaculties = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items data" });
    }

    for (const item of items) {
      await prisma.faculty.update({
        where: { id: Number(item.id) },
        data: { order: Number(item.order) },
      });
    }

    res.json({ success: true, message: "Order updated successfully" });
  } catch (err) {
    console.error("Reorder Error Details:", err);
    res.status(500).json({ error: "Reorder failed", details: err.message });
  }
};

/* ---------------- DELETE FACULTY ---------------- */
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await prisma.faculty.findUnique({
      where: { id: Number(id) },
    });

    if (!faculty) return res.status(404).json({ error: "Faculty not found" });

    await prisma.faculty.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Faculty deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};