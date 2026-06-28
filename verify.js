const fs = require('fs');
const files = ['pages.json', 'manifest.json'];
for (const f of files) {
  try {
    JSON.parse(fs.readFileSync(f,'utf8'));
    console.log(f + ': OK');
  } catch(e) {
    console.log(f + ' ERROR: ' + e.message);
  }
}
