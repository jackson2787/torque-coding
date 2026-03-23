const prompts = require('prompts');
const path = require('path');
const fs = require('fs');
const {
  copyCore,
  copySkillPack,
  copyOptionalSkill,
  stageSkill,
  mergeInjectedSkills,
  scaffoldMemoryBank,
  collectPathChecksums,
  writeInstallManifest,
  readInstallManifest,
} = require('./files');
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
const MANAGED_ROOTS = ['AGENTS.md', '.agent/skills'];

function buildManifest({ version, packs, optional, stagedSkills, copyAgentsMd, fileChecksums }) {
  return {
    schemaVersion: 2,
    packageVersion: version,
    installedAt: new Date().toISOString(),
    copyAgentsMd: Boolean(copyAgentsMd),
    managedRoots: MANAGED_ROOTS,
    packs: packs || [],
    optional: optional || [],
    stagedSkills: stagedSkills || [],
    fileChecksums: fileChecksums || {},
  };
}

function collectManagedChecksums(targetDir) {
  return collectPathChecksums(targetDir, MANAGED_ROOTS);
}

function diffChecksums(previous = {}, current = {}) {
  const modified = [];
  const missing = [];
  const added = [];

  for (const [file, checksum] of Object.entries(previous)) {
    if (!Object.prototype.hasOwnProperty.call(current, file)) {
      missing.push(file);
      continue;
    }

    if (current[file] !== checksum) {
      modified.push(file);
    }
  }

  for (const file of Object.keys(current)) {
    if (!Object.prototype.hasOwnProperty.call(previous, file)) {
      added.push(file);
    }
  }

  modified.sort();
  missing.sort();
  added.sort();

  return { modified, missing, added };
}

function summarizeDrift(drift, limit = 8) {
  const entries = [];
  for (const file of drift.modified) entries.push(`modified: ${file}`);
  for (const file of drift.missing) entries.push(`missing: ${file}`);
  for (const file of drift.added) entries.push(`added: ${file}`);

  const visible = entries.slice(0, limit);
  const remaining = entries.length - visible.length;

  return {
    count: entries.length,
    lines: visible,
    remaining,
  };
}

function inferManifestFromFilesystem(targetDir) {
  const skillsRoot = path.join(targetDir, '.agent', 'skills');
  if (!fs.existsSync(skillsRoot)) return null;

  const present = new Set(
    fs.readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  );

  const packs = [];
  if (
    present.has('backend-architect-supabase-hono') ||
    present.has('supabase-postgres-best-practices')
  ) {
    packs.push('backend');
  }
  if (
    present.has('react-native-skills') ||
    present.has('expo-native-data-fetching')
  ) {
    packs.push('mobile');
  }
  if (
    present.has('react-best-practices') ||
    present.has('next-best-practices') ||
    present.has('next-cache-components') ||
    present.has('next-upgrade')
  ) {
    packs.push('web');
  }

  const optional = OPTIONAL_SKILLS
    .filter((skill) => present.has(skill.value))
    .map((skill) => skill.value);

  const stagedSkills = STAGED_SKILLS.has('sync-api')
    ? (fs.existsSync(path.join(targetDir, 'docs', 'memory-bank', 'skills-to-install', 'sync-api'))
      ? ['sync-api']
      : [])
    : [];

  return {
    schemaVersion: 1,
    packageVersion: null,
    installedAt: null,
    copyAgentsMd: true,
    packs,
    optional,
    stagedSkills,
  };
}

function installManagedFiles(pkgRoot, targetDir, selection, options = {}) {
  const {
    includeBootstrapArtifacts = true,
    includeMemoryBankScaffold = false,
    allowStagedSkills = true,
    forceCopyAgentsMd = false,
  } = options;

  const agentDir = path.join(targetDir, '.agent');
  const packValues = selection.packs || [];
  const optionalSkills = selection.optional || [];

  copyCore(pkgRoot, agentDir, {
    copyAgentsMd: forceCopyAgentsMd ? true : Boolean(selection.copyAgentsMd),
    targetDir,
    includeBootstrapArtifacts,
  });

  const selectedPackDirs = [];
  const packResults = [];
  const copiedDirs = new Set();
  for (const packValue of packValues) {
    const pack = SKILL_PACKS.find((p) => p.value === packValue);
    if (!pack) continue;

    for (const dir of pack.dirs) {
      if (copiedDirs.has(dir)) continue;
      copiedDirs.add(dir);
      selectedPackDirs.push(dir);
      const count = copySkillPack(pkgRoot, agentDir, dir);
      packResults.push({ packValue: pack.value, packTitle: pack.title, dir, count });
    }
  }

  if (selectedPackDirs.length > 0) {
    mergeInjectedSkills(pkgRoot, agentDir, selectedPackDirs);
  }

  const stagedSkills = [];
  for (const skill of optionalSkills) {
    if (STAGED_SKILLS.has(skill)) {
      if (includeBootstrapArtifacts && allowStagedSkills) {
        stageSkill(pkgRoot, targetDir, skill);
        stagedSkills.push(skill);
      }
      continue;
    }

    copyOptionalSkill(pkgRoot, agentDir, skill);
  }

  if (includeMemoryBankScaffold) {
    scaffoldMemoryBank(pkgRoot, targetDir);
  }

  return { selectedPackDirs, stagedSkills, packResults };
}

function onCancel() {
  console.log('\nInstallation cancelled.');
  process.exit(0);
}

async function run() {
  const pkgRoot = path.resolve(__dirname, '..');
  const targetDir = process.cwd();
  const agentDir = path.join(targetDir, '.agent');
  const version = readVersion(pkgRoot);

  console.log(`\n  ${bold('torque-coding')} ${dim(`v${version}`)}\n`);
  console.log(`  ${dim('Target:')} ${targetDir}\n`);
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

  const selection = { packs, optional, copyAgentsMd };
  const { packResults, stagedSkills } = installManagedFiles(pkgRoot, targetDir, selection, {
    includeBootstrapArtifacts: true,
    includeMemoryBankScaffold: true,
    allowStagedSkills: true,
  });

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
  for (const result of packResults) {
    log(`${result.packTitle} — ${result.dir} (${result.count} skills)`, '.agent/skills/');
  }

  // 3. Merge injected skills from selected packs
  if (packResults.length > 0) {
    log('Injected skills configured', 'writing-plans + build-execution');
  }

  // 4. Optional skills
  for (const skill of optional) {
    if (STAGED_SKILLS.has(skill)) {
      log(skill, 'docs/memory-bank/skills-to-install/');
    } else {
      log(skill, `.agent/skills/${skill}/`);
    }
  }

  // 5. Scaffold memory bank
  scaffoldMemoryBank(pkgRoot, targetDir);
  log('Memory bank scaffolded', '.memory-bank/');

  const fileChecksums = collectManagedChecksums(targetDir);

  writeInstallManifest(targetDir, buildManifest({
    version,
    packs,
    optional,
    stagedSkills,
    copyAgentsMd,
    fileChecksums,
  }));

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
    console.log(`  4. Commit ${cyan('AGENTS.md')}, ${cyan('.agent/')}, ${cyan('docs/memory-bank/')}, ${cyan('.memory-bank/')}, and ${cyan('.torque-coding.json')}.\n`);
  } else {
    console.log(`  3. Commit ${cyan('AGENTS.md')}, ${cyan('.agent/')}, ${cyan('docs/memory-bank/')}, ${cyan('.memory-bank/')}, and ${cyan('.torque-coding.json')}.\n`);
  }

  console.log(`  ${dim(`Version ${version} installed.`)}\n`);
}

async function update() {
  const pkgRoot = path.resolve(__dirname, '..');
  const targetDir = process.cwd();
  const version = readVersion(pkgRoot);

  console.log(`\n  ${bold('torque-coding')} ${dim(`v${version}`)}\n`);
  console.log(`  ${dim('Target:')} ${targetDir}\n`);
  console.log(`  ${dim('Refreshing managed playbook files only (skips .memory-bank)')}\n`);

  let manifest = readInstallManifest(targetDir);
  let inferred = false;
  if (!manifest) {
    manifest = inferManifestFromFilesystem(targetDir);
    inferred = Boolean(manifest);
  }

  if (!manifest) {
    throw new Error(
      'No torque-coding manifest found and no installed skill set could be inferred. Run `torque-coding init` once to seed .torque-coding.json before using update.'
    );
  }

  const checksumBaseline = manifest.fileChecksums || {};
  const hasChecksumBaseline = Object.keys(checksumBaseline).length > 0;

  if (hasChecksumBaseline) {
    const currentChecksums = collectManagedChecksums(targetDir);
    const drift = diffChecksums(checksumBaseline, currentChecksums);
    const driftSummary = summarizeDrift(drift);

    if (driftSummary.count > 0) {
      console.log(`  ${dim('Local edits detected in managed files:')}`);
      for (const line of driftSummary.lines) {
        console.log(`  ${dim(`- ${line}`)}`);
      }
      if (driftSummary.remaining > 0) {
        console.log(`  ${dim(`- ...and ${driftSummary.remaining} more`)}`);
      }
      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Overwrite managed files and refresh the checksum baseline?',
        initial: false,
      }, { onCancel });

      if (!proceed) {
        console.log(`  ${dim('Update cancelled.')}\n`);
        return;
      }
    }
  } else {
    console.log(`  ${dim('No checksum baseline found for this install. Drift detection is unavailable until the manifest is refreshed.')}`);
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed and overwrite managed files anyway?',
      initial: false,
    }, { onCancel });

    if (!proceed) {
      console.log(`  ${dim('Update cancelled.')}\n`);
      return;
    }
  }

  const selection = {
    packs: manifest.packs || [],
    optional: manifest.optional || [],
    copyAgentsMd: true,
  };

  const { packResults } = installManagedFiles(pkgRoot, targetDir, selection, {
    includeBootstrapArtifacts: false,
    includeMemoryBankScaffold: false,
    allowStagedSkills: false,
    forceCopyAgentsMd: true,
  });

  if (inferred) {
    console.log(`  ${dim('No manifest found — inferred the installed skill set from .agent/skills')}\n`);
  }

  log('Core operating model', 'AGENTS.md');
  log('State machine skills (4)', '.agent/skills/state-machine/');
  log('Memory bank skills (7)', '.agent/skills/memory-bank/');

  for (const result of packResults) {
    log(`${result.packTitle} — ${result.dir} (${result.count} skills)`, '.agent/skills/');
  }

  for (const skill of selection.optional) {
    if (STAGED_SKILLS.has(skill)) {
      log(`${skill} (skipped in update mode)`, 'docs/memory-bank/skills-to-install/');
    } else {
      log(skill, `.agent/skills/${skill}/`);
    }
  }

  const stagedSkills = (manifest.stagedSkills || []).filter((skill) => STAGED_SKILLS.has(skill));
  if (stagedSkills.length > 0) {
    console.log(`  ${dim(`Skipped staged docs-only skills: ${stagedSkills.join(', ')}`)}`);
  }

  writeInstallManifest(targetDir, buildManifest({
    version,
    packs: selection.packs,
    optional: selection.optional,
    stagedSkills,
    copyAgentsMd: true,
    fileChecksums: collectManagedChecksums(targetDir),
  }));

  console.log(`\n  ${green('Done.')}\n`);
  console.log(`  ${dim(`Version ${version} refreshed.`)}\n`);
}

function log(label, target) {
  console.log(`  ${green('✓')} ${label.padEnd(38)} ${dim('→')} ${target}`);
}

module.exports = { run, update };
