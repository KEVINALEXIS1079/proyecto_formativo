import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from "@heroui/react";
import { Download, Printer } from "lucide-react";
import type { Venta } from "../api/production.service";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface PosReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    venta: Venta | null;
}

export default function PosReceiptModal({ isOpen, onClose, venta }: PosReceiptModalProps) {
    console.log("PosReceiptModal render. Open:", isOpen, "Venta:", venta?.id);
    if (!venta) return null;

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        
        // Header
        doc.setFontSize(18);
        doc.text("AGROTECH", pageWidth / 2, 20, { align: "center" });
        
        doc.setFontSize(10);
        doc.text("Nit: 900.000.000-1", pageWidth / 2, 26, { align: "center" });
        doc.text("Valle del Cauca, Colombia", pageWidth / 2, 31, { align: "center" });
        
        // Info Venta
        doc.setFontSize(12);
        doc.text(`Factura de Venta N° ${String(venta.id).padStart(6, '0')}`, 14, 45);
        doc.setFontSize(10);
        doc.text(`Fecha: ${format(new Date(venta.fecha), "dd/MM/yyyy HH:mm")}`, 14, 52);
        
        // Cliente
        doc.text("Cliente:", 14, 62);
        doc.setFont("helvetica", "bold");
        doc.text(venta.cliente?.nombre || "Consumidor Final", 30, 62);
        doc.setFont("helvetica", "normal");
        if (venta.cliente?.identificacion) {
            doc.text(`CC/NIT: ${venta.cliente.identificacion}`, 14, 67);
        }

        // Tabla
        const tableBody = venta.detalles.map(d => [
            `${d.loteProduccion?.productoAgro?.nombre || "Producto"}\n${d.loteProduccion?.codigoLote || ''} ${d.loteProduccion?.calidad ? `(${d.loteProduccion.calidad})` : ''}`,
            `${d.cantidadKg} kg`,
            `$${(d.precioUnitarioKg ?? 0).toLocaleString()}`,
            `$${(d.subtotal ?? 0).toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 75,
            head: [['Producto / Detalle', 'Cant.', 'Precio', 'Subtotal']],
            body: tableBody,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
            foot: [
                ['Subtotal', '', '', `$${venta.subtotal.toLocaleString()}`],
                ['IVA (19%)', '', '', `$${venta.impuestos.toLocaleString()}`],
                ['Total', '', '', `$${venta.total.toLocaleString()}`]
            ],
            footStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
        });

        // Final Y position after table
        // const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Footer message
        // doc.text("Gracias por su compra!", pageWidth / 2, finalY, { align: "center" });

        doc.save(`factura-${venta.id}.pdf`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 items-center">
                            <span className="font-bold text-xl uppercase tracking-widest text-gray-800">Agrotech</span>
                            <span className="text-xs text-gray-500 font-mono">RECIBO DE CAJA</span>
                        </ModalHeader>
                        <ModalBody>
                            <div className="bg-white p-4 font-mono text-sm border rounded-lg shadow-sm">
                                <div className="text-center mb-4 pb-4 border-b border-dashed">
                                    <p>Venta #{String(venta.id).padStart(6, '0')}</p>
                                    <p className="text-gray-500">{format(new Date(venta.fecha), "dd MMM yyyy - HH:mm")}</p>
                                </div>
                                
                                <div className="mb-4 space-y-1">
                                    <p><span className="text-gray-500">Cliente:</span> <span className="font-bold">{venta.cliente?.nombre || "Consumidor Final"}</span></p>
                                    {venta.cliente?.identificacion && <p><span className="text-gray-500">ID:</span> {venta.cliente.identificacion}</p>}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between font-bold border-b pb-1">
                                        <span>Desc</span>
                                        <span>Total</span>
                                    </div>
                                    {venta.detalles.map((detalle) => (
                                        <div key={detalle.id} className="flex justify-between border-b border-dashed border-gray-100 py-2 last:border-0">
                                            <div className="flex flex-col">
                                                <span className="font-bold">
                                                    {detalle.loteProduccion?.productoAgro?.nombre || "Producto"} 
                                                    {detalle.loteProduccion?.calidad && <span className="text-xs font-normal text-gray-500 ml-1">({detalle.loteProduccion.calidad})</span>}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Lote: {detalle.loteProduccion?.codigoLote || detalle.loteProduccionId}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {detalle.cantidadKg} kg x ${(detalle.precioUnitarioKg ?? 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <span className="font-bold">${(detalle.subtotal ?? 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed pt-4 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${venta.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Impuestos</span>
                                        <span>${venta.impuestos.toLocaleString()}</span>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>TOTAL</span>
                                        <span>${venta.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                            <Button 
                                color="primary" 
                                onPress={generatePDF}
                                startContent={<Download size={18} />}
                            >
                                Descargar PDF
                            </Button>
                            <Button 
                                variant="flat"
                                startContent={<Printer size={18} />}
                                onPress={() => window.print()}
                                className="hidden md:flex"
                            >
                                Imprimir
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
