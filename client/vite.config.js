import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import dotenv from "dotenv";
import checker from "vite-plugin-checker";
import pluginRewriteAll from "vite-plugin-rewrite-all";

dotenv.config();

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    base: "/",
    server: {
      port: 3000,
    },
    plugins: [
      react(),
      eslint(),
      checker({
        typescript: true,
      }),
      pluginRewriteAll(),
    ],
    resolve: {
      alias: {
        src: "/src",
      },
    },
  };
});
