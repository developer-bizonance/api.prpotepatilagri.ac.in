import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */
export const getGoverningBodies = async (req, res) => {
  try {
    const docs = await prisma.governingBody.findMany({ orderBy: { id: "desc" } });
    res.json(docs);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/* ---------------- CREATE ---------------- */
export const createGoverningBody = async (req, res) => {
  try {
    const { title } = req.body; 
    const file = req.file;

    const doc = await prisma.governingBody.create({
      data: {
        title,
        pdf_name: file ? file.originalname : null,
        pdf_path: file ? `/uploads/governing-bodies/${file.filename}` : null,
        uploaded_date: new Date(),
      },
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Create failed" });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateGoverningBody = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    const existing = await prisma.governingBody.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    let updateData = { title };
    
    // Agar naya PDF upload kiya gaya hai
    if (file) {
      // Purana PDF delete karein storage se
      if (existing.pdf_path) {
        const oldPath = path.join(process.cwd(), existing.pdf_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.pdf_name = file.originalname;
      updateData.pdf_path = `/uploads/governing-bodies/${file.filename}`;
      updateData.uploaded_date = new Date();
    }

    const updated = await prisma.governingBody.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteGoverningBody = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.governingBody.findUnique({ where: { id: Number(id) } });
    if (!doc) return res.status(404).json({ error: "Not found" });

    // PDF file storage se delete karein
    if (doc.pdf_path) {
      const filePath = path.join(process.cwd(), doc.pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    await prisma.governingBody.delete({ where: { id: Number(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};