#!/usr/bin/env node

const { run, update } = require('../lib/cli');

const command = process.argv[2];

if (!command || command === 'init') {
  run().catch((err) => {
    console.error(`\n\x1b[31mError: ${err.message}\x1b[0m`);
    process.exit(1);
  });
} else if (command === 'update') {
  update().catch((err) => {
    console.error(`\n\x1b[31mError: ${err.message}\x1b[0m`);
    process.exit(1);
  });
} else if (command === '--version' || command === '-v') {
  const { readVersion } = require('../lib/version');
  const path = require('path');
  console.log(readVersion(path.resolve(__dirname, '..')));
} else if (command === '--help' || command === '-h') {
  console.log(`
  Usage: torque-coding [command]

  Commands:
    init        Install the playbook into the current project (default)
    update      Refresh managed playbook files from the saved install manifest

  Options:
    -v, --version   Show version
    -h, --help      Show this help
`);
} else {
  console.error(`\n  Unknown command: ${command}\n  Run 'torque-coding --help' for usage.\n`);
  process.exit(1);
}
