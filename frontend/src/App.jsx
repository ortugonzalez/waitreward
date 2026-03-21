import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Header, Navigation } from "./components/Navigation";
import { PatientView }  from "./views/PatientView";
import { ClinicView }   from "./views/ClinicView";
import { CommerceView } from "./views/CommerceView";

const VIEWS = {
  patient:  <PatientView />,
  clinic:   <ClinicView />,
  commerce: <CommerceView />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("patient");

  return (
    <div className="bg-surface min-h-screen">
      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            maxWidth: "360px",
            fontSize: "14px",
            borderRadius: "12px",
          },
          success: { iconTheme: { primary: "#7F77DD", secondary: "#fff" } },
        }}
      />

      {/* Layout centrado max 480px */}
      <div className="max-w-app mx-auto relative min-h-screen flex flex-col">
        <Header activeTab={activeTab} />

        {/* Contenido con espacio para header y nav */}
        <main className="flex-1 pt-20 pb-24 overflow-y-auto">
          {VIEWS[activeTab]}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
