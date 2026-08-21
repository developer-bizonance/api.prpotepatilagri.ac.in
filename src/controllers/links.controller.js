import prisma from "../lib/prisma.js";

/* -------- GET ALL -------- */

export const getLinks = async (req, res) => {
  try {
    const links = await prisma.importantLink.findMany({
      orderBy: { id: "desc" },
    });

    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load links" });
  }
};

/* -------- CREATE -------- */

export const createLink = async (req, res) => {
  try {
    const { title, url } = req.body;

    const link = await prisma.importantLink.create({
      data: { title, url },
    });

    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save link" });
  }
};

/* -------- UPDATE -------- */

export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;

    const updated = await prisma.importantLink.update({
      where: { id: Number(id) },
      data: { title, url },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Link not found" });
    }

    res.status(500).json({ error: "Update failed" });
  }
};

/* -------- DELETE -------- */

export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.importantLink.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Link not found" });
    }

    res.status(500).json({ error: "Delete failed" });
  }
};
