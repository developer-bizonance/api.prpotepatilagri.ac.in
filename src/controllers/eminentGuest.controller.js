import prisma from "../lib/prisma.js";

/* ---------------- GET ALL GUESTS ---------------- */
export const getGuests = async (req, res) => {
  try {
    const guests = await prisma.eminentGuest.findMany({
      orderBy: { id: "desc" },
    });
    res.json(guests);
  } catch (err) {
    console.error("Error fetching guests:", err);
    res.status(500).json({ error: "Failed to fetch eminent guests" });
  }
};

/* ---------------- CREATE OR UPDATE GUEST ---------------- */
export const saveGuest = async (req, res) => {
  try {
    const { id, name, designation, existingImage } = req.body;
    // existingImage will contain the unique string from your media server
    const imageUrl = existingImage || null;

    /* ---------- UPDATE ---------- */
    if (id && id !== "undefined" && id !== "null") {
      const existing = await prisma.eminentGuest.findUnique({ where: { id: Number(id) } });
      if (!existing) return res.status(404).json({ error: "Guest not found" });

      await prisma.eminentGuest.update({
        where: { id: Number(id) },
        data: { name, designation, imageUrl },
      });
      return res.json({ success: true, message: "Guest updated" });
    }

    /* ---------- CREATE ---------- */
    await prisma.eminentGuest.create({
      data: { name, designation, imageUrl },
    });

    res.json({ success: true, message: "Guest added" });
  } catch (err) {
    console.error("Event Save Error:", err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await prisma.eminentGuest.findUnique({
      where: { id: Number(id) },
    });

    if (!guest) return res.status(404).json({ error: "Guest not found" });

    await prisma.eminentGuest.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Guest deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};