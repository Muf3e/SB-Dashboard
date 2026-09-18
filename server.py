#!/usr/bin/env python3
import sys
from pathlib import Path

# Set up root and module paths dynamically
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "dashboard"))
sys.path.insert(0, str(ROOT_DIR / "corporate-governance"))
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from dashboard.server import SBGroupRequestHandler, main

# Vercel serverless function export
handler = SBGroupRequestHandler
app = SBGroupRequestHandler

if __name__ == "__main__":
    main()
