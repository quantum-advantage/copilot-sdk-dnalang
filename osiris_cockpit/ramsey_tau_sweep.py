import numpy as np
from qiskit import QuantumCircuit
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

service = QiskitRuntimeService(channel="ibm_quantum_platform")
backend = service.least_busy(simulator=False, operational=True)
print("[✓] Backend:", backend.name)

taus_us = np.linspace(0.1, 80.0, 25)  # microseconds
results = []

for tau in taus_us:
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.delay(int(tau * backend.dt * 1e6), 0)
    qc.h(0)
    qc.measure(0, 0)

    sampler = Sampler(
        backend,
        options={"transpilation": {"skip_transpilation": True}}
    )

    job = sampler.run([qc], shots=4096)
    dist = job.result().quasi_dists[0]
    p0 = dist.get(0, 0.0)

    results.append((tau, p0))
    print(f"τ={tau:5.2f} µs → P(|0>)={p0:.3f}")

print("[✓] Sweep complete")
