const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Restrict watch folders to only the mobile directory to avoid ENOSPC errors
config.watchFolders = [__dirname];

// Block the parent node_modules from being watched/resolved
config.resolver.blockList = [
  new RegExp('/home/z/my-project/node_modules/.*'),
  new RegExp('/home/z/my-project/src/.*'),
  new RegExp('/home/z/my-project/public/.*'),
  new RegExp('/home/z/my-project/dist/.*'),
  new RegExp('/home/z/my-project/download/.*'),
  new RegExp('/home/z/my-project/upload/.*'),
  new RegExp('/home/z/my-project/db/.*'),
  new RegExp('/home/z/my-project/examples/.*'),
];

// Use polling watcher to avoid ENOSPC errors with inotify
config.watcher = {
  ...config.watcher,
  additionalExts: ['ts', 'tsx'],
  // Reduce watchman overhead
  healthCheck: undefined,
};

module.exports = config;
