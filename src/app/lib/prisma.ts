// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalWithPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalWithPrisma.prisma ??
  new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") globalWithPrisma.prisma = prisma;
