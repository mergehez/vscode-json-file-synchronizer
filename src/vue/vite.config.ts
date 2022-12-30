import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
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
        outDir: '../../ArgJsonTable',
        emptyOutDir: true,
    },
});
