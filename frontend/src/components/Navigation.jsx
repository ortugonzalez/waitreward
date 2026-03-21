const VIEW_LABELS = {
  home: "Beneficios",
  patient: "Mi Panel",
  clinic: "Panel Médico",
  commerce: "Panel Comercio",
};

// Define visible tabs for each role
function getTabsForRole(role) {
  if (role === "patient") {
    return [
      { id: "patient", label: "Mi Panel", icon: "🧑‍⚕️" },
      { id: "home", label: "Beneficios", icon: "🎁" },
    ];
  }
  if (role === "clinic") {
    return [
      { id: "clinic", label: "Panel Médico", icon: "👨‍⚕️" }
    ];
  }
  if (role === "commerce") {
    return [
      { id: "commerce", label: "Panel Comercio", icon: "🏪" }
    ];
  }
  return [];
}

export function Header({ activeTab }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="max-w-app mx-auto flex items-center justify-between px-4 h-14">
        <span className="text-lg font-black text-[#7F77DD] tracking-tight flex items-center gap-1.5"><span className="text-[15px]">⏱</span> WaitReward</span>
        <span className="text-[13px] font-bold text-gray-400 tracking-wide uppercase">{VIEW_LABELS[activeTab] || ""}</span>
      </div>
    </header>
  );
}

// ── Mobile Bottom Navigation ──
export function Navigation({ activeTab, setActiveTab, session }) {
  const tabs = session ? getTabsForRole(session.role) : [];

  if (tabs.length <= 1) return null; // Only show bottom bar if there's more than one option (like patient)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-app mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative
              ${activeTab === tab.id
                ? "text-[#7F77DD]"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <span className={`text-[22px] leading-none transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>{tab.icon}</span>
            <span className={`text-[11px] ${activeTab === tab.id ? 'font-black' : 'font-medium'}`}>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute top-0 w-12 h-1 bg-[#7F77DD] rounded-b-full shadow-[0_2px_8px_rgba(127,119,221,0.5)]" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Desktop Sidebar Navigation ──
export function SidebarNav({ activeTab, setActiveTab, session }) {
  const tabs = session ? getTabsForRole(session.role) : [];

  return (
    <>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-[16px] transition-all text-left ${activeTab === tab.id
              ? "bg-white text-[#7F77DD] shadow-[0_4px_16px_rgba(0,0,0,0.1)] scale-[1.02]"
              : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className={`text-[15px] ${activeTab === tab.id ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
        </button>
      ))}
    </>
  );
}
