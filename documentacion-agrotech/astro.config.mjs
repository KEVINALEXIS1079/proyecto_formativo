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
				src: './src/assets/LogoTic.png',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KEVINALEXIS1079/proyecto_formativo.git' }],
			credits: false,
			sidebar: [
				{
					label: 'Guías',
					items: [
						{ label: 'Introducción', slug: 'guides/getting-started' },
						{ label: 'Despliegue', slug: 'guides/deployment' },
						{ label: 'Manual de Usuario', slug: 'guides/example' },
					],
				},

				{
					label: 'Documentación API',
					items: [
						{ label: 'Visión General', slug: 'api' },
						{
							label: 'Seguridad y Acceso',
							items: [
								{ label: 'Autenticación', slug: 'api/auth' },
								{ label: 'Usuarios y Permisos', slug: 'api/users' },
							]
						},
						{
							label: 'Gestión Agrícola',
							items: [
								{ label: 'Mapas y Lotes', slug: 'api/geo' },
								{ label: 'Cultivos', slug: 'api/cultivos' },
								{ label: 'Actividades de Campo', slug: 'api/activities' },
								{ label: 'Detalle de Lotes', slug: 'api/lotes' },
							]
						},
						{
							label: 'Operaciones y Recursos',
							items: [
								{ label: 'Inventario de Insumos', slug: 'api/inventory' },
								{ label: 'Producción y Ventas', slug: 'api/production' },
								{ label: 'Finanzas', slug: 'api/finance' },
							]
						},
						{
							label: 'Inteligencia y Monitoreo',
							items: [
								{ label: 'Dispositivos IoT', slug: 'api/iot' },
								{ label: 'Reportes y Analítica', slug: 'api/reports' },
								{ label: 'Métricas de Sensores', slug: 'api/iot-reports' },
							]
						},
						{
							label: 'Recursos Extra',
							items: [
								{ label: 'Wiki del Proyecto', slug: 'api/wiki' },
							]
						},
					],
				},
				{
					label: 'Referencia',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
