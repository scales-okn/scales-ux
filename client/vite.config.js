import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import dotenv from "dotenv";
import checker from "vite-plugin-checker";

dotenv.config();

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    server: {
      port: 3000,
    },
    plugins: [
      react(),
      eslint(),
      checker({
        typescript: true,
      }),
    ],
    resolve: {
      alias: {
        src: "/src",
      },
    },
  };
});
