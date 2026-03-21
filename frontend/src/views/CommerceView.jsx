import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "../hooks/useWallet";
import WaitRewardABI from "../abi/WaitReward.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const API_URL = import.meta.env.VITE_API_URL;

// Mock de canjes recientes para el demo
const MOCK_REDEMPTIONS = [
  { points: 150, date: "Hoy 10:32", patient: "María G." },
  { points: 50, date: "Hoy 09:15", patient: "Carlos R." },
  { points: 300, date: "Ayer 18:47", patient: "Ana L." },
  { points: 150, date: "Ayer 11:20", patient: "Luis M." },
];

export function CommerceView() {
  const { address, connect, isConnecting } = useWallet();
  const [searchInput, setSearchInput] = useState("");
  const [commerce, setCommerce] = useState(null);
  const [loading, setLoading] = useState(false);

  // Guardamos la address internamente para las transacciones
  const [activeAddr, setActiveAddr] = useState("");

  // Modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registering, setRegistering] = useState(false);

  // ── Fetch commerce data by name ─────────────────────────────────────────────
  const fetchCommerceByName = useCallback(async (nameStr) => {
    if (!nameStr) return;
    setLoading(true);
    setCommerce(null);
    try {
      const res = await fetch(`${API_URL}/api/commerce/search?name=${encodeURIComponent(nameStr)}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Comercio no encontrado");
      }

      setCommerce(data);
      setActiveAddr(data.address);
    } catch (err) {
      console.error("[WaitReward] Commerce search error:", err);
      toast.error(err.message || "Comercio no encontrado");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch commerce data by address (used for refreshing after tx) ────────────
  const fetchCommerceByAddress = useCallback(async (addr) => {
    if (!addr) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/commerce/${addr}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Error al cargar datos");
      }

      setCommerce(prev => ({
        ...prev, // Mantener datos como el emoji
        ...data
      }));
    } catch (err) {
      console.error("[WaitReward] Commerce fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load el comercio demo al montar (por nombre)
  useEffect(() => {
    fetchCommerceByName("Farmacia Del Pueblo");
  }, [fetchCommerceByName]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return toast.error("Ingresá el nombre del comercio");
    fetchCommerceByName(searchInput.trim());
  };

  // ── Depositar fondos ───────────────────────────────────────────
  const handleDeposit = async () => {
    const amt = Number(depositAmt);
    if (!amt || amt <= 0) return toast.error("Ingresá un monto válido");
    if (!CONTRACT_ADDRESS || !window.ethereum) return toast.error("Error de conexión");

    setDepositing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WaitRewardABI, signer);

      const value = ethers.parseEther(String(amt));
      toast("Confirmando recarga...", { icon: "💳" });
      const tx = await contract.depositForRedemptions({ value });
      toast("Procesando recarga...", { icon: "⏳" });
      await tx.wait();

      toast.success(`Recargaste saldo exitosamente`);
      setShowDeposit(false);
      setDepositAmt("");
      // Refresh data
      fetchCommerceByAddress(activeAddr);
    } catch (err) {
      console.error(err);
      toast.error("Hubo un problema al recargar saldo. Intentá de nuevo.");
    } finally {
      setDepositing(false);
    }
  };

  // ── Registrar nuevo comercio ───────────────────────────────────
  const handleRegister = async () => {
    if (!registerName.trim()) return toast.error("Ingresá el nombre del comercio");
    if (!CONTRACT_ADDRESS || !window.ethereum) return toast.error("Error de conexión");

    setRegistering(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WaitRewardABI, signer);

      const fee = ethers.parseEther("0.01");
      toast("Abonando membresía...", { icon: "💳" });
      const tx = await contract.registerCommerce(registerName.trim(), { value: fee });
      toast("Completando registro...", { icon: "⏳" });
      await tx.wait();

      toast.success(`¡Bienvenido a WaitReward, ${registerName}!`);
      setShowRegister(false);
      setRegisterName("");

      // El registro fue exitoso, intentamos buscar el nuevo comercio por nombre
      // Ojo: en backend el backend/lib/commerces.js es estático, así que buscarlo
      // podría fallar si es MOCK, pero fetchCommerceByAddress lo trae del contrato.
      const signerAddr = await signer.getAddress();
      fetchCommerceByAddress(signerAddr);
    } catch (err) {
      console.error(err);
      toast.error("Hubo un problema al registrarte. Intentá de nuevo revisando tu saldo.");
    } finally {
      setRegistering(false);
    }
  };

  const expiryDate = commerce?.subscriptionExpiryISO
    ? new Date(commerce.subscriptionExpiryISO).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric",
    })
    : null;

  const totalRedemptions = MOCK_REDEMPTIONS.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
        <h2 className="font-bold text-ink text-base">Iniciar sesión como comercio</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: Farmacia Del Pueblo"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-60 active:scale-95 transition-transform flex-shrink-0"
          >
            {loading ? "…" : "Ingresar"}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-card shadow-sm p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Commerce Dashboard */}
      {commerce && !loading && (
        <>
          {/* Card principal */}
          <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{commerce.emoji || "🏪"}</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-ink">{commerce.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{commerce.category || "Comercio Adherido"}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${commerce.subscriptionActive ?? commerce.active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {(commerce.subscriptionActive ?? commerce.active) ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard
                label="Saldo"
                value={`$${((commerce.depositedFunds || 0) * 35).toFixed(0)}`} // Multiplicamos aprox x35
                icon="💰"
              />
              <StatCard
                label="Canjes"
                value={MOCK_REDEMPTIONS.length}
                unit="hoy"
                icon="🔄"
              />
              <StatCard
                label="Suscripción"
                value={expiryDate ?? "—"}
                icon="📅"
              />
            </div>

            {/* Progress bar del depósito */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Fondos para respaldar canjes</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all"
                  style={{ width: `${Math.min(((commerce.depositedFunds || 0) / 0.1) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeposit(true)}
                className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-sm active:scale-95 transition-transform"
              >
                💰 Recargar saldo
              </button>
              <button
                onClick={() => fetchCommerceByAddress(activeAddr)}
                className="px-4 py-3 rounded-full border-2 border-gray-200 text-gray-500 font-bold text-sm active:scale-95 transition-transform"
              >
                ↻
              </button>
            </div>
          </div>

          {/* WaitPoints canjeados (resumen) */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-card shadow-sm p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm opacity-90">WaitPoints recibidos</h3>
              <span className="text-xs opacity-70">Últimos 7 días</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">{totalRedemptions}</span>
              <span className="text-sm opacity-80 mb-1">WP</span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              = ${(totalRedemptions / 100).toFixed(2)} generados en ventas
            </p>
          </div>

          {/* Canjes recientes */}
          <div className="bg-white rounded-card shadow-sm p-5">
            <h3 className="font-bold text-ink text-sm mb-3">Canjes recientes</h3>
            <ul className="flex flex-col divide-y divide-gray-50">
              {MOCK_REDEMPTIONS.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{r.patient.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{r.patient}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">
                    +{r.points} WP
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Registrar nuevo comercio */}
      {!commerce && !loading && (
        <div className="bg-white rounded-card shadow-sm p-5 flex flex-col items-center gap-4">
          <span className="text-5xl">🏪</span>
          <div className="text-center">
            <h3 className="font-bold text-ink text-lg">¿Tenés un comercio?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Unite a WaitReward para recibir pagos con puntos y atraer nuevos clientes
            </p>
          </div>
          {address ? (
            <button
              onClick={() => setShowRegister(true)}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform"
            >
              Unirme a WaitReward
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 active:scale-95 transition-transform"
            >
              {isConnecting ? "Validando…" : "Validar identidad (Login)"}
            </button>
          )}
        </div>
      )}

      {/* Modal: Depositar fondos */}
      {showDeposit && (
        <Modal onClose={() => setShowDeposit(false)}>
          <h2 className="font-bold text-ink text-lg">Recargar saldo</h2>
          <p className="text-sm text-gray-500">
            Los fondos depositados se usan para respaldar los descuentos de los pacientes.
            (En esta demo, el pago se hace en tokens de prueba de Avalanche).
          </p>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              Monto a recargar (Demo token)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.05"
              value={depositAmt}
              onChange={(e) => setDepositAmt(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <button
            onClick={handleDeposit}
            disabled={depositing}
            className="w-full py-4 rounded-full bg-primary text-white font-bold active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {depositing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando recarga…
              </>
            ) : (
              "Confirmar recarga"
            )}
          </button>
        </Modal>
      )}

      {/* Modal: Registrar comercio */}
      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <h2 className="font-bold text-ink text-lg">Unirse a WaitReward</h2>
          <p className="text-sm text-gray-500">
            Tu comercio aparecerá en toda la red y podrás aceptar WaitPoints.
          </p>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">
              Nombre de tu comercio
            </label>
            <input
              type="text"
              placeholder="Ej: Farmacia San Martín"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="bg-surface rounded-xl p-3 flex items-start gap-3 mt-2">
            <span className="text-lg">💡</span>
            <p className="text-xs text-gray-500">
              La suscripción requiere un pago mensual de integración (0.01 tokens en la demo).
              Este monto valida tu comercio en el contrato inteligente.
            </p>
          </div>
          <button
            onClick={handleRegister}
            disabled={registering}
            className="w-full py-4 rounded-full bg-primary text-white font-bold active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {registering ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completando…
              </>
            ) : (
              "Completar registro"
            )}
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-surface rounded-xl p-3 flex flex-col gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-500">{label}</span>
      <div>
        <span className="text-sm font-bold text-ink">{value}</span>
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-app bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
        {children}
      </div>
    </div>
  );
}
