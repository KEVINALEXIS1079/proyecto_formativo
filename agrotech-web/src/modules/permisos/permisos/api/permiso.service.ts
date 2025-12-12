export const permisoService = {
    onPermissionsChanged: (callback: (data: { userId: number }) => Promise<void>) => {
        // Stub implementation
        console.warn('PermisoService stub: onPermissionsChanged called');
        return () => { }; // Unsubscribe function
    }
};
