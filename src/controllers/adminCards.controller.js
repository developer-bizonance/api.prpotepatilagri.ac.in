import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getAdminCards = async (req, res) => {
  try {
    const cards = await prisma.adminCard.findMany({
      orderBy: { id: "asc" },
    });

    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
};

/* ---------------- CREATE ---------------- */

export const createAdminCard = async (req, res) => {
  try {
    const { name, title, noteTitle, salutation, content } =
      req.body;

    const file = req.file;

    const card = await prisma.adminCard.create({
      data: {
        name,
        title,
        noteTitle,
        salutation,
        content,
        image_url: file
          ? `/uploads/admin_cards/${file.filename}`
          : null,
      },
    });

    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- UPDATE ---------------- */

export const updateAdminCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, noteTitle, salutation, content } =
      req.body;

    const file = req.file;

    const existing = await prisma.adminCard.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    let updateData = {
      name,
      title,
      noteTitle,
      salutation,
      content,
    };

    if (file) {
      // delete old image
      if (existing.image_url) {
        const oldPath = path.join(
          process.cwd(),
          existing.image_url
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateData.image_url = `/uploads/admin_cards/${file.filename}`;
    }

    const updated = await prisma.adminCard.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

/* ---------------- DELETE ---------------- */

export const deleteAdminCard = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.adminCard.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete image file
    if (existing.image_url) {
      const filePath = path.join(
        process.cwd(),
        existing.image_url
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.adminCard.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
