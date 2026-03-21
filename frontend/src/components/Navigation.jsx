const ALL_TABS = [
  { id: "patient",  label: "Paciente",  icon: "🧑" },
  { id: "clinic",   label: "Clínica",   icon: "🏥" },
  { id: "commerce", label: "Comercio",  icon: "🏪" },
];

const VIEW_LABELS = {
  patient:  "Paciente",
  clinic:   "Clínica",
  commerce: "Comercio",
};

function getSession() {
  try { return JSON.parse(localStorage.getItem("wr_session")) || null; }
  catch { return null; }
}

export function Header({ activeTab }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-app mx-auto flex items-center justify-between px-4 h-14">
        <span className="text-lg font-bold text-primary">⏱ WaitReward</span>
        <span className="text-sm font-medium text-gray-500">{VIEW_LABELS[activeTab]}</span>
      </div>
    </header>
  );
}

export function Navigation({ activeTab, setActiveTab }) {
  const session = getSession();
  const role = session?.role;

  // Filter tabs based on role
  const visibleTabs = ALL_TABS.filter((tab) => {
    if (!role) return false;                  // sin sesión: solo Inicio (nav no se muestra desde Home)
    if (role === "patient")  return tab.id === "patient";
    if (role === "clinic")   return tab.id === "clinic";
    if (role === "commerce") return tab.id === "commerce";
    return false;
  });

  // Always add home tab
  const tabs = [{ id: "home", label: "Inicio", icon: "🏠" }, ...visibleTabs];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200">
      <div className="max-w-app mx-auto flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative
              ${activeTab === tab.id
                ? "text-primary"
                : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-[11px] font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
