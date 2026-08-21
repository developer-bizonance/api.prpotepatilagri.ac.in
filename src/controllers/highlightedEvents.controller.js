import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getHighlightedEvents = async (req, res) => {
  try {
    const events = await prisma.highlightedEvent.findMany({
      orderBy: { eventDate: "desc" },
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/* ---------------- CREATE / UPDATE ---------------- */

export const saveHighlightedEvent = async (req, res) => {
  try {
    const {
      id,
      title,
      date,
      time,
      location,
      description,
      videos,
      existingCoverImage,
      existingAdditionalImages,
    } = req.body;

    /* ---------- FILE HANDLING ---------- */

    let coverImage = existingCoverImage || null;
    let additionalImages = existingAdditionalImages
      ? JSON.parse(existingAdditionalImages)
      : [];

    if (req.files?.coverImage) {
      coverImage = `/assets/highlighted_events/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.additionalImages) {
      const newImages = req.files.additionalImages.map(
        (f) => `/assets/highlighted_events/${f.filename}`
      );
      additionalImages = [...additionalImages, ...newImages];
    }

    const videoLinks = videos ? JSON.parse(videos) : [];

    /* ---------- UPDATE ---------- */

    if (id) {
      const existing = await prisma.highlightedEvent.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      // delete old cover if replaced
      if (req.files?.coverImage && existing.coverImage) {
        const oldPath = path.join(process.cwd(), existing.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await prisma.highlightedEvent.update({
        where: { id: Number(id) },
        data: {
          title,
          eventDate: new Date(date),
          eventTime: time,
          location,
          description,
          coverImage,
          additionalImages,
          videos: videoLinks,
        },
      });

      return res.json({ success: true });
    }

    /* ---------- CREATE ---------- */

    await prisma.highlightedEvent.create({
      data: {
        title,
        eventDate: new Date(date),
        eventTime: time,
        location,
        description,
        coverImage,
        additionalImages,
        videos: videoLinks,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- DELETE ---------------- */

export const deleteHighlightedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.highlightedEvent.findUnique({
      where: { id: Number(id) },
    });

    if (!event) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete cover image
    if (event.coverImage) {
      const coverPath = path.join(process.cwd(), event.coverImage);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    // delete additional images
    for (const img of event.additionalImages || []) {
      const imgPath = path.join(process.cwd(), img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.highlightedEvent.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
