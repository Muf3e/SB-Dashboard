#!/usr/bin/env python3
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parent
ROOT_DIR = API_DIR.parent

sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "dashboard"))
sys.path.insert(0, str(ROOT_DIR / "corporate-governance"))
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from server import app, handler, application
