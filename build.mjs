// Bundles www/app.jsx into a single local file: www/app.bundle.js.
// This is the SAME app.jsx used by the Android app — Capacitor plugins (Firebase Auth,
// Firestore, Haptics, etc.) automatically use their browser-native "web" implementation
// when there's no native runtime detected, so no code fork is needed between the two.
//
// Usage:
//   npm run build          -> one-off production build
//   npm run build:watch    -> rebuild on save while developing (npm run dev serves it too)

import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["www/app.jsx"],
  bundle: true,
  outfile: "www/app.bundle.js",
  format: "esm",
  target: ["es2020"],
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": watch ? '"development"' : '"production"',
  },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("Watching www/app.jsx for changes... (Ctrl+C to stop)");
} else {
  await esbuild.build(options);
  console.log("Built www/app.bundle.js");
}
