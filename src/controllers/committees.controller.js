import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getCommittees = async (req, res) => {
  try {
    const committees = await prisma.committee.findMany({
      orderBy: { id: "asc" },
    });

    res.json(committees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

/* ---------------- CREATE ---------------- */

export const createCommittee = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.file;

    const committee = await prisma.committee.create({
      data: {
        title,
        pdf_name: file ? file.originalname : null,
        pdf_path: file
          ? `/assets/college_committee/${file.filename}`
          : null,
        uploaded_date: file ? new Date() : null,
      },
    });

    res.status(201).json(committee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- UPDATE ---------------- */

export const updateCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    const existing = await prisma.committee.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    let updateData = { title };

    if (file) {
      // delete old file
      if (existing.pdf_path) {
        const oldPath = path.join(
          process.cwd(),
          existing.pdf_path
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateData.pdf_name = file.originalname;
      updateData.pdf_path = `/assets/college_committee/${file.filename}`;
      updateData.uploaded_date = new Date();
    }

    const updated = await prisma.committee.update({
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

export const deleteCommittee = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.committee.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete file from disk
    if (existing.pdf_path) {
      const filePath = path.join(
        process.cwd(),
        existing.pdf_path
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.committee.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
