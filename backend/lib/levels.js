const LEVELS = [
  {
    name: "Bronce",
    emoji: "🥉",
    minPoints: 0,
    maxPoints: 100,
    color: "#CD7F32",
    perks: ["Catálogo básico de beneficios"],
  },
  {
    name: "Plata",
    emoji: "🥈",
    minPoints: 101,
    maxPoints: 300,
    color: "#C0C0C0",
    perks: ["Catálogo completo", "Prioridad en canjes"],
  },
  {
    name: "Oro",
    emoji: "🥇",
    minPoints: 301,
    maxPoints: 600,
    color: "#FFD700",
    perks: ["Catálogo completo", "Prioridad en canjes", "Socios exclusivos"],
  },
  {
    name: "Premium",
    emoji: "💎",
    minPoints: 601,
    maxPoints: Infinity,
    color: "#7F77DD",
    perks: ["Todo incluido", "Beneficios VIP", "Soporte prioritario"],
  },
];

function getLevel(points) {
  return LEVELS.find((l) => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0];
}

function getNextLevel(points) {
  const currentIndex = LEVELS.findIndex(
    (l) => points >= l.minPoints && points <= l.maxPoints
  );
  return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
}

function getProgressToNextLevel(points) {
  const current = getLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100; // ya es Premium
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.round((progress / range) * 100);
}

module.exports = { getLevel, getNextLevel, getProgressToNextLevel, LEVELS };
