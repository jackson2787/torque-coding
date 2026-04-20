'use strict';

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const PKG_ROOT = path.resolve(__dirname, '..');

const PLATFORMS = {
  claude: 'claude',
  other: 'other',
  both: 'both',
};

// Files copied to the consumer project root — src is relative to PKG_ROOT, name is the dest filename
const SHARED_ROOT_FILES = [
  { name: 'bootstrap-memory-bank-contract.md', src: 'bootstrap-memory-bank-contract.md' },
];

const ENTRY_FILES = [
  { name: 'AGENTS.md', src: path.join('agents', 'AGENTS.md') },
  { name: 'CLAUDE.md', src: path.join('agents', 'CLAUDE.md') },
];

// Directories copied into the consumer project root for shared entrypoint references.
const ROOT_RULE_DIR = 'rules';

// Directories copied into .claude/ in the consumer project.
const CLAUDE_DIRS = ['rules', 'skills'];

// Directories copied into .agent/ in the consumer project.
const AGENT_DIRS = ['rules', 'skills'];

function cpSync(src, dest) {
  // fs.cpSync is Node 16.7+; we require Node 18 so this is safe
  fs.cpSync(src, dest, { recursive: true, force: true });
}

function normalizePlatform(platform) {
  if (!platform) return PLATFORMS.both;
  return Object.values(PLATFORMS).includes(platform) ? platform : PLATFORMS.both;
}

function shouldInstallAgents(platform) {
  return platform === PLATFORMS.other || platform === PLATFORMS.both;
}

function shouldInstallClaude(platform) {
  return platform === PLATFORMS.claude || platform === PLATFORMS.both;
}

async function promptForOverwrite(dest, label, message) {
  if (!fs.existsSync(dest)) return true;

  const { overwrite } = await prompts({
    type: 'confirm',
    name: 'overwrite',
    message: message || `${label} already exists. Overwrite with the package version?`,
    initial: false,
  });

  return Boolean(overwrite);
}

async function copyRootFiles(targetDir, files, promptPrefix) {
  for (const file of files) {
    const dest = path.join(targetDir, file.name);
    const src = path.join(PKG_ROOT, file.src);
    const overwrite = await promptForOverwrite(
      dest,
      file.name,
      `${promptPrefix || file.name} already exists in the project root. Overwrite with the package version?`
    );

    if (!overwrite) {
      console.log(`  — skipped ${file.name} (kept existing)`);
      continue;
    }

    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${file.name}`);
  }
}

function copyRootRuleDir(targetDir) {
  const src = path.join(PKG_ROOT, ROOT_RULE_DIR);
  const dest = path.join(targetDir, ROOT_RULE_DIR);
  cpSync(src, dest);
  console.log(`  ✓ ${ROOT_RULE_DIR}/`);
}

function copyClaudeDirs(targetDir) {
  const claudeDir = path.join(targetDir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });
  for (const dir of CLAUDE_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    const dest = path.join(claudeDir, dir);
    cpSync(src, dest);
    console.log(`  ✓ .claude/${dir}/`);
  }
}

function copyAgentDirs(targetDir) {
  const agentDir = path.join(targetDir, '.agent');
  fs.mkdirSync(agentDir, { recursive: true });
  for (const dir of AGENT_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    const dest = path.join(agentDir, dir);
    cpSync(src, dest);
    console.log(`  ✓ .agent/${dir}/`);
  }
}

async function deploy(targetDir, platform) {
  const normalizedPlatform = normalizePlatform(platform);

  console.log(`\nDeploying rules and skills to ${targetDir} ...\n`);

  await copyRootFiles(targetDir, SHARED_ROOT_FILES);

  if (shouldInstallAgents(normalizedPlatform)) {
    copyAgentDirs(targetDir);
    await copyRootFiles(targetDir, [ENTRY_FILES[0]]);
  }

  if (shouldInstallClaude(normalizedPlatform)) {
    copyRootRuleDir(targetDir);
    await copyRootFiles(targetDir, [ENTRY_FILES[1]]);
    copyClaudeDirs(targetDir);
  }

  console.log(`
Deployment complete.

  Project root: ${shouldInstallClaude(normalizedPlatform) ? 'rules/, ' : ''}bootstrap-memory-bank-contract.md
  Tool entry files: ${shouldInstallAgents(normalizedPlatform) ? 'AGENTS.md ' : ''}${shouldInstallClaude(normalizedPlatform) ? 'CLAUDE.md' : ''}`.trimEnd());

  if (shouldInstallAgents(normalizedPlatform)) {
    console.log('  Other tools:  .agent/rules/, .agent/skills/');
  }

  if (shouldInstallClaude(normalizedPlatform)) {
    console.log('  Claude Code:  .claude/rules/, .claude/skills/');
  }

  console.log(`
Note: CLAUDE.md relies on the root-level rules/ directory for @rules imports.
      Other tools are deployed under .agent/ by convention.
      .claude/rules/ and .claude/skills/ are convenience mirrors for Claude Code.
`);
}

async function update(targetDir) {
  const claudeDir = path.join(targetDir, '.claude');
  const agentDir = path.join(targetDir, '.agent');
  const hasAgentsEntry = fs.existsSync(path.join(targetDir, 'AGENTS.md'));
  const hasClaudeEntry = fs.existsSync(path.join(targetDir, 'CLAUDE.md'));
  const hasClaudeMirror = fs.existsSync(claudeDir);
  const hasAgentMirror = fs.existsSync(agentDir);

  // Verify this looks like an initialised torque-coding project
  const mbRoot = path.join(targetDir, '.memory-bank-v2');
  if (!fs.existsSync(mbRoot)) {
    console.warn(`Warning: No .memory-bank-v2/ found at ${targetDir}.`);
    console.warn('Run "torque-coding init" first to initialise the memory bank.\n');
  }

  console.log(`\nUpdating rules and skills at ${targetDir} ...\n`);

  if (hasClaudeEntry || hasClaudeMirror) {
    copyRootRuleDir(targetDir);
  }

  if (hasAgentsEntry || hasAgentMirror) {
    copyAgentDirs(targetDir);
  }

  if (hasClaudeEntry || hasClaudeMirror) {
    copyClaudeDirs(targetDir);
  }

  // Prompt before overwriting root entry files on update
  const filesToUpdate = [...SHARED_ROOT_FILES];
  if (hasAgentsEntry) filesToUpdate.push(ENTRY_FILES[0]);
  if (hasClaudeEntry || hasClaudeMirror) filesToUpdate.push(ENTRY_FILES[1]);

  for (const file of filesToUpdate) {
    const dest = path.join(targetDir, file.name);
    const src = path.join(PKG_ROOT, file.src);

    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file.name} (added)`);
      continue;
    }

    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Update ${file.name} from package? (you may have customised this file)`,
      initial: false,
    });

    if (overwrite) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file.name} (updated)`);
    } else {
      console.log(`  — ${file.name} (kept existing)`);
    }
  }

  console.log('\nUpdate complete. .memory-bank-v2/ was not touched.\n');
}

module.exports = { deploy, update, PLATFORMS };
