import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma.js";


const createAdmin = async () => {
  const hashed = await bcrypt.hash("admin123", 10);

  await prisma.admin.create({
    data: {
      username: "admin",
      password: hashed,
    },
  });
};

createAdmin();
