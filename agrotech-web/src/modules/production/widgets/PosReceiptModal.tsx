import { Modal, ModalContent, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Download, Printer } from "lucide-react";
import type { Venta } from "../api/production.service";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { PosReceiptPDF } from "../ui/pdfs/PosReceiptPDF";

interface PosReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    venta: Venta | null;
}

export default function PosReceiptModal({ isOpen, onClose, venta }: PosReceiptModalProps) {
    if (!venta) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
            <ModalContent>
                {(onClose) => (
                    <>
                        {/* Remove header to keep it clean like the other report modal if desired, 
                            or keep a minimal one. User asked for preview to be "equal to pdf" 
                            so we just show the PDF viewer full body. */}
                        <ModalBody className="p-0 h-[600px] bg-gray-100 overflow-hidden">
                            <div className="w-full h-full flex justify-center py-4">
                                {/* Wrap in a container to simulate standard receipt width visually on desktop if needed, 
                                    but PDFViewer handles the "page" canvas. */}
                                <PDFViewer
                                    width="100%"
                                    height="100%"
                                    className="border-none shadow-sm"
                                    showToolbar={false}
                                >
                                    <PosReceiptPDF venta={venta} />
                                </PDFViewer>
                            </div>
                        </ModalBody>
                        <ModalFooter className="justify-between">
                            <Button variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="flat"
                                    startContent={<Printer size={18} />}
                                    onPress={() => window.print()}
                                    className="hidden lg:flex"
                                >
                                    Imprimir
                                </Button>
                                <PDFDownloadLink
                                    document={<PosReceiptPDF venta={venta} />}
                                    fileName={`recibo-${venta.id}.pdf`}
                                >
                                    {({ loading }) => (
                                        <Button
                                            color="primary"
                                            startContent={<Download size={18} />}
                                            isLoading={loading}
                                        >
                                            {loading ? 'Generando...' : 'Descargar PDF'}
                                        </Button>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
