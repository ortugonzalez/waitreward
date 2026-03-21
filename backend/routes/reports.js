const { Router } = require("express");
const PDFDocument = require("pdfkit");

const router = Router();

// ── Mock analytics data (same as analytics.js) ────────────────────────────────
const ANALYTICS = {
  totalAppointments: 847,
  avgDelay: 28,
  onTimeRate: 23,
  totalPointsAwarded: 42350,
  todayAppointments: 34,
  byHour: [
    { hour: 8,  avgDelay: 12, count: 8  },
    { hour: 9,  avgDelay: 18, count: 22 },
    { hour: 10, avgDelay: 35, count: 31 },
    { hour: 11, avgDelay: 42, count: 28 },
    { hour: 12, avgDelay: 38, count: 19 },
    { hour: 14, avgDelay: 15, count: 24 },
    { hour: 15, avgDelay: 28, count: 33 },
    { hour: 16, avgDelay: 45, count: 29 },
    { hour: 17, avgDelay: 52, count: 18 },
  ],
  byDay: [
    { day: "Lunes",     avgDelay: 31, count: 142 },
    { day: "Martes",    avgDelay: 24, count: 128 },
    { day: "Miércoles", avgDelay: 38, count: 156 },
    { day: "Jueves",    avgDelay: 27, count: 134 },
    { day: "Viernes",   avgDelay: 44, count: 148 },
    { day: "Sábado",    avgDelay: 19, count: 89  },
  ],
  topDelays: [
    { appointment_id: "A-047", delay_minutes: 78, points_awarded: 780 },
    { appointment_id: "B-112", delay_minutes: 65, points_awarded: 650 },
    { appointment_id: "A-203", delay_minutes: 59, points_awarded: 590 },
    { appointment_id: "C-088", delay_minutes: 54, points_awarded: 540 },
    { appointment_id: "B-031", delay_minutes: 51, points_awarded: 510 },
  ],
};

const PRIMARY = "#7F77DD";
const INK = "#1A1A2E";
const GRAY = "#6B7280";
const GREEN = "#22C55E";

function drawHRule(doc, y, color = "#E5E7EB") {
  doc.save().strokeColor(color).lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke().restore();
}

function sectionHeader(doc, title, y) {
  doc.save()
    .rect(50, y, 495, 20)
    .fillColor("#F8F7FF")
    .fill()
    .restore();
  doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold")
    .text(title.toUpperCase(), 56, y + 6, { width: 480 });
  doc.fillColor(INK);
  return y + 28;
}

/**
 * GET /api/reports/clinic/pdf
 * Generates and streams a PDF analytics report.
 */
router.get("/clinic/pdf", (_req, res) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  const fileDate = now.toISOString().slice(0, 10);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="reporte-clinica-${fileDate}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
  doc.pipe(res);

  // ── HEADER ─────────────────────────────────────────────────────────────────
  // Purple bar
  doc.rect(0, 0, 595, 70).fillColor(PRIMARY).fill();

  // Logo text
  doc.fillColor("white").fontSize(22).font("Helvetica-Bold").text("⏱ WaitReward", 50, 22);
  doc.fontSize(9).font("Helvetica").fillColor("rgba(255,255,255,0.8)")
    .text("Powered by Avalanche · Reporte generado el " + dateStr, 50, 48);

  // ── TITLE ──────────────────────────────────────────────────────────────────
  doc.fillColor(INK).fontSize(16).font("Helvetica-Bold")
    .text("Reporte de Analytics — Clínica Demo", 50, 90);
  doc.fontSize(9).font("Helvetica").fillColor(GRAY)
    .text("Periodo: últimos 30 días · Fuente: Avalanche Fuji + datos históricos", 50, 112);

  drawHRule(doc, 128);

  // ── KPIs ───────────────────────────────────────────────────────────────────
  let y = 138;
  doc.fillColor(INK).fontSize(11).font("Helvetica-Bold").text("KPIs Principales", 50, y);
  y += 16;

  const kpis = [
    { label: "Turnos totales",    value: ANALYTICS.totalAppointments.toLocaleString("es-AR"), color: INK },
    { label: "Demora promedio",   value: `${ANALYTICS.avgDelay} min`,                          color: INK },
    { label: "Tasa puntual",      value: `${ANALYTICS.onTimeRate}%`,                           color: GREEN },
    { label: "WaitPoints emitidos", value: ANALYTICS.totalPointsAwarded.toLocaleString("es-AR"), color: PRIMARY },
  ];

  const boxW = 115;
  const boxH = 52;
  const gap  = 10;
  let bx = 50;

  for (const kpi of kpis) {
    doc.save().rect(bx, y, boxW, boxH).fillColor("#F8F7FF").strokeColor("#E5E7EB")
      .lineWidth(0.5).fillAndStroke().restore();
    doc.fillColor(GRAY).fontSize(7.5).font("Helvetica-Bold")
      .text(kpi.label.toUpperCase(), bx + 8, y + 8, { width: boxW - 16 });
    doc.fillColor(kpi.color).fontSize(18).font("Helvetica-Bold")
      .text(kpi.value, bx + 8, y + 22, { width: boxW - 16 });
    bx += boxW + gap;
  }

  y += boxH + 20;
  drawHRule(doc, y);
  y += 12;

  // ── DEMORA POR HORA ────────────────────────────────────────────────────────
  y = sectionHeader(doc, "Demora promedio por hora del día", y);

  // Table header
  const cols = [50, 120, 250, 380];
  doc.fontSize(8).font("Helvetica-Bold").fillColor(GRAY);
  doc.text("Hora",        cols[0], y);
  doc.text("Demora prom.", cols[1], y);
  doc.text("Turnos",      cols[2], y);
  doc.text("Índice",      cols[3], y);
  y += 14;
  drawHRule(doc, y, "#D1D5DB");
  y += 6;

  const maxHourDelay = Math.max(...ANALYTICS.byHour.map((h) => h.avgDelay));

  for (const row of ANALYTICS.byHour) {
    const barW = Math.round((row.avgDelay / maxHourDelay) * 100);
    doc.fontSize(8.5).font("Helvetica").fillColor(INK);
    doc.text(`${row.hour}:00`, cols[0], y);
    doc.text(`${row.avgDelay} min`,    cols[1], y);
    doc.text(`${row.count} turnos`,    cols[2], y);
    // Mini bar
    doc.save().rect(cols[3], y + 2, barW, 7).fillColor(PRIMARY).fill().restore();
    y += 15;
    if (y > 720) { doc.addPage(); y = 50; }
  }

  y += 8;
  drawHRule(doc, y);
  y += 12;

  // ── DEMORA POR DÍA ─────────────────────────────────────────────────────────
  y = sectionHeader(doc, "Demora promedio por día de la semana", y);

  doc.fontSize(8).font("Helvetica-Bold").fillColor(GRAY);
  doc.text("Día",         cols[0], y);
  doc.text("Demora prom.", cols[1], y);
  doc.text("Turnos",       cols[2], y);
  doc.text("Índice",       cols[3], y);
  y += 14;
  drawHRule(doc, y, "#D1D5DB");
  y += 6;

  const maxDayDelay = Math.max(...ANALYTICS.byDay.map((d) => d.avgDelay));

  for (const row of ANALYTICS.byDay) {
    const barW = Math.round((row.avgDelay / maxDayDelay) * 100);
    doc.fontSize(8.5).font("Helvetica").fillColor(INK);
    doc.text(row.day,                  cols[0], y);
    doc.text(`${row.avgDelay} min`,    cols[1], y);
    doc.text(`${row.count} turnos`,    cols[2], y);
    doc.save().rect(cols[3], y + 2, barW, 7).fillColor("#9B8FE8").fill().restore();
    y += 15;
    if (y > 720) { doc.addPage(); y = 50; }
  }

  y += 8;
  drawHRule(doc, y);
  y += 12;

  // ── TOP 5 DEMORAS ──────────────────────────────────────────────────────────
  y = sectionHeader(doc, "Top 5 mayores demoras registradas", y);

  doc.fontSize(8).font("Helvetica-Bold").fillColor(GRAY);
  doc.text("Turno",        cols[0], y);
  doc.text("Demora",       cols[1], y);
  doc.text("WaitPoints",   cols[2], y);
  doc.text("Severidad",    cols[3], y);
  y += 14;
  drawHRule(doc, y, "#D1D5DB");
  y += 6;

  for (const row of ANALYTICS.topDelays) {
    const sev = row.delay_minutes >= 60 ? "Severa" : row.delay_minutes >= 30 ? "Moderada" : "Leve";
    const sevColor = row.delay_minutes >= 60 ? "#EF4444" : row.delay_minutes >= 30 ? "#F97316" : "#EAB308";
    doc.fontSize(8.5).font("Helvetica").fillColor(INK);
    doc.text(row.appointment_id,         cols[0], y);
    doc.text(`${row.delay_minutes} min`, cols[1], y);
    doc.text(`${row.points_awarded} WP`, cols[2], y);
    doc.fillColor(sevColor).font("Helvetica-Bold").text(sev, cols[3], y);
    doc.fillColor(INK).font("Helvetica");
    y += 15;
  }

  y += 16;
  drawHRule(doc, y);

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.save()
      .rect(0, 800, 595, 42)
      .fillColor("#F8F7FF")
      .fill()
      .restore();
    doc.fillColor(GRAY).fontSize(7.5).font("Helvetica")
      .text(
        `Generado por WaitReward — Powered by Avalanche · ${dateStr} · Página ${i + 1} de ${pages.count}`,
        50, 812, { width: 495, align: "center" }
      );
  }

  doc.end();
});

module.exports = router;
