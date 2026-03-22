import { useState } from "react";
import { Navigation, SidebarNav } from "./Navigation";

export function Layout({ session, activeTab, setActiveTab, onLogout, children, isHome }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

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
                                {session?.role === 'patient' ? 'Paciente' : session?.role === 'clinic' ? 'Médico' : 'Comercio'}
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
            <div className={`flex-1 flex flex-col min-w-0 h-[100dvh] lg:h-screen lg:overflow-y-auto overflow-x-hidden relative pt-[max(16px,env(safe-area-inset-top))] lg:pt-0`}>

                {/* ── MOBILE HEADER CON HAMBURGUESA ── */}
                <div className="lg:hidden flex items-center px-4 py-3 bg-[#F8F7FF] z-40 sticky top-0 justify-between">
                    <button 
                        onClick={() => setDrawerOpen(true)} 
                        className="text-2xl p-1 text-[#1A1A2E] bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center w-10 h-10 active:scale-95"
                    >
                        ☰
                    </button>
                    <div className="font-black text-lg text-[#1A1A2E] tracking-tight">{isHome ? "Beneficios" : "HORMI"}</div>
                    <div className="w-10"></div> {/* Spacer balance */}
                </div>

                <main className="flex-1 w-full mx-auto pb-24 lg:pb-8 lg:pt-8 px-4 sm:px-6 lg:px-8 max-w-app lg:max-w-[900px]">
                    {children}
                </main>

                {/* ── MOBILE DRAWER (HAMBURGER MENU) ── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-[9999] lg:hidden flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        
                        <div className="relative w-[280px] h-full bg-white shadow-2xl flex flex-col animate-slide-right">
                            {/* Drawer Header userInfo */}
                            <div className="p-6 bg-[#7F77DD] text-white flex flex-col gap-4">
                                <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl">✕</button>
                                
                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-2xl text-[#7F77DD] shadow-sm">
                                    {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-lg leading-tight truncate">{session?.name || "Usuario"}</span>
                                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest mt-1">
                                        {session?.role === 'patient' ? 'PACIENTE' : session?.role === 'clinic' ? 'MÉDICO' : session?.role === 'commerce' ? 'COMERCIO' : 'INVITADO'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Drawer Links */}
                            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
                                <SidebarNav activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setDrawerOpen(false); }} session={session} mobileDrawer={true} />
                            </div>
                            
                            {/* Drawer Footer Logout */}
                            <div className="p-4 border-t border-gray-100 mb-4">
                                <button onClick={() => { setDrawerOpen(false); onLogout(); }} className="w-full text-left px-4 py-3 text-red-600 font-bold flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-[12px] transition-colors">
                                    <span className="text-lg">🚪</span> Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Bottom Navigation (Solo si no es Home) */}
                <div className="lg:hidden">
                    {!isHome && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} session={session} />}
                </div>

            </div>
        </div>
    );
}
