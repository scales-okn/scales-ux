import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    server: {
      port: 3000,
    },
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") },
        { find: "@store", replacement: path.resolve(__dirname, "src/store") },
        { find: "@pages", replacement: path.resolve(__dirname, "src/pages") },
        {
          find: "@components",
          replacement: path.resolve(__dirname, "src/components"),
        },
        {
          find: "@helpers",
          replacement: path.resolve(__dirname, "src/helpers"),
        },
        { find: "@hooks", replacement: path.resolve(__dirname, "src/hooks") },
        { find: "@styles", replacement: path.resolve(__dirname, "src/styles") },
        { find: "@models", replacement: path.resolve(__dirname, "src/models") },
        { find: "@types", replacement: path.resolve(__dirname, "src/types") },
      ],
    },
  };
});
