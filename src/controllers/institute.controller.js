import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */
export const getInstitutes = async (req, res) => {
  try {
    const data = await prisma.institute.findMany({
      orderBy: { id: "desc" },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
};

/* ---------------- CREATE / UPDATE ---------------- */
export const saveInstitute = async (req, res) => {
  try {
    // req.body se 'link' ko bhi fetch kar rahe hain
    const { id, title, existingImage, link } = req.body;

    let imageUrl = existingImage || null;

if (req.file) {
  imageUrl = `/uploads/institutes/${req.file.filename}`;
}

    /* ---------- UPDATE ---------- */
    if (id && !isNaN(id)) {
      const existing = await prisma.institute.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      // delete old image if replaced
      if (req.file && existing.imageUrl) {
        const oldPath = path.join(process.cwd(), existing.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const updated = await prisma.institute.update({
        where: { id: Number(id) },
        data: {
          title,
          imageUrl,
          link, // Link update ho raha hai
        },
      });

      return res.json(updated);
    }

    /* ---------- CREATE ---------- */
    const created = await prisma.institute.create({
      data: {
        title,
        imageUrl,
        link, // Naya link save ho raha hai
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Operation failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.institute.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete physical file
    if (existing.imageUrl) {
      const filePath = path.join(process.cwd(), existing.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.institute.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};