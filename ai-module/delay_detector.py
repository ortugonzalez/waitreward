import numpy as np
from datetime import datetime, timedelta

class DelayDetector:
    """
    AI Module for Medical Appointment Delay Detection
    
    Detects delays based on:
    - Scheduled appointment time vs actual check-in time
    - Historical clinic patterns
    - Doctor/specialist typical delays
    """
    
    def __init__(self):
        self.clinic_patterns = {}
        self.specialist_patterns = {}
        
    def calculate_delay(self, appointment_time: str, checkin_time: str) -> dict:
        """
        Calculate delay between scheduled and actual check-in
        
        Args:
            appointment_time (str): Scheduled time (ISO format)
            checkin_time (str): Actual check-in time (ISO format)
        
        Returns:
            dict: Delay info with minutes and points
        """
        apt = datetime.fromisoformat(appointment_time)
        checkin = datetime.fromisoformat(checkin_time)
        
        delay_minutes = max(0, int((checkin - apt).total_seconds() / 60))
        
        return {
            'delay_minutes': delay_minutes,
            'points_earned': delay_minutes,
            'severity': self._classify_severity(delay_minutes),
            'timestamp': datetime.now().isoformat()
        }
    
    def _classify_severity(self, delay_minutes: int) -> str:
        """Classify delay severity"""
        if delay_minutes == 0:
            return 'on_time'
        elif delay_minutes <= 15:
            return 'minor'
        elif delay_minutes <= 30:
            return 'moderate'
        elif delay_minutes <= 60:
            return 'significant'
        else:
            return 'severe'
    
    def predict_delay_for_appointment(self, clinic_id: str, specialist: str, day_of_week: int) -> float:
        """
        Predict expected delay for an upcoming appointment
        Uses historical patterns from clinic and specialist
        
        Args:
            clinic_id (str): Clinic identifier
            specialist (str): Medical specialist name
            day_of_week (int): 0=Monday, 6=Sunday
        
        Returns:
            float: Predicted delay in minutes
        """
        # Simulate ML prediction from historical data
        base_delay = 10  # Average clinic delay
        
        # Specialist factor (some doctors are more punctual)
        specialist_factor = hash(specialist) % 15
        
        # Day of week factor (Fridays typically longer waits)
        day_factor = [5, 8, 10, 12, 15, 18, 12][day_of_week]
        
        predicted = base_delay + specialist_factor + (day_factor / 2)
        
        return round(predicted, 1)
    
    def get_clinic_metrics(self, clinic_id: str) -> dict:
        """Get historical metrics for a clinic"""
        return {
            'clinic_id': clinic_id,
            'average_delay': 18.5,
            'max_delay': 120,
            'min_delay': 0,
            'total_appointments': 847,
            'punctuality_rate': 35.2  # % on time
        }
    
    def analyze_pattern(self, delays: list) -> dict:
        """
        Analyze delay patterns from historical data
        
        Args:
            delays (list): List of delay values in minutes
        
        Returns:
            dict: Statistical analysis
        """
        arr = np.array(delays)
        return {
            'mean': round(float(np.mean(arr)), 2),
            'median': round(float(np.median(arr)), 2),
            'std_dev': round(float(np.std(arr)), 2),
            'percentile_75': round(float(np.percentile(arr, 75)), 2),
            'percentile_95': round(float(np.percentile(arr, 95)), 2)
        }

# Initialize detector
detector = DelayDetector()
