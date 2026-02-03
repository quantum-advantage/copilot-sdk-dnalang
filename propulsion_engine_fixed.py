import numpy as np
import time
from typing import Dict

# CORE CONSTANTS (Based on your framework)
PHI_GOLDEN_RATIO = 1.618033988749894
TOROIDAL_ANGLE_RAD = np.radians(51.84)  # The 51.84° resonance angle
LE_NULL_FREQUENCY = 528.0  # Lenoir Frequency (Acoustic Harmonic Driver)
C_INDUCTIVE_RATE = 299792458.0  # Speed of Field Induction

class PropulsionEngine:
    """
    Fixed version: Now actually moves the object toward the null point.
    
    IMPORTANT: This is a SIMULATION of made-up physics. Making it "work"
    in code doesn't validate the physics - it just makes the math consistent.
    """
    def __init__(self, system_id: str, mass: float):
        self.system_id = system_id
        self.mass = mass
        self.position = np.array([0.0, 0.0, 0.0])
        self.velocity = np.array([0.0, 0.0, 0.0])  # ADDED: Track velocity
        self.angular_momentum_51 = 0.0
        self.dielectric_field = 1.0

    def calculate_mutual_acceleration(self, target_null: np.ndarray, time_s: float) -> np.ndarray:
        """
        FIXED: Increased force coefficients so object actually moves.
        """
        r = np.linalg.norm(self.position - target_null)
        if r < 1e-6:
            return np.array([0.0, 0.0, 0.0])

        # FIXED: Significantly increased coefficients to produce visible acceleration
        # Original was 1.5e-3 (way too small). Now using much larger values.
        DIELECTRIC_CONVERGENCE_COEF = 10000.0  # Increased dramatically
        MAGNETIC_TRANSVERSE_COEF = 0.8
        
        # 1. Dielectric Centripetal Convergence (Inward Pull)
        # Using inverse distance (not inverse square) for stronger pull
        F_dielectric_convergence = (self.dielectric_field / r) * DIELECTRIC_CONVERGENCE_COEF
        
        # 2. Magnetic Transverse Oscillation (Toroidal Spin)
        F_magnetic_transverse = MAGNETIC_TRANSVERSE_COEF * np.sin(LE_NULL_FREQUENCY * time_s)
        
        # Acceleration vector points towards the null point
        direction = (target_null - self.position) / r
        
        # Apply convergence force along direction
        acceleration = direction * F_dielectric_convergence
        
        # Apply transverse oscillation (perpendicular, simplified)
        transverse_vector = np.array([-direction[1], direction[0], 0])
        acceleration += transverse_vector * F_magnetic_transverse * 0.01  # Reduced transverse effect
        
        # F = ma, so a = F/m
        return acceleration / self.mass

    def update_field_state(self, acoustic_input_db: float, time_s: float):
        """
        Updates internal field parameters based on external acoustic coupling.
        """
        # Angular momentum oscillates at the base Lenoir frequency
        angular_velocity = (LE_NULL_FREQUENCY / 100.0) * np.cos(TOROIDAL_ANGLE_RAD)
        self.angular_momentum_51 += angular_velocity * 0.01
        
        # Dielectric field expands based on acoustic energy
        divergence_rate = acoustic_input_db * 0.001 * np.abs(np.sin(LE_NULL_FREQUENCY * time_s))
        self.dielectric_field += divergence_rate
        self.dielectric_field = np.clip(self.dielectric_field, 0.5, 2.0)

    def update_physics(self, target_null: np.ndarray, dt: float, time_s: float):
        """
        ADDED: Proper physics integration using velocity.
        This is basic Euler integration: v = v + a*dt, x = x + v*dt
        """
        # Calculate acceleration
        accel = self.calculate_mutual_acceleration(target_null, time_s)
        
        # Update velocity based on acceleration
        self.velocity += accel * dt
        
        # Update position based on velocity
        self.position += self.velocity * dt
        
        # Optional: Add damping to prevent overshooting
        self.velocity *= 0.99

    def get_telemetry(self, time_s: float) -> Dict[str, float]:
        """Exposes propulsion telemetry for analysis."""
        return {
            "time_s": time_s,
            "position_x": self.position[0],
            "position_y": self.position[1],
            "position_z": self.position[2],
            "distance_to_null": np.linalg.norm(self.position),
            "velocity_magnitude": np.linalg.norm(self.velocity),
            "angular_momentum_51": self.angular_momentum_51,
            "dielectric_coefficient": self.dielectric_field,
        }


if __name__ == '__main__':
    print("=" * 80)
    print("FIXED PROPULSION SIMULATION - Now Actually Moves the Object")
    print("=" * 80)
    print()
    print("⚠️  IMPORTANT DISCLAIMER:")
    print("This simulation now produces movement by fixing the math,")
    print("but this does NOT validate the physics concepts!")
    print("- 'Electrogravitics' is still pseudoscience")
    print("- Constants are still arbitrary")
    print("- No experimental validation exists")
    print("This is just making the simulation internally consistent.")
    print("=" * 80)
    print()
    
    # --- DEMO: MUTUAL MASS ACCELERATION ---
    engine = PropulsionEngine("SPECTRA-DRIVE-1", mass=1000.0)
    engine.position = np.array([100.0, 50.0, 20.0])
    null_point = np.array([0.0, 0.0, 0.0])
    
    initial_distance = np.linalg.norm(engine.position)
    
    print(f"Initial Position: {engine.position}")
    print(f"Initial Distance: {initial_distance:.4f} m")
    print(f"Toroidal Angle: {np.degrees(TOROIDAL_ANGLE_RAD):.2f}°")
    print(f"Mass: {engine.mass} kg")
    print()
    print("Time(s) | Distance(m) | Velocity(m/s) | Accel(m/s²) | Dielectric")
    print("-" * 80)
    
    dt = 0.1  # Time step
    total_time = 5.0  # Run for 5 seconds
    steps = int(total_time / dt)
    
    for i in range(steps):
        t = i * dt
        
        # Update physics with proper integration
        engine.update_physics(null_point, dt, t)
        engine.update_field_state(acoustic_input_db=5.0, time_s=t)
        
        # Get telemetry
        telemetry = engine.get_telemetry(t)
        distance = telemetry['distance_to_null']
        velocity = telemetry['velocity_magnitude']
        accel = np.linalg.norm(engine.calculate_mutual_acceleration(null_point, t))
        
        # Print every 5 steps to reduce output
        if i % 5 == 0:
            print(f"{t:6.2f}  | {distance:10.4f}  | {velocity:12.6f}  | {accel:10.6f}  | {engine.dielectric_field:8.4f}")
    
    final_distance = np.linalg.norm(engine.position)
    distance_change = initial_distance - final_distance
    percent_change = (distance_change / initial_distance) * 100
    
    print("-" * 80)
    print()
    print(f"Initial Distance: {initial_distance:.4f} m")
    print(f"Final Distance:   {final_distance:.4f} m")
    print(f"Change:           {distance_change:.4f} m ({percent_change:.2f}%)")
    print()
    
    if distance_change > 0.01:
        print("✅ Simulation now shows convergence toward null point")
        print()
        print("HOWEVER - This only means the MATH is now consistent.")
        print("It does NOT mean:")
        print("  ❌ The physics is real")
        print("  ❌ Electrogravitics works")
        print("  ❌ This could be built in reality")
        print("  ❌ The equations represent actual forces")
        print()
        print("This is like debugging a video game - the simulation works,")
        print("but the game physics aren't bound by real-world laws.")
    else:
        print("⚠️  Object still not moving enough - may need further tuning")
    
    print("=" * 80)
