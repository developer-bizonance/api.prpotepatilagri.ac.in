import prisma from "../lib/prisma.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/images/popups";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

let tableInitialized = false;

// Helper to auto-create PopupEvent table if it doesn't exist (cached after 1st run)
const ensureTableExists = async () => {
  if (tableInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PopupEvent" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL DEFAULT '',
        "type" TEXT NOT NULL DEFAULT 'general',
        "order" INTEGER NOT NULL DEFAULT 1,
        "icon" TEXT NOT NULL DEFAULT '🗕',
        "dateInfo" TEXT NOT NULL DEFAULT '',
        "buttonText" TEXT NOT NULL DEFAULT '',
        "contentType" TEXT NOT NULL DEFAULT 'content',
        "link" TEXT DEFAULT '',
        "discription" TEXT DEFAULT '',
        "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "youtubeLinks" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableInitialized = true;
  } catch (err) {
    console.error("Table creation error:", err);
  }
};

export const getAll = async (req, res) => {
  try {
    if (!tableInitialized) {
      await ensureTableExists();
    }

    if (prisma.popupEvent) {
      const events = await prisma.popupEvent.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(events);
    }

    // Direct SQL fallback
    const events = await prisma.$queryRawUnsafe(
      `SELECT * FROM "PopupEvent" ORDER BY "createdAt" DESC;`
    );
    res.json(events || []);
  } catch (err) {
    console.error("Get Popups Error:", err);
    res.json([]);
  }
};

export const create = async (req, res) => {
  try {
    await ensureTableExists();
    const { title, link, discription, buttonText } = req.body;
    const images = req.files ? req.files.map((f) => f.filename) : [];
    const id = crypto.randomUUID();
    const dateInfo = new Date().toISOString();

    if (prisma.popupEvent) {
      const newEvent = await prisma.popupEvent.create({
        data: {
          id,
          title: title || "",
          link: link || "",
          discription: discription || "",
          images,
          type: "general",
          order: 1,
          buttonText: buttonText || "",
          dateInfo,
          contentType: "content",
        },
      });
      return res.json(newEvent);
    }

    // Direct SQL fallback
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PopupEvent" ("id", "title", "link", "discription", "images", "type", "order", "buttonText", "dateInfo", "contentType", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'general', 1, $6, $7, 'content', NOW(), NOW());`,
      id,
      title || "",
      link || "",
      discription || "",
      images,
      buttonText || "",
      dateInfo
    );

    res.json({
      id,
      title: title || "",
      link: link || "",
      discription: discription || "",
      images,
      buttonText: buttonText || "",
    });
  } catch (err) {
    console.error("Create Popup Error:", err);
    res.status(500).json({ error: err.message || "Failed to save popup" });
  }
};

export const update = async (req, res) => {
  try {
    await ensureTableExists();
    const { id } = req.params;
    const { title, link, discription, buttonText } = req.body;
    const newImages = req.files ? req.files.map((f) => f.filename) : null;

    if (prisma.popupEvent) {
      const existingPopup = await prisma.popupEvent.findUnique({
        where: { id },
      });

      if (!existingPopup) {
        return res.status(404).json({ error: "Popup not found" });
      }

      const updateData = {
        title: title !== undefined ? title || "" : existingPopup.title,
        link: link !== undefined ? link || "" : existingPopup.link,
        discription:
          discription !== undefined
            ? discription || ""
            : existingPopup.discription,
        buttonText:
          buttonText !== undefined ? buttonText : existingPopup.buttonText,
      };

      if (newImages && newImages.length > 0) {
        updateData.images = newImages;
      }

      const updatedEvent = await prisma.popupEvent.update({
        where: { id },
        data: updateData,
      });

      return res.json(updatedEvent);
    }

    // Direct SQL fallback
    if (newImages && newImages.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "PopupEvent" SET "title" = $1, "link" = $2, "discription" = $3, "buttonText" = $4, "images" = $5, "updatedAt" = NOW() WHERE "id" = $6;`,
        title || "",
        link || "",
        discription || "",
        buttonText || "",
        newImages,
        id
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "PopupEvent" SET "title" = $1, "link" = $2, "discription" = $3, "buttonText" = $4, "updatedAt" = NOW() WHERE "id" = $6;`,
        title || "",
        link || "",
        discription || "",
        buttonText || "",
        id
      );
    }

    res.json({ id, title, link, discription, buttonText });
  } catch (err) {
    console.error("Update Popup Error:", err);
    res.status(500).json({ error: err.message || "Failed to update popup" });
  }
};

export const remove = async (req, res) => {
  try {
    await ensureTableExists();
    const { id } = req.params;

    if (prisma.popupEvent) {
      await prisma.popupEvent.delete({ where: { id } });
      return res.json({ message: "Deleted successfully" });
    }

    await prisma.$executeRawUnsafe(
      `DELETE FROM "PopupEvent" WHERE "id" = $1;`,
      id
    );
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete Popup Error:", err);
    res.status(500).json({ error: err.message || "Failed to delete popup" });
  }
};
