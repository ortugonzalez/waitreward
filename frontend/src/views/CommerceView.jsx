import { useState } from "react";
import toast from "react-hot-toast";
import { getCommerce } from "../api/client";

// Mock de canjes recientes para el demo
const MOCK_REDEMPTIONS = [
  { wallet: "0xAbCd1234567890EF1234567890abcdef12345678", points: 150, date: "Hoy 10:32" },
  { wallet: "0x1234567890abcdef1234567890AbCd1234567890", points: 50,  date: "Hoy 09:15" },
  { wallet: "0x9876543210fedcba9876543210FEDCBA98765432", points: 300, date: "Ayer 18:47" },
];

function truncate(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Avatar({ label }) {
  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-primary font-bold text-sm">{label}</span>
    </div>
  );
}

export function CommerceView() {
  const [input,       setInput]       = useState("");
  const [commerce,    setCommerce]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmt,  setDepositAmt]  = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return toast.error("Ingresá una dirección");

    setLoading(true);
    setCommerce(null);

    try {
      const data = await getCommerce(input.trim());
      setCommerce(data);
    } catch (err) {
      toast.error(err.message || "Comercio no encontrado");
    } finally {
      setLoading(false);
    }
  };

  const expiryDate = commerce?.subscriptionExpiryISO
    ? new Date(commerce.subscriptionExpiryISO).toLocaleDateString("es-AR", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-3">
        <h2 className="font-bold text-ink text-base">Consultar comercio</h2>
        <input
          type="text"
          placeholder="0x... dirección del comercio"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Buscando…
            </>
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      {/* Resultado */}
      {commerce && (
        <>
          {/* Card de estado */}
          <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-ink">{commerce.name}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{truncate(input)}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  commerce.subscriptionActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {commerce.subscriptionActive ? "✅ Activo" : "❌ Expirado"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Depósito disponible"
                value={`${commerce.depositedFunds?.toFixed(4)} AVAX`}
                icon="💰"
              />
              <StatCard
                label="Vence el"
                value={expiryDate ?? "—"}
                icon="📅"
              />
            </div>

            <button
              onClick={() => setDepositModal(true)}
              className="w-full py-3 rounded-full border-2 border-primary text-primary font-bold text-sm active:scale-95 transition-transform"
            >
              Depositar fondos
            </button>
          </div>

          {/* Canjes recientes (mock) */}
          <div className="bg-white rounded-card shadow-sm p-5">
            <h3 className="font-bold text-ink text-sm mb-3">Canjes recientes</h3>
            <ul className="flex flex-col divide-y divide-gray-50">
              {MOCK_REDEMPTIONS.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar label={r.wallet.slice(2, 3).toUpperCase()} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink font-mono truncate">
                      {truncate(r.wallet)}
                    </p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <span className="text-sm font-bold text-primary flex-shrink-0">
                    -{r.points} WP
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Modal depositar */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setDepositModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-app bg-white rounded-t-3xl p-6 pb-10 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
            <h2 className="font-bold text-ink text-lg">Depositar fondos</h2>
            <p className="text-sm text-gray-500">
              Los fondos depositados se usan para pagar los canjes de los pacientes.
            </p>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">
                Monto en AVAX
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={depositAmt}
                onChange={(e) => setDepositAmt(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              onClick={() => {
                toast.success("En producción: firma con MetaMask");
                setDepositModal(false);
                setDepositAmt("");
              }}
              className="w-full py-4 rounded-full bg-primary text-white font-bold active:scale-95 transition-transform"
            >
              Confirmar depósito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-surface rounded-xl p-3 flex flex-col gap-1">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}
