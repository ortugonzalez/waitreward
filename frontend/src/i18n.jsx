import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  es: {
    welcome: "Bienvenido a HORMI",
    subtitle: "Ingresá tus datos para acceder a tu panel.",
    howToLogin: "¿Cómo querés ingresar?",
    patient: "Soy paciente",
    doctor: "Soy médico",
    commerce: "Soy comercio",
    enter: "Ingresar",
    logout: "Cerrar sesión",
    myPanel: "Mi Panel",
    benefits: "Beneficios",
    realTimeQueue: "Tu turno en tiempo real",
    patientsAhead: "pacientes delante tuyo",
    estimatedDelay: "Demora est.",
    update: "Actualizar",
    tagline: "Tu tiempo vale. Ahora lo demostramos.",
    installApp: "Instalar HORMI",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    language: "Idioma",
    points: "Puntos",
    redeem: "Canjear",
    missingPoints: "Faltan",
    validUntil: "Válido hasta el",
    registerAttention: "Registrar atención",
    appointmentId: "Número de turno",
    patientDni: "DNI o código de paciente",
    scheduledTime: "Hora programada del turno",
    actualTime: "Hora real de atención",
    register: "Registrar atención",
  },
  en: {
    welcome: "Welcome to HORMI",
    subtitle: "Enter your details to access your panel.",
    howToLogin: "How would you like to sign in?",
    patient: "I'm a patient",
    doctor: "I'm a doctor",
    commerce: "I'm a business",
    enter: "Sign in",
    logout: "Sign out",
    myPanel: "My Dashboard",
    benefits: "Benefits",
    realTimeQueue: "Your turn in real time",
    patientsAhead: "patients ahead of you",
    estimatedDelay: "Est. delay",
    update: "Refresh",
    tagline: "Your time has value. Now we prove it.",
    installApp: "Install HORMI",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    language: "Language",
    points: "Points",
    redeem: "Redeem",
    missingPoints: "Need",
    validUntil: "Valid until",
    registerAttention: "Register attendance",
    appointmentId: "Appointment number",
    patientDni: "Patient ID or code",
    scheduledTime: "Scheduled appointment time",
    actualTime: "Actual attendance time",
    register: "Register attendance",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('hormi-lang') || 'es');
  
  useEffect(() => {
    localStorage.setItem('hormi-lang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
