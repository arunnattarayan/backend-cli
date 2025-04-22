"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateControllerTemplate = generateControllerTemplate;
function generateControllerTemplate(resourceName, pascalName) {
    return `import { Request, Response } from 'express';
import { ${pascalName}Service } from '../services/${resourceName}.service';
import { wrapAsync } from '../utils/wrapAsync';

const service = new ${pascalName}Service();

export const create${pascalName} = wrapAsync(async (req: Request, res: Response) => {
  const result = await service.create(req.body);
  res.json(result);
});

export const get${pascalName}ById = wrapAsync(async (req: Request, res: Response) => {
  const result = await service.findById(req.params.id);
  res.json(result);
});

export const getAll${pascalName}s =wrapAsync(async (req: Request, res: Response) => {
  const { skip = 0, take = 10 } = req.query;
  const result = await service.findAll(Number(skip), Number(take));
  res.json(result);
});

export const update${pascalName} = wrapAsync(async (req: Request, res: Response) => {
  const result = await service.update(req.params.id, req.body);
  res.json(result);
});

export const delete${pascalName} = wrapAsync(async (req: Request, res: Response) => {
  const result = await service.delete(req.params.id);
  res.json(result);
});`;
}
