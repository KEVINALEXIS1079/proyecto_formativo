import { Card, CardBody } from '@heroui/react';

interface ReportHeaderProps {
    title: string;
    subtitle?: string;
    period?: string;
}

export function ReportHeader({ title, subtitle, period }: ReportHeaderProps) {
    return (
        <div className="text-center border-b-2 border-success-600 pb-6 mb-6">
            <div className="flex justify-center mb-4">
                <img
                    src="/LogoTic.png"
                    alt="TIC Yamboro"
                    className="h-16 w-auto object-contain"
                />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                    {subtitle}
                </p>
            )}
            {period && (
                <p className="text-sm text-gray-500">
                    Período: {period}
                </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
                Generado: {new Date().toLocaleString('es-CO')}
            </p>
        </div>
    );
}
