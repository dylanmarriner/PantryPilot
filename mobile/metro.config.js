const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const axiosBrowserPath = path.resolve(
  __dirname,
  "node_modules/axios/dist/browser/axios.cjs",
);

// Polyfill Node.js builtins needed by some transitive deps
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
};

// Intercept axios resolution: force the browser CJS bundle instead of the
// Node.js one. Metro SDK 50 doesn't honour package.json "exports" conditions,
// so without this it resolves "main" → "dist/node/axios.cjs" which requires
// url, http, https, etc.
const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "axios" || moduleName === "axios/dist/node/axios.cjs") {
    return {
      filePath: axiosBrowserPath,
      type: "sourceFile",
    };
  }
  if (origResolveRequest) {
    return origResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
