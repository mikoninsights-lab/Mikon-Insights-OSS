"""Backend tests for Mikon OSS Ghostwriter feature (Block 6)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://metrics-core-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@mikon.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def auth_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("token") or data.get("data", {}).get("token")
    assert token, f"No token in response: {data}"
    return token


@pytest.fixture(scope="module")
def headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


# --- Health & auth basics ---
def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_ghostwriter_requires_auth():
    r = requests.post(f"{API}/ghostwriter/generate", json={}, timeout=10)
    assert r.status_code in (401, 403), f"Expected 401/403 unauth, got {r.status_code}"


def test_ghostwriter_validation_missing_fields(headers):
    r = requests.post(f"{API}/ghostwriter/generate", headers=headers, json={"contentType": "linkedin"}, timeout=10)
    assert r.status_code == 400
    body = r.json()
    assert body.get("success") is False
    assert "Faltan" in body.get("message", "") or "requeridos" in body.get("message", "")


# --- Real Gemini calls (slow, may flake on 503) ---
def _generate(headers, model):
    payload = {
        "contentType": "linkedin",
        "service": "Dashboards de BI",
        "audience": "CFOs de PyMEs",
        "model": model,
        "context": "Caso de éxito: una PyME industrial redujo un 23% su coste de inventario tras desplegar un dashboard de BI predictivo en 6 semanas.",
    }
    return requests.post(f"{API}/ghostwriter/generate", headers=headers, json=payload, timeout=120)


def test_ghostwriter_generate_flash(headers):
    r = _generate(headers, "flash")
    assert r.status_code in (200, 503), f"Unexpected status: {r.status_code} {r.text[:300]}"
    if r.status_code == 503:
        pytest.skip(f"Gemini overloaded: {r.text[:200]}")
    body = r.json()
    assert body.get("success") is True
    assert isinstance(body.get("content"), str) and len(body["content"]) > 50
    assert body.get("model")
    assert isinstance(body.get("elapsedMs"), int)


def test_ghostwriter_generate_pro(headers):
    time.sleep(3)  # rate limit safety
    r = _generate(headers, "pro")
    assert r.status_code in (200, 503), f"Unexpected status: {r.status_code} {r.text[:300]}"
    if r.status_code == 503:
        pytest.skip(f"Gemini overloaded: {r.text[:200]}")
    body = r.json()
    assert body.get("success") is True
    assert isinstance(body.get("content"), str) and len(body["content"]) > 50
    assert body.get("model")
