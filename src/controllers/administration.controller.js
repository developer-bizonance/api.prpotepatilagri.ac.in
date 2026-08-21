import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */
export const getAdministrationDocs = async (req, res) => {
  try {
    const docs = await prisma.administration.findMany({ orderBy: { id: "asc" } });
    res.json(docs);
  } catch (err) {
    console.error("GET ERROR:", err); // 🚨 YAHAN ASLI ERROR PRINT HOGA
    res.status(500).json({ error: "Database error" });
  }
};

/* ---------------- CREATE ---------------- */
export const createAdministrationDoc = async (req, res) => {
  try {
    const { title, category, type, link } = req.body; 
    const file = req.file;

    const doc = await prisma.administration.create({
      data: {
        title,
        category: category || "useful-links",
        link: type === "link" ? link : null,
        pdf_name: type === "pdf" && file ? file.originalname : null,
        pdf_path: type === "pdf" && file ? `/uploads/administration/${file.filename}` : null,
        uploaded_date: new Date(),
      },
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error("CREATE ERROR:", err); // 🚨 YAHAN BHI ERROR PRINT HOGA
    res.status(500).json({ error: "Create failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteAdministrationDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.administration.findUnique({ where: { id: Number(id) } });
    if (!doc) return res.status(404).json({ error: "Not found" });

    if (doc.pdf_path) {
      const filePath = path.join(process.cwd(), doc.pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.administration.delete({ where: { id: Number(id) } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateAdministrationDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, type, link } = req.body;
    const file = req.file;

    const existing = await prisma.administration.findUnique({ where: { id: Number(id) } });
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
      updateData.pdf_path = `/uploads/administration/${file.filename}`;
      updateData.link = null;
      updateData.uploaded_date = new Date();
    }

    const updated = await prisma.administration.update({
      where: { id: Number(id) },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
};