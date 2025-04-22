export default function findAllUtilTemplate() {
  return `// src/utils/prisma/findAll.ts
    import { PrismaClient } from '@prisma/client';

    interface FindAllOptions {
      skip?: number;
      take?: number;
      searchTerm?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }

    export async function findAll<T = any>({
      prisma,
      resourceName,
      searchableFields,
      options = {},
    }: {
      prisma: PrismaClient;
      resourceName: string;
      searchableFields: string[];
      options?: FindAllOptions;
    }): Promise<T[]> {
      const {
        skip = 0,
        take = 10,
        searchTerm,
        sortBy = 'createdAt',
        sortOrder = 'asc',
      } = options;

      const model = (prisma as any)[resourceName];
      if (!model) throw new Error('Model not found');

      const where = searchTerm
        ? {
            OR: searchableFields.map((field) => ({
              [field]: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            })),
          }
        : undefined;

      const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;

      return model.findMany({
        skip,
        take,
        where,
        orderBy,
      });
    }`

}