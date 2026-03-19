const prompts = require('prompts');
const path = require('path');
const { copyCore, copySkillPack, copyOptionalSkill, stageSkill, mergeInjectedSkills, scaffoldMemoryBank } = require('./files');
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
  { title: 'legal-compliance-checker', value: 'legal-compliance-checker' },
  { title: 'sync-api (requires agent-assisted install)', value: 'sync-api' },
];

// Skills that need agent-assisted installation — staged to docs/memory-bank/skills-to-install/
const STAGED_SKILLS = new Set(['sync-api']);

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

  const fs = require('fs');
  const existing = fs.existsSync(agentDir);
  if (existing) {
    console.log(`  ${dim('.agent/ exists — updating playbook files in place')}\n`);
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

  // AGENTS.md goes to project root — confirm overwrite if exists
  const agentsMdDest = path.join(targetDir, 'AGENTS.md');
  let copyAgentsMd = true;
  if (fs.existsSync(agentsMdDest)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'AGENTS.md already exists in project root. Overwrite?',
      initial: false,
    }, { onCancel });
    copyAgentsMd = overwrite;
  }

  console.log(`\n  Installing...\n`);

  // 1. Core
  copyCore(pkgRoot, agentDir, { copyAgentsMd, targetDir });
  if (copyAgentsMd) {
    log('Core operating model', 'AGENTS.md');
  } else {
    log('Core operating model', 'AGENTS.md (skipped — kept existing)');
  }
  log('State machine skills (4)', '.agent/skills/state-machine/');
  log('Memory bank skills (7)', '.agent/skills/memory-bank/');
  log('Bootstrap contract', 'docs/memory-bank/');
  log('Templates (4)', 'docs/memory-bank/templates/');

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
  const stagedSkills = [];
  for (const skill of optional) {
    if (STAGED_SKILLS.has(skill)) {
      stageSkill(pkgRoot, targetDir, skill);
      log(skill, 'docs/memory-bank/skills-to-install/');
      stagedSkills.push(skill);
    } else {
      copyOptionalSkill(pkgRoot, agentDir, skill);
      log(skill, `.agent/skills/${skill}/`);
    }
  }

  // 5. Scaffold memory bank
  scaffoldMemoryBank(pkgRoot, targetDir);
  log('Memory bank scaffolded', '.memory-bank/');

  // Done
  console.log(`\n  ${green('Done.')}\n`);
  console.log(`  ${bold('Next steps:')}`);
  console.log(`  1. Open a new AI session and run:`);
  console.log(`     ${cyan('"Read docs/memory-bank/bootstrap-memory-bank-contract.md and execute it."')}`);
  console.log(`  2. This scans your actual repo code to populate the memory bank.`);

  if (stagedSkills.length > 0) {
    console.log(`  3. Install staged skills by asking your agent:`);
    for (const skill of stagedSkills) {
      console.log(`     ${cyan(`"Read docs/memory-bank/skills-to-install/${skill}/installation.md and execute it."`)}`);
    }
    console.log(`  4. Commit ${cyan('AGENTS.md')}, ${cyan('.agent/')}, ${cyan('docs/memory-bank/')}, and ${cyan('.memory-bank/')}.\n`);
  } else {
    console.log(`  3. Commit ${cyan('AGENTS.md')}, ${cyan('.agent/')}, ${cyan('docs/memory-bank/')}, and ${cyan('.memory-bank/')}.\n`);
  }

  console.log(`  ${dim(`Version ${version} installed.`)}\n`);
}

function log(label, target) {
  console.log(`  ${green('✓')} ${label.padEnd(38)} ${dim('→')} ${target}`);
}

module.exports = { run };
