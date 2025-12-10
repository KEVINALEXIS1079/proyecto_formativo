export default function LandingFooter() {
    return (
        <footer className="border-t border-default-200/70">
            <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between text-sm text-foreground-500">
                <span>© {new Date().getFullYear()} AgroTech</span>
                <div className="hidden sm:flex items-center gap-4">
                    <a href="#acerca" className="hover:text-foreground">Acerca</a>
                    <a href="#caracteristicas" className="hover:text-foreground">Características</a>
                </div>
            </div>
        </footer>
    );
}
