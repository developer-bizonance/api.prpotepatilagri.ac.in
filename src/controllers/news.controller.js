import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getNews = async (req, res) => {
  try {
    const data = await prisma.newsNotice.findMany({
      orderBy: { id: "desc" },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};

/* ---------------- CREATE / UPDATE ---------------- */

export const saveNews = async (req, res) => {
  try {
    const {
      id,
      title,
      type,
      fileType,
      linkUrl,
      existingFileUrl,
      existingFileName,
      existingFileSize,
    } = req.body;

    let fileUrl = linkUrl || null;
    let fileName = linkUrl || null;
    let fileSize = "-";

    /* ---------- FILE UPLOAD ---------- */

    if (req.file) {
      fileUrl = `/assets/news/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
    } else if (existingFileUrl && fileType !== "link") {
      fileUrl = existingFileUrl;
      fileName = existingFileName;
      fileSize = existingFileSize;
    }

    /* ---------- UPDATE ---------- */

    if (id) {
      const existing = await prisma.newsNotice.findUnique({
        where: { id: Number(id) },
      });

      if (!existing) {
        return res.status(404).json({ error: "Not found" });
      }

      // delete old file if new file uploaded
      if (req.file && existing.fileUrl) {
        const oldPath = path.join(process.cwd(), existing.fileUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await prisma.newsNotice.update({
        where: { id: Number(id) },
        data: {
          title,
          type,
          fileType,
          fileUrl,
          fileName,
          fileSize,
        },
      });

      return res.json({ success: true });
    }

    /* ---------- CREATE ---------- */

    await prisma.newsNotice.create({
      data: {
        title,
        type,
        fileType,
        fileUrl,
        fileName,
        fileSize,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- DELETE ---------------- */

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.newsNotice.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Not found" });
    }

    // delete physical file if exists
    if (existing.fileUrl && !existing.fileUrl.startsWith("http")) {
      const filePath = path.join(
        process.cwd(),
        "src", // remove this if assets is not inside src
        existing.fileUrl.replace(/^\/+/, "")
      );

      console.log("Deleting:", filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File deleted successfully");
      } else {
        console.log("File not found");
      }
    }


    await prisma.newsNotice.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
