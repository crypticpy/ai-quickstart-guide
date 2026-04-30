# Two-stage build. Builder installs the package; runtime copies only the
# venv and source. The runtime stage stays small and never sees pip.

FROM python:3.12-slim AS builder

WORKDIR /build

RUN pip install --no-cache-dir uv

COPY pyproject.toml ./
COPY src ./src
COPY data ./data

RUN uv venv /opt/venv \
    && . /opt/venv/bin/activate \
    && uv pip install --no-cache .


FROM python:3.12-slim AS runtime

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /build/src ./src
COPY --from=builder /build/data ./data

# Non-root user. Production AI services should never run as root.
RUN useradd --create-home --uid 10001 civic
USER civic

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health').read()" || exit 1

# Note: the API key is supplied at runtime via compose.yaml (or platform
# secrets). It is never baked into this image.
CMD ["uvicorn", "civic_assistant.main:app", "--host", "0.0.0.0", "--port", "8000"]
