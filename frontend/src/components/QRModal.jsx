import { QRCodeSVG } from "qrcode.react";

export function QRModal({ data, onClose }) {
  if (!data) return null;

  const qrPayload = JSON.stringify({
    wallet:          data.wallet,
    commerceAddress: data.commerceAddress,
    points:          data.points,
    timestamp:       Date.now(),
    version:         "1",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-app bg-white rounded-t-3xl p-6 pb-10 flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full" />

        <h2 className="text-xl font-bold text-ink">Tu QR de canje</h2>
        <p className="text-sm text-gray-500 text-center">
          Mostrá este código en el comercio para canjear tus puntos
        </p>

        {/* QR */}
        <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
          <QRCodeSVG
            value={qrPayload}
            size={220}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Puntos destacados */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-5xl font-black text-primary">{data.points}</span>
          <span className="text-base font-semibold text-gray-500">WaitPoints a canjear</span>
          <span className="text-sm text-gray-400">= ${(data.points / 100).toFixed(2)} de descuento</span>
        </div>

        {/* Info */}
        <div className="w-full bg-surface rounded-card p-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Wallet</span>
            <span className="font-mono">{data.wallet.slice(0, 6)}…{data.wallet.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Comercio</span>
            <span className="font-mono">{data.commerceAddress.slice(0, 6)}…{data.commerceAddress.slice(-4)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-base active:scale-95 transition-transform"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
