import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useWallet } from "../hooks/useWallet";
import { getPoints } from "../api/client";
import { QRModal } from "../components/QRModal";
import WaitRewardABI from "../abi/WaitReward.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Comercio registrado en Fuji
const DEMO_COMMERCES = [
  { label: "Farmacia Del Pueblo", address: "0xb586790F5684d6E40a7e4dE353d08053D3eF9b41" },
];

function truncate(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function PatientView() {
  const { address, connect, disconnect, isConnecting } = useWallet();
  const [points,       setPoints]       = useState(null);
  const [loadingPts,   setLoadingPts]   = useState(false);
  const [redeemAmt,    setRedeemAmt]    = useState("");
  const [commerce,     setCommerce]     = useState(DEMO_COMMERCES[0].address);
  const [redeeming,    setRedeeming]    = useState(false);
  const [qrData,       setQrData]       = useState(null);

  const fetchPoints = useCallback(async () => {
    if (!address) return;
    setLoadingPts(true);
    try {
      const data = await getPoints(address);
      setPoints(data.points ?? 0);
    } catch {
      toast.error("No se pudo obtener el saldo");
    } finally {
      setLoadingPts(false);
    }
  }, [address]);

  // Carga inicial y refresco cada 15s
  useEffect(() => {
    fetchPoints();
    const interval = setInterval(fetchPoints, 15_000);
    return () => clearInterval(interval);
  }, [fetchPoints]);

  // ── Canje directo via MetaMask ──────────────────────────────────────────────
  const handleRedeem = async () => {
    const amt = Number(redeemAmt);
    if (!amt || amt <= 0) {
      toast.error("Ingresá una cantidad válida de puntos");
      return;
    }
    if (points !== null && amt > points) {
      toast.error(`Saldo insuficiente (tenés ${points} WP)`);
      return;
    }
    if (!CONTRACT_ADDRESS) {
      toast.error("VITE_CONTRACT_ADDRESS no configurado");
      return;
    }
    if (!window.ethereum) {
      toast.error("MetaMask no detectado");
      return;
    }

    setRedeeming(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer   = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, WaitRewardABI, signer);

      const pointsWei = ethers.parseEther(String(amt));

      toast("Confirmá la transacción en MetaMask…", { icon: "🦊" });
      const tx      = await contract.redeemPoints(commerce, pointsWei);
      toast("Transacción enviada, esperando confirmación…", { icon: "⏳" });
      const receipt = await tx.wait();

      toast.success(`Canjeaste ${amt} WP exitosamente`);

      // Refresco de saldo
      await fetchPoints();
      setRedeemAmt("");

      // Mostrar link a Snowtrace
      const explorerUrl = `https://testnet.snowtrace.io/tx/${receipt.hash}`;
      toast(
        (t) => (
          <span>
            Tx confirmada{" "}
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
               className="underline text-primary" onClick={() => toast.dismiss(t.id)}>
              ver en Snowtrace ↗
            </a>
          </span>
        ),
        { duration: 8000 }
      );
    } catch (err) {
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        toast.error("Transacción rechazada");
      } else if (err.message?.includes("Insufficient balance")) {
        toast.error("Saldo de WRT insuficiente");
      } else if (err.message?.includes("Commerce not active")) {
        toast.error("El comercio no está activo");
      } else if (err.message?.includes("Commerce has insufficient deposit")) {
        toast.error("El comercio no tiene fondos suficientes");
      } else {
        toast.error(err.reason || err.message || "Error en el canje");
      }
    } finally {
      setRedeeming(false);
    }
  };

  // ── Generar QR (alternativa al canje directo) ─────────────────────────────
  const handleQR = () => {
    const amt = Number(redeemAmt);
    if (!amt || amt <= 0) {
      toast.error("Ingresá una cantidad válida de puntos");
      return;
    }
    if (points !== null && amt > points) {
      toast.error(`Saldo insuficiente (tenés ${points} WP)`);
      return;
    }
    setQrData({ wallet: address, commerceAddress: commerce, points: amt });
  };

  // ── Sin wallet ──────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
        <div className="bg-white rounded-card shadow-sm p-8 flex flex-col items-center gap-5 w-full">
          <span className="text-6xl">🧑</span>
          <div className="text-center">
            <h2 className="text-xl font-bold text-ink">Conectá tu wallet</h2>
            <p className="text-sm text-gray-500 mt-1">
              Necesitás MetaMask para ver y canjear tus WaitPoints
            </p>
          </div>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 active:scale-95 transition-transform"
          >
            {isConnecting ? "Conectando…" : "Conectar MetaMask"}
          </button>
        </div>
      </div>
    );
  }

  // ── Con wallet ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Card de saldo */}
      <div className="bg-white rounded-card shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 font-mono">{truncate(address)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Avalanche Fuji</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPoints}
              disabled={loadingPts}
              className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-gray-500 active:scale-95 transition-transform disabled:opacity-40"
              title="Actualizar"
            >
              <span className={`text-base ${loadingPts ? "animate-spin" : ""}`}>↻</span>
            </button>
            <button
              onClick={disconnect}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-4">
          {loadingPts && points === null ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-6xl font-black text-primary leading-none">
                {points ?? 0}
              </span>
              <span className="text-lg font-semibold text-gray-400 mt-1">WaitPoints</span>
              <span className="text-sm text-gray-400 mt-1">
                = ${((points ?? 0) / 100).toFixed(2)} en descuentos
              </span>
            </>
          )}
        </div>
      </div>

      {/* Card de canje */}
      <div className="bg-white rounded-card shadow-sm p-5 flex flex-col gap-4">
        <h3 className="font-bold text-ink text-base">Canjeá tus puntos</h3>

        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">
            ¿Cuántos puntos?
          </label>
          <input
            type="number"
            min="1"
            max={points ?? undefined}
            value={redeemAmt}
            onChange={(e) => setRedeemAmt(e.target.value)}
            placeholder={`Máx. ${points ?? "?"} WP`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {redeemAmt && (
            <p className="text-xs text-gray-400 mt-1">
              = ${(Number(redeemAmt) / 100).toFixed(2)} de descuento
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">
            Comercio
          </label>
          <select
            value={commerce}
            onChange={(e) => setCommerce(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-ink text-base focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
          >
            {DEMO_COMMERCES.map((c) => (
              <option key={c.address} value={c.address}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Canje directo via MetaMask */}
        <button
          onClick={handleRedeem}
          disabled={redeeming || !redeemAmt}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {redeeming ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Canjeando…
            </>
          ) : (
            "Canjear con MetaMask"
          )}
        </button>

        {/* QR como alternativa */}
        <button
          onClick={handleQR}
          disabled={!redeemAmt}
          className="w-full py-3 rounded-full border-2 border-primary text-primary font-bold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          Generar QR 📲
        </button>
      </div>

      {/* QR Modal */}
      <QRModal data={qrData} onClose={() => setQrData(null)} />
    </div>
  );
}
