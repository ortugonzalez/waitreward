# WaitReward — Módulo de IA

Servidor Flask que analiza y predice demoras en consultas médicas.
Corre en `http://localhost:5000` y es consumido por el backend Node.js.

## Requisitos

- Python 3.9+

## Instalación y arranque

```bash
cd ai-module
pip install -r requirements.txt
python app.py
# → http://localhost:5000
```

## Endpoints

### GET /health
Verifica que el módulo está activo.

### POST /detect-delay
Calcula la demora real de un turno.
```json
{
  "appointment_time": "2026-03-21T10:00:00",
  "checkin_time":     "2026-03-21T10:45:00",
  "clinic_id":        "clinic-001"
}
```

### GET /predict-delay/:clinicId/:specialist
Predice la demora esperada para un turno futuro.
Query param opcional: `day_of_week` (0=lunes, 6=domingo).

### GET /clinic-metrics/:clinicId
Retorna métricas históricas de demora de una clínica.

### POST /pattern-analysis
Analiza estadísticamente un historial de demoras.
```json
{ "delays": [10, 25, 45, 60, 12, 30] }
```
