#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CORE_PATH = path.join(ROOT, "AGENTS.core.md");
const PROFILES_DIR = path.join(ROOT, "profiles");
const GENERATED_DIR = path.join(ROOT, "generated");
const DEFAULT_PROFILE = "backend-generic";

const PROFILE_LABELS = {
  "frontend-web": "Frontend Web",
  "frontend-mobile": "Frontend Mobile",
  "backend-generic": "Backend Generic",
  "backend-hono-supabase": "Backend Hono Supabase",
};

function parseArgs(argv) {
  const args = { all: false, profile: null, output: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--all") {
      args.all = true;
      continue;
    }

    if (arg === "--profile") {
      args.profile = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--output") {
      args.output = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return args;
}

function getProfilePath(profile) {
  return path.join(PROFILES_DIR, `${profile}.md`);
}

function assertProfile(profile) {
  if (!PROFILE_LABELS[profile]) {
    const valid = Object.keys(PROFILE_LABELS).join(", ");
    throw new Error(`Unknown profile "${profile}". Valid profiles: ${valid}`);
  }
}

function render(profile) {
  assertProfile(profile);

  const core = fs.readFileSync(CORE_PATH, "utf8");
  const profileBody = fs.readFileSync(getProfilePath(profile), "utf8").trim();
  const profileLabel = PROFILE_LABELS[profile];

  const profileSection = [
    `<!-- ACTIVE_PROFILE: ${profile} -->`,
    `**Profile Label**: ${profileLabel}`,
    "",
    profileBody,
  ].join("\n");

  const rendered = core.replace("{{PRODUCTION_PROFILE_SECTION}}", profileSection);

  return [
    "<!-- Generated file. Edit agent/AGENTS.core.md, agent/profiles/*.md, or agent/scripts/render-agents.js instead. -->",
    rendered,
    "",
  ].join("\n");
}

function writeFile(outputPath, content) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function renderAll() {
  for (const profile of Object.keys(PROFILE_LABELS)) {
    const content = render(profile);
    writeFile(path.join(GENERATED_DIR, `AGENTS.${profile}.md`), content);
  }

  writeFile(path.join(ROOT, "AGENTS.md"), render(DEFAULT_PROFILE));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.all) {
    renderAll();
    return;
  }

  const profile = args.profile || DEFAULT_PROFILE;
  const content = render(profile);

  if (args.output) {
    writeFile(path.resolve(process.cwd(), args.output), content);
    return;
  }

  process.stdout.write(content);
}

main();
