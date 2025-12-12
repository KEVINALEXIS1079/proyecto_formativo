import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Image, Spinner, Tabs, Tab } from "@heroui/react";
import { useState, useEffect, useRef } from "react";
import { productionApi, type ProductoAgro } from "../api/production.service";
import { useQueryClient } from "@tanstack/react-query";
import { QK_PRODUCTION } from "../hooks/useProduction";
import { Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { getImageUrl } from "../utils/image-helper";

interface ProductImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    producto: ProductoAgro | null;
}

export default function ProductImageModal({ isOpen, onClose, producto }: ProductImageModalProps) {
    const [activeTab, setActiveTab] = useState<"url" | "file">("file");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isValid, setIsValid] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen && producto) {
            const url = (producto as any).imagen || "";
            // We keep the raw URL in state for editing, but validate/show the full URL
            setImageUrl(url);
            setPreviewUrl(null);
            setSelectedFile(null);
            setActiveTab("file");
            if (url) validateImage(getImageUrl(url));
        }
    }, [isOpen, producto]);

    const validateImage = (url: string) => {
        const fullUrl = getImageUrl(url);
        if (!fullUrl) {
            setIsValid(false);
            return;
        }
        setIsValidating(true);
        const img = new window.Image();
        img.onload = () => {
            setIsValid(true);
            setIsValidating(false);
        };
        img.onerror = () => {
            setIsValid(false);
            setIsValidating(false);
        };
        img.src = fullUrl;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setIsValid(true); // Local files are valid by definition
        }
    };

    const handleSave = async () => {
        if (!producto) return;
        setIsLoading(true);
        try {
            if (activeTab === "file" && selectedFile) {
                await productionApi.uploadProductImage(producto.id, selectedFile);
            } else if (activeTab === "url" && imageUrl) {
                await productionApi.updateProducto(producto.id, { imagen: imageUrl });
            }
            queryClient.invalidateQueries({ queryKey: [QK_PRODUCTION.LOTES] });
            onClose();
        } catch (error) {
            console.error("Failed to update product image", error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentImage = activeTab === "file" ? previewUrl : imageUrl;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Imagen del Producto
                            <span className="text-xs font-normal text-gray-500">{producto?.nombre}</span>
                        </ModalHeader>
                        <ModalBody>
                             <Tabs 
                                aria-label="Opciones de Imagen" 
                                selectedKey={activeTab} 
                                onSelectionChange={(key) => setActiveTab(key as "url" | "file")}
                            >
                                <Tab key="file" title={
                                    <div className="flex items-center space-x-2">
                                        <Upload size={16} />
                                        <span>Subir Archivo</span>
                                    </div>
                                }/>
                                <Tab key="url" title={
                                    <div className="flex items-center space-x-2">
                                        <LinkIcon size={16} />
                                        <span>Enlace URL</span>
                                    </div>
                                }/>
                            </Tabs>

                            <div className="space-y-4 mt-2">
                                {activeTab === "url" ? (
                                    <Input
                                        label="URL de la Imagen"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        value={imageUrl}
                                        onValueChange={(val) => {
                                            setImageUrl(val);
                                            validateImage(val);
                                        }}
                                        description="Pega el enlace de una imagen pública"
                                    />
                                ) : (
                                    <div 
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium text-gray-600">
                                            {selectedFile ? selectedFile.name : "Haga clic para seleccionar una imagen"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                                    </div>
                                )}

                                <div className="flex justify-center items-center min-h-[200px] bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                                    {isValidating ? (
                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                            <Spinner size="sm" />
                                            <span className="text-xs">Verificando...</span>
                                        </div>
                                    ) : (currentImage && isValid) ? (
                                        <img
                                            src={activeTab === "file" && selectedFile ? currentImage! : getImageUrl(currentImage)}
                                            alt="Preview"
                                            className="object-contain max-h-[300px] w-full"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ImageIcon size={40} className="opacity-20 mb-2" />
                                            <span className="text-sm">Vista previa</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button 
                                color="primary" 
                                onPress={handleSave} 
                                isLoading={isLoading}
                                isDisabled={
                                    (activeTab === "url" && (!isValid || !imageUrl)) ||
                                    (activeTab === "file" && !selectedFile)
                                }
                            >
                                Guardar Imagen
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
