import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */
export const getStudentDocs = async (req, res) => {
  try {
    const docs = await prisma.student.findMany({ orderBy: { id: "desc" } });
    res.json(docs);
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
};

/* ---------------- CREATE ---------------- */
export const createStudentDoc = async (req, res) => {
  try {
    const { title, category, type, link } = req.body; 
    const file = req.file;

    const doc = await prisma.student.create({
      data: {
        title,
        category: category || "academic-calendar",
        link: type === "link" ? link : null,
        pdf_name: type === "pdf" && file ? file.originalname : null,
        pdf_path: type === "pdf" && file ? `/uploads/students/${file.filename}` : null,
        uploaded_date: new Date(),
      },
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Create failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteStudentDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.student.findUnique({ where: { id: Number(id) } });
    if (!doc) return res.status(404).json({ error: "Not found" });

    if (doc.pdf_path) {
      const filePath = path.join(process.cwd(), doc.pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.student.delete({ where: { id: Number(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateStudentDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, type, link } = req.body;
    const file = req.file;

    const existing = await prisma.student.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    let updateData = { title };
    if (category) updateData.category = category;
    
    if (type === "link") {
       updateData.link = link;
       updateData.pdf_name = null;
       updateData.pdf_path = null;
    } else if (type === "pdf" && file) {
      if (existing.pdf_path) {
        const oldPath = path.join(process.cwd(), existing.pdf_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.pdf_name = file.originalname;
      updateData.pdf_path = `/uploads/students/${file.filename}`;
      updateData.link = null;
      updateData.uploaded_date = new Date();
    }

    const updated = await prisma.student.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
};