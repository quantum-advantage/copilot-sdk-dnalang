from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="dnalang-copilot-sdk",
    version="1.0.0",
    author="DNALang Team",
    author_email="",
    description="Quantum-native SDK extension for GitHub Copilot CLI",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/github/copilot-sdk",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Scientific/Engineering :: Physics",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.10",
    install_requires=[
        "numpy>=1.24.0",
        "scipy>=1.10.0",
    ],
    extras_require={
        "quantum": [
            "qiskit>=1.0.0",
            "qiskit-aer>=0.13.0",
            "qiskit-ibm-runtime>=0.18.0",
        ],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "pylint>=2.17.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "dnalang-sdk=dnalang_sdk.cli:main",
        ],
    },
)
