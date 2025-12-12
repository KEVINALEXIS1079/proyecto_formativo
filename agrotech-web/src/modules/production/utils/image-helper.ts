export function getImageUrl(path: string | undefined | null): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
    // Ensure path starts with / if not present
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
}
