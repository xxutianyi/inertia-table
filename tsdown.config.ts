import pluginBabel from '@rolldown/plugin-babel';
import { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'tsdown';

export default defineConfig({
    dts: true,
    entry: [
        './src/index.ts',
        './src/components/luma/index.ts',
        './src/components/lyra/index.ts',
        './src/components/maia/index.ts',
        './src/components/mira/index.ts',
        './src/components/nova/index.ts',
        './src/components/vega/index.ts',
    ],
    exports: true,
    sourcemap: true,
    platform: 'browser',
    plugins: [
        pluginBabel({
            presets: [reactCompilerPreset()],
        }),
    ],
});
