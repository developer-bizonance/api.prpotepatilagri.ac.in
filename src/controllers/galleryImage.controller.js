import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getGalleryImages = async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { id: "desc" },
    });

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

/* ---------------- MULTI UPLOAD ---------------- */

export const uploadGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const createdImages = [];

    for (const file of req.files) {
      const imageUrl = `/assets/gallery/${file.filename}`;

      const created = await prisma.galleryImage.create({
        data: {
          imageUrl,
          title: file.originalname,
        },
      });

      createdImages.push(created);
    }

    res.status(201).json(createdImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

/* ---------------- DELETE ---------------- */

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.galleryImage.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete physical file
    const filePath = path.join(process.cwd(), existing.imageUrl);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.galleryImage.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
