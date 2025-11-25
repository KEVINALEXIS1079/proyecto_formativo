// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	server: { host: '0.0.0.0' },
	integrations: [
		starlight({
			title: 'Agrotech API Documentation',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KEVINALEXIS1079/proyecto_formativo.git' }],
			sidebar: [
				{
					label: 'Inicio',
					items: [
						{ label: 'Introducción', slug: 'index' },
						{ label: 'Primeros Pasos', slug: 'getting-started' },
						{ label: 'Autenticación', slug: 'authentication' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{
							label: 'Autenticación',
							items: [
								{ label: 'Registro', slug: 'api/auth/register' },
								{ label: 'Inicio de Sesión', slug: 'api/auth/login' },
							],
						},
						{
							label: 'Usuarios',
							items: [
								{ label: 'Listar Usuarios', slug: 'api/users/list' },
								{ label: 'Perfil de Usuario', slug: 'api/users/profile' },
							],
						},
						{
							label: 'Geografía',
							items: [
								{ label: 'Lotes', slug: 'api/geo/lotes' },
								{ label: 'Sub-lotes', slug: 'api/geo/sublotes' },
							],
						},
						{
							label: 'Cultivos',
							items: [
								{ label: 'Gestión de Cultivos', slug: 'api/cultivos/cultivos' },
							],
						},
						{
							label: 'Inventario',
							items: [
								{ label: 'Insumos', slug: 'api/inventory/insumos' },
							],
						},
						{
							label: 'Actividades',
							items: [
								{ label: 'Gestión de Actividades', slug: 'api/activities/activities' },
							],
						},
						{
							label: 'Producción',
							items: [
								{ label: 'Gestión de Producción', slug: 'api/production/production' },
							],
						},
						{
							label: 'IoT',
							items: [
								{ label: 'Sensores y Monitoreo', slug: 'api/iot/iot' },
							],
						},
						{
							label: 'Wiki',
							items: [
								{ label: 'Base de Conocimiento', slug: 'api/wiki/wiki' },
							],
						},
						{
							label: 'Reportes Avanzados',
							items: [
								{ label: 'Reportes de Cultivos', slug: 'api/reports/crop-reports' },
								{ label: 'Reportes IoT', slug: 'api/reports/iot-reports' },
								{ label: 'Reportes Financieros', slug: 'api/reports/financial-reports' },
							],
						},
					],
				},
				{
					label: 'Tipos de Datos',
					items: [
						{ label: 'Esquemas TypeScript', slug: 'types/schemas' },
						{ label: 'Ejemplos de Datos', slug: 'types/examples' },
					],
				},
				{
					label: 'Referencia',
					items: [
						{ label: 'Códigos de Estado', slug: 'reference/status-codes' },
						{ label: 'Errores', slug: 'reference/errors' },
						{ label: 'WebSockets', slug: 'reference/websockets' },
					],
				},
			],
		}),
	],
});
