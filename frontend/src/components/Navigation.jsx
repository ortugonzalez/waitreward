const TABS = [
  { id: "patient",  label: "Paciente",  icon: "🧑" },
  { id: "clinic",   label: "Clínica",   icon: "🏥" },
  { id: "commerce", label: "Comercio",  icon: "🏪" },
];

const VIEW_LABELS = {
  patient:  "Paciente",
  clinic:   "Clínica",
  commerce: "Comercio",
};

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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200">
      <div className="max-w-app mx-auto flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors
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
