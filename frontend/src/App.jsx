import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
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
  const urlParams = new URLSearchParams(window.location.search);
  const isValidate = window.location.pathname === "/validate";
  const validateCode = isValidate ? urlParams.get("code") : null;

  const [session, setSession] = useState(loadSession);
  const [activeTab, setActiveTab] = useState(() => {
    const s = loadSession();
    return s ? ROLE_TAB[s.role] ?? "patient" : null;
  });

  const handleLogin = (sessionData) => {
    setSession(sessionData);
    setActiveTab(ROLE_TAB[sessionData.role] ?? "patient");
  };

  const handleLogout = () => {
    localStorage.removeItem("wr_session");
    setSession(null);
    setActiveTab(null);
  };

  const handleTabChange = (tab) => {
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

  if (!session) {
    return (
      <div className="bg-surface min-h-screen">
        {toaster}
        <div className="max-w-app mx-auto relative min-h-screen">
          <LoginView onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const isHome = activeTab === "home";

  const VIEWS = {
    home: <HomeView setActiveTab={handleTabChange} />,
    patient: <PatientView session={session} onLogout={handleLogout} />,
    clinic: <ClinicView session={session} onLogout={handleLogout} />,
    commerce: <CommerceView session={session} onLogout={handleLogout} />,
  };

  return (
    <>
      {toaster}
      <Layout
        session={session}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLogout={handleLogout}
        isHome={isHome}
      >
        {VIEWS[activeTab] || VIEWS[ROLE_TAB[session.role] || "patient"]}
      </Layout>
    </>
  );
}
