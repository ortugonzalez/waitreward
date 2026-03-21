from flask import Flask, request, jsonify
from delay_detector import detector
from datetime import datetime
import os

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'AI Module running ✅', 'version': '1.0'})

@app.route('/detect-delay', methods=['POST'])
def detect_delay():
    """
    Endpoint to detect delay from check-in data
    
    Expected JSON:
    {
        "appointment_time": "2026-03-20T10:00:00",
        "checkin_time": "2026-03-20T10:18:00",
        "clinic_id": "clinic123"
    }
    """
    try:
        data = request.json
        result = detector.calculate_delay(
            data.get('appointment_time'),
            data.get('checkin_time')
        )
        result['clinic_id'] = data.get('clinic_id', 'unknown')
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict-delay/<clinic_id>/<specialist>', methods=['GET'])
def predict_delay(clinic_id, specialist):
    """
    Predict expected delay for upcoming appointments
    
    Query params:
    - day_of_week: 0-6 (optional, uses today if not provided)
    """
    try:
        from datetime import datetime
        day_of_week = request.args.get('day_of_week', default=datetime.now().weekday())
        day_of_week = int(day_of_week)
        
        predicted = detector.predict_delay_for_appointment(clinic_id, specialist, day_of_week)
        
        return jsonify({
            'clinic_id': clinic_id,
            'specialist': specialist,
            'predicted_delay_minutes': predicted,
            'confidence': 0.78,
            'recommendation': f'Prepare for ~{int(predicted)} minutes wait'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/clinic-metrics/<clinic_id>', methods=['GET'])
def clinic_metrics(clinic_id):
    """Get historical metrics for a clinic"""
    try:
        metrics = detector.get_clinic_metrics(clinic_id)
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/pattern-analysis', methods=['POST'])
def pattern_analysis():
    """
    Analyze delay patterns from historical data
    
    Expected JSON:
    {
        "delays": [10, 15, 20, 18, 25, 12, ...]
    }
    """
    try:
        data = request.json
        delays = data.get('delays', [])
        
        if not delays:
            return jsonify({'error': 'No delays data provided'}), 400
        
        analysis = detector.analyze_pattern(delays)
        return jsonify(analysis), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('AI_PORT', 5000))
    print(f"🤖 AI Module running on http://localhost:{port}")
    app.run(debug=True, port=port)
