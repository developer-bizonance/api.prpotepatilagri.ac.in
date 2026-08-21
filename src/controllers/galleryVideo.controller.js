import prisma from "../lib/prisma.js";

/* ---------------- GET ALL ---------------- */
export const getGalleryVideos = async (req, res) => {
  try {
    const videos = await prisma.galleryVideo.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

/* ---------------- CREATE / UPDATE ---------------- */
export const saveGalleryVideo = async (req, res) => {
  try {
    const { id, title, url, description, featured } = req.body;

    /* ---------- UPDATE ---------- */
    if (id) {
      const existing = await prisma.galleryVideo.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Video not found" });
      }

      const updated = await prisma.galleryVideo.update({
        where: { id: Number(id) },
        data: {
          title,
          url,
          description,
          featured: Boolean(featured),
        },
      });

      return res.json(updated);
    }

    /* ---------- CREATE ---------- */
    const created = await prisma.galleryVideo.create({
      data: {
        title,
        url,
        description,
        featured: Boolean(featured),
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save video" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteGalleryVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.galleryVideo.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Video not found" });
    }

    await prisma.galleryVideo.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete video" });
  }
};