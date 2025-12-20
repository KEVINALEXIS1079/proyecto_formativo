import { ScrollShadow } from "@heroui/react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { NAVIGATION_ITEMS } from "../navigation.config";
import { X, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export default function MobileSidebar({ isOpen, onClose, onLogout }: MobileSidebarProps) {
    const { can } = useAuth();
    const location = useLocation();

    // Close sidebar when route changes
    useEffect(() => {
        onClose();
    }, [location.pathname, onClose]);

    const visibleItems = NAVIGATION_ITEMS.filter((item) => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    // if (!isOpen) return null; // Removed to allow transitions

    return (
        <div className={`fixed inset-0 z-[60] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`absolute inset-y-0 left-0 z-[70] w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-4 flex items-center justify-between border-b relative">
                    <div className="flex-1 flex justify-center">
                        <img src="/logoAgrotech.png" alt="AgroTech" className="h-12 w-auto object-contain" />
                    </div>
                    <button onClick={onClose} className="absolute right-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <ScrollShadow className="flex-1 overflow-y-auto py-4">
                    <nav className="px-2 space-y-1">
                        {visibleItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose} // Auto-close on navigate
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                        ? "bg-emerald-50 text-emerald-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <div className={`${item.to === location.pathname ? "text-emerald-600" : "text-gray-400"}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </ScrollShadow>
                {/* Logout button removed as requested */}
            </div>
        </div>
    );
}
