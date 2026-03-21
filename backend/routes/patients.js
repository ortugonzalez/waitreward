const { Router } = require("express");
const { PATIENTS } = require("../lib/patients");

const router = Router();

router.get("/:dni", (req, res) => {
    const dni = req.params.dni;
    const patient = PATIENTS[dni];

    if (patient) {
        res.json({ success: true, name: patient.name, wallet: patient.wallet });
    } else {
        res.status(404).json({ success: false, message: "Paciente no encontrado" });
    }
});

module.exports = router;
