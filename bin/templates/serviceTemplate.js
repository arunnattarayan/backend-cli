"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServiceTemplate = generateServiceTemplate;
function generateServiceTemplate(resourceName, pascalName) {
    return `import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class ${pascalName}Service {
  async create(data: any) {
    return prisma.${resourceName}.create({ data });
  }
  async findById(id: string) {
    return prisma.${resourceName}.findUnique({ where: { id } });
  }
  async findAll(skip = 0, take = 10) {
    return prisma.${resourceName}.findMany({ skip, take });
  }
  async update(id: string, data: any) {
    return prisma.${resourceName}.update({ where: { id }, data });
  }
  async delete(id: string) {
    return prisma.${resourceName}.delete({ where: { id } });
  }
}`;
}
