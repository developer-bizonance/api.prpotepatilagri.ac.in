import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { id: "asc" },
      include: {
        details: true,
        pdfs: true,
        photos: true,
        videos: true,
      },
    });

    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load departments" });
  }
};

/* ---------------- CREATE ---------------- */
export const saveDepartment = async (req, res) => {
  try {
    const { departmentData } = req.body;
    const data = JSON.parse(departmentData);
    const files = req.files || [];

    await prisma.$transaction(async (tx) => {
      let dept;

      /* ---- CREATE OR UPDATE DEPARTMENT ---- */

      if (!data.id || String(data.id).length > 10) {
        dept = await tx.department.create({
          data: { name: data.title },
        });
      } else {
        dept = await tx.department.update({
          where: { id: Number(data.id) },
          data: { name: data.title },
        });
      }

      /* ---- DESCRIPTION ---- */

      await tx.departmentDetail.deleteMany({
        where: { departmentId: dept.id },
      });

      if (data.section.description) {
        await tx.departmentDetail.create({
          data: {
            departmentId: dept.id,
            description: data.section.description,
          },
        });
      }

      /* ---- DELETE OLD FILE RECORDS ---- */

      await tx.departmentPdf.deleteMany({
        where: { departmentId: dept.id },
      });

      await tx.departmentPhoto.deleteMany({
        where: { departmentId: dept.id },
      });

      await tx.departmentVideo.deleteMany({
        where: { departmentId: dept.id },
      });

      /* ---- INSERT PDFS ---- */

      for (const pdf of data.section.pdfs) {
        let url = pdf.url;

        if (pdf.tempId) {
          const uploaded = files.find(
            (f) => f.fieldname === pdf.tempId
          );
          if (uploaded) {
            url = `/assets/departments/${uploaded.filename}`;
          }
        }

        if (url && !url.startsWith("blob:")) {
          await tx.departmentPdf.create({
            data: {
              departmentId: dept.id,
              title: pdf.title,
              fileName: pdf.fileName,
              fileUrl: url,
              fileSize: pdf.fileSize || "0 MB",
            },
          });
        }
      }

      /* ---- INSERT PHOTOS ---- */

      for (const photo of data.section.photos) {
        let url = photo.url;

        if (photo.tempId) {
          const uploaded = files.find(
            (f) => f.fieldname === photo.tempId
          );
          if (uploaded) {
            url = `/assets/departments/${uploaded.filename}`;
          }
        }

        if (url && !url.startsWith("blob:")) {
          await tx.departmentPhoto.create({
            data: {
              departmentId: dept.id,
              fileName: photo.fileName,
              photoUrl: url,
            },
          });
        }
      }

      /* ---- INSERT VIDEOS ---- */

      for (const video of data.section.videos) {
        await tx.departmentVideo.create({
          data: {
            departmentId: dept.id,
            title: video.title,
            videoUrl: video.url,
          },
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const dept = await prisma.department.findUnique({
      where: { id: Number(id) },
      include: { pdfs: true, photos: true },
    });

    if (!dept) {
      return res.status(404).json({ error: "Not found" });
    }

    // Delete physical files
    const allFiles = [...dept.pdfs, ...dept.photos];

    for (const file of allFiles) {
      const filePath = path.join(
        process.cwd(),
        file.fileUrl || file.photoUrl
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.department.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
