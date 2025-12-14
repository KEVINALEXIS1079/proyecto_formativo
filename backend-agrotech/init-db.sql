-- Script de inicialización para la base de datos Agrotech
-- Este script se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL por primera vez

-- Crear la tabla telegram_form_estado si no existe
CREATE TABLE IF NOT EXISTS public.telegram_form_estado (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    step INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    access_token TEXT
);

-- Crear índice en user_id para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_telegram_form_estado_user_id ON public.telegram_form_estado(user_id);

-- Crear índice en estado para filtros rápidos
CREATE INDEX IF NOT EXISTS idx_telegram_form_estado_estado ON public.telegram_form_estado(estado);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.telegram_form_estado IS 'Tabla para mantener el estado de los formularios del bot de Telegram';
COMMENT ON COLUMN public.telegram_form_estado.id IS 'Identificador único autoincremental';
COMMENT ON COLUMN public.telegram_form_estado.user_id IS 'ID del usuario de Telegram (único)';
COMMENT ON COLUMN public.telegram_form_estado.step IS 'Paso actual en el formulario';
COMMENT ON COLUMN public.telegram_form_estado.data IS 'Datos del formulario en formato JSON';
COMMENT ON COLUMN public.telegram_form_estado.estado IS 'Estado del formulario (activo, logged_in, etc.)';
COMMENT ON COLUMN public.telegram_form_estado.updated_at IS 'Fecha y hora de última actualización';
COMMENT ON COLUMN public.telegram_form_estado.access_token IS 'Token de acceso para autenticación';
