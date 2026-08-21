import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET PRINCIPAL ---------------- */

export const getPrincipal = async (req, res) => {
  try {
    const principal = await prisma.principal.findFirst({
      orderBy: { id: "desc" },
    });

    res.json(principal || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch principal details",
    });
  }
};

/* ---------------- UPSERT PRINCIPAL ---------------- */

export const upsertPrincipal = async (req, res) => {
  try {
    const {
      name,
      designation,
      messageTitle,
      content,
      qualifications,
      experience,
      specialization,
      email,
      mobile,
      address,
    } = req.body;

    const file = req.file;

    const existing = await prisma.principal.findFirst();

    /* ---------- FIRST TIME (INSERT) ---------- */

    if (!existing) {
      const created = await prisma.principal.create({
        data: {
          name,
          designation,
          messageTitle,
          content,
          qualifications,
          experience,
          specialization,
          email,
          mobile,
          address,
          image_url: file
            ? `/uploads/college_principal/${file.filename}`
            : null,
        },
      });

      return res.json(created);
    }

    /* ---------- UPDATE ---------- */

    let updateData = {
      name,
      designation,
      messageTitle,
      content,
      qualifications,
      experience,
      specialization,
      email,
      mobile,
      address,
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

      updateData.image_url = `/uploads/college_principal/${file.filename}`;
    }

    const updated = await prisma.principal.update({
      where: { id: existing.id },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};