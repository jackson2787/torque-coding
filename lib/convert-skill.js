const fs = require('fs');
const path = require('path');

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
 * Determine allowed-tools based on skill name patterns.
 *
 * - Memory bank update skills (name starts with "update-" or "mb-"):
 *     Read, Grep, Glob, Write, Edit
 * - State machine skills and all others:
 *     Read, Grep, Glob, Write, Edit, Bash
 */
function resolveAllowedTools(name) {
  if (name && (name.startsWith('update-') || name.startsWith('mb-'))) {
    return 'Read, Grep, Glob, Write, Edit';
  }
  return 'Read, Grep, Glob, Write, Edit, Bash';
}

/**
 * Parse simple YAML frontmatter between --- markers.
 * Returns { fields, body } where fields is an object of top-level keys
 * and body is everything after the closing ---.
 *
 * Handles nested blocks (like metadata:) by collecting indented lines
 * under a parent key, but we only need top-level scalars for conversion.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { fields: {}, body: content };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const fields = {};
  let currentKey = null;

  for (const line of yamlBlock.split('\n')) {
    // Top-level key: value
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '') {
        // Block key (like metadata:), store as object placeholder
        fields[currentKey] = {};
      } else {
        // Strip surrounding quotes if present
        fields[currentKey] = value.replace(/^["']|["']$/g, '');
      }
      continue;
    }

    // Indented line belongs to current block key
    if (currentKey && line.match(/^\s+/)) {
      const nested = line.match(/^\s+(\w[\w-]*):\s*(.*)$/);
      if (nested && typeof fields[currentKey] === 'object') {
        fields[currentKey][nested[1]] = nested[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  }

  return { fields, body };
}

/**
 * Build YAML frontmatter string from converted fields.
 */
function buildFrontmatter(fields) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push('---');
  return lines.join('\n');
}

/**
 * Replace agent-specific path and name references in body text.
 */
function replaceBodyRefs(text) {
  return text
    .replace(/\.agent\/skills\//g, '.claude/skills/')
    .replace(/AGENTS\.md/g, 'CLAUDE.md');
}

/**
 * Convert a generic torque-coding SKILL.md file to Claude Code native format.
 *
 * - Keeps name and description
 * - Removes metadata block
 * - Adds user-invocable: false
 * - Adds allowed-tools based on skill name
 * - Replaces .agent/skills/ with .claude/skills/ in body
 * - Replaces AGENTS.md with CLAUDE.md in body
 */
function convertSkillFrontmatter(content) {
  const { fields, body } = parseFrontmatter(content);

  // If no frontmatter was found, just do body replacements
  if (Object.keys(fields).length === 0) {
    return replaceBodyRefs(content);
  }

  const converted = {};

  if (fields.name) {
    converted.name = fields.name;
  }
  if (fields.description) {
    converted.description = fields.description;
  }

  converted['user-invocable'] = 'false';
  converted['allowed-tools'] = resolveAllowedTools(fields.name || '');

  return buildFrontmatter(converted) + '\n' + replaceBodyRefs(body);
}

/**
 * Convert an entire skill directory from generic to Claude Code format.
 *
 * - SKILL.md files are fully converted (frontmatter + body)
 * - All other files get path/name reference replacements only
 * - .DS_Store files are skipped
 * - Directory structure is preserved
 */
function convertSkillDir(srcDir, destDir) {
  safe('Create destination directory', () =>
    fs.mkdirSync(destDir, { recursive: true })
  );

  const entries = safe(`Read source directory: ${srcDir}`, () =>
    fs.readdirSync(srcDir, { withFileTypes: true })
  );

  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      convertSkillDir(srcPath, destPath);
      continue;
    }

    const content = safe(`Read file: ${srcPath}`, () =>
      fs.readFileSync(srcPath, 'utf8')
    );

    let converted;
    if (entry.name === 'SKILL.md') {
      converted = convertSkillFrontmatter(content);
    } else {
      converted = replaceBodyRefs(content);
    }

    safe(`Write converted file: ${destPath}`, () =>
      fs.writeFileSync(destPath, converted)
    );
  }
}

/**
 * Convert injected-skills.md reference content.
 * Replaces .agent/skills/ with .claude/skills/ in skill path references.
 */
function convertInjectedSkillRefs(content) {
  return replaceBodyRefs(content);
}

module.exports = {
  convertSkillFrontmatter,
  convertSkillDir,
  convertInjectedSkillRefs,
};
