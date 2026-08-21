import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */
export const getAdmissions = async (req, res) => {
  try {
    const admissions = await prisma.admissions.findMany({
      orderBy: { id: "asc" },
    });
    res.json(admissions);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/* ---------------- CREATE ---------------- */
export const createAdmission = async (req, res) => {
  try {
    // 🌟 FIX: "link" aur "type" ko hata diya
    const { title, category } = req.body; 
    const file = req.file;

    const admission = await prisma.admissions.create({
      data: {
        title,
        category: category || "course-layout",
        // 🌟 FIX: link column remove kar diya
        pdf_name: file ? file.originalname : null, 
        pdf_path: file ? `/uploads/admissions/${file.filename}` : null,
        uploaded_date: new Date(),
      },
    });

    res.status(201).json(admission);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Create failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await prisma.admissions.findUnique({ where: { id: Number(id) } });

    if (!admission) return res.status(404).json({ error: "Not found" });

    if (admission.pdf_path) {
      const filePath = path.join(process.cwd(), admission.pdf_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.admissions.delete({ where: { id: Number(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    // 🌟 FIX: "link" aur "type" ko hata diya
    const { title, category } = req.body;
    const file = req.file;

    const existing = await prisma.admissions.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Admission not found" });

    let updateData = { title };
    if (category) updateData.category = category;

    if (file) {
      // Agar admin ne nayi PDF daali hai, toh purani PDF delete kardo
      if (existing.pdf_path) {
        const oldPath = path.join(process.cwd(), existing.pdf_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.pdf_name = file.originalname;
      updateData.pdf_path = `/uploads/admissions/${file.filename}`;
      updateData.uploaded_date = new Date();
    }

    const updated = await prisma.admissions.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
};