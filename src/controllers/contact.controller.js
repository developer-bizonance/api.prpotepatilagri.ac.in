import prisma from "../lib/prisma.js";

/* ---------------- GET CONTACT ---------------- */

export const getContact = async (req, res) => {
  try {
    const contact = await prisma.contactInfo.findUnique({
      where: { id: 1 },
    });

    res.json(contact || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
};

/* ---------------- UPSERT CONTACT ---------------- */

export const saveContact = async (req, res) => {
  try {
    const {
      address,
      phone,
      alternate_phone,
      email,
      map_link,
      facebook,
      instagram,
      youtube,
      google,
      whatsapp,
    } = req.body;

    const data = {
      address,
      phone,
      alternatePhone: alternate_phone,
      email,
      mapLink: map_link,
      facebook,
      instagram,
      youtube,
      google,
      whatsapp,
    };

    const result = await prisma.contactInfo.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data,
      },
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};
