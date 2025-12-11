import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Tabs,
    Tab,
    Autocomplete,
    AutocompleteItem,
    Card,
    CardBody,
    Divider,
} from "@heroui/react";
import { useState, useMemo } from "react";
import { User, CreditCard, Banknote, Plus, Wallet, CheckCircle2 } from "lucide-react";
import { useClientes, useCreateCliente, useCreateVenta } from "../hooks/useProduction";
import toast from "react-hot-toast";
import { useAuth } from "@/modules/auth/context/AuthContext";

interface CartItem {
    lote: any;
    cantidad: number;
    precio: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    total: number;
    onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, cart, total, onSuccess }: CheckoutModalProps) {
    const { user } = useAuth();
    const { data: clientes = [] } = useClientes();
    const createClienteMutation = useCreateCliente();
    const createVentaMutation = useCreateVenta();

    const [step, setStep] = useState<"customer" | "payment">("customer");
    const [selectedClienteId, setSelectedClienteId] = useState<string | number>("");

    // New Client Form
    const [newClientName, setNewClientName] = useState("");
    const [newClientDoc, setNewClientDoc] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    // Payment
    const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "transferencia">("efectivo");
    const [amountPaid, setAmountPaid] = useState<string>("");

    const handleCreateClient = async () => {
        if (!newClientName) return toast.error("Nombre requerido");
        try {
            const client = await createClienteMutation.mutateAsync({
                nombre: newClientName,
                identificacion: newClientDoc
            });
            setSelectedClienteId(client.id);
            setIsCreatingClient(false);
            toast.success("Cliente creado");
        } catch (e) {
            toast.error("Error al crear cliente");
        }
    };

    const handlePay = async () => {
        const paid = Number(amountPaid);
        if (!paid || paid < total) {
            return toast.error("El monto debe cubrir el total");
        }

        try {
            await createVentaMutation.mutateAsync({
                usuarioId: user?.id || 1, // Fallback if auth missing
                clienteId: selectedClienteId ? Number(selectedClienteId) : undefined,
                detalles: cart.map(item => ({
                    loteProduccionId: item.lote.id,
                    cantidadKg: item.cantidad,
                    precioUnitarioKg: item.precio
                })),
                pagos: [
                    { metodoPago: paymentMethod, monto: paid }
                ]
            });
            toast.success("Venta registrada exitosamente");
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Error al procesar la venta");
        }
    };

    const change = useMemo(() => {
        const paid = Number(amountPaid);
        return paid > total ? paid - total : 0;
    }, [amountPaid, total]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Checkout</h2>
                            <p className="text-sm text-gray-500">Pasos para finalizar la venta</p>
                        </ModalHeader>
                        <ModalBody>
                            <Tabs
                                selectedKey={step}
                                onSelectionChange={(k) => setStep(k as any)}
                                aria-label="Checkout Steps"
                                color="primary"
                                variant="bordered"
                                fullWidth
                            >
                                <Tab key="customer" title={<div className="flex items-center gap-2"><User size={18} /> Cliente</div>}>
                                    <div className="py-4 space-y-6">
                                        {!isCreatingClient ? (
                                            <div className="space-y-4">
                                                <Autocomplete
                                                    label="Buscar Cliente"
                                                    placeholder="Nombre o Identificación"
                                                    defaultItems={clientes}
                                                    selectedKey={selectedClienteId ? String(selectedClienteId) : null}
                                                    onSelectionChange={(k) => setSelectedClienteId(k as string)}
                                                >
                                                    {(item: any) => <AutocompleteItem key={item.id} textValue={item.nombre}>{item.nombre} ({item.identificacion})</AutocompleteItem>}
                                                </Autocomplete>

                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <Divider className="flex-1" /> o <Divider className="flex-1" />
                                                </div>

                                                <Button
                                                    variant="flat"
                                                    color="primary"
                                                    startContent={<Plus size={18} />}
                                                    fullWidth
                                                    onPress={() => setIsCreatingClient(true)}
                                                >
                                                    Crear Nuevo Cliente
                                                </Button>
                                            </div>
                                        ) : (
                                            <Card className="bg-slate-50 border border-slate-200">
                                                <CardBody className="space-y-3">
                                                    <h4 className="font-semibold text-gray-700">Nuevo Cliente</h4>
                                                    <Input label="Nombre Completo" value={newClientName} onValueChange={setNewClientName} autoFocus />
                                                    <Input label="Identificación (Opcional)" value={newClientDoc} onValueChange={setNewClientDoc} />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="light" onPress={() => setIsCreatingClient(false)}>Cancelar</Button>
                                                        <Button size="sm" color="primary" onPress={handleCreateClient} isLoading={createClienteMutation.isPending}>Guardar</Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        )}
                                    </div>
                                </Tab>

                                <Tab key="payment" title={<div className="flex items-center gap-2"><Wallet size={18} /> Pago</div>}>
                                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <p className="font-semibold text-gray-700">Método de Pago</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setPaymentMethod("efectivo")}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'efectivo' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <Banknote size={24} />
                                                    <span className="font-medium">Efectivo</span>
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod("transferencia")}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'transferencia' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <CreditCard size={24} />
                                                    <span className="font-medium">Transferencia</span>
                                                </button>
                                            </div>

                                            <Input
                                                label="Monto Recibido"
                                                placeholder="0.00"
                                                startContent="$"
                                                size="lg"
                                                type="number"
                                                value={amountPaid}
                                                onValueChange={setAmountPaid}
                                                description={change > 0 ? `Cambio a devolver: $${change.toLocaleString()}` : undefined}
                                                color={change >= 0 && Number(amountPaid) >= total ? "success" : "danger"}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <Card className="bg-gray-50 shadow-inner">
                                                <CardBody>
                                                    <h4 className="font-semibold text-gray-500 uppercase text-xs mb-4">Resumen de Venta</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between text-gray-600">
                                                            <span>Subtotal</span>
                                                            <span>${Math.round(total / 1.19).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600">
                                                            <span>IVA (19%)</span>
                                                            <span>${Math.round(total - (total / 1.19)).toLocaleString()}</span>
                                                        </div>
                                                        <Divider className="my-2" />
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-xl font-bold text-gray-800">Total</span>
                                                            <span className="text-2xl font-bold text-green-600">${total.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                                                <User size={16} className="mt-1 text-blue-600" />
                                                <div>
                                                    <p className="text-xs text-blue-700 font-bold uppercase">Cliente</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {selectedClienteId
                                                            ? clientes.find(c => String(c.id) === String(selectedClienteId))?.nombre
                                                            : "Consumidor Final"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </ModalBody>
                        <ModalFooter>
                            {step === "customer" ? (
                                <Button color="primary" onPress={() => setStep("payment")}>
                                    Continuar al Pago
                                </Button>
                            ) : (
                                <>
                                    <Button variant="light" onPress={() => setStep("customer")}>Atrás</Button>
                                    <Button
                                        color="success"
                                        onPress={handlePay}
                                        isLoading={createVentaMutation.isPending}
                                        startContent={<CheckCircle2 size={18} />}
                                        className="text-white font-bold"
                                    >
                                        Confirmar Pago
                                    </Button>
                                </>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
