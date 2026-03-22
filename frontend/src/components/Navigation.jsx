import { useTranslation } from "../i18n";

export function Header({ activeTab }) {
    return null; 
}

export function SidebarNav({ activeTab, setActiveTab, session, mobileDrawer = false }) {
    const { t } = useTranslation();
    const isPatient = session?.role === "patient";
    const isAdmin = session?.role === "clinic";
    
    // Classes adapt based on whether they are in Desktop sidebar (dark/white theme) or Mobile drawer (white/gray theme)
    const baseLinkClass = "flex items-center gap-3 px-4 py-3 rounded-[12px] font-bold text-[14px] transition-all";
    const inactiveClass = mobileDrawer 
        ? "text-[#1A1A2E] hover:bg-gray-50" 
        : "text-white/80 hover:text-white hover:bg-white/10";
    
    const activeClass = mobileDrawer
        ? "bg-[#7F77DD]/10 text-[#7F77DD]"
        : "bg-white/20 text-white shadow-sm";

    return (
        <>
            {isPatient && (
                <>
                    <button
                        onClick={() => setActiveTab("patient")}
                        className={`${baseLinkClass} ${activeTab === "patient" ? activeClass : inactiveClass}`}
                    >
                        <span className="text-xl">🏥</span> {t('myPanel')}
                    </button>
                    <button
                        onClick={() => setActiveTab("home")}
                        className={`${baseLinkClass} ${activeTab === "home" ? activeClass : inactiveClass}`}
                    >
                        <span className="text-xl">🎁</span> {t('benefits')}
                    </button>
                </>
            )}

            {isAdmin && (
                <button
                    onClick={() => setActiveTab("clinic")}
                    className={`${baseLinkClass} ${activeTab === "clinic" ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl">👨‍⚕️</span> {t('myPanel')}
                </button>
            )}

            {!isPatient && !isAdmin && (
                <button
                    onClick={() => setActiveTab("commerce")}
                    className={`${baseLinkClass} ${activeTab === "commerce" ? activeClass : inactiveClass}`}
                >
                    <span className="text-xl">🏪</span> {t('myPanel')}
                </button>
            )}
        </>
    );
}

export function Navigation({ activeTab, setActiveTab, session }) {
    const { t } = useTranslation();
    const isPatient = session?.role === "patient";
    const isAdmin = session?.role === "clinic";

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-colors pb-[max(12px,env(safe-area-inset-bottom))]">
            
            {isPatient && (
                <>
                    <button
                        onClick={() => setActiveTab("patient")}
                        className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === "patient" ? "text-[#7F77DD]" : "text-[var(--text-secondary)]"}`}
                    >
                        <span className={`text-[22px] ${activeTab === "patient" ? "scale-110 drop-shadow-sm" : "opacity-60 grayscale"}`}>🏥</span>
                        <span className="text-[10px] font-bold tracking-wide">{t('myPanel')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("home")}
                        className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === "home" ? "text-[#7F77DD]" : "text-[var(--text-secondary)]"}`}
                    >
                        <span className={`text-[22px] ${activeTab === "home" ? "scale-110 drop-shadow-sm" : "opacity-60 grayscale"}`}>🎁</span>
                        <span className="text-[10px] font-bold tracking-wide">{t('benefits')}</span>
                    </button>
                </>
            )}

            {isAdmin && (
                <button
                    onClick={() => setActiveTab("clinic")}
                    className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === "clinic" ? "text-[#7F77DD]" : "text-[var(--text-secondary)]"}`}
                >
                    <span className={`text-[22px] ${activeTab === "clinic" ? "scale-110 drop-shadow-sm" : "opacity-60 grayscale"}`}>👨‍⚕️</span>
                    <span className="text-[10px] font-bold tracking-wide">{t('myPanel')}</span>
                </button>
            )}

            {!isPatient && !isAdmin && (
                <button
                    onClick={() => setActiveTab("commerce")}
                    className={`flex flex-col items-center gap-1 transition-all flex-1 ${activeTab === "commerce" ? "text-[#7F77DD]" : "text-[var(--text-secondary)]"}`}
                >
                    <span className={`text-[22px] ${activeTab === "commerce" ? "scale-110 drop-shadow-sm" : "opacity-60 grayscale"}`}>🏪</span>
                    <span className="text-[10px] font-bold tracking-wide">{t('myPanel')}</span>
                </button>
            )}
        </div>
    );
}
