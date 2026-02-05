import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;
dotenv.config();
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    prisma = new PrismaClient();
    global.cachedPrisma = prisma;

    
  }

  prisma = global.cachedPrisma;
}

export const db: PrismaClient = prisma;
export default prisma;