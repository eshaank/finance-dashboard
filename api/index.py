import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app

# Vercel runs ASGI apps via the `app` variable; do not export `handler` (that expects a class).
