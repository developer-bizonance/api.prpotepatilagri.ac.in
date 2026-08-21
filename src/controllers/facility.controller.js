import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* -------- GET FACILITY BY CATEGORY -------- */
export const getFacility = async (req, res) => {
  try {
    const { category } = req.params;
    const facility = await prisma.facility.findUnique({
      where: { category },
      include: { images: true },
    });

    if (!facility) {
      return res.json({ category, title: "", description: "", images: [] });
    }
    res.json(facility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch facility" });
  }
};

/* -------- UPDATE TEXT INFO -------- */
export const upsertFacilityInfo = async (req, res) => {
  try {
    const { category } = req.params;
    const { title, description } = req.body;

    const facility = await prisma.facility.upsert({
      where: { category },
      update: { title, description },
      create: { category, title, description },
    });
    res.json(facility);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

/* -------- UPLOAD MULTIPLE IMAGES -------- */
export const uploadImages = async (req, res) => {
  try {
    const { category } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No images provided" });
    }

    // Ensure facility exists first
    let facility = await prisma.facility.findUnique({ where: { category } });
    if (!facility) {
      facility = await prisma.facility.create({
        data: { category, title: category, description: "" },
      });
    }

    const imagePromises = files.map((file) => {
      return prisma.facilityImage.create({
        data: {
          facilityId: facility.id,
          imageUrl: `/uploads/facilities/${file.filename}`,
        },
      });
    });

    await Promise.all(imagePromises);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

/* -------- DELETE SINGLE IMAGE -------- */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await prisma.facilityImage.findUnique({
      where: { id: Number(id) },
    });

    if (image) {
      const filePath = path.join(process.cwd(), image.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.facilityImage.delete({ where: { id: Number(id) } });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};