export function generateRouterTemplate(resourceName: string, pascalName: string): string {
  return `import { Router } from 'express';
import {
  create${pascalName},
  get${pascalName}ById,
  getAll${pascalName}s,
  update${pascalName},
  delete${pascalName}
} from '../controllers/${resourceName}.controller';

const router = Router();

router.post('/', create${pascalName});
router.get('/', getAll${pascalName}s);
router.get('/:id', get${pascalName}ById);
router.put('/:id', update${pascalName});
router.delete('/:id', delete${pascalName});

export default router;`;
}
