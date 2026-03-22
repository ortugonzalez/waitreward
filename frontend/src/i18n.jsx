import { createContext, useContext, useState, useEffect } from "react";

export const translations = {
  es: {
    hello: "Hola",
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
    delayMinutes: "min demora",

    // Benefits (HomeView)
    yourAvailablePoints: "Tus Puntos HORMI disponibles",
    points: "Puntos",
    bronzeMembership: "MEMBRESÍA BRONCE",
    silverMembership: "MEMBRESÍA PLATA",
    goldMembership: "MEMBRESÍA ORO",
    premiumMembership: "MEMBRESÍA PREMIUM",
    redeem: "Canjear",
    missingPoints: "Faltan",
    
    // Cards
    coffeeShop: "Café en local adherido",
    pharmacyDiscount: "Descuento en farmacia",
    psychology: "Sesión de psicología",
    internalConsult: "Consulta interna sin cargo",
    dentistry: "Descuento en odontología",
    kinesiology: "Sesión de kinesiología",
    labAnalysis: "Análisis de laboratorio",
    gym: "Mes en gimnasio",
    aesthetics: "Sesión en estética",
    yoga: "Clase de yoga",
    nutritionist: "Consulta con nutricionista",
    ophthalmology: "Control oftalmológico",
    traumatology: "Consulta traumatológica",
    vipBenefit: "Beneficio VIP personalizado",
    dietetics: "Descuento en dietética",
    hairdresser: "Descuento en peluquería",
    partnerBusinesses: "Comercios adheridos",

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
    cardiology: "Cardiología",
    dermatology: "Dermatología",
    traumatologySpec: "Traumatología",
    pediatrics: "Pediatría",
    generalClinic: "Clínica general",
    ophthalmologySpec: "Oftalmología",
    totalAppointments: "Turnos totales",
    avgDelay: "Demora promedio",
    onTimeRate: "% puntual",
    pointsIssued: "Puntos emitidos",
    delayByHour: "Demoras por hora",
    delayByDay: "Demoras por día",
    minutes: "min",

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
    hours: "Horarios",
    schedule: "Horario",
    address: "Dirección",
    todayRedemptions: "Canjes hoy",
    discountsGiven: "Descuentos entregados",
    newClients: "Clientes nuevos",
    active: "Activo",
    monFri: "Lun-Vie",
    monSun: "Lun-Dom",
    monSat: "Lun-Sáb",

    // Errors
    userNotFound: "Usuario no encontrado. Verificá los datos e intentá de nuevo.",
    connectionError: "No pudimos conectarnos al servidor. Verificá tu conexión.",
    sessionExpired: "Tu sesión expiró. Por favor iniciá sesión nuevamente."
  },
  en: {
    hello: "Hi",
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
    delayMinutes: "min delay",

    // Benefits (HomeView)
    yourAvailablePoints: "Your available HORMI Points",
    points: "Points",
    bronzeMembership: "BRONZE MEMBERSHIP",
    silverMembership: "SILVER MEMBERSHIP",
    goldMembership: "GOLD MEMBERSHIP",
    premiumMembership: "PREMIUM MEMBERSHIP",
    redeem: "Redeem",
    missingPoints: "Need",

    // Cards
    coffeeShop: "Coffee at partner café",
    pharmacyDiscount: "Pharmacy discount",
    psychology: "Psychology session",
    internalConsult: "Free internal consultation",
    dentistry: "Dentistry discount",
    kinesiology: "Kinesiology session",
    labAnalysis: "Lab analysis",
    gym: "Gym membership",
    aesthetics: "Aesthetics session",
    yoga: "Yoga class",
    nutritionist: "Nutritionist consultation",
    ophthalmology: "Ophthalmology checkup",
    traumatology: "Traumatology consultation",
    vipBenefit: "Personalized VIP benefit",
    dietetics: "Dietetics discount",
    hairdresser: "Hairdresser discount",
    partnerBusinesses: "Partner businesses",

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
    cardiology: "Cardiology",
    dermatology: "Dermatology",
    traumatologySpec: "Traumatology",
    pediatrics: "Pediatrics",
    generalClinic: "General clinic",
    ophthalmologySpec: "Ophthalmology",
    totalAppointments: "Total appointments",
    avgDelay: "Avg delay",
    onTimeRate: "On time rate",
    pointsIssued: "Points issued",
    delayByHour: "Delay by hour",
    delayByDay: "Delay by day",
    minutes: "min",

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
    hours: "Hours",
    schedule: "Schedule",
    address: "Address",
    todayRedemptions: "Today's redemptions",
    discountsGiven: "Discounts given",
    newClients: "New clients",
    active: "Active",
    monFri: "Mon-Fri",
    monSun: "Mon-Sun",
    monSat: "Mon-Sat",

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
