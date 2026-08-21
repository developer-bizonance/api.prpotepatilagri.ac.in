import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- GET ALL ---------------- */

export const getMuhs = async (req, res) => {
  try {
    const data = await prisma.muhsTab.findMany({
      orderBy: { title: "desc" },
      include: {
        sections: {
          orderBy: { id: "asc" },
          include: {
            pdfs: true,
          },
        },
      },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load MUHS data" });
  }
};

/* ---------------- FULL SYNC ---------------- */

export const saveMuhs = async (req, res) => {
  try {
    const { tabData } = req.body;
    const data = JSON.parse(tabData);
    const files = req.files || [];

    await prisma.$transaction(async (tx) => {
      let tab;

      /* ---- CREATE OR UPDATE TAB ---- */

      if (!data.id || String(data.id).length > 10) {
        tab = await tx.muhsTab.create({
          data: { title: data.title },
        });
      } else {
        tab = await tx.muhsTab.update({
          where: { id: Number(data.id) },
          data: { title: data.title },
        });

        await tx.muhsSection.deleteMany({
          where: { tabId: tab.id },
        });
      }

      /* ---- INSERT SECTIONS ---- */

      for (const section of data.sections) {
        const newSection = await tx.muhsSection.create({
          data: {
            title: section.sectionTitle,
            tabId: tab.id,
          },
        });

        /* ---- INSERT FILES ---- */

        for (const pdf of section.files) {
          let fileUrl = pdf.url;

          if (pdf.tempId) {
            const uploadedFile = files.find(
              (f) => f.fieldname === pdf.tempId
            );

            if (uploadedFile) {
              fileUrl = `/assets/muhs/${uploadedFile.filename}`;
            }
          }

          if (fileUrl && !fileUrl.startsWith("blob:")) {
            await tx.muhsPdf.create({
              data: {
                name: pdf.name,
                pdf_path: fileUrl,
                sectionId: newSection.id,
              },
            });
          }
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
};

/* ---------------- DELETE TAB ---------------- */

export const deleteMuhs = async (req, res) => {
  try {
    const { id } = req.params;

    const tab = await prisma.muhsTab.findUnique({
      where: { id: Number(id) },
      include: {
        sections: {
          include: { pdfs: true },
        },
      },
    });

    if (!tab) {
      return res.status(404).json({ error: "Not found" });
    }

    // Delete physical files
    for (const section of tab.sections) {
      for (const pdf of section.pdfs) {
        const filePath = path.join(
          process.cwd(),
          pdf.pdf_path
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await prisma.muhsTab.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
};
