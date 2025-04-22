"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDbTemplate = generateDbTemplate;
function generateDbTemplate(usePrisma) {
    return usePrisma
        ? `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🗃️ Prisma connected');
  } catch (error) {
    console.error('Prisma connection error:', error);
    process.exit(1);
  }
};

export { connectDB, prisma };`
        : `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('🗃️ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;`;
}
