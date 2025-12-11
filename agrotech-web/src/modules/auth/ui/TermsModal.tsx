import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, ScrollShadow } from "@heroui/react";
import AuthLogo from "./AuthLogo";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            backdrop="blur"
            size="2xl"
            motionProps={{
                variants: {
                    enter: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
                    exit: { y: 20, opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
                }
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-row items-center gap-1.5 py-1.5 bg-green-50/50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20">
                            <div className="transform scale-50 origin-left">
                                <AuthLogo />
                            </div>
                            <h2 className="text-lg font-bold text-green-800 dark:text-green-400">Términos y Condiciones</h2>
                        </ModalHeader>
                        <ModalBody className="py-2 px-6">
                            <ScrollShadow className="h-[400px] prose prose-sm dark:prose-invert max-w-none">
                                <p><strong>Última actualización: Diciembre 2025</strong></p>
                                <p>
                                    Bienvenido a AgroTech. Al acceder y utilizar nuestra plataforma, aceptas cumplir con los siguientes términos y condiciones.
                                    Por favor, léelos detenidamente antes de registrarte.
                                </p>

                                <h3>1. Uso de la Plataforma</h3>
                                <p>
                                    AgroTech proporciona herramientas para la gestión de cultivos y monitoreo IoT. El uso indebido de estas herramientas,
                                    incluyendo intentos de acceso no autorizado, manipulación de datos o interrupción del servicio, está estrictamente prohibido.
                                </p>

                                <h3>2. Privacidad de Datos</h3>
                                <p>
                                    Nos comprometemos a proteger tu información personal. Los datos recopilados (como nombre, correo, teléfono) se utilizan
                                    exclusivamente para la operación del servicio y no serán compartidos con terceros sin tu consentimiento, salvo requerimiento legal.
                                </p>

                                <h3>3. Responsabilidades del Usuario</h3>
                                <p>
                                    Eres responsable de mantener la confidencialidad de tu contraseña y cuenta. AgroTech no se hace responsable por pérdidas
                                    resultantes del acceso no autorizado a tu cuenta debido a negligencia en la seguridad de tus credenciales.
                                </p>

                                <h3>4. Propiedad Intelectual</h3>
                                <p>
                                    Todo el contenido, software y diseños de AgroTech son propiedad exclusiva de la empresa y están protegidos por leyes de
                                    derechos de autor.
                                </p>

                                <h3>5. Modificaciones</h3>
                                <p>
                                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Las actualizaciones se notificarán a través
                                    de la plataforma o por correo electrónico.
                                </p>

                                <p className="mt-4 text-center italic text-default-500">
                                    Al hacer clic en "Aceptar", confirmas que has leído y entendido estos términos.
                                </p>
                            </ScrollShadow>
                        </ModalBody>
                        <ModalFooter className="justify-end gap-3 pb-6 pr-8">
                            <Button
                                variant="light"
                                className="text-black font-medium hover:bg-default-100"
                                onPress={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button
                                color="success"
                                className="font-medium text-black shadow-lg shadow-green-500/20"
                                onPress={() => { onAccept(); onClose(); }}
                            >
                                Aceptar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
