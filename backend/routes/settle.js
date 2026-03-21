const { Router } = require("express");
const { ethers } = require("ethers");
const { contractClinic, contractRead } = require("../lib/contract");
const { PATIENTS } = require("../lib/patients");
const { supabase } = require("../lib/supabase");
const { sendPushToWallet, notifyPatientTurnApproaching } = require("../lib/push");

const router = Router();

const AI_URL = process.env.AI_URL || "http://localhost:5000";

/**
 * POST /api/settle
 * body: { appointmentId, patientWallet (or dni), scheduledTimestamp, actualTimestamp }
 */
router.post("/", async (req, res, next) => {
  try {
    let { appointmentId, patientWallet, dni, scheduledTimestamp, actualTimestamp } = req.body;

    if (dni && PATIENTS[dni]) {
      patientWallet = PATIENTS[dni].wallet;
    }

    // ── Validación de campos ───────────────────────────────────────────────
    if (!appointmentId || !patientWallet || scheduledTimestamp == null || actualTimestamp == null) {
      return res.status(400).json({
        success: false,
        error: "Faltan campos obligatorios: appointmentId, patientWallet, scheduledTimestamp, actualTimestamp",
      });
    }

    if (!ethers.isAddress(patientWallet)) {
      return res.status(400).json({
        success: false,
        error: `Wallet del paciente inválida: ${patientWallet}`,
      });
    }

    const scheduled = BigInt(scheduledTimestamp);
    const actual = BigInt(actualTimestamp);

    if (actual < scheduled) {
      return res.status(400).json({
        success: false,
        error: "actualTimestamp no puede ser anterior a scheduledTimestamp",
      });
    }

    // ── Notificar al paciente que su turno se acerca (non-blocking) ────────
    try {
      const aiRes = await fetch(
        `${AI_URL}/predict-delay/clinica-demo/clinica_general`
      ).then((r) => r.json());
      notifyPatientTurnApproaching(
        patientWallet,
        aiRes.predicted_delay || 25,
        aiRes.patients_ahead || 3
      ).catch(() => {});
    } catch (_) {
      // No bloquear si el módulo IA no está disponible
    }

    // ── Convertir appointmentId a bytes32 ──────────────────────────────────
    const apptId32 = ethers.id(String(appointmentId));

    // ── Verificar que no esté ya procesado ─────────────────────────────────
    const alreadySettled = await contractRead.settledAppointments(apptId32);
    if (alreadySettled) {
      return res.status(409).json({
        success: false,
        error: "Este turno ya fue procesado",
        appointmentId,
      });
    }

    // ── Enviar transacción ─────────────────────────────────────────────────
    const tx = await contractClinic.settleAppointment(
      apptId32,
      patientWallet,
      scheduled,
      actual
    );
    const receipt = await tx.wait();

    // ── Parsear evento para obtener datos del resultado ────────────────────
    let delayMinutes = 0n;
    let pointsAwarded = 0n;

    const iface = contractClinic.interface;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === "AppointmentSettled") {
          delayMinutes = parsed.args.delayMinutes;
          pointsAwarded = parsed.args.pointsAwarded;
          break;
        }
      } catch (_) {}
    }

    const response = {
      success: true,
      txHash: receipt.hash,
      appointmentId,
      appointmentId32: apptId32,
      patientWallet,
      delayMinutes: Number(delayMinutes),
      pointsAwarded: ethers.formatEther(pointsAwarded),
      pointsAwardedRaw: pointsAwarded.toString(),
    };

    // ── Persistir en Supabase (non-blocking) ──────────────────────────────
    supabase
      .from("wr_appointments")
      .insert({
        appointment_id: appointmentId,
        patient_wallet: patientWallet,
        delay_minutes: Number(delayMinutes),
        points_awarded: Number(ethers.formatEther(pointsAwarded)),
        tx_hash: receipt.hash || receipt.transactionHash,
      })
      .then(() => {})
      .catch((e) => console.error("[settle] Supabase log error:", e.message));

    // ── Notificación de puntos ganados (non-blocking) ──────────────────────
    if (Number(pointsAwarded) > 0) {
      const pts = Math.round(parseFloat(ethers.formatEther(pointsAwarded)));
      const delay = Number(delayMinutes);
      const discountARS = (pts / 100).toFixed(2);
      sendPushToWallet(patientWallet, {
        title: `¡Recibiste ${pts} WaitPoints! 🎉`,
        body: `Te esperaste ${delay} min. Tenés $${discountARS} en descuentos disponibles.`,
        tag: `appt-${appointmentId}`,
        url: "/",
      }).catch(() => {});
    }

    return res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
