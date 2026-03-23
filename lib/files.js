const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Wrap a file-system operation with a clear error message.
 */
function safe(description, fn) {
  try {
    return fn();
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error(`Permission denied: ${description}\n  ${err.path || ''}`);
    }
    if (err.code === 'ENOSPC') {
      throw new Error(`Disk full: ${description}`);
    }
    if (err.code === 'ENOENT') {
      throw new Error(`File not found: ${description}\n  ${err.path || ''}`);
    }
    throw new Error(`${description}: ${err.message}`);
  }
}

/**
 * Copy core operating model, skills, templates, and bootstrap contract.
 *
 * Options:
 * - copyAgentsMd: whether to copy AGENTS.md to project root (default true)
 * - targetDir: project root directory (required when copyAgentsMd is true)
 */
function copyCore(pkgRoot, agentDir, options = {}) {
  const {
    copyAgentsMd = true,
    targetDir,
    includeBootstrapArtifacts = true,
  } = options;

  safe('Create .agent directory', () =>
    fs.mkdirSync(agentDir, { recursive: true })
  );

  // AGENTS.md goes to project root, not .agent/
  if (copyAgentsMd) {
    const rootDir = targetDir || path.dirname(agentDir);
    safe('Copy AGENTS.md to project root', () =>
      fs.copyFileSync(
        path.join(pkgRoot, 'agent', 'AGENTS.md'),
        path.join(rootDir, 'AGENTS.md')
      )
    );
  }

  if (includeBootstrapArtifacts) {
    // Bootstrap contract and templates go to docs/memory-bank/
    const docsDir = path.join(path.dirname(agentDir), 'docs', 'memory-bank');
    safe('Create docs/memory-bank directory', () =>
      fs.mkdirSync(docsDir, { recursive: true })
    );

    safe('Copy bootstrap contract', () =>
      fs.copyFileSync(
        path.join(pkgRoot, 'agent', 'bootstrap-memory-bank-contract.md'),
        path.join(docsDir, 'bootstrap-memory-bank-contract.md')
      )
    );

    // Templates — only copy files that don't already exist
    const templatesTarget = path.join(docsDir, 'templates');
    safe('Create templates directory', () =>
      fs.mkdirSync(templatesTarget, { recursive: true })
    );
    const templatesSource = path.join(pkgRoot, 'agent', 'templates');
    for (const entry of fs.readdirSync(templatesSource, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue;
      const destPath = path.join(templatesTarget, entry.name);
      if (fs.existsSync(destPath)) continue;
      safe(`Copy template: ${entry.name}`, () =>
        fs.copyFileSync(path.join(templatesSource, entry.name), destPath)
      );
    }
  }

  // State machine skills
  safe('Copy state machine skills', () =>
    syncDirRecursive(
      path.join(pkgRoot, 'skills', 'state-machine'),
      path.join(agentDir, 'skills', 'state-machine')
    )
  );

  // Memory bank skills
  safe('Copy memory bank skills', () =>
    syncDirRecursive(
      path.join(pkgRoot, 'skills', 'memory-bank'),
      path.join(agentDir, 'skills', 'memory-bank')
    )
  );
}

/**
 * Copy skills from a skill pack directory.
 * Returns the number of skills copied.
 *
 * Skills are identified as subdirectories containing a SKILL.md file.
 * Injection files (plan.injected-skills.md, build.injected-skills.md) at
 * the pack root are handled separately by mergeInjectedSkills.
 */
function copySkillPack(pkgRoot, agentDir, packDirName) {
  const packDir = path.join(pkgRoot, 'skill-packs', packDirName);
  const skillsTarget = path.join(agentDir, 'skills');
  let count = 0;

  if (!fs.existsSync(packDir)) {
    throw new Error(`Skill pack not found: ${packDirName}\n  Expected at: ${packDir}`);
  }

  for (const entry of fs.readdirSync(packDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(packDir, entry.name);
    const skillMd = path.join(skillDir, 'SKILL.md');

    if (!fs.existsSync(skillMd)) continue;

    const target = path.join(skillsTarget, entry.name);

    safe(`Copy skill pack: ${packDirName}/${entry.name}`, () =>
      syncDirRecursive(skillDir, target)
    );
    count++;
  }

  return count;
}

/**
 * Copy an optional skill from optional-skills/ into .agent/skills/.
 */
function copyOptionalSkill(pkgRoot, agentDir, skillName) {
  const src = path.join(pkgRoot, 'optional-skills', skillName);
  const dest = path.join(agentDir, 'skills', skillName);

  if (!fs.existsSync(src)) {
    throw new Error(`Optional skill not found: ${skillName}\n  Expected at: ${src}`);
  }

  safe(`Copy optional skill: ${skillName}`, () =>
    syncDirRecursive(src, dest)
  );
}

/**
 * Stage a skill that requires agent-assisted installation.
 * Copies the full skill package to docs/memory-bank/skills-to-install/<name>/
 * so the user's agent can read installation.md and execute it.
 */
function stageSkill(pkgRoot, targetDir, skillName) {
  const src = path.join(pkgRoot, 'optional-skills', skillName);
  const dest = path.join(targetDir, 'docs', 'memory-bank', 'skills-to-install', skillName);

  if (!fs.existsSync(src)) {
    throw new Error(`Optional skill not found: ${skillName}\n  Expected at: ${src}`);
  }

  safe(`Stage skill for agent install: ${skillName}`, () =>
    syncDirRecursive(src, dest)
  );
}

/**
 * Merge injected-skills files from selected skill packs.
 *
 * For each type (plan/build), reads the injection file from each selected
 * pack directory, strips the top-level heading, and concatenates into a
 * single file at the target skill's references/injected-skills.md.
 *
 * The template header/comments from the existing injected-skills.md are
 * preserved as the top of the merged file.
 */
function mergeInjectedSkills(pkgRoot, agentDir, selectedPackDirs) {
  const targets = [
    {
      type: 'plan',
      sourceFile: 'plan.injected-skills.md',
      destFile: path.join(
        agentDir, 'skills', 'state-machine', 'writing-plans',
        'references', 'injected-skills.md'
      ),
    },
    {
      type: 'build',
      sourceFile: 'build.injected-skills.md',
      destFile: path.join(
        agentDir, 'skills', 'state-machine', 'build-execution',
        'references', 'injected-skills.md'
      ),
    },
  ];

  for (const target of targets) {
    // Read existing template header (everything up to ## Required Skills)
    const templateContent = fs.readFileSync(target.destFile, 'utf8');
    const headerEnd = templateContent.indexOf('## Required Skills');
    const header = headerEnd >= 0
      ? templateContent.slice(0, headerEnd)
      : templateContent;

    // Collect injection content from each selected pack
    const sections = [];
    for (const dir of selectedPackDirs) {
      const srcFile = path.join(pkgRoot, 'skill-packs', dir, target.sourceFile);
      if (!fs.existsSync(srcFile)) continue;

      let content = fs.readFileSync(srcFile, 'utf8');
      // Strip the top-level heading (e.g. "# Plan Phase — Injected Skills")
      content = content.replace(/^#\s+.*\n+(-{3,}\n+)?/, '');
      sections.push(content.trim());
    }

    // Write merged file
    let merged = header + '## Required Skills\n\n';
    if (sections.length > 0) {
      merged += sections.join('\n\n') + '\n';
    } else {
      merged += '<!-- No skill packs selected. Add skills manually. -->\n';
    }

    safe(`Write merged ${target.type} injection file`, () =>
      fs.writeFileSync(target.destFile, merged)
    );
  }
}

/**
 * Scaffold the .memory-bank directory with templates and placeholder files.
 */
function scaffoldMemoryBank(pkgRoot, targetDir) {
  const mbDir = path.join(targetDir, '.memory-bank');

  safe('Create .memory-bank directory', () =>
    fs.mkdirSync(mbDir, { recursive: true })
  );

  const templatesDir = path.join(pkgRoot, 'agent', 'templates');

  // Copy template files — only if they don't already exist
  const templateFiles = ['architecture.md', 'activeContext.md', 'projectBrief.md', 'productContext.md'];
  for (const file of templateFiles) {
    const src = path.join(templatesDir, file);
    const dest = path.join(mbDir, file);
    if (fs.existsSync(dest)) continue;
    if (fs.existsSync(src)) {
      safe(`Copy template: ${file}`, () =>
        fs.copyFileSync(src, dest)
      );
    }
  }

  // Scaffold decisions.md
  writeIfMissing(path.join(mbDir, 'decisions.md'), `# Architectural Decisions

<!-- Append-only log. Never edit or delete existing entries. -->

<!-- Format for new entries:

### YYYY-MM-DD: [Decision Title]
**Status**: Proposed | Approved | Deprecated
**Context**: [Why this decision was needed]
**Decision**: [What was decided]
**Alternatives**: [Other options considered and why they were rejected]
**Consequences**: [Positive and negative outcomes]
**References**: \`tasks/YYYY-MM/DDMMDD_task-name.md\`

-->

<!-- No decisions recorded yet. Bootstrap will populate if applicable. -->
`);

  // Scaffold toc.md
  writeIfMissing(path.join(mbDir, 'toc.md'), `# Memory Bank — Table of Contents

## Foundation Documents
- [projectBrief.md](./projectBrief.md) — Project identity, mission, scope
- [productContext.md](./productContext.md) — Users, jobs to be done, flows
- [architecture.md](./architecture.md) — Tech stack, patterns, rules

## Operational Documents
- [activeContext.md](./activeContext.md) — Current state, progress, session data
- [decisions.md](./decisions.md) — Architectural decision records (append-only)

## Task History
- [tasks/](./tasks/) — Monthly task summaries and individual task docs
`);

  // Scaffold tasks directory with current month
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const tasksDir = path.join(mbDir, 'tasks', `${yyyy}-${mm}`);

  safe('Create tasks directory', () =>
    fs.mkdirSync(tasksDir, { recursive: true })
  );

  writeIfMissing(path.join(tasksDir, 'README.md'), `# ${yyyy}-${mm} — Task Summary

## Tasks Completed

<!-- Entries are added by the update-task-docs skill after APPLY succeeds. -->

## Notes

- Memory bank bootstrapped via \`agent-playbook init\`
- Run the bootstrap contract to populate foundation documents from repo code
`);
}

/**
 * Write a file only if it does not already exist.
 * Preserves user content on re-runs.
 */
function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return;
  safe(`Create ${path.basename(filePath)}`, () =>
    fs.writeFileSync(filePath, content)
  );
}

/**
 * Recursively copy a directory, skipping .DS_Store files.
 */
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Replace a directory with the contents of another directory.
 */
function syncDirRecursive(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  copyDirRecursive(src, dest);
}

function checksumFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function collectPathChecksums(baseDir, relativeRoots) {
  const checksums = {};

  for (const root of relativeRoots) {
    const absRoot = path.join(baseDir, root);
    if (!fs.existsSync(absRoot)) continue;
    collectPathChecksumsFromPath(baseDir, absRoot, checksums);
  }

  return checksums;
}

function collectPathChecksumsFromPath(baseDir, absPath, output) {
  const stat = fs.statSync(absPath);

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(absPath, { withFileTypes: true })
      .filter((entry) => entry.name !== '.DS_Store')
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      collectPathChecksumsFromPath(baseDir, path.join(absPath, entry.name), output);
    }

    return;
  }

  const relPath = path.relative(baseDir, absPath).split(path.sep).join('/');
  output[relPath] = checksumFile(absPath);
}

/**
 * Install manifest stored at the project root so update runs can replay
 * selections without touching .memory-bank/.
 */
function manifestPath(targetDir) {
  return path.join(targetDir, '.agent-playbook.json');
}

function legacyManifestPath(targetDir) {
  return path.join(targetDir, '.agent', 'playbook-manifest.json');
}

function writeInstallManifest(targetDir, manifest) {
  const dest = manifestPath(targetDir);
  safe('Write playbook manifest', () =>
    fs.writeFileSync(dest, `${JSON.stringify(manifest, null, 2)}\n`)
  );

  const legacyDest = legacyManifestPath(targetDir);
  if (fs.existsSync(legacyDest)) {
    safe('Remove legacy playbook manifest', () =>
      fs.rmSync(legacyDest, { force: true })
    );
  }
}

function readInstallManifest(targetDir) {
  const currentDest = manifestPath(targetDir);
  if (fs.existsSync(currentDest)) {
    const manifest = parseManifest(currentDest);
    const legacyDest = legacyManifestPath(targetDir);
    if (fs.existsSync(legacyDest)) {
      safe('Remove legacy playbook manifest', () =>
        fs.rmSync(legacyDest, { force: true })
      );
    }
    return manifest;
  }

  const legacyDest = legacyManifestPath(targetDir);
  if (!fs.existsSync(legacyDest)) return null;

  const manifest = parseManifest(legacyDest);
  writeInstallManifest(targetDir, manifest);
  return manifest;
}

function parseManifest(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Invalid playbook manifest: ${filePath}\n  ${err.message}`);
  }
}

module.exports = {
  copyCore,
  copySkillPack,
  copyOptionalSkill,
  stageSkill,
  mergeInjectedSkills,
  scaffoldMemoryBank,
  writeInstallManifest,
  readInstallManifest,
  collectPathChecksums,
};
