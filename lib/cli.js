const prompts = require('prompts');
const path = require('path');
const { copyCore, copySkillPack, copyOptionalSkill, mergeInjectedSkills, scaffoldMemoryBank } = require('./files');
const { readVersion } = require('./version');

// ANSI helpers
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

const SKILL_PACKS = [
  {
    title: 'Web (React / Next.js)',
    value: 'web',
    dirs: ['frontend-web-skills', 'frontend-shared-skills'],
  },
  {
    title: 'Mobile (React Native / Expo)',
    value: 'mobile',
    dirs: ['frontend-mobile-skills', 'frontend-shared-skills'],
  },
  {
    title: 'Backend (Supabase / Hono)',
    value: 'backend',
    dirs: ['backend-skills'],
  },
];

const OPTIONAL_SKILLS = [
  { title: 'idea-to-task', value: 'idea-to-task' },
  { title: 'best-practices-audit', value: 'best-practices-audit' },
  { title: 'sync-api', value: 'sync-api' },
  { title: 'legal-compliance-checker', value: 'legal-compliance-checker' },
];

function onCancel() {
  console.log('\nInstallation cancelled.');
  process.exit(0);
}

async function run() {
  const pkgRoot = path.resolve(__dirname, '..');
  const targetDir = process.cwd();
  const agentDir = path.join(targetDir, '.agent');
  const version = readVersion(pkgRoot);

  console.log(`\n  ${bold('agent-playbook')} ${dim(`v${version}`)}\n`);
  console.log(`  ${dim('Target:')} ${targetDir}\n`);

  // Check for existing install
  const fs = require('fs');
  if (fs.existsSync(agentDir)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: '.agent/ already exists. Overwrite?',
      initial: false,
    }, { onCancel });

    if (!overwrite) {
      console.log('\nInstallation cancelled.');
      return;
    }

    fs.rmSync(agentDir, { recursive: true, force: true });
  }

  // Skill packs
  const { packs } = await prompts({
    type: 'multiselect',
    name: 'packs',
    message: 'What are you building?',
    choices: SKILL_PACKS,
    hint: '- Space to select. Enter to confirm. Empty for none.',
  }, { onCancel });

  // Optional skills
  const { optional } = await prompts({
    type: 'multiselect',
    name: 'optional',
    message: 'Include optional skills?',
    choices: OPTIONAL_SKILLS,
    hint: '- Space to select. Enter to confirm. Empty for none.',
  }, { onCancel });

  console.log(`\n  Installing...\n`);

  // 1. Core
  copyCore(pkgRoot, agentDir);
  log('Core operating model', '.agent/AGENTS.md');
  log('State machine skills (4)', '.agent/skills/state-machine/');
  log('Memory bank skills (7)', '.agent/skills/memory-bank/');
  log('Templates (4)', '.agent/templates/');
  log('Bootstrap contract', '.agent/bootstrap-memory-bank-contract.md');

  // 2. Skill packs — collect unique dirs to avoid copying shared skills twice
  const copiedDirs = new Set();
  const selectedPackDirs = [];

  for (const packValue of packs) {
    const pack = SKILL_PACKS.find((p) => p.value === packValue);
    for (const dir of pack.dirs) {
      if (!copiedDirs.has(dir)) {
        copiedDirs.add(dir);
        selectedPackDirs.push(dir);
        const count = copySkillPack(pkgRoot, agentDir, dir);
        log(`${pack.title} — ${dir} (${count} skills)`, '.agent/skills/');
      }
    }
  }

  // 3. Merge injected skills from selected packs
  if (selectedPackDirs.length > 0) {
    mergeInjectedSkills(pkgRoot, agentDir, selectedPackDirs);
    log('Injected skills configured', 'writing-plans + build-execution');
  }

  // 4. Optional skills
  for (const skill of optional) {
    copyOptionalSkill(pkgRoot, agentDir, skill);
    log(skill, `.agent/skills/${skill}/`);
  }

  // 5. Scaffold memory bank
  scaffoldMemoryBank(pkgRoot, targetDir);
  log('Memory bank scaffolded', 'memory-bank/');

  // Done
  console.log(`\n  ${green('Done.')}\n`);
  console.log(`  ${bold('Next steps:')}`);
  console.log(`  1. Open a new AI session and run:`);
  console.log(`     ${cyan('"Read .agent/bootstrap-memory-bank-contract.md and execute it."')}`);
  console.log(`  2. This scans your actual repo code to populate the memory bank.`);
  console.log(`  3. Commit the ${cyan('.agent/')} and ${cyan('memory-bank/')} directories.\n`);
  console.log(`  ${dim(`Version ${version} installed.`)}\n`);
}

function log(label, target) {
  console.log(`  ${green('✓')} ${label.padEnd(38)} ${dim('→')} ${target}`);
}

module.exports = { run };
