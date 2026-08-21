import prisma from "../lib/prisma.js";
import path from "path";
import fs from "fs";

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

export const addGalleryImage = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageUrl = `/uploads/image_gallery/${req.file.filename}`;

    const newImage = await prisma.galleryImage.create({
      data: { title, imageUrl },
    });

    res.status(201).json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add image" });
  }
};

export const deleteGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.galleryImage.findUnique({
      where: { id: Number(id) },
    });

    if (image) {
      const filePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await prisma.galleryImage.delete({
        where: { id: Number(id) },
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};