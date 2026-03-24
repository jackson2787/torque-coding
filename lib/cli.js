const prompts = require('prompts');
const path = require('path');
const fs = require('fs');
const {
  copyCore,
  copyCoreClaude,
  copySkillPack,
  copySkillPackClaude,
  copyOptionalSkill,
  copyOptionalSkillClaude,
  stageSkill,
  mergeInjectedSkills,
  mergeInjectedSkillsClaude,
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

const TARGETS = {
  generic: {
    label: 'Generic (Cursor, Copilot, Cline, Aider — uses AGENTS.md)',
    coreDoc: 'AGENTS.md',
    skillsDir: '.agent/skills',
    managedRoots: ['AGENTS.md', '.agent/skills'],
  },
  'claude-code': {
    label: 'Claude Code (uses CLAUDE.md + .claude/ native skills)',
    coreDoc: 'CLAUDE.md',
    skillsDir: '.claude/skills',
    managedRoots: ['CLAUDE.md', '.claude/skills', '.claude/rules'],
  },
};

function managedRootsForTarget(target) {
  const t = TARGETS[target] || TARGETS.generic;
  return t.managedRoots;
}

function buildManifest({ version, target, packs, optional, stagedSkills, copyCoreDoc, fileChecksums }) {
  return {
    schemaVersion: 3,
    packageVersion: version,
    installedAt: new Date().toISOString(),
    target: target || 'generic',
    copyCoreDoc: Boolean(copyCoreDoc),
    managedRoots: managedRootsForTarget(target),
    packs: packs || [],
    optional: optional || [],
    stagedSkills: stagedSkills || [],
    fileChecksums: fileChecksums || {},
  };
}

function collectManagedChecksums(targetDir, target) {
  return collectPathChecksums(targetDir, managedRootsForTarget(target));
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
  // Try Claude Code target first
  const claudeSkillsRoot = path.join(targetDir, '.claude', 'skills');
  if (fs.existsSync(claudeSkillsRoot) && fs.existsSync(path.join(targetDir, 'CLAUDE.md'))) {
    return inferManifestFromSkillsDir(targetDir, claudeSkillsRoot, 'claude-code');
  }

  // Fall back to generic target
  const agentSkillsRoot = path.join(targetDir, '.agent', 'skills');
  if (fs.existsSync(agentSkillsRoot)) {
    return inferManifestFromSkillsDir(targetDir, agentSkillsRoot, 'generic');
  }

  return null;
}

function inferManifestFromSkillsDir(targetDir, skillsRoot, target) {
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
    target,
    copyCoreDoc: true,
    packs,
    optional,
    stagedSkills,
  };
}

/**
 * Install managed files for the Generic target (AGENTS.md + .agent/).
 */
function installManagedFilesGeneric(pkgRoot, targetDir, selection, options = {}) {
  const {
    includeBootstrapArtifacts = true,
    includeMemoryBankScaffold = false,
    allowStagedSkills = true,
    forceCopyCoreDoc = false,
  } = options;

  const agentDir = path.join(targetDir, '.agent');
  const packValues = selection.packs || [];
  const optionalSkills = selection.optional || [];

  copyCore(pkgRoot, agentDir, {
    copyAgentsMd: forceCopyCoreDoc ? true : Boolean(selection.copyCoreDoc),
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

/**
 * Install managed files for the Claude Code target (CLAUDE.md + .claude/).
 */
function installManagedFilesClaude(pkgRoot, targetDir, selection, options = {}) {
  const {
    includeBootstrapArtifacts = true,
    includeMemoryBankScaffold = false,
    allowStagedSkills = true,
    forceCopyCoreDoc = false,
  } = options;

  const claudeDir = path.join(targetDir, '.claude');
  const packValues = selection.packs || [];
  const optionalSkills = selection.optional || [];

  copyCoreClaude(pkgRoot, targetDir, {
    copyCoreDoc: forceCopyCoreDoc ? true : Boolean(selection.copyCoreDoc),
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
      const count = copySkillPackClaude(pkgRoot, claudeDir, dir);
      packResults.push({ packValue: pack.value, packTitle: pack.title, dir, count });
    }
  }

  if (selectedPackDirs.length > 0) {
    mergeInjectedSkillsClaude(pkgRoot, claudeDir, selectedPackDirs);
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

    copyOptionalSkillClaude(pkgRoot, claudeDir, skill);
  }

  if (includeMemoryBankScaffold) {
    scaffoldMemoryBank(pkgRoot, targetDir);
  }

  return { selectedPackDirs, stagedSkills, packResults };
}

/**
 * Dispatch to the correct installer based on target.
 */
function installManagedFiles(pkgRoot, targetDir, selection, options = {}) {
  if (selection.target === 'claude-code') {
    return installManagedFilesClaude(pkgRoot, targetDir, selection, options);
  }
  return installManagedFilesGeneric(pkgRoot, targetDir, selection, options);
}

function onCancel() {
  console.log('\nInstallation cancelled.');
  process.exit(0);
}

async function run() {
  const pkgRoot = path.resolve(__dirname, '..');
  const targetDir = process.cwd();
  const version = readVersion(pkgRoot);

  console.log(`\n  ${bold('torque-coding')} ${dim(`v${version}`)}\n`);
  console.log(`  ${dim('Target:')} ${targetDir}\n`);

  // Detect existing installation
  const existingAgent = fs.existsSync(path.join(targetDir, '.agent'));
  const existingClaude = fs.existsSync(path.join(targetDir, '.claude', 'skills'));
  if (existingAgent || existingClaude) {
    const which = existingClaude ? '.claude/' : '.agent/';
    console.log(`  ${dim(`${which} exists — updating playbook files in place`)}\n`);
  }

  // Target selection
  const { target } = await prompts({
    type: 'select',
    name: 'target',
    message: 'Which AI agent target?',
    choices: [
      { title: TARGETS.generic.label, value: 'generic' },
      { title: TARGETS['claude-code'].label, value: 'claude-code' },
    ],
  }, { onCancel });

  const targetConfig = TARGETS[target];
  const coreDoc = targetConfig.coreDoc;
  const skillsPath = targetConfig.skillsDir;

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

  // Core doc goes to project root — confirm overwrite if exists
  const coreDocDest = path.join(targetDir, coreDoc);
  let copyCoreDoc = true;
  if (fs.existsSync(coreDocDest)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `${coreDoc} already exists in project root. Overwrite?`,
      initial: false,
    }, { onCancel });
    copyCoreDoc = overwrite;
  }

  console.log(`\n  Installing (${target})...\n`);

  const selection = { target, packs, optional, copyCoreDoc };
  const { packResults, stagedSkills } = installManagedFiles(pkgRoot, targetDir, selection, {
    includeBootstrapArtifacts: true,
    includeMemoryBankScaffold: true,
    allowStagedSkills: true,
  });

  if (copyCoreDoc) {
    log('Core operating model', coreDoc);
  } else {
    log('Core operating model', `${coreDoc} (skipped — kept existing)`);
  }

  if (target === 'claude-code') {
    log('Claude rules (4)', '.claude/rules/');
  }

  log('State machine skills (4)', `${skillsPath}/state-machine/`);
  log('Memory bank skills (7)', `${skillsPath}/memory-bank/`);
  log('Bootstrap contract', 'docs/memory-bank/');
  log('Templates (4)', 'docs/memory-bank/templates/');

  // 2. Skill packs — collect unique dirs to avoid copying shared skills twice
  for (const result of packResults) {
    log(`${result.packTitle} — ${result.dir} (${result.count} skills)`, `${skillsPath}/`);
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
      log(skill, `${skillsPath}/${skill}/`);
    }
  }

  // 5. Scaffold memory bank
  scaffoldMemoryBank(pkgRoot, targetDir);
  log('Memory bank scaffolded', '.memory-bank/');

  const fileChecksums = collectManagedChecksums(targetDir, target);

  writeInstallManifest(targetDir, buildManifest({
    version,
    target,
    packs,
    optional,
    stagedSkills,
    copyCoreDoc,
    fileChecksums,
  }));

  // Done
  console.log(`\n  ${green('Done.')}\n`);
  console.log(`  ${bold('Next steps:')}`);
  console.log(`  1. Open a new AI session and run:`);
  console.log(`     ${cyan('"Read docs/memory-bank/bootstrap-memory-bank-contract.md and execute it."')}`);
  console.log(`  2. This scans your actual repo code to populate the memory bank.`);

  const commitFiles = target === 'claude-code'
    ? `${cyan('CLAUDE.md')}, ${cyan('.claude/')}, ${cyan('docs/memory-bank/')}, ${cyan('.memory-bank/')}, and ${cyan('.torque-coding.json')}`
    : `${cyan('AGENTS.md')}, ${cyan('.agent/')}, ${cyan('docs/memory-bank/')}, ${cyan('.memory-bank/')}, and ${cyan('.torque-coding.json')}`;

  if (stagedSkills.length > 0) {
    console.log(`  3. Install staged skills by asking your agent:`);
    for (const skill of stagedSkills) {
      console.log(`     ${cyan(`"Read docs/memory-bank/skills-to-install/${skill}/installation.md and execute it."`)}`);
    }
    console.log(`  4. Commit ${commitFiles}.\n`);
  } else {
    console.log(`  3. Commit ${commitFiles}.\n`);
  }

  console.log(`  ${dim(`Version ${version} installed (${target}).`)}\n`);
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

  // Resolve target — default to 'generic' for v2 manifests without target field
  const target = manifest.target || 'generic';
  const targetConfig = TARGETS[target];
  const coreDoc = targetConfig.coreDoc;
  const skillsPath = targetConfig.skillsDir;

  const checksumBaseline = manifest.fileChecksums || {};
  const hasChecksumBaseline = Object.keys(checksumBaseline).length > 0;

  if (hasChecksumBaseline) {
    const currentChecksums = collectManagedChecksums(targetDir, target);
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
    target,
    packs: manifest.packs || [],
    optional: manifest.optional || [],
    copyCoreDoc: true,
  };

  const { packResults } = installManagedFiles(pkgRoot, targetDir, selection, {
    includeBootstrapArtifacts: false,
    includeMemoryBankScaffold: false,
    allowStagedSkills: false,
    forceCopyCoreDoc: true,
  });

  if (inferred) {
    console.log(`  ${dim(`No manifest found — inferred the installed skill set from ${skillsPath}`)}\n`);
  }

  log('Core operating model', coreDoc);

  if (target === 'claude-code') {
    log('Claude rules (4)', '.claude/rules/');
  }

  log('State machine skills (4)', `${skillsPath}/state-machine/`);
  log('Memory bank skills (7)', `${skillsPath}/memory-bank/`);

  for (const result of packResults) {
    log(`${result.packTitle} — ${result.dir} (${result.count} skills)`, `${skillsPath}/`);
  }

  for (const skill of selection.optional) {
    if (STAGED_SKILLS.has(skill)) {
      log(`${skill} (skipped in update mode)`, 'docs/memory-bank/skills-to-install/');
    } else {
      log(skill, `${skillsPath}/${skill}/`);
    }
  }

  const stagedSkills = (manifest.stagedSkills || []).filter((skill) => STAGED_SKILLS.has(skill));
  if (stagedSkills.length > 0) {
    console.log(`  ${dim(`Skipped staged docs-only skills: ${stagedSkills.join(', ')}`)}`);
  }

  writeInstallManifest(targetDir, buildManifest({
    version,
    target,
    packs: selection.packs,
    optional: selection.optional,
    stagedSkills,
    copyCoreDoc: true,
    fileChecksums: collectManagedChecksums(targetDir, target),
  }));

  console.log(`\n  ${green('Done.')}\n`);
  console.log(`  ${dim(`Version ${version} refreshed (${target}).`)}\n`);
}

function log(label, target) {
  console.log(`  ${green('✓')} ${label.padEnd(38)} ${dim('→')} ${target}`);
}

module.exports = { run, update };
