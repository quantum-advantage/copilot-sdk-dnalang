#!/usr/bin/env python3
"""
NWSI (Noetic Whisper Security Initiative) Consciousness Monitor

Implements 528 Hz acoustic resonance analysis to extract operator consciousness
factor (Φn) as a biometric security marker for quantum system access control.

Based on: Integrated Information Theory (IIT) 3.0 + Acoustic Resonance
"""

import numpy as np
try:
    import sounddevice as sd
    SOUNDDEVICE_AVAILABLE = True
except ImportError:
    print("Warning: sounddevice module not available. Running in simulation mode.")
    SOUNDDEVICE_AVAILABLE = False
    
from scipy import signal
from scipy.fft import fft, fftfreq
try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    print("Warning: websockets module not available. WebSocket streaming disabled.")
    WEBSOCKETS_AVAILABLE = False
    
import asyncio
import json
import time
from dataclasses import dataclass
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ConsciousnessMetrics:
    """Consciousness metrics from acoustic analysis."""
    phi_n: float  # Noetic consciousness factor (0.0-1.0)
    resonance_strength: float  # 528 Hz resonance amplitude
    coherence: float  # Signal coherence measure
    timestamp: float
    
    def to_dict(self):
        return {
            'phi_n': self.phi_n,
            'resonance_strength': self.resonance_strength,
            'coherence': self.coherence,
            'timestamp': self.timestamp
        }


class NWSIConsciousnessMonitor:
    """
    Real-time consciousness monitoring via 528 Hz acoustic resonance.
    
    The 528 Hz frequency (Solfeggio frequency) is analyzed for resonance
    patterns that correlate with operator noetic state.
    """
    
    def __init__(
        self,
        sample_rate: int = 44100,
        target_frequency: float = 528.0,
        buffer_size: int = 4096,
        websocket_url: Optional[str] = None
    ):
        self.sample_rate = sample_rate
        self.target_frequency = target_frequency
        self.buffer_size = buffer_size
        self.websocket_url = websocket_url
        
        # Bandpass filter for 528 Hz ± 10 Hz
        self.sos = signal.butter(
            4, 
            [518, 538], 
            btype='band', 
            fs=sample_rate, 
            output='sos'
        )
        
        # Metrics history
        self.metrics_history = []
        self.max_history = 1000
        
        # Running state
        self.is_monitoring = False
        
        logger.info(f"NWSI Monitor initialized: {sample_rate}Hz, target={target_frequency}Hz")
    
    def analyze_audio_buffer(self, audio_data: np.ndarray) -> ConsciousnessMetrics:
        """
        Analyze audio buffer for consciousness markers.
        
        Args:
            audio_data: Audio samples (mono)
            
        Returns:
            ConsciousnessMetrics with Φn factor
        """
        # Apply bandpass filter
        filtered = signal.sosfilt(self.sos, audio_data)
        
        # Compute FFT
        fft_vals = fft(filtered)
        fft_freq = fftfreq(len(filtered), 1/self.sample_rate)
        
        # Find 528 Hz bin
        target_idx = np.argmin(np.abs(fft_freq - self.target_frequency))
        
        # Resonance strength (normalized amplitude at 528 Hz)
        resonance_strength = np.abs(fft_vals[target_idx]) / len(filtered)
        
        # Coherence (spectral flatness around 528 Hz)
        window = 10  # ±10 bins
        start_idx = max(0, target_idx - window)
        end_idx = min(len(fft_vals), target_idx + window)
        
        spectral_window = np.abs(fft_vals[start_idx:end_idx])
        geometric_mean = np.exp(np.mean(np.log(spectral_window + 1e-10)))
        arithmetic_mean = np.mean(spectral_window)
        coherence = geometric_mean / (arithmetic_mean + 1e-10)
        
        # Calculate Φn (noetic consciousness factor)
        # Φn = f(resonance_strength, coherence, temporal_stability)
        phi_n = self._calculate_phi_n(resonance_strength, coherence)
        
        metrics = ConsciousnessMetrics(
            phi_n=phi_n,
            resonance_strength=float(resonance_strength),
            coherence=float(coherence),
            timestamp=time.time()
        )
        
        # Store in history
        self.metrics_history.append(metrics)
        if len(self.metrics_history) > self.max_history:
            self.metrics_history.pop(0)
        
        return metrics
    
    def _calculate_phi_n(self, resonance: float, coherence: float) -> float:
        """
        Calculate noetic consciousness factor Φn.
        
        Φn combines resonance strength and coherence with temporal stability.
        Range: 0.0 (unconscious) to 1.0 (peak consciousness)
        """
        # Base calculation
        base_phi = 0.6 * resonance + 0.4 * coherence
        
        # Temporal stability bonus
        if len(self.metrics_history) >= 10:
            recent_resonances = [m.resonance_strength for m in self.metrics_history[-10:]]
            stability = 1.0 - np.std(recent_resonances)
            base_phi *= (0.8 + 0.2 * stability)
        
        # Clamp to [0, 1]
        phi_n = np.clip(base_phi, 0.0, 1.0)
        
        return float(phi_n)
    
    def get_average_phi_n(self, window: int = 30) -> float:
        """Get average Φn over recent window."""
        if not self.metrics_history:
            return 0.0
        
        recent = self.metrics_history[-window:]
        return np.mean([m.phi_n for m in recent])
    
    def get_current_metrics(self) -> Optional[ConsciousnessMetrics]:
        """Get most recent metrics."""
        return self.metrics_history[-1] if self.metrics_history else None
    
    async def stream_to_websocket(self, metrics: ConsciousnessMetrics):
        """Stream metrics to WebSocket endpoint."""
        if not self.websocket_url or not WEBSOCKETS_AVAILABLE:
            return
        
        try:
            async with websockets.connect(self.websocket_url) as websocket:
                await websocket.send(json.dumps({
                    'type': 'nwsi_metrics',
                    'data': metrics.to_dict()
                }))
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
    
    def audio_callback(self, indata, frames, time_info, status):
        """Callback for audio stream."""
        if status:
            logger.warning(f"Audio status: {status}")
        
        # Convert to mono if stereo
        if indata.shape[1] > 1:
            audio_mono = np.mean(indata, axis=1)
        else:
            audio_mono = indata[:, 0]
        
        # Analyze
        metrics = self.analyze_audio_buffer(audio_mono)
        
        # Log
        logger.info(
            f"Φn={metrics.phi_n:.3f} | "
            f"Resonance={metrics.resonance_strength:.4f} | "
            f"Coherence={metrics.coherence:.3f}"
        )
        
        # Stream to WebSocket (non-blocking)
        if self.websocket_url and WEBSOCKETS_AVAILABLE:
            asyncio.create_task(self.stream_to_websocket(metrics))
    
    def start_monitoring(self, duration: Optional[float] = None):
        """
        Start real-time consciousness monitoring.
        
        Args:
            duration: Optional duration in seconds (None = infinite)
        """
        if not SOUNDDEVICE_AVAILABLE:
            logger.error("Cannot start monitoring: sounddevice module not available")
            logger.info("Install sounddevice: pip install sounddevice")
            return
            
        self.is_monitoring = True
        
        logger.info("Starting NWSI consciousness monitoring...")
        logger.info("Listening for 528 Hz resonance patterns...")
        
        try:
            with sd.InputStream(
                samplerate=self.sample_rate,
                channels=1,
                blocksize=self.buffer_size,
                callback=self.audio_callback
            ):
                if duration:
                    sd.sleep(int(duration * 1000))
                else:
                    # Run indefinitely
                    while self.is_monitoring:
                        sd.sleep(1000)
        except KeyboardInterrupt:
            logger.info("Monitoring stopped by user")
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
        finally:
            self.is_monitoring = False
    
    def stop_monitoring(self):
        """Stop monitoring."""
        self.is_monitoring = False
        logger.info("Stopping NWSI consciousness monitoring...")
    
    def generate_report(self) -> dict:
        """Generate consciousness monitoring report."""
        if not self.metrics_history:
            return {'error': 'No data collected'}
        
        phi_values = [m.phi_n for m in self.metrics_history]
        resonances = [m.resonance_strength for m in self.metrics_history]
        coherences = [m.coherence for m in self.metrics_history]
        
        return {
            'total_samples': len(self.metrics_history),
            'duration_seconds': self.metrics_history[-1].timestamp - self.metrics_history[0].timestamp,
            'phi_n': {
                'mean': float(np.mean(phi_values)),
                'std': float(np.std(phi_values)),
                'min': float(np.min(phi_values)),
                'max': float(np.max(phi_values)),
                'current': float(phi_values[-1])
            },
            'resonance': {
                'mean': float(np.mean(resonances)),
                'std': float(np.std(resonances))
            },
            'coherence': {
                'mean': float(np.mean(coherences)),
                'std': float(np.std(coherences))
            },
            'consciousness_state': self._classify_consciousness_state(phi_values[-1])
        }
    
    def _classify_consciousness_state(self, phi_n: float) -> str:
        """Classify consciousness state based on Φn."""
        if phi_n >= 0.8:
            return "PEAK_CONSCIOUSNESS"
        elif phi_n >= 0.6:
            return "HIGH_CONSCIOUSNESS"
        elif phi_n >= 0.4:
            return "MODERATE_CONSCIOUSNESS"
        elif phi_n >= 0.2:
            return "LOW_CONSCIOUSNESS"
        else:
            return "MINIMAL_CONSCIOUSNESS"


def main():
    """Main entry point for NWSI monitor."""
    import argparse
    
    parser = argparse.ArgumentParser(description='NWSI Consciousness Monitor')
    parser.add_argument('--sample-rate', type=int, default=44100, help='Audio sample rate')
    parser.add_argument('--target-freq', type=float, default=528.0, help='Target frequency (Hz)')
    parser.add_argument('--duration', type=float, help='Monitoring duration (seconds)')
    parser.add_argument('--websocket-url', type=str, help='WebSocket URL for streaming')
    
    args = parser.parse_args()
    
    # Initialize monitor
    monitor = NWSIConsciousnessMonitor(
        sample_rate=args.sample_rate,
        target_frequency=args.target_freq,
        websocket_url=args.websocket_url
    )
    
    # Start monitoring
    try:
        monitor.start_monitoring(duration=args.duration)
    finally:
        # Generate report
        report = monitor.generate_report()
        print("\n" + "="*60)
        print("NWSI CONSCIOUSNESS MONITORING REPORT")
        print("="*60)
        print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
