import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function ValidateView({ code, onBack }) {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!code) { setStatus("error"); setResult({ message: "Código QR no válido" }); return; }

    fetch(`${API_URL}/api/rewards/redeem-qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode: code }),
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data);
        setStatus(data.success ? "success" : "error");
      })
      .catch(() => {
        setResult({ message: "Error de conexión con el servidor" });
        setStatus("error");
      });
  }, [code]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-card shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-6 text-center">

        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-ink font-semibold">Validando QR…</p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="text-6xl">✅</span>
            <div>
              <h2 className="text-xl font-black text-green-700">Canje exitoso</h2>
              <p className="text-sm text-green-600 mt-1">
                {result.pointsRedeemed} WaitPoints · Descuento: {result.discountValue}
              </p>
            </div>
            <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs text-green-700 font-medium">{result.message}</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <span className="text-6xl">❌</span>
            <div>
              <h2 className="text-xl font-black text-red-700">QR inválido o expirado</h2>
              <p className="text-sm text-red-500 mt-1">{result?.message}</p>
            </div>
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs text-red-700 font-mono break-all">{code}</p>
            </div>
          </>
        )}

        {status !== "loading" && (
          <button
            onClick={onBack}
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform"
          >
            Volver al inicio
          </button>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mt-6">WaitReward · Avalanche Fuji Testnet</p>
    </div>
  );
}
