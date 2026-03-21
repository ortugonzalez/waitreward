// Tier color según demora en minutos
export function tierColor(delayMinutes) {
  if (delayMinutes >= 60) return { bg: "bg-red-100",    text: "text-red-700",    label: "60+ min" };
  if (delayMinutes >= 30) return { bg: "bg-orange-100", text: "text-orange-700", label: "30-59 min" };
  if (delayMinutes >= 15) return { bg: "bg-yellow-100", text: "text-yellow-700", label: "15-29 min" };
  return                         { bg: "bg-green-100",  text: "text-green-700",  label: "< 15 min" };
}

export function PointsBadge({ points, delayMinutes }) {
  const { bg, text, label } = tierColor(delayMinutes);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {points > 0 ? `+${points} WP` : "Sin puntos"} · {label}
    </span>
  );
}
