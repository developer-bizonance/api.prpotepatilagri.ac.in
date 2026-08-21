import prisma from "../lib/prisma.js"; 
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:4001";

/* ---------------- GET ALL ---------------- */
export const getAuthorities = async (req, res) => {
  try {
    const inspiration = await prisma.inspiration.findUnique({
      where: { id: 1 },
    });

    const principal = await prisma.principalData.findUnique({
      where: { id: 1 },
    });

    const pillars = await prisma.pillar.findMany({
      orderBy: { id: "asc" },
    });

    res.json({
      inspiration: inspiration || {},
      principal: principal || {},
      pillars,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch authorities" });
  }
};

/* ---------------- UPSERT SINGLE (Inspiration / Principal) ---------------- */
export const saveSingleAuthority = async (req, res) => {
  try {
    const { type, name, desc, role, existingImage } = req.body;

    if (!["inspiration", "principal"].includes(type)) {
      return res.status(400).json({ error: "Invalid authority type" });
    }

    let imageUrl = existingImage || null;

    if (req.file) {
      // ✅ Automatically generate safe relative path pointing inside 'uploads/authorities'
      const relativePath = path.relative(process.cwd(), req.file.path);
      imageUrl = "/" + relativePath.replace(/\\/g, "/");
    }

    const data = {
      name: name || "",
      description: desc || "",
      role: role || (type === "principal" ? "Principal" : ""),
      imageUrl,
    };

    let result;

    if (type === "inspiration") {
      result = await prisma.inspiration.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    } else {
      result = await prisma.principalData.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

/* ---------------- CREATE / UPDATE PILLAR ---------------- */
export const savePillar = async (req, res) => {
  try {
    const { id, name, role, desc, existingImage } = req.body;

    let imageUrl = existingImage || null;

    if (req.file) {
      // ✅ Automatically generate safe relative path pointing inside 'uploads/authorities'
      const relativePath = path.relative(process.cwd(), req.file.path);
      imageUrl = "/" + relativePath.replace(/\\/g, "/");
    }

    /* ---------- UPDATE ---------- */
    if (id && !isNaN(id)) {
      const existing = await prisma.pillar.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      // delete old physical file if replaced
      if (req.file && existing.imageUrl) {
        const oldPath = path.join(process.cwd(), existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const updated = await prisma.pillar.update({
        where: { id: Number(id) },
        data: {
          name,
          role,
          description: desc,
          imageUrl,
        },
      });

      return res.json(updated);
    }

    /* ---------- CREATE ---------- */
    const created = await prisma.pillar.create({
      data: {
        name,
        role,
        description: desc,
        imageUrl,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Pillar operation failed" });
  }
};

/* ---------------- DELETE PILLAR ---------------- */
export const deletePillar = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.pillar.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete physical file
    if (existing.imageUrl) {
      const filePath = path.join(process.cwd(), existing.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.pillar.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};