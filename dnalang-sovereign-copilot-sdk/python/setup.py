# Dnalang Sovereign Copilot SDK - Python Package Setup

from setuptools import setup, find_packages

with open("../README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="dnalang-sovereign-copilot-sdk",
    version="1.0.0",
    author="Devin Davis",
    author_email="devin@agiledefense.systems",
    description="Token-free quantum-enhanced AI SDK with complete sovereignty",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/dnalang/sovereign-copilot-sdk",
    project_urls={
        "Bug Tracker": "https://github.com/dnalang/sovereign-copilot-sdk/issues",
        "Documentation": "https://dnalang.quantum.dev/docs",
        "Source Code": "https://github.com/dnalang/sovereign-copilot-sdk",
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Scientific/Engineering :: Physics",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    python_requires=">=3.11",
    install_requires=[
        "qiskit>=2.3.0",
        "qiskit-ibm-runtime>=0.45.0",
        "numpy>=2.4.0",
        "scipy>=1.17.0",
        "asyncio>=3.4.3",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
        ],
        "full": [
            "matplotlib>=3.10.0",
            "pandas>=3.0.0",
            "jupyter>=1.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "dnalang-agent=copilot_quantum.agent:quick_test",
        ],
    },
    keywords=[
        "quantum computing",
        "ai agent",
        "copilot",
        "sovereign",
        "token-free",
        "aeterna porta",
        "lambda phi",
        "dnalang"
    ],
)
