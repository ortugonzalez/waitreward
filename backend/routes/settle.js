const { Router } = require("express");
const { ethers } = require("ethers");
const { contractClinic, contractRead } = require("../lib/contract");
const { PATIENTS } = require("../lib/patients");
const { supabase } = require("../lib/supabase");

const router = Router();

/**
 * POST /api/settle
 * body: { appointmentId, patientWallet (or dni), scheduledTimestamp, actualTimestamp }
 *
 * appointmentId  → string (ej. "clinic-001-20240320") se convierte a bytes32
 * scheduledTimestamp / actualTimestamp → unix seconds (número o string)
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

    // ── Convertir appointmentId a bytes32 ──────────────────────────────────
    const apptId32 = ethers.id(String(appointmentId)); // keccak256 del string

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
      } catch (_) { }
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

    // ── Persistir en Supabase (best-effort, no bloquea la respuesta) ──────────
    if (supabase) {
      const { data: patient } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", patientWallet)
        .single()
        .catch(() => ({ data: null }));

      supabase.from("appointments").insert({
        appointment_id: appointmentId,
        patient_id: patient?.id ?? null,
        scheduled_time: new Date(Number(scheduled) * 1000).toISOString(),
        actual_time: new Date(Number(actual) * 1000).toISOString(),
        delay_minutes: Number(delayMinutes),
        points_awarded: Number(ethers.formatEther(pointsAwarded)),
        tx_hash: receipt.hash,
      }).then(({ error }) => {
        if (error) console.error("[settle] Supabase insert error:", error.message);
      });
    }

    return res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
