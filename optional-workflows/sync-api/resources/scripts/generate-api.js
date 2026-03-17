const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_ROOT = path.resolve(__dirname, '../src/lib/api');

function main() {
  const isFull = process.argv.includes('--full');

  let dirtyTags = [];
  console.log('--- Slicing API ---');
  try {
    const output = execSync('node scripts/slice-openapi.js --list-dirty').toString().trim();
    dirtyTags = output.split(',').filter(Boolean);
    console.log(`Dirty tags: ${dirtyTags.length === 0 ? 'None' : dirtyTags.join(', ')}`);
  } catch (e) {
    console.error('Slicing failed:', e.message);
    process.exit(1);
  }

  if (isFull) {
    console.log('--- Running Full Regeneration ---');
    execSync('npx orval', { stdio: 'inherit' });
  } else if (dirtyTags.length === 0) {
    console.log('--- No changes detected. Skipping regeneration. ---');
  } else if (dirtyTags.length > 5) {
    // If everything changed, just run normal Orval for speed/consistency
    console.log('--- Many changes detected. Running Full Regeneration ---');
    execSync('npx orval', { stdio: 'inherit' });
  } else {
    console.log(`--- Regenerating ${dirtyTags.length} dirty slices ---`);
    for (const tag of dirtyTags) {
      console.log(`\nProcessing tag: ${tag}`);
      try {
        execSync('npx orval', {
          stdio: 'inherit',
          env: { ...process.env, ORVAL_TAG: tag },
        });
      } catch (e) {
        console.error(`Generation failed for tag ${tag}:`, e.message);
        process.exit(1);
      }
    }
  }
  console.log('\n--- API Generation Complete ---');
}

main();
