import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// React Compiler disabled until LCX-8 (auto-memoization distorts DevTools render
// evidence for the rungs before LCX-8 formally introduces it). To re-enable:
//   import babel from "@rolldown/plugin-babel";
//   import react, { reactCompilerPreset } from "@vitejs/plugin-react";
//   plugins: [react(), babel({ presets: [reactCompilerPreset()] })]
export default defineConfig({
  plugins: [react()],
});
