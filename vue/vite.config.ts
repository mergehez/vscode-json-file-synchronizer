import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import {fileURLToPath, URL} from "url";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, "./src"),
      '@vscode': path.resolve(__dirname, "../vscode/src"),
    }
  },
  build: {
    outDir: '../vscode/ArgJsonTable',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo:any) => {
          let extType = assetInfo ? assetInfo.name.split('.').at(1) : '--';
          if (extType === 'css') {
            return 'arg-json-table[extname]';
          }
          return '[name][extname]';
        },
        chunkFileNames: 'arg-json-table.js',
        entryFileNames: 'arg-json-table.js',
      },
    },
  },
})
