import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Header, Navigation } from "./components/Navigation";
import { HomeView } from "./views/HomeView";
import { PatientView } from "./views/PatientView";
import { ClinicView } from "./views/ClinicView";
import { CommerceView } from "./views/CommerceView";
import { LoginView } from "./views/LoginView";
import { ValidateView } from "./views/ValidateView";

function loadSession() {
  try { return JSON.parse(localStorage.getItem("wr_session")) || null; }
  catch { return null; }
}

const ROLE_TAB = { patient: "patient", clinic: "clinic", commerce: "commerce" };

export default function App() {
  // ── QR validation route (check URL before anything else) ──────────────────
  const urlParams  = new URLSearchParams(window.location.search);
  const isValidate = window.location.pathname === "/validate";
  const validateCode = isValidate ? urlParams.get("code") : null;

  const [session, setSession] = useState(loadSession);
  const [activeTab, setActiveTab] = useState(() => {
    const s = loadSession();
    return s ? ROLE_TAB[s.role] ?? "home" : "home";
  });
  const [loginFor, setLoginFor] = useState(null);

  const handleLogin = (sessionData) => {
    setSession(sessionData);
    setLoginFor(null);
    setActiveTab(ROLE_TAB[sessionData.role] ?? "home");
  };

  const handleLogout = () => {
    localStorage.removeItem("wr_session");
    setSession(null);
    setActiveTab("home");
  };

  const handleTabChange = (tab) => {
    const isRoleTab = ["patient", "clinic", "commerce"].includes(tab);
    if (isRoleTab && !session) {
      setLoginFor(tab);
      return;
    }
    setLoginFor(null);
    setActiveTab(tab);
  };

  const toaster = (
    <Toaster
      position="top-center"
      toastOptions={{
        style: { maxWidth: "360px", fontSize: "14px", borderRadius: "12px" },
        success: { iconTheme: { primary: "#7F77DD", secondary: "#fff" } },
      }}
    />
  );

  // ── /validate?code=... ─────────────────────────────────────────────────────
  if (validateCode) {
    return (
      <div className="bg-surface min-h-screen">
        {toaster}
        <div className="max-w-app mx-auto">
          <ValidateView
            code={validateCode}
            onBack={() => { window.location.href = "/"; }}
          />
        </div>
      </div>
    );
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (loginFor) {
    return (
      <div className="bg-surface min-h-screen">
        {toaster}
        <div className="max-w-app mx-auto relative min-h-screen">
          <LoginView
            onLogin={handleLogin}
            onBack={() => { setLoginFor(null); setActiveTab("home"); }}
          />
        </div>
      </div>
    );
  }

  const isHome = activeTab === "home";

  const VIEWS = {
    home:     <HomeView setActiveTab={handleTabChange} />,
    patient:  <PatientView  session={session} onLogout={handleLogout} />,
    clinic:   <ClinicView   session={session} onLogout={handleLogout} />,
    commerce: <CommerceView session={session} onLogout={handleLogout} />,
  };

  return (
    <div className="bg-surface min-h-screen">
      {toaster}
      <div className="max-w-app mx-auto relative min-h-screen flex flex-col">
        {!isHome && <Header activeTab={activeTab} />}
        <main className={`flex-1 ${!isHome ? "pt-20 pb-24" : ""} overflow-y-auto`}>
          {VIEWS[activeTab]}
        </main>
        {!isHome && <Navigation activeTab={activeTab} setActiveTab={handleTabChange} />}
      </div>
    </div>
  );
}
