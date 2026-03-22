import { Header, Navigation, SidebarNav } from "./Navigation";

export function Layout({ session, activeTab, setActiveTab, onLogout, children, isHome }) {
    // Mobile layout uses the existing Header and bottom Navigation structure if not on HomeView equivalent
    // Desktop layout uses fixed left Sidebar and center main content

    return (
        <div className="bg-[#F8F7FF] min-h-screen lg:flex lg:flex-row w-full font-sans">

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className="hidden lg:flex flex-col flex-shrink-0 relative z-20"
                style={{ width: "260px", background: "#7F77DD", color: "white", padding: "24px" }}
            >
                <div className="flex items-center gap-2 mb-10">
                    <span className="text-2xl">⏱</span>
                    <span className="text-xl font-black tracking-tight">HORMI</span>
                </div>

                <div className="mb-8 bg-white/10 p-4 rounded-[20px] shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest font-black text-white/60 mb-2">Mi Cuenta</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-lg text-[#7F77DD] shadow-sm">
                            {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] leading-tight truncate max-w-[130px]">{session?.name || "Usuario"}</span>
                            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wide mt-0.5">
                                {session?.role === 'patient' ? 'Paciente • Premium' : session?.role === 'clinic' ? 'Médico' : 'Comercio'}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-3">
                    <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} session={session} />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/20">
                    <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 px-4 py-3 rounded-[12px] font-bold text-[14px] transition-all"
                    >
                        <span className="text-lg opacity-80">🚪</span> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen lg:overflow-y-auto overflow-x-hidden relative">

                {/* Mobile Header */}
                <div className="lg:hidden">
                    {!isHome && <Header activeTab={activeTab} />}
                </div>

                <main
                    className={`flex-1 w-full mx-auto pb-24 lg:pb-8 lg:pt-8 px-4 sm:px-6 lg:px-8 max-w-app lg:max-w-[900px] ${!isHome ? "pt-20" : ""}`}
                >
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden">
                    {!isHome && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} session={session} />}
                </div>

            </div>

        </div>
    );
}
