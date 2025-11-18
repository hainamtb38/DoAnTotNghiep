import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // Nếu chưa có admin thì tạo mới
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {}, // nếu đã tồn tại thì không làm gì
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: password,
      role: "admin",
    },
  });

  console.log("Seeded admin account:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
