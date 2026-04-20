'use strict';

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

// Resolve the package root (one level up from lib/)
const PKG_ROOT = path.resolve(__dirname, '..');

const MACHINE_TEMPLATES = [
  'constitution.md',
  'operational-context.md',
  'limits.md',
  'activeContext.md',
];

const HUMAN_DIRS = ['decisions', 'tasks', 'meetings', 'rationale', 'progress'];

function stubIndex(dirName) {
  const title = dirName.charAt(0).toUpperCase() + dirName.slice(1);
  return `# ${title} Index\n\n<!-- Maintained by update-human-log skill. Do not edit manually. -->\n\n*(no entries yet)*\n`;
}

async function init(targetDir) {
  const mbRoot = path.join(targetDir, '.memory-bank-v2');
  const machineDir = path.join(mbRoot, 'machine');
  const currentTaskDir = path.join(machineDir, 'current-task');
  const humanDir = path.join(mbRoot, 'human');

  // Check if memory bank already exists
  if (fs.existsSync(mbRoot)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Memory bank already exists at ${mbRoot}.\nOverwrite machine templates? (human/ data is never overwritten)`,
      initial: false,
    });
    if (!overwrite) {
      console.log('\nAborted. No changes made.');
      return;
    }
  }

  console.log(`\nInitialising memory bank at ${mbRoot} ...\n`);

  // Create directory structure
  fs.mkdirSync(machineDir, { recursive: true });
  fs.mkdirSync(currentTaskDir, { recursive: true });
  for (const dir of HUMAN_DIRS) {
    fs.mkdirSync(path.join(humanDir, dir), { recursive: true });
  }

  // Copy machine templates (always overwrite on re-init)
  const templateSrc = path.join(PKG_ROOT, 'templates', 'machine');
  for (const file of MACHINE_TEMPLATES) {
    const src = path.join(templateSrc, file);
    const dest = path.join(machineDir, file);
    fs.copyFileSync(src, dest);
    console.log(`  ✓ machine/${file}`);
  }

  // Copy human README
  const humanReadmeSrc = path.join(PKG_ROOT, 'templates', 'human', 'README.md');
  const humanReadmeDest = path.join(humanDir, 'README.md');
  if (!fs.existsSync(humanReadmeDest)) {
    fs.copyFileSync(humanReadmeSrc, humanReadmeDest);
    console.log('  ✓ human/README.md');
  }

  // Create stub INDEX.md files in human subdirs (never overwrite existing)
  for (const dir of HUMAN_DIRS) {
    if (dir === 'progress') continue; // progress has no INDEX.md
    const indexPath = path.join(humanDir, dir, 'INDEX.md');
    if (!fs.existsSync(indexPath)) {
      fs.writeFileSync(indexPath, stubIndex(dir), 'utf8');
      console.log(`  ✓ human/${dir}/INDEX.md`);
    }
  }

  console.log(`
Memory bank initialised.

Next steps:
  1. Run the bootstrap contract to populate constitution.md and operational-context.md:
     Open bootstrap-memory-bank-contract.md and follow the prompts with your AI agent.

  2. Review and tune .memory-bank-v2/machine/limits.md if needed
     (defaults target a £20/month mid-tier plan).

  3. Start your first task — see GETTING-STARTED.md for a walkthrough.
`);
}

module.exports = { init };
