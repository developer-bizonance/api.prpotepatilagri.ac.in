
import prisma from "../lib/prisma.js";

// 1. Get all details (Sorted by orderIndex)
export const getDetails = async (req, res) => {
  try {
    const details = await prisma.universityDetail.findMany({
      orderBy: { orderIndex: "asc" },
    });
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch university details" });
  }
};

// 2. Create a new detail
export const createDetail = async (req, res) => {
  try {
    const { name, designation, image, featured } = req.body;
    const count = await prisma.universityDetail.count();
    
    const newDetail = await prisma.universityDetail.create({
      data: { 
        name, 
        designation, 
        image, 
        featured: featured || false,
        orderIndex: count 
      },
    });
    res.status(201).json(newDetail);
  } catch (error) {
    res.status(500).json({ error: "Failed to create detail" });
  }
};

// 3. Update an existing detail
export const updateDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, image, featured } = req.body;
    
    const updated = await prisma.universityDetail.update({
      where: { id: parseInt(id) },
      data: { name, designation, image, featured },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update detail" });
  }
};

// 4. Delete a detail
export const deleteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.universityDetail.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete detail" });
  }
};

// 5. Reorder details (Persist Drag and Drop)
export const reorderDetails = async (req, res) => {
  try {
    const { orderedIds } = req.body; // Expecting array of IDs in new order
    
    const updates = orderedIds.map((id, index) =>
      prisma.universityDetail.update({
        where: { id: parseInt(id) },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);
    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save new order" });
  }
};

// POST: Create
export const createDetails = async (req, res) => {
  try {
    const { name, designation, image, noteTitle, noteContent, featured } = req.body;
    const count = await prisma.universityDetails.count();
    
    const newDetail = await prisma.universityDetails.create({
      data: { name, designation, image, noteTitle, noteContent, featured: featured || false, orderIndex: count },
    });
    res.status(201).json(newDetail);
  } catch (error) {
    res.status(500).json({ error: "Failed to create detail" });
  }
};

// PUT: Update
export const updateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, image, noteTitle, noteContent, featured } = req.body;
    
    const updated = await prisma.universityDetails.update({
      where: { id: parseInt(id) },
      data: { name, designation, image, noteTitle, noteContent, featured },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update detail" });
  }
};