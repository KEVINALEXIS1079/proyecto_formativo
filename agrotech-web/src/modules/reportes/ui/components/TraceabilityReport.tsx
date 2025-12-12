import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';

interface TraceabilityData {
    actividades: Array<{
        nombre: string;
        fecha: string;
        tipo: string;
        responsable: string;
    }>;
    insumos: Array<{
        nombre: string;
        cantidad: number;
        unidad: string;
        precioUnitario: number;
        total: number;
    }>;
    horasTrabajadas: {
        total: number;
        porActividad: Array<{
            actividad: string;
            horas: number;
            costo: number;
        }>;
    };
    ventas: Array<{
        fecha: string;
        producto: string;
        cantidad: number;
        precioUnitario: number;
        total: number;
    }>;
}

interface TraceabilityReportProps {
    data: TraceabilityData;
}

export function TraceabilityReport({ data }: TraceabilityReportProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const totalInsumos = data.insumos.reduce((sum, i) => sum + i.total, 0);
    const totalHoras = data.horasTrabajadas.total;
    const costoHoras = data.horasTrabajadas.porActividad.reduce((sum, a) => sum + a.costo, 0);
    const totalVentas = data.ventas.reduce((sum, v) => sum + v.total, 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardBody className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Actividades</p>
                        <p className="text-2xl font-bold text-primary-600">{data.actividades.length}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Horas Trabajadas</p>
                        <p className="text-2xl font-bold text-warning-600">{totalHoras}h</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Costo Insumos</p>
                        <p className="text-2xl font-bold text-danger-600">{formatCurrency(totalInsumos)}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
                        <p className="text-2xl font-bold text-success-600">{formatCurrency(totalVentas)}</p>
                    </CardBody>
                </Card>
            </div>

            {/* Activities Table */}
            <Card>
                <CardHeader className="bg-gray-50">
                    <h3 className="font-bold">Actividades Realizadas</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Actividades">
                        <TableHeader>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>ACTIVIDAD</TableColumn>
                            <TableColumn>TIPO</TableColumn>
                            <TableColumn>RESPONSABLE</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {(data.actividades.map((act, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{new Date(act.fecha).toLocaleDateString('es-CO')}</TableCell>
                                    <TableCell className="font-semibold">{act.nombre}</TableCell>
                                    <TableCell>{act.tipo}</TableCell>
                                    <TableCell>{act.responsable}</TableCell>
                                </TableRow>
                            )) as any)}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Inputs Table */}
            <Card>
                <CardHeader className="bg-gray-50">
                    <h3 className="font-bold">Insumos Utilizados</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Insumos">
                        <TableHeader>
                            <TableColumn>INSUMO</TableColumn>
                            <TableColumn>CANTIDAD</TableColumn>
                            <TableColumn>PRECIO UNIT.</TableColumn>
                            <TableColumn>TOTAL</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {(data.insumos.map((ins, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-semibold">{ins.nombre}</TableCell>
                                    <TableCell>{ins.cantidad} {ins.unidad}</TableCell>
                                    <TableCell>{formatCurrency(ins.precioUnitario)}</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(ins.total)}</TableCell>
                                </TableRow>
                            )) as any)}
                            <TableRow className="bg-gray-100">
                                <TableCell colSpan={3} className="font-bold">TOTAL INSUMOS</TableCell>
                                <TableCell className="font-bold text-lg text-danger-600">{formatCurrency(totalInsumos)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Hours Table */}
            <Card>
                <CardHeader className="bg-gray-50">
                    <h3 className="font-bold">Horas Trabajadas por Actividad</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Horas">
                        <TableHeader>
                            <TableColumn>ACTIVIDAD</TableColumn>
                            <TableColumn>HORAS</TableColumn>
                            <TableColumn>COSTO</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {(data.horasTrabajadas.porActividad.map((h, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-semibold">{h.actividad}</TableCell>
                                    <TableCell>{h.horas}h</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(h.costo)}</TableCell>
                                </TableRow>
                            )) as any)}
                            <TableRow className="bg-gray-100">
                                <TableCell className="font-bold">TOTAL</TableCell>
                                <TableCell className="font-bold">{totalHoras}h</TableCell>
                                <TableCell className="font-bold text-lg text-warning-600">{formatCurrency(costoHoras)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Sales Table */}
            <Card>
                <CardHeader className="bg-gray-50">
                    <h3 className="font-bold">Ventas Realizadas</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Ventas">
                        <TableHeader>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>PRODUCTO</TableColumn>
                            <TableColumn>CANTIDAD</TableColumn>
                            <TableColumn>PRECIO UNIT.</TableColumn>
                            <TableColumn>TOTAL</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {(data.ventas.map((v, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{new Date(v.fecha).toLocaleDateString('es-CO')}</TableCell>
                                    <TableCell className="font-semibold">{v.producto}</TableCell>
                                    <TableCell>{v.cantidad} kg</TableCell>
                                    <TableCell>{formatCurrency(v.precioUnitario)}</TableCell>
                                    <TableCell className="font-bold">{formatCurrency(v.total)}</TableCell>
                                </TableRow>
                            )) as any)}
                            <TableRow className="bg-gray-100">
                                <TableCell colSpan={4} className="font-bold">TOTAL VENTAS</TableCell>
                                <TableCell className="font-bold text-lg text-success-600">{formatCurrency(totalVentas)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
