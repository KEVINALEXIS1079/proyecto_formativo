import { useState, useMemo } from "react";
import { useLotesProduccion } from "../hooks/useProduction";
import {
    Input,
    Card,
    CardBody,
    Button,
    Chip,
    ScrollShadow,
    Spinner,
    Divider
} from "@heroui/react";
import {
    Search,
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    Package,
    Tag
} from "lucide-react";
import CheckoutModal from "../widgets/CheckoutModal";

interface CartItem {
    lote: any;
    cantidad: number;
    precio: number;
}

export default function PosPage() {
    const { data: lotes = [], isLoading } = useLotesProduccion();
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Filter products (active stock > 0)
    const products = useMemo(() => {
        return lotes.filter(l =>
            l.stockDisponibleKg > 0 &&
            (l.productoAgro?.nombre.toLowerCase().includes(search.toLowerCase()) ||
                l.cultivo?.nombre.toLowerCase().includes(search.toLowerCase()))
        );
    }, [lotes, search]);

    const addToCart = (lote: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.lote.id === lote.id);
            if (existing) {
                // Increment if stock allows
                if (existing.cantidad + 1 <= lote.stockDisponibleKg) {
                    return prev.map(item => item.lote.id === lote.id ? { ...item, cantidad: item.cantidad + 1 } : item);
                }
                return prev;
            }
            return [...prev, { lote, cantidad: 1, precio: lote.precioSugeridoKg }];
        });
    };

    const removeFromCart = (loteId: number) => {
        setCart(prev => prev.filter(item => item.lote.id !== loteId));
    };

    const updateQuantity = (loteId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.lote.id !== loteId) return item;
            const newQty = item.cantidad + delta;
            if (newQty < 1) return item;
            if (newQty > item.lote.stockDisponibleKg) return item;
            return { ...item, cantidad: newQty };
        }));
    };

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.cantidad * item.precio), 0), [cart]);

    return (
        <div className="h-[calc(100vh-80px)] w-full flex gap-4 p-4 bg-gray-50/50">
            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Header / Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
                        <p className="text-sm text-gray-500">Selecciona productos para agregar al carrito</p>
                    </div>

                    <div className="w-1/3">
                        <Input
                            placeholder="Buscar producto..."
                            startContent={<Search className="text-gray-400" />}
                            value={search}
                            onValueChange={setSearch}
                            variant="bordered"
                            radius="lg"
                            classNames={{ inputWrapper: "bg-gray-50 hover:bg-white transition-colors" }}
                        />
                    </div>
                </div>

                {/* Grid */}
                <ScrollShadow className="flex-1 p-2 -m-2">
                    {isLoading ? (
                        <div className="flex bg-white h-64 rounded-2xl items-center justify-center">
                            <Spinner label="Cargando productos..." color="success" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                            <Package size={48} className="mb-2 opacity-20" />
                            <p>No hay productos disponibles.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((lote: any) => (
                                <Card
                                    key={lote.id}
                                    isPressable
                                    onPress={() => addToCart(lote)}
                                    className="border border-gray-100 hover:border-green-400 hover:shadow-md transition-all group"
                                >
                                    <CardBody className="p-3 flex flex-col gap-2 relative">
                                        {/* Price Tag */}
                                        <Chip color="success" variant="solid" className="absolute top-2 right-2 z-10 font-bold shadow-sm">
                                            ${lote.precioSugeridoKg?.toLocaleString()}
                                        </Chip>

                                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-1 overflow-hidden">
                                            {/* Placeholder or Image */}
                                            <Package className="text-gray-300 w-12 h-12 group-hover:scale-110 transition-transform" />
                                        </div>

                                        <div>
                                            <h4 className="font-bold text-gray-800 leading-tight truncate">{lote.productoAgro?.nombre}</h4>
                                            <p className="text-xs text-gray-500 truncate">{lote.cultivo?.nombre || "Lote General"}</p>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                            <span>Stock:</span>
                                            <span className="font-semibold text-gray-800">{lote.stockDisponibleKg} kg</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollShadow>
            </div>

            {/* RIGHT: Cart */}
            <div className="w-96 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full right-panel-cart">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <ShoppingCart className="text-green-600" />
                        Carrito de Compras
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">{cart.length} items seleccionados</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            <ShoppingCart size={48} className="mb-2" />
                            <p className="text-sm">El carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.lote.id} className="flex gap-3 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Package size={20} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm truncate">{item.lote.productoAgro?.nombre}</p>
                                    <p className="text-xs text-green-600 font-bold">${item.precio.toLocaleString()} / kg</p>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                        <button
                                            onClick={() => updateQuantity(item.lote.id, -1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-xs font-semibold w-6 text-center">{item.cantidad}</span>
                                        <button
                                            onClick={() => updateQuantity(item.lote.id, 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">${(item.precio * item.cantidad).toLocaleString()}</p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.lote.id)}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${Math.round(cartTotal / 1.19).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Impuestos (19%)</span>
                            <span>${Math.round(cartTotal - (cartTotal / 1.19)).toLocaleString()}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-xl text-gray-800">Total</span>
                            <span className="font-bold text-2xl text-green-600">${cartTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button
                        fullWidth
                        color="success"
                        size="lg"
                        className="text-white font-bold shadow-lg shadow-green-200"
                        isDisabled={cart.length === 0}
                        onPress={() => setIsCheckoutOpen(true)}
                        startContent={<Tag />}
                    >
                        Pagar Ahora
                    </Button>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                total={cartTotal}
                onSuccess={() => setCart([])}
            />
        </div>
    );
}
