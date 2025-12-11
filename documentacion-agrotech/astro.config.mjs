// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	server: { host: '0.0.0.0' },
	integrations: [
		starlight({
			title: 'Agrotech API Documentation',
			logo: {
				src: './src/assets/logo.png',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KEVINALEXIS1079/proyecto_formativo.git' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Introducción', slug: 'guides/getting-started' },
						{ label: 'Despliegue', slug: 'guides/deployment' },
						{ label: 'Ejemplo', slug: 'guides/example' },
					],
				},
				{
					label: 'API',
					autogenerate: { directory: 'api' },
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
