import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || "http://localhost:4001";

const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const sanitized = url.replace(/\\/g, "/").replace(/^\//, "");
  return `${BASE_URL}/${sanitized}`;
};

export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility_gallery.findMany({
      orderBy: [
        { sequence_order: "asc" },
        { created_at: "desc" }
      ]
    });
    const formattedData = facilities.map((row) => ({
      ...row,
      image_url: formatImageUrl(row.image_url),
    }));
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🌟 MULTIPLE IMAGES ADD SUPPORT
export const addFacility = async (req, res) => {
  const { title, category, sub_category } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }

  try {
    const createdImages = [];

    for (const file of req.files) {
      const imageUrl = `uploads/facilities/${file.filename}`.replace(/\\/g, "/");
      const newFacility = await prisma.facility_gallery.create({
        data: {
          title: title ? title.trim() : "",
          category: category ? category.trim() : "General",
          sub_category: sub_category ? sub_category.trim() : "Default",
          image_url: imageUrl
        }
      });
      createdImages.push({
        ...newFacility,
        image_url: formatImageUrl(newFacility.image_url)
      });
    }

    res.status(201).json(createdImages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFacility = async (req, res) => {
  const { id } = req.params;
  const { title, category, sub_category } = req.body;
  const parsedId = parseInt(id, 10);

  try {
    const existing = await prisma.facility_gallery.findUnique({ where: { id: parsedId } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    let updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (sub_category !== undefined) updateData.sub_category = sub_category.trim();

    if (req.file) {
      const newImageUrl = `uploads/facilities/${req.file.filename}`.replace(/\\/g, "/");
      if (existing.image_url) {
        const relativePath = existing.image_url.replace(/^https?:\/\/[^/]+\//, "");
        const oldPath = path.join(__dirname, "..", "..", relativePath); 
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image_url = newImageUrl;
    }

    const updated = await prisma.facility_gallery.update({
      where: { id: parsedId },
      data: updateData
    });
    res.status(200).json({ ...updated, image_url: formatImageUrl(updated.image_url) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFacility = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);

  try {
    const data = await prisma.facility_gallery.findUnique({ where: { id: parsedId } });
    if (data && data.image_url) {
      const relativePath = data.image_url.replace(/^https?:\/\/[^/]+\//, "");
      const filePath = path.join(__dirname, "..", "..", relativePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await prisma.facility_gallery.delete({ where: { id: parsedId } });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reorderFacilities = async (req, res) => {
  const { sequence } = req.body;
  try {
    await prisma.$transaction(
      sequence.map((item) =>
        prisma.facility_gallery.update({
          where: { id: parseInt(item.id, 10) },
          data: { sequence_order: parseInt(item.sequence_order, 10) }
        })
      )
    );
    res.status(200).json({ message: "Sequence updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};