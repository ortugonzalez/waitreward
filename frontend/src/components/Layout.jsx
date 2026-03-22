import { useState, useEffect } from "react";
import { Navigation, SidebarNav } from "./Navigation";
import { HormiLogo } from "./HormiLogo";
import { useTranslation } from "../i18n";

export function Layout({ session, activeTab, setActiveTab, onLogout, children, isHome }) {
    const { t, lang, setLang } = useTranslation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Auto-update toggles UI on theme change
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                if(m.attributeName === 'data-theme') setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('hormi-theme', next);
    };

    return (
        <div className="bg-[var(--bg-primary)] min-h-screen lg:flex lg:flex-row w-full font-sans transition-colors">
            
            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className="hidden lg:flex flex-col flex-shrink-0 relative z-20 bg-[var(--bg-sidebar)] text-[var(--text-on-sidebar)] transition-colors"
                style={{ width: "260px", padding: "24px" }}
            >
                <div className="flex items-center gap-2 mb-10">
                    <HormiLogo size="md" />
                </div>

                <div className="mb-8 bg-black/10 p-4 rounded-[20px] shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-60 mb-2">Mi Cuenta</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--bg-sidebar)] flex items-center justify-center font-bold text-lg shadow-sm">
                            {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[15px] leading-tight truncate max-w-[130px]">{session?.name || "Usuario"}</span>
                            <span className="text-[11px] font-bold opacity-80 uppercase tracking-wide mt-0.5">
                                {session?.role === 'patient' ? 'PACIENTE' : session?.role === 'clinic' ? 'MÉDICO' : 'COMERCIO'}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-3">
                    <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} session={session} />
                </nav>

                <div className="mt-auto pt-4 border-t border-[var(--text-on-sidebar)]/20 flex flex-col gap-2">
                    <div className="flex gap-2 mb-2">
                        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-[11px] font-bold border border-[var(--text-on-sidebar)]/30 px-2 py-2 rounded-[8px] hover:bg-black/10 transition-colors flex-1 text-center">
                            {lang === 'es' ? '🇦🇷 ES' : '🇺🇸 EN'}
                        </button>
                        <button onClick={toggleTheme} className="text-[11px] font-bold border border-[var(--text-on-sidebar)]/30 px-2 py-2 rounded-[8px] hover:bg-black/10 transition-colors flex-1 text-center">
                            {isDark ? '☀️ Claro' : '🌙 Oscuro'}
                        </button>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center gap-3 text-red-300 hover:text-red-200 hover:bg-black/10 px-4 py-3 rounded-[12px] font-bold text-[14px] transition-all"
                    >
                        <span className="text-lg opacity-80">🚪</span> {t('logout')}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT AREA ── */}
            <div className={`flex-1 flex flex-col min-w-0 h-[100dvh] lg:h-screen lg:overflow-y-auto overflow-x-hidden relative`}>

                {/* ── MOBILE HEADER CON FIX 1 ESTÁTICO ── */}
                <div className="lg:hidden flex items-center px-4 bg-[var(--bg-secondary)] shadow-sm sticky top-0 justify-between transition-colors z-[100] h-[56px] border-b border-[var(--border)] pt-[env(safe-area-inset-top)] box-content">
                    <button 
                        onClick={() => setDrawerOpen(true)} 
                        className="text-2xl p-1 text-[var(--text-primary)] rounded-lg flex items-center justify-center w-10 h-10 active:scale-95"
                    >
                        ☰
                    </button>
                    <div className="flex items-center scale-[0.80] transform origin-center">
                        <HormiLogo size="md" />
                    </div>
                    <div className="w-10"></div> {/* Spacer balance */}
                </div>

                <main className="flex-1 w-full mx-auto pb-24 lg:pb-8 lg:pt-8 px-4 sm:px-6 lg:px-8 max-w-app lg:max-w-[900px]">
                    {children}
                </main>

                {/* ── MOBILE DRAWER (HAMBURGER MENU) FIX 3 ── */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-[9999] lg:hidden flex">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        
                        <div className="relative w-[280px] h-full bg-[var(--bg-secondary)] border-r border-[var(--border)] shadow-2xl flex flex-col animate-slide-right transition-colors">
                            
                            {/* Drawer Header userInfo */}
                            <div className="p-6 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex flex-col gap-4 relative transition-colors">
                                <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl font-bold">✕</button>
                                
                                <div className="w-14 h-14 rounded-full bg-[#7F77DD] flex items-center justify-center font-black text-2xl text-white shadow-sm">
                                    {session?.name ? session.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[16px] leading-tight truncate text-[var(--text-primary)]">{session?.name || "Usuario"}</span>
                                    <span className="text-[12px] font-semibold text-[#7F77DD] uppercase tracking-widest mt-1">
                                        {session?.role === 'patient' ? 'PACIENTE' : session?.role === 'clinic' ? 'MÉDICO' : session?.role === 'commerce' ? 'COMERCIO' : 'INVITADO'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Drawer Links */}
                            <div className="flex-1 overflow-y-auto py-2 flex flex-col px-1">
                                <SidebarNav activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); setDrawerOpen(false); }} session={session} mobileDrawer={true} />
                            </div>
                            
                            {/* Drawer Footer Logout & Toggles */}
                            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col gap-3 transition-colors">
                                <div className="flex gap-2">
                                    <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')} className="text-[12px] font-bold border border-[var(--border)] px-2 py-2.5 rounded-[12px] text-[var(--text-primary)] hover:bg-[#7F77DD]/10 transition-colors flex-1 text-center">
                                        {lang === 'es' ? '🇦🇷 Español' : '🇺🇸 English'}
                                    </button>
                                    <button onClick={toggleTheme} className="text-[12px] font-bold border border-[var(--border)] px-2 py-2.5 rounded-[12px] text-[var(--text-primary)] hover:bg-[#7F77DD]/10 transition-colors flex-1 text-center">
                                        {isDark ? '☀️ Claro' : '🌙 Oscuro'}
                                    </button>
                                </div>
                                <button onClick={() => { setDrawerOpen(false); onLogout(); }} className="w-full text-left px-4 py-3 text-[#EF4444] font-semibold flex items-center gap-3 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 rounded-[12px] transition-colors mt-1 border border-transparent">
                                    <span className="text-lg">🚪</span> {t('logout')}
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
