import prisma from "../lib/prisma.js";

// 1. GET: Fetch all updates sorted by orderIndex
export const getUpdates = async (req, res) => {
  try {
    const updates = await prisma.newUpdateTab.findMany({
      include: {
        sections: {
          include: {
            pdfs: true,
          },
          orderBy: { orderIndex: "asc" }, // Ensure sections follow order
        },
      },
      orderBy: { orderIndex: "asc" }, // Ensure tabs follow order
    });
    res.json(updates);
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({ error: "Server error fetching updates" });
  }
};

// 2. POST: Create or Update a Tab
export const saveUpdate = async (req, res) => {
  try {
    const tabData = JSON.parse(req.body.tabData);
    const files = req.files || [];

    const getFilePath = (tempId) => {
      const file = files.find((f) => f.fieldname === tempId);
      return file ? `/assets/new_updates/${file.filename}` : null;
    };

    // Format the nested sections with orderIndex
    const formattedSections = tabData.sections.map((sec, index) => ({
      title: sec.sectionTitle,
      orderIndex: index, // Maintain section order
      pdfs: {
        create: sec.pdfFiles.map((pdf) => {
          let finalPath = pdf.url;
          if (pdf.tempId) {
            const newPath = getFilePath(pdf.tempId);
            if (newPath) finalPath = newPath;
          }
          return {
            name: pdf.name,
            pdfPath: finalPath || "",
          };
        }),
      },
    }));

    let result;

    if (tabData.id) {
      // --- UPDATE EXISTING TAB ---
      await prisma.newUpdateSection.deleteMany({
        where: { tabId: parseInt(tabData.id) },
      });

      result = await prisma.newUpdateTab.update({
        where: { id: parseInt(tabData.id) },
        data: {
          title: tabData.title,
          sections: {
            create: formattedSections,
          },
        },
      });
    } else {
      // --- CREATE NEW TAB ---
      // Get current count to set the next orderIndex
      const count = await prisma.newUpdateTab.count();
      
      result = await prisma.newUpdateTab.create({
        data: {
          title: tabData.title,
          orderIndex: count,
          sections: {
            create: formattedSections,
          },
        },
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error saving update:", error);
    res.status(500).json({ error: "Server error saving update" });
  }
};

// 3. PUT: Reorder Tabs (For Drag and Drop persistence)
export const reorderUpdates = async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array of IDs in new order

    const updates = orderedIds.map((id, index) =>
      prisma.newUpdateTab.update({
        where: { id: parseInt(id) },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);
    res.status(200).json({ message: "Sequence updated successfully" });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ error: "Failed to update sequence" });
  }
};

// 4. DELETE: Delete a Tab
export const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "null") {
      return res.status(400).json({ error: "Invalid ID provided" });
    }

    const tabId = parseInt(id);
    await prisma.newUpdateTab.delete({
      where: { id: tabId },
    });

    res.status(200).json({ message: "Tab and all associated sections deleted successfully" });
  } catch (error) {
    console.error("Error deleting tab:", error);
    res.status(500).json({ 
      error: "Server error deleting tab",
      details: error.message 
    });
  }
};