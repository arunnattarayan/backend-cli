// build-with-shebang.js
const fs = require('fs');
const path = './bin/index.js';
const shebang = '#!/usr/bin/env node\n';

const content = fs.readFileSync(path, 'utf8');
if (!content.startsWith(shebang)) {
  fs.writeFileSync(path, shebang + content);
  console.log('✅ Shebang added to bin/index.js');
} else {
  console.log('ℹ️ Shebang already present');
}
