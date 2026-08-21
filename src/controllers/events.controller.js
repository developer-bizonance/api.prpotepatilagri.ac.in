import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.upcomingEvent.findMany({
      orderBy: { eventDate: "asc" },
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

/* ---------------- GET SINGLE BY ID ---------------- */

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    let event = await prisma.upcomingEvent.findUnique({
      where: { id: numericId },
    });

    if (!event) {
      event = await prisma.highlightedEvent.findUnique({
        where: { id: numericId },
      });
    }

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error("Error fetching event by ID:", err);
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

/* ---------------- CREATE / UPDATE ---------------- */

export const saveEvent = async (req, res) => {
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
  coverImage = `/uploads/events/${req.files.coverImage[0].filename}`;
}

if (req.files?.additionalImages) {
  const newImages = req.files.additionalImages.map(
    (f) => `/uploads/events/${f.filename}`
  );
  additionalImages = [...additionalImages, ...newImages];
}
    const videoLinks = videos ? JSON.parse(videos) : [];

    /* ---------- UPDATE ---------- */

    if (id) {
      const existing = await prisma.upcomingEvent.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Event not found" });
      }

      // delete old cover if replaced
      if (req.files?.coverImage && existing.coverImage) {
        const oldPath = path.join(process.cwd(), existing.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await prisma.upcomingEvent.update({
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

    await prisma.upcomingEvent.create({
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
    console.error("Event Save Error:", err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- DELETE ---------------- */

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.upcomingEvent.findUnique({
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

    await prisma.upcomingEvent.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
