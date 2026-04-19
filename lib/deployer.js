'use strict';

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const PKG_ROOT = path.resolve(__dirname, '..');

// Files copied to the consumer project root
const ROOT_FILES = ['AGENTS.md', 'CLAUDE.md', 'bootstrap-memory-bank-contract.md'];

// Directories copied into .claude/ in the consumer project
const CLAUDE_DIRS = ['rules', 'skills'];

function cpSync(src, dest) {
  // fs.cpSync is Node 16.7+; we require Node 18 so this is safe
  fs.cpSync(src, dest, { recursive: true, force: true });
}

async function deploy(targetDir) {
  const claudeDir = path.join(targetDir, '.claude');

  console.log(`\nDeploying rules and skills to ${targetDir} ...\n`);

  // Deploy root-level entry files (prompt if they already exist and were likely customised)
  for (const file of ROOT_FILES) {
    const dest = path.join(targetDir, file);
    const src = path.join(PKG_ROOT, file);

    if (fs.existsSync(dest)) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `${file} already exists in the project root. Overwrite with the package version?`,
        initial: false,
      });
      if (!overwrite) {
        console.log(`  — skipped ${file} (kept existing)`);
        continue;
      }
    }

    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${file}`);
  }

  // Deploy .claude/rules/ and .claude/skills/ (always overwrite on deploy)
  fs.mkdirSync(claudeDir, { recursive: true });
  for (const dir of CLAUDE_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    const dest = path.join(claudeDir, dir);
    cpSync(src, dest);
    console.log(`  ✓ .claude/${dir}/`);
  }

  console.log(`
Deployment complete.

  Project root: AGENTS.md, CLAUDE.md, bootstrap-memory-bank-contract.md
  Claude Code:  .claude/rules/, .claude/skills/

Note: CLAUDE.md uses @rules/ imports that resolve from the project root.
      .claude/rules/ is a copy for tools that look there by convention.
`);
}

async function update(targetDir) {
  const claudeDir = path.join(targetDir, '.claude');

  // Verify this looks like an initialised torque-coding project
  const mbRoot = path.join(targetDir, '.memory-bank-v2');
  if (!fs.existsSync(mbRoot)) {
    console.warn(`Warning: No .memory-bank-v2/ found at ${targetDir}.`);
    console.warn('Run "torque-coding init" first to initialise the memory bank.\n');
  }

  console.log(`\nUpdating rules and skills at ${targetDir} ...\n`);

  // Only update .claude/ dirs — never touch .memory-bank-v2/ or root entry files without asking
  fs.mkdirSync(claudeDir, { recursive: true });
  for (const dir of CLAUDE_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    const dest = path.join(claudeDir, dir);
    cpSync(src, dest);
    console.log(`  ✓ .claude/${dir}/ (updated)`);
  }

  // Prompt before overwriting root entry files on update
  for (const file of ROOT_FILES) {
    const dest = path.join(targetDir, file);
    const src = path.join(PKG_ROOT, file);

    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file} (added)`);
      continue;
    }

    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Update ${file} from package? (you may have customised this file)`,
      initial: false,
    });

    if (overwrite) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file} (updated)`);
    } else {
      console.log(`  — ${file} (kept existing)`);
    }
  }

  console.log('\nUpdate complete. .memory-bank-v2/ was not touched.\n');
}

module.exports = { deploy, update };
