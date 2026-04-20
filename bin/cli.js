#!/usr/bin/env node
'use strict';

const path = require('path');
const prompts = require('prompts');
const { version } = require('../package.json');
const installer = require('../lib/installer');
const deployer = require('../lib/deployer');

const USAGE = `
torque-coding v${version}

Usage:
  torque-coding init [--target <dir>] [--platform <claude|other|both>]
                                         Scaffold memory bank + deploy rules/skills
  torque-coding update [--target <dir>]  Re-sync rules/skills from installed package
  torque-coding --version                Print version
  torque-coding --help                   Print this help

Options:
  --target <dir>     Target project directory (default: current working directory)
  --platform <name>  Install target: claude, other, or both
`.trim();

function parseArgs(argv) {
  const args = { command: null, target: process.cwd(), platform: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--version') { args.command = 'version'; break; }
    if (arg === '--help' || arg === '-h') { args.command = 'help'; break; }
    if (arg === '--target' || arg === '-t') {
      args.target = path.resolve(argv[++i] || process.cwd());
    } else if (arg === '--platform' || arg === '-p') {
      args.platform = (argv[++i] || '').toLowerCase();
    } else if (!arg.startsWith('--') && !args.command) {
      args.command = arg;
    }
  }
  return args;
}

async function resolvePlatform(args) {
  if (args.platform) {
    return args.platform;
  }

  if (!process.stdout.isTTY) {
    return deployer.PLATFORMS.both;
  }

  const { platform } = await prompts({
    type: 'select',
    name: 'platform',
    message: 'Which platform should Torque Coding configure?',
    choices: [
      { title: 'Claude Code', value: deployer.PLATFORMS.claude },
      { title: 'Other', value: deployer.PLATFORMS.other },
      { title: 'Both', value: deployer.PLATFORMS.both },
    ],
    initial: 2,
  });

  return platform || deployer.PLATFORMS.both;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.command === 'version') {
    console.log(version);
    process.exit(0);
  }

  if (args.command === 'help' || !args.command) {
    console.log(USAGE);
    process.exit(args.command === 'help' ? 0 : 1);
  }

  if (args.command === 'init') {
    try {
      const platform = await resolvePlatform(args);
      await installer.init(args.target);
      await deployer.deploy(args.target, platform);
    } catch (err) {
      console.error(`\ntorque-coding init failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (args.command === 'update') {
    try {
      await deployer.update(args.target);
    } catch (err) {
      console.error(`\ntorque-coding update failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown command: ${args.command}\n`);
  console.log(USAGE);
  process.exit(1);
}

main();
