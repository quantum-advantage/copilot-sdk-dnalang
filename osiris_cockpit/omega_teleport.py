import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

THETA = np.deg2rad(51.843)

print("[Ω] Dynamic teleport — transpilation fully disabled")

service = QiskitRuntimeService(channel="ibm_quantum_platform")
backend = service.least_busy(simulator=False, operational=True)
print(f"[✓] Backend: {backend.name}")

q = QuantumRegister(3)
c = ClassicalRegister(2)
qc = QuantumCircuit(q, c)

qc.ry(THETA, q[0])
qc.h(q[1])
qc.cx(q[1], q[2])

qc.cx(q[0], q[1])
qc.h(q[0])
qc.measure(q[0], c[0])
qc.measure(q[1], c[1])

with qc.if_test((c[1], 1)):
    qc.x(q[2])
with qc.if_test((c[0], 1)):
    qc.z(q[2])

sampler = Sampler(
    backend,
    options={
        "transpilation": {
            "skip_transpilation": True
        }
    }
)

job = sampler.run([qc])
print("[✓] Job submitted:", job.job_id())
print(job.result().quasi_dists[0])
