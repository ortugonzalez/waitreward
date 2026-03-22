import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  es: {
    welcome: "Bienvenido a HORMI",
    subtitle: "Ingresá tus datos para acceder a tu panel.",
    tagline: "Tu tiempo vale. Ahora lo demostramos.",
    howToLogin: "¿Cómo querés ingresar?",
    patient: "Soy paciente",
    doctor: "Soy médico",
    commerce: "Soy comercio",
    enter: "Ingresar",
    logout: "Cerrar sesión",
    installApp: "Instalar HORMI",
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    language: "Idioma",

    // Common
    update: "Actualizar",
    close: "Cerrar",
    
    // PatientView & Navigation
    myPanel: "Mi Panel",
    benefits: "Beneficios",
    realTimeQueue: "Tu turno en tiempo real",
    patientsAhead: "pacientes delante tuyo",
    estimatedDelay: "Demora est.",
    appointmentHistory: "Mi historial",
    ourImpact: "Nuestro impacto",
    pointsDelivered: "Puntos entregados",
    appointmentsRegistered: "Turnos registrados",
    redemptionsMade: "Canjes realizados",

    // Benefits (HomeView)
    yourAvailablePoints: "Tus Puntos HORMI disponibles",
    points: "Puntos",
    bronzeMembership: "MEMBRESÍA BRONCE",
    silverMembership: "MEMBRESÍA PLATA",
    goldMembership: "MEMBRESÍA ORO",
    premiumMembership: "MEMBRESÍA PREMIUM",
    redeem: "Canjear",
    missingPoints: "Faltan",

    // QR Modal
    qrTitle: "Tu código de canje",
    conditions: "Condiciones",
    validUntil: "Válido hasta el",
    shareQR: "Compartir",

    // ClinicView
    registerAttention: "Registrar atención",
    appointmentNumber: "Número de turno",
    patientId: "DNI o código de paciente",
    scheduledTime: "Hora programada",
    actualTime: "Hora real de atención",
    register: "Registrar",
    delayPrediction: "Predicción de demora (IA)",
    estimatedWait: "Demora estimada",
    confidence: "Confianza",
    analyticsTitle: "Analytics de la clínica",
    downloadPDF: "Descargar reporte PDF",
    contractStatus: "Estado del contrato",

    // CommerceView
    scanQRTitle: "Escanear QR del paciente",
    qrCode: "Código QR",
    validateQR: "Validar QR",
    scanWithCamera: "Escanear con cámara",
    redemptionHistory: "Historial de canjes",
    todayMetrics: "Métricas del día",
    activeSubscription: "Suscripción activa",
    generateQR: "Generar QR",
    scanQR: "Escanear QR",

    // Errors
    userNotFound: "Usuario no encontrado. Verificá los datos e intentá de nuevo.",
    connectionError: "No pudimos conectarnos al servidor. Verificá tu conexión.",
    sessionExpired: "Tu sesión expiró. Por favor iniciá sesión nuevamente."
  },
  en: {
    welcome: "Welcome to HORMI",
    subtitle: "Enter your details to access your panel.",
    tagline: "Your time has value. Now we prove it.",
    howToLogin: "How would you like to sign in?",
    patient: "I'm a patient",
    doctor: "I'm a doctor",
    commerce: "I'm a business",
    enter: "Sign in",
    logout: "Sign out",
    installApp: "Install HORMI",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    language: "Language",

    // Common
    update: "Refresh",
    close: "Close",

    // PatientView & Navigation
    myPanel: "My Dashboard",
    benefits: "Benefits",
    realTimeQueue: "Your turn in real time",
    patientsAhead: "patients ahead of you",
    estimatedDelay: "Est. delay",
    appointmentHistory: "My history",
    ourImpact: "Our impact",
    pointsDelivered: "Points delivered",
    appointmentsRegistered: "Appointments registered",
    redemptionsMade: "Redemptions made",

    // Benefits (HomeView)
    yourAvailablePoints: "Your available HORMI Points",
    points: "Points",
    bronzeMembership: "BRONZE MEMBERSHIP",
    silverMembership: "SILVER MEMBERSHIP",
    goldMembership: "GOLD MEMBERSHIP",
    premiumMembership: "PREMIUM MEMBERSHIP",
    redeem: "Redeem",
    missingPoints: "Need",

    // QR Modal
    qrTitle: "Your redemption code",
    conditions: "Conditions",
    validUntil: "Valid until",
    shareQR: "Share",

    // ClinicView
    registerAttention: "Register attendance",
    appointmentNumber: "Appointment number",
    patientId: "Patient ID or code",
    scheduledTime: "Scheduled time",
    actualTime: "Actual attendance time",
    register: "Register",
    delayPrediction: "Delay prediction (AI)",
    estimatedWait: "Estimated wait",
    confidence: "Confidence",
    analyticsTitle: "Clinic analytics",
    downloadPDF: "Download PDF report",
    contractStatus: "Contract status",

    // CommerceView
    scanQRTitle: "Scan patient QR",
    qrCode: "QR Code",
    validateQR: "Validate QR",
    scanWithCamera: "Scan with camera",
    redemptionHistory: "Redemption history",
    todayMetrics: "Today's metrics",
    activeSubscription: "Active subscription",
    generateQR: "Generate QR",
    scanQR: "Scan QR",

    // Errors
    userNotFound: "User not found. Please check your details and try again.",
    connectionError: "Could not connect to server. Check your connection.",
    sessionExpired: "Your session expired. Please sign in again."
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('hormi-lang') || 'es');
  
  useEffect(() => {
    localStorage.setItem('hormi-lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
