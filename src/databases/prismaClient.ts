//@ts-ignore
import { PrismaClient } from '@prisma/client'
// const { PrismaClient } = require("@prisma/client");
const prismaClient = new PrismaClient();
export { prismaClient };
