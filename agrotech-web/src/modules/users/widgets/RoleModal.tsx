import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Checkbox, CheckboxGroup, Accordion, AccordionItem, Chip, ScrollShadow, Tabs, Tab } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateRol, useUpdateRol, usePermisos, usePermisosByRol, useSyncPermisosRol } from "../hooks/usePermissions";
import type { Permiso, Rol } from "../models/types/permissions.types";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    roleToEdit?: Rol;
}

interface RoleForm {
    nombre: string;
    descripcion: string;
}

import { formatModuleName } from "../constants/module-labels";

export default function RoleModal({ isOpen, onClose, roleToEdit }: RoleModalProps) {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoleForm>();
    const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]); // Strings of ID for CheckboxGroup
    const [activeTab, setActiveTab] = useState<string>("info");

    const { data: allPermisos = [] } = usePermisos();
    const { data: rolePermisos = [] } = usePermisosByRol(roleToEdit?.id || null);

    const createRol = useCreateRol();
    const updateRol = useUpdateRol();
    const syncPermisos = useSyncPermisosRol();


    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (roleToEdit) {
                setValue("nombre", roleToEdit.nombre);
                setValue("descripcion", roleToEdit.descripcion || "");
                setIsEditing(false); // Default to View mode for existing roles
                setActiveTab("info"); // Reset to info tab
            } else {
                reset({ nombre: "", descripcion: "" });
                setSelectedPermisos([]);
                setIsEditing(true); // Default to Edit mode for new roles
                setActiveTab("info"); // Reset to info tab
            }
        }
    }, [isOpen, roleToEdit, setValue, reset]);

    // Sync selected permissions when rolePermisos fetch completes (Logic unchanged)
    useEffect(() => {
        if (roleToEdit && rolePermisos.length > 0) {
            const newSelection = rolePermisos.map(p => String(p.id));
            setSelectedPermisos(prev => {
                const isSame = prev.length === newSelection.length && prev.every(id => newSelection.includes(id));
                return isSame ? prev : newSelection;
            });
        } else if (!roleToEdit) {
            setSelectedPermisos(prev => prev.length === 0 ? prev : []);
        }
    }, [rolePermisos, roleToEdit]);

    const permisosByModule = useMemo(() => {
        const grouped: Record<string, Permiso[]> = {};
        allPermisos.forEach(p => {
            if (!grouped[p.modulo]) grouped[p.modulo] = [];
            grouped[p.modulo].push(p);
        });
        return grouped;
    }, [allPermisos]);

    const sortedModules = useMemo(() => {
        return Object.keys(permisosByModule).sort((a, b) => {
            const nameA = formatModuleName(a);
            const nameB = formatModuleName(b);
            return nameA.localeCompare(nameB);
        });
    }, [permisosByModule]);

    const onSubmit = async (data: RoleForm) => {
        try {
            let savedRole: Rol;
            if (roleToEdit) {
                await updateRol.mutateAsync({ id: roleToEdit.id, ...data });
                savedRole = roleToEdit;
            } else {
                savedRole = await createRol.mutateAsync(data);
            }

            // Sync permissions
            if (savedRole && savedRole.id) {
                const permisoIds = selectedPermisos.map(Number);
                await syncPermisos.mutateAsync({ rolId: savedRole.id, permisoIds });
            }

            onClose();
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    const handleSelectModule = (modulo: string, isSelected: boolean) => {
        if (!isEditing) return; // Prevent change in view mode
        const idsInModule = permisosByModule[modulo].map(p => String(p.id));
        if (isSelected) {
            setSelectedPermisos(prev => [...new Set([...prev, ...idsInModule])]);
        } else {
            setSelectedPermisos(prev => prev.filter(id => !idsInModule.includes(id)));
        }
    };

    const isModuleSelected = (modulo: string) => {
        const idsInModule = permisosByModule[modulo].map(p => String(p.id));
        return idsInModule.every(id => selectedPermisos.includes(id));
    }

    const isModuleIndeterminate = (modulo: string) => {
        const idsInModule = permisosByModule[modulo].map(p => String(p.id));
        const selectedCount = idsInModule.filter(id => selectedPermisos.includes(id)).length;
        return selectedCount > 0 && selectedCount < idsInModule.length;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader>
                    {roleToEdit ? (isEditing ? "Editar Rol" : "Gestionar Rol") : "Nuevo Rol"}
                </ModalHeader>
                <ModalBody>
                    <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={(key) => setActiveTab(key as string)}
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-success",
                                tab: "max-w-fit px-0 h-12",
                                tabContent: "group-data-[selected=true]:text-success"
                            }}
                        >
                            <Tab key="info" title="Información del Rol">
                                <div className="py-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Nombre del Rol"
                                            placeholder="Ej. Gerente de Cultivo"
                                            {...register("nombre", { required: "El nombre es requerido" })}
                                            isInvalid={!!errors.nombre}
                                            errorMessage={errors.nombre?.message}
                                            variant="bordered"
                                            isDisabled={!isEditing}
                                        />
                                        <Input
                                            label="Descripción"
                                            placeholder="Breve descripción de responsabilidades"
                                            {...register("descripcion")}
                                            variant="bordered"
                                            isDisabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </Tab>
                            <Tab key="permissions" title="Permisos">
                                <div className="py-4">
                                    <h3 className="text-lg font-semibold mb-2">Permisos del Sistema</h3>
                                    <p className="text-sm text-gray-500 mb-4">Seleccione los permisos que tendrá este rol.</p>

                                    <ScrollShadow className="h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                        <Accordion selectionMode="multiple" variant="splitted">

                                            {sortedModules.map((modulo) => {
                                                const permisos = permisosByModule[modulo];
                                                return (
                                                    <AccordionItem
                                                        key={modulo}
                                                        aria-label={modulo}
                                                        title={
                                                            <div className="flex items-center gap-4">
                                                                <Checkbox
                                                                    color="success"
                                                                    isSelected={isModuleSelected(modulo)}
                                                                    isIndeterminate={isModuleIndeterminate(modulo)}
                                                                    onValueChange={(v) => handleSelectModule(modulo, v)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    isDisabled={!isEditing}
                                                                />
                                                                <span className="font-semibold text-medium">{formatModuleName(modulo)}</span>
                                                                <Chip size="sm" variant="flat" color="success">{permisos.length}</Chip>
                                                            </div>
                                                        }
                                                    >
                                                        <CheckboxGroup
                                                            value={selectedPermisos}
                                                            onValueChange={isEditing ? setSelectedPermisos : undefined}
                                                            className="pl-2"
                                                            classNames={{ wrapper: "grid grid-cols-1 md:grid-cols-2 gap-4" }}
                                                            orientation="horizontal"
                                                            isDisabled={!isEditing}
                                                        >
                                                            {permisos.map(p => (
                                                                <Checkbox
                                                                    color="success"
                                                                    key={p.id}
                                                                    value={String(p.id)}
                                                                    classNames={{
                                                                        base: "max-w-full w-full bg-content2 hover:bg-content3 m-0 border-2 border-transparent hover:border-success/20 rounded-lg p-3 cursor-pointer transition-colors",
                                                                        label: "w-full"
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-sm font-semibold">{p.accion}</span>
                                                                        <span className="text-tiny text-default-500 font-mono">{p.clave}</span>
                                                                        {p.descripcion && <span className="text-tiny text-default-400">{p.descripcion}</span>}
                                                                    </div>
                                                                </Checkbox>
                                                            ))}
                                                        </CheckboxGroup>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </ScrollShadow>
                                </div>
                            </Tab>
                        </Tabs>
                    </form>
                </ModalBody>
                <ModalFooter>
                    {!isEditing ? (
                        <>
                            <Button variant="flat" onPress={onClose}>
                                Cerrar
                            </Button>
                            <Button color="success" className="text-black font-semibold" onPress={() => setIsEditing(true)}>
                                Editar
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="light" onPress={() => roleToEdit ? setIsEditing(false) : onClose()}>
                                Cancelar
                            </Button>
                            <Button color="success" className="text-black font-semibold" type="submit" form="role-form" isLoading={createRol.isPending || updateRol.isPending || syncPermisos.isPending}>
                                Guardar Rol
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
