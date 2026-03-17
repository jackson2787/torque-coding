const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SPEC_PATH = path.resolve(__dirname, '../src/lib/api-schema.json');
const SLICES_DIR = path.resolve(__dirname, '../src/lib/api/slices');
const CHECKSUMS_PATH = path.join(SLICES_DIR, '.checksums.json');

function getChecksum(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

function main() {
  if (!fs.existsSync(SPEC_PATH)) {
    console.error(`Spec file not found at ${SPEC_PATH}`);
    process.exit(1);
  }

  const fullSpec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
  const tags = fullSpec.tags || [];

  // Check for "Global" changes (components, etc.)
  const globalState = {
    openapi: fullSpec.openapi,
    info: fullSpec.info,
    servers: fullSpec.servers,
    security: fullSpec.security,
    components: fullSpec.components,
  };
  const globalChecksum = getChecksum(globalState);

  const prevChecksums = fs.existsSync(CHECKSUMS_PATH)
    ? JSON.parse(fs.readFileSync(CHECKSUMS_PATH, 'utf8'))
    : {};

  const currentChecksums = { _global: globalChecksum };
  const dirtyTags = [];
  const isGlobalDirty = prevChecksums._global !== globalChecksum;

  if (!fs.existsSync(SLICES_DIR)) {
    fs.mkdirSync(SLICES_DIR, { recursive: true });
  }

  tags.forEach((tag) => {
    const tagName = tag.name;
    const tagKey = tagName.toLowerCase();

    // Extract paths for this tag
    const tagPaths = {};
    Object.entries(fullSpec.paths).forEach(([pathName, methods]) => {
      const methodsForTag = {};
      Object.entries(methods).forEach(([method, config]) => {
        if (config.tags && config.tags.includes(tagName)) {
          methodsForTag[method] = config;
        }
      });
      if (Object.keys(methodsForTag).length > 0) {
        tagPaths[pathName] = methodsForTag;
      }
    });

    const sliceSpec = {
      ...fullSpec,
      tags: [tag],
      paths: tagPaths,
    };

    const sliceChecksum = getChecksum(sliceSpec);
    currentChecksums[tagKey] = sliceChecksum;

    const slicePath = path.join(SLICES_DIR, `${tagKey}.json`);
    fs.writeFileSync(slicePath, JSON.stringify(sliceSpec, null, 2));

    if (isGlobalDirty || prevChecksums[tagKey] !== sliceChecksum) {
      dirtyTags.push(tagKey);
    }
  });

  fs.writeFileSync(CHECKSUMS_PATH, JSON.stringify(currentChecksums, null, 2));

  if (process.argv.includes('--list-dirty')) {
    process.stdout.write(dirtyTags.join(','));
  } else {
    console.log(
      `Slicing complete. Dirty tags: ${dirtyTags.length === 0 ? 'None' : dirtyTags.join(', ')}`
    );
    if (isGlobalDirty) console.log('Global components or config changed. All slices marked dirty.');
  }
}

main();
