import prisma from "../lib/prisma.js"; 
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:4001";

// GET: Fetch images from your ORIGINAL sliderImage table
export const getSliderImages = async (req, res) => {
  try {
    const sliderImages = await prisma.sliderImage.findMany({
      orderBy: { id: 'asc' } // Changed back to ID sorting to prevent crashes
    });
    
    const formatted = sliderImages.map((row) => ({
      id: row.id,
      name: "Slider Image",
      // Match your original schema: imageUrl
      url: row.imageUrl
        ? `${BASE_URL}/${row.imageUrl.replace(/\\/g, "/").replace(/^\//, "")}`
        : null,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error("GET Slider Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST: Add new image
export const addImage = async (req, res) => {
  let imagePath = null;

  if (req.file) {
    // Convert absolute server path to relative path
    const relativePath = path.relative(process.cwd(), req.file.path);
    imagePath = relativePath.replace(/\\/g, "/"); 
  }

  try {
    const result = await prisma.sliderImage.create({
      data: {
        imageUrl: imagePath // Match your original schema
      }
    });

    res.status(201).json({
      id: result.id,
      url: `${BASE_URL}/${result.imageUrl}`
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove image physically and from DB
export const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await prisma.sliderImage.findUnique({
      where: { id: parseInt(id) },
      select: { imageUrl: true }
    });

    // Physical file deletion
    if (fileData?.imageUrl) {
      const fullPath = path.join(process.cwd(), fileData.imageUrl);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await prisma.sliderImage.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "Image deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST: Update order for drag-and-drop
export const reorderImages = async (req, res) => {
  const { sequence } = req.body;
  try {
    await prisma.$transaction(
      sequence.map((item) =>
        prisma.sliderImage.update({
          where: { id: item.id },
          data: { sequence_order: item.sequence_order } 
        })
      )
    );
    res.status(200).json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("Reorder Error:", err);
    res.status(500).json({ error: "Make sure 'sequence_order' column exists in your Prisma schema!" });
  }
};