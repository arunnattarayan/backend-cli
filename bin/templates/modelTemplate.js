"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModelTemplate = generateModelTemplate;
function generateModelTemplate(resourceName, pascalName, fieldsArr) {
    return `export interface ${pascalName} {
${fieldsArr.map((f) => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`).join('\n')}
}`;
}
