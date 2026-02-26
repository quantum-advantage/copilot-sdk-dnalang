"""
Tests for QuantumCrypto — Post-Quantum Cryptography Module.

Tests cover:
  - LWE key generation
  - LWE encrypt/decrypt round-trip
  - Hash-based signatures (sign + verify)
  - HMAC sign/verify
  - Entropy harvesting
  - Bit conversion helpers
"""

import sys
import os
import pytest
import numpy as np

sys.path.insert(0, os.path.join(
    os.path.expanduser("~"),
    "dnalang-sovereign-copilot-sdk/python/src"
))

from copilot_quantum.crypto import (
    QuantumCrypto,
    LWEKeyPair,
    LWECiphertext,
    Signature,
    QuantumEntropy,
    LWE_N,
    LWE_Q,
    LAMBDA_PHI,
    PHI_THRESHOLD,
)

SEED = 51843


# ─── LWE Key Generation ─────────────────────────────────────────────


class TestLWEKeyGeneration:
    def test_generate_keypair(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        assert isinstance(kp, LWEKeyPair)
        A, b = kp.public_key
        assert A.shape == (LWE_N, LWE_N)
        assert b.shape == (LWE_N,)
        assert kp.secret_key.shape == (LWE_N,)

    def test_keypair_has_id(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        assert len(kp.key_id) == 16

    def test_different_seeds_different_keys(self):
        kp1 = QuantumCrypto(seed=1).generate_keypair()
        kp2 = QuantumCrypto(seed=2).generate_keypair()
        assert kp1.key_id != kp2.key_id

    def test_keypair_to_dict(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        d = kp.to_dict()
        assert "key_id" in d
        assert d["n"] == LWE_N
        assert d["q"] == LWE_Q


# ─── LWE Encryption / Decryption ────────────────────────────────────


class TestLWEEncryption:
    def test_encrypt_returns_ciphertexts(self):
        crypto = QuantumCrypto(n=32, q=7681, seed=SEED)
        kp = crypto.generate_keypair()
        cts = crypto.encrypt(b"A", kp.public_key)
        assert isinstance(cts, list)
        assert len(cts) == 8  # 1 byte = 8 bits
        assert all(isinstance(ct, LWECiphertext) for ct in cts)

    def test_encrypt_decrypt_roundtrip(self):
        crypto = QuantumCrypto(n=64, q=7681, sigma=0.5, seed=SEED)
        kp = crypto.generate_keypair()
        plaintext = b"Hi"
        cts = crypto.encrypt(plaintext, kp.public_key)
        recovered = crypto.decrypt(cts, kp.secret_key)
        assert recovered == plaintext

    def test_encrypt_empty(self):
        crypto = QuantumCrypto(n=32, q=7681, seed=SEED)
        kp = crypto.generate_keypair()
        cts = crypto.encrypt(b"", kp.public_key)
        assert len(cts) == 0


# ─── Hash-Based Signatures ──────────────────────────────────────────


class TestSignatures:
    def test_sign_returns_signature(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        sig = crypto.sign(b"hello world", kp)
        assert isinstance(sig, Signature)
        assert len(sig.message_hash) == 64  # SHA-256 hex
        assert len(sig.signature_chain) == 64  # 64 hex chars in hash
        assert sig.key_index == 0

    def test_verify_valid(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        sig = crypto.sign(b"test message", kp)
        assert crypto.verify(b"test message", sig, kp) is True

    def test_verify_invalid_message(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        sig = crypto.sign(b"original", kp)
        assert crypto.verify(b"tampered", sig, kp) is False

    def test_sign_increments_index(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        s1 = crypto.sign(b"msg1", kp)
        s2 = crypto.sign(b"msg2", kp)
        assert s1.key_index == 0
        assert s2.key_index == 1

    def test_signature_to_dict(self):
        crypto = QuantumCrypto(seed=SEED)
        kp = crypto.generate_keypair()
        sig = crypto.sign(b"data", kp)
        d = sig.to_dict()
        assert "message_hash" in d
        assert "chain_length" in d


# ─── HMAC ────────────────────────────────────────────────────────────


class TestHMAC:
    def test_hmac_sign(self):
        crypto = QuantumCrypto(seed=SEED)
        mac = crypto.hmac_sign(b"message", b"secret_key")
        assert isinstance(mac, str)
        assert len(mac) == 64

    def test_hmac_verify_valid(self):
        crypto = QuantumCrypto(seed=SEED)
        key = b"my_secret_key"
        msg = b"important data"
        mac = crypto.hmac_sign(msg, key)
        assert crypto.hmac_verify(msg, key, mac) is True

    def test_hmac_verify_invalid(self):
        crypto = QuantumCrypto(seed=SEED)
        key = b"my_key"
        mac = crypto.hmac_sign(b"original", key)
        assert crypto.hmac_verify(b"tampered", key, mac) is False

    def test_hmac_different_keys(self):
        crypto = QuantumCrypto(seed=SEED)
        mac1 = crypto.hmac_sign(b"msg", b"key1")
        mac2 = crypto.hmac_sign(b"msg", b"key2")
        assert mac1 != mac2


# ─── Entropy Harvesting ─────────────────────────────────────────────


class TestEntropyHarvesting:
    def test_harvest_basic(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy(phi=0.9, gamma=0.1)
        assert isinstance(entropy, QuantumEntropy)
        assert len(entropy.raw_bytes) == 32

    def test_harvest_custom_length(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy(n_bytes=64)
        assert len(entropy.raw_bytes) == 64

    def test_harvest_quality_high(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy(phi=0.9, gamma=0.1)
        assert entropy.quality == 1.0  # Both conditions met

    def test_harvest_quality_low(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy(phi=0.3, gamma=0.5)
        assert entropy.quality == 0.5  # Neither condition met

    def test_harvest_hex(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy()
        assert len(entropy.hex()) == 64  # 32 bytes = 64 hex chars

    def test_entropy_to_dict(self):
        crypto = QuantumCrypto(seed=SEED)
        entropy = crypto.harvest_entropy()
        d = entropy.to_dict()
        assert "hex" in d
        assert "quality" in d
        assert "source" in d


# ─── Bit Conversion ─────────────────────────────────────────────────


class TestBitConversion:
    def test_bytes_to_bits(self):
        bits = QuantumCrypto._bytes_to_bits(b"\xff")
        assert bits == [1, 1, 1, 1, 1, 1, 1, 1]

    def test_bytes_to_bits_zero(self):
        bits = QuantumCrypto._bytes_to_bits(b"\x00")
        assert bits == [0, 0, 0, 0, 0, 0, 0, 0]

    def test_bits_to_bytes(self):
        result = QuantumCrypto._bits_to_bytes([1, 1, 1, 1, 1, 1, 1, 1])
        assert result == b"\xff"

    def test_roundtrip(self):
        original = b"test"
        bits = QuantumCrypto._bytes_to_bits(original)
        recovered = QuantumCrypto._bits_to_bytes(bits)
        assert recovered == original


# ─── Repr ────────────────────────────────────────────────────────────


class TestCryptoRepr:
    def test_repr(self):
        crypto = QuantumCrypto(seed=SEED)
        assert "QuantumCrypto" in repr(crypto)
        assert "256" in repr(crypto)
