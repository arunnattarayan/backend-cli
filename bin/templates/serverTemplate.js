"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServerTemplate = generateServerTemplate;
function generateServerTemplate() {
    return `import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Server is running on port \${PORT}\`);
});`;
}
