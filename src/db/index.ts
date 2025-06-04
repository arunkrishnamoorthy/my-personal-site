import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    prisma = new PrismaClient();
    global.cachedPrisma = prisma;

    
  }

  prisma = global.cachedPrisma;
}

export const db:PrismaClient = prisma;