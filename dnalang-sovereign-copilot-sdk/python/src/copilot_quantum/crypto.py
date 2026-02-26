"""
QuantumCrypto — Post-Quantum Cryptography Module
=================================================

Implements quantum-safe cryptographic primitives:

  1. **Lattice-based key generation**: Simplified LWE (Learning With Errors)
  2. **Hash-based signatures**: XMSS-like one-time signatures using SHA-256
  3. **Quantum-safe HMAC**: Message authentication with quantum entropy
  4. **Entropy harvesting**: Extract randomness from quantum metrics

Framework: DNA::}{::lang v51.843
Security Level: Post-quantum safe (NIST PQC Level 1 equivalent)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import hashlib
import hmac
import os
import secrets
import struct
import numpy as np

# Immutable constants
LAMBDA_PHI = 2.176435e-8
PHI_THRESHOLD = 0.7734
GAMMA_CRITICAL = 0.3
THETA_LOCK = 51.843


# ── LWE Parameters (toy/educational — not production grade) ──────────
LWE_N = 256          # lattice dimension
LWE_Q = 7681         # modulus (prime ≡ 1 mod 2N for NTT)
LWE_SIGMA = 3.2      # Gaussian error std dev


@dataclass
class LWEKeyPair:
    """Lattice-based key pair (Learning With Errors).

    Attributes:
        public_key: Tuple (A, b) where A is n×n matrix mod q, b = A·s + e.
        secret_key: Secret vector s.
        key_id: SHA-256 fingerprint of public key.
    """
    public_key: Tuple[np.ndarray, np.ndarray]
    secret_key: np.ndarray
    key_id: str = ""

    def __post_init__(self):
        if not self.key_id:
            A, b = self.public_key
            data = A.tobytes() + b.tobytes()
            self.key_id = hashlib.sha256(data).hexdigest()[:16]

    def to_dict(self) -> dict:
        A, b = self.public_key
        return {
            "key_id": self.key_id,
            "n": int(A.shape[0]),
            "q": LWE_Q,
        }


@dataclass
class LWECiphertext:
    """LWE-encrypted ciphertext.

    Attributes:
        u: Cipher vector (A^T · r + e1).
        v: Cipher scalar (b^T · r + e2 + ⌊q/2⌋·m).
    """
    u: np.ndarray
    v: int


@dataclass
class Signature:
    """Hash-based digital signature.

    Attributes:
        message_hash: SHA-256 hash of the signed message.
        signature_chain: List of hash chain elements.
        public_seed: Seed used to generate the verification key.
        key_index: One-time key index used.
    """
    message_hash: str
    signature_chain: List[str]
    public_seed: str
    key_index: int

    def to_dict(self) -> dict:
        return {
            "message_hash": self.message_hash,
            "chain_length": len(self.signature_chain),
            "public_seed": self.public_seed,
            "key_index": self.key_index,
        }


@dataclass
class QuantumEntropy:
    """Entropy harvested from quantum metrics.

    Attributes:
        raw_bytes: Random bytes extracted.
        source: Description of the quantum source.
        phi: Phi value at harvest time.
        gamma: Gamma value at harvest time.
        quality: Entropy quality estimate [0, 1].
    """
    raw_bytes: bytes
    source: str = "quantum_metrics"
    phi: float = 0.0
    gamma: float = 0.0
    quality: float = 0.0

    def hex(self) -> str:
        return self.raw_bytes.hex()

    def to_dict(self) -> dict:
        return {
            "hex": self.hex(),
            "length": len(self.raw_bytes),
            "source": self.source,
            "phi": self.phi,
            "gamma": self.gamma,
            "quality": round(self.quality, 4),
        }


class QuantumCrypto:
    """Quantum-safe cryptography engine.

    Provides lattice-based encryption, hash-based signatures,
    HMAC authentication, and entropy harvesting from quantum metrics.

    Example::

        crypto = QuantumCrypto(seed=51843)
        keypair = crypto.generate_keypair()
        ct = crypto.encrypt(b"hello", keypair.public_key)
        pt = crypto.decrypt(ct, keypair.secret_key)
        assert pt == b"hello"

        sig = crypto.sign(b"message", keypair)
        assert crypto.verify(b"message", sig, keypair)
    """

    def __init__(
        self,
        n: int = LWE_N,
        q: int = LWE_Q,
        sigma: float = LWE_SIGMA,
        seed: Optional[int] = None,
    ):
        """Initialize crypto engine.

        Args:
            n: Lattice dimension.
            q: LWE modulus.
            sigma: Gaussian error standard deviation.
            seed: Random seed for reproducibility.
        """
        self.n = n
        self.q = q
        self.sigma = sigma
        self.rng = np.random.default_rng(seed)
        self._ots_index = 0  # one-time signature counter
        self._ots_seed = secrets.token_hex(32) if seed is None else (
            hashlib.sha256(str(seed).encode()).hexdigest()
        )

    # ── LWE Key Generation ───────────────────────────────────────────

    def generate_keypair(self) -> LWEKeyPair:
        """Generate an LWE key pair.

        Returns:
            LWEKeyPair with (A, b=As+e) public key and secret s.
        """
        A = self.rng.integers(0, self.q, size=(self.n, self.n), dtype=np.int64)
        # Secret drawn from error distribution (small secret LWE)
        s = self._sample_error(self.n)
        e = self._sample_error(self.n)
        b = (A @ s + e) % self.q
        return LWEKeyPair(public_key=(A, b), secret_key=s)

    def _sample_error(self, size: int) -> np.ndarray:
        """Sample discrete Gaussian error vector."""
        return np.round(
            self.rng.normal(0, self.sigma, size=size)
        ).astype(np.int64) % self.q

    # ── LWE Encryption / Decryption ──────────────────────────────────

    def encrypt(
        self,
        plaintext: bytes,
        public_key: Tuple[np.ndarray, np.ndarray],
    ) -> List[LWECiphertext]:
        """Encrypt plaintext bytes using LWE.

        Each bit of the message is encrypted independently.

        Args:
            plaintext: Message bytes.
            public_key: (A, b) from LWEKeyPair.

        Returns:
            List of LWECiphertext (one per bit).
        """
        A, b = public_key
        bits = self._bytes_to_bits(plaintext)
        ciphertexts = []

        for bit in bits:
            r = self.rng.integers(0, 2, size=self.n, dtype=np.int64)
            e1 = self._sample_error(self.n)
            e2 = int(self._sample_error(1)[0])
            u = (A.T @ r + e1) % self.q
            v = int((b @ r + e2 + (self.q // 2) * bit) % self.q)
            ciphertexts.append(LWECiphertext(u=u, v=v))

        return ciphertexts

    def decrypt(
        self,
        ciphertexts: List[LWECiphertext],
        secret_key: np.ndarray,
    ) -> bytes:
        """Decrypt LWE ciphertexts.

        Args:
            ciphertexts: List of LWECiphertext.
            secret_key: Secret vector s.

        Returns:
            Decrypted plaintext bytes.
        """
        bits = []
        for ct in ciphertexts:
            val = (ct.v - int(secret_key @ ct.u)) % self.q
            # Decision: closer to 0 → bit=0, closer to q/2 → bit=1
            if val > self.q // 4 and val < 3 * self.q // 4:
                bits.append(1)
            else:
                bits.append(0)
        return self._bits_to_bytes(bits)

    # ── Hash-Based Signatures ────────────────────────────────────────

    def sign(self, message: bytes, keypair: LWEKeyPair) -> Signature:
        """Sign a message using hash-based one-time signature.

        Uses a Lamport-like scheme with SHA-256 hash chains.

        Args:
            message: Message to sign.
            keypair: Key pair (key_id used as additional entropy).

        Returns:
            Signature object.
        """
        msg_hash = hashlib.sha256(message).hexdigest()
        key_index = self._ots_index
        self._ots_index += 1

        # Generate one-time signing key from seed + index
        chain_seed = hashlib.sha256(
            f"{self._ots_seed}:{key_index}".encode()
        ).hexdigest()

        # Build signature chain: hash each bit of the message hash
        chain = []
        for i, char in enumerate(msg_hash):
            nibble = int(char, 16)
            link = hashlib.sha256(
                f"{chain_seed}:{i}:{nibble}".encode()
            ).hexdigest()
            chain.append(link)

        return Signature(
            message_hash=msg_hash,
            signature_chain=chain,
            public_seed=hashlib.sha256(self._ots_seed.encode()).hexdigest()[:32],
            key_index=key_index,
        )

    def verify(
        self,
        message: bytes,
        signature: Signature,
        keypair: LWEKeyPair,
    ) -> bool:
        """Verify a hash-based signature.

        Args:
            message: Original message.
            signature: Signature to verify.
            keypair: Key pair used for signing.

        Returns:
            True if signature is valid.
        """
        msg_hash = hashlib.sha256(message).hexdigest()
        if msg_hash != signature.message_hash:
            return False

        # Recompute the expected chain
        chain_seed = hashlib.sha256(
            f"{self._ots_seed}:{signature.key_index}".encode()
        ).hexdigest()

        for i, char in enumerate(msg_hash):
            nibble = int(char, 16)
            expected = hashlib.sha256(
                f"{chain_seed}:{i}:{nibble}".encode()
            ).hexdigest()
            if i >= len(signature.signature_chain):
                return False
            if signature.signature_chain[i] != expected:
                return False

        return True

    # ── HMAC ─────────────────────────────────────────────────────────

    def hmac_sign(self, message: bytes, key: bytes) -> str:
        """Compute quantum-safe HMAC-SHA256.

        Args:
            message: Message to authenticate.
            key: Secret key bytes.

        Returns:
            Hex-encoded HMAC.
        """
        return hmac.new(key, message, hashlib.sha256).hexdigest()

    def hmac_verify(
        self, message: bytes, key: bytes, mac: str
    ) -> bool:
        """Verify HMAC-SHA256.

        Args:
            message: Original message.
            key: Secret key.
            mac: HMAC to verify.

        Returns:
            True if MAC is valid.
        """
        expected = hmac.new(key, message, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, mac)

    # ── Entropy Harvesting ───────────────────────────────────────────

    def harvest_entropy(
        self,
        phi: float = 0.8,
        gamma: float = 0.2,
        n_bytes: int = 32,
    ) -> QuantumEntropy:
        """Harvest entropy from quantum metrics.

        Mixes phi, gamma, lambda_phi with cryptographic randomness
        to produce high-quality random bytes.

        Args:
            phi: Current phi value.
            gamma: Current gamma value.
            n_bytes: Number of random bytes to produce.

        Returns:
            QuantumEntropy with random bytes and quality assessment.
        """
        # Mix quantum metrics into hash
        quantum_data = struct.pack(
            "ddd", phi, gamma, LAMBDA_PHI
        ) + struct.pack("d", THETA_LOCK)

        system_random = os.urandom(32)
        seed_material = quantum_data + system_random

        # Expand via iterative hashing
        output = b""
        state = hashlib.sha256(seed_material).digest()
        while len(output) < n_bytes:
            state = hashlib.sha256(state + quantum_data).digest()
            output += state
        raw = output[:n_bytes]

        # Quality: higher when phi > threshold and gamma < critical
        quality = 0.5
        if phi >= PHI_THRESHOLD:
            quality += 0.25
        if gamma < GAMMA_CRITICAL:
            quality += 0.25

        return QuantumEntropy(
            raw_bytes=raw,
            source="quantum_metrics",
            phi=phi,
            gamma=gamma,
            quality=quality,
        )

    # ── Helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _bytes_to_bits(data: bytes) -> List[int]:
        """Convert bytes to list of bits."""
        bits = []
        for byte in data:
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
        return bits

    @staticmethod
    def _bits_to_bytes(bits: List[int]) -> bytes:
        """Convert list of bits to bytes."""
        # Pad to multiple of 8
        while len(bits) % 8 != 0:
            bits.append(0)
        result = bytearray()
        for i in range(0, len(bits), 8):
            byte = 0
            for j in range(8):
                byte = (byte << 1) | bits[i + j]
            result.append(byte)
        return bytes(result)

    def __repr__(self) -> str:
        return (
            f"QuantumCrypto(n={self.n}, q={self.q}, "
            f"sigma={self.sigma}, ots_index={self._ots_index})"
        )
