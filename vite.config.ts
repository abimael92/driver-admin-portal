import path from 'node:path';
import { reactRouter } from '@react-router/dev/vite';
import { reactRouterHonoServer } from 'react-router-hono-server/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { addRenderIds } from './plugins/addRenderIds';
import { aliases } from './plugins/aliases';
import consoleToParent from './plugins/console-to-parent';
import { layoutWrapperPlugin } from './plugins/layouts';
import { loadFontsFromTailwindSource } from './plugins/loadFontsFromTailwindSource';
import { nextPublicProcessEnv } from './plugins/nextPublicProcessEnv';
import { restart } from './plugins/restart';
import { restartEnvFileChange } from './plugins/restartEnvFileChange';

export default defineConfig({
	envPrefix: 'NEXT_PUBLIC_',
	optimizeDeps: {
		include: ['lucide-react'],
		exclude: [
			'@hono/auth-js/react',
			'@hono/auth-js',
			'@auth/core',
			'hono/context-storage',
			'@auth/core/errors',
			'fsevents',
			'lightningcss',
		],
	},
	logLevel: 'info',
	plugins: [
		nextPublicProcessEnv(),
		restartEnvFileChange(),
		reactRouterHonoServer({
			serverEntryPoint: './__create/index.ts',
			runtime: 'node',
		}),
		restart({
			restart: [
				'src/**/page.jsx',
				'src/**/page.tsx',
				'src/**/layout.jsx',
				'src/**/layout.tsx',
				'src/**/route.js',
				'src/**/route.ts',
			],
		}),
		consoleToParent(),
		loadFontsFromTailwindSource(),
		addRenderIds(),
		reactRouter(),
		tsconfigPaths(),
		aliases(),
		layoutWrapperPlugin(),
	],
	resolve: {
		alias: {
			lodash: 'lodash-es',
			'npm:stripe': 'stripe',
			stripe: path.resolve(__dirname, './src/__create/stripe'),
			'@auth/create/react': '@hono/auth-js/react',
			'@auth/create': path.resolve(__dirname, './src/__create/@auth/create'),
			'@': path.resolve(__dirname, 'src'),
		},
		dedupe: ['react', 'react-dom'],
	},
	// ADD SSR configuration
	ssr: {
		noExternal: ['react-idle-timer'], // Prevent SSR issues with client-side packages
	},
	clearScreen: false,
	server: {
		host: '0.0.0.0',
		port: 4000,
		hmr: {
			overlay: false,
		},
		warmup: {
			clientFiles: [
				'./src/app/root.tsx',
				'./src/app/routes/**/*.{ts,tsx}',
				'./src/app/routes.ts',
			],
		},
	},
	build: {
		target: 'es2022',
		sourcemap: true,
		rollupOptions: {
			onwarn(warning, warn) {
				if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
					return;
				}
				warn(warning);
			},
		},
	},
});
