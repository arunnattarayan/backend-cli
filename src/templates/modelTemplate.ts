export function generateModelTemplate(resourceName: string, pascalName: string, fieldsArr:any): string {
  return `export interface ${pascalName} {
${fieldsArr.map((f: { name: any; optional: any; type: any; }) => `  ${f.name}${f.optional ? '?' : ''}: ${f.type};`).join('\n')}
}`;
}
