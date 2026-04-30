"""Lab 4.1 starter: provider-neutral LLM API wrapper.

The tests drive the TODOs. This module intentionally avoids importing provider
SDKs. A real app would adapt `build_request` to the approved SDK or HTTP API.
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Callable


class TransientProviderError(RuntimeError):
    """Provider-side error that may succeed if retried."""


@dataclass(frozen=True)
class ModelConfig:
    """Runtime configuration for one model endpoint."""

    provider: str
    model_id: str
    api_key_env: str
    endpoint: str | None = None


@dataclass(frozen=True)
class LLMRequest:
    """Normalized request passed to a provider transport."""

    system: str
    user: str
    max_tokens: int = 512
    temperature: float = 0.0


@dataclass(frozen=True)
class LLMResponse:
    """Normalized response returned by the wrapper."""

    text: str
    input_tokens: int
    output_tokens: int
    model_id: str
    provider: str


Transport = Callable[[dict, str], LLMResponse]


def load_config(provider: str = "anthropic") -> ModelConfig:
    """TODO: return a ModelConfig for the requested provider.

    Requirements:
    - Support "anthropic", "openai", and "azure-openai".
    - Read model IDs from provider-specific env vars first, then `LLM_MODEL_ID`.
    - For Azure OpenAI, use `AZURE_OPENAI_DEPLOYMENT` as the model/deployment ID.
    - Use these secret env var names: ANTHROPIC_API_KEY, OPENAI_API_KEY,
      AZURE_OPENAI_API_KEY.
    - For Azure OpenAI, also capture AZURE_OPENAI_ENDPOINT.
    - Raise ValueError for unknown providers.
    """
    raise NotImplementedError("Implement load_config")


def require_api_key(config: ModelConfig) -> str:
    """TODO: read the configured API key from the environment.

    Raise RuntimeError if the key is missing. Do not print or log the key.
    """
    raise NotImplementedError("Implement require_api_key")


def estimate_tokens(text: str) -> int:
    """TODO: return a rough token estimate for plain English text.

    A common classroom approximation is 1 token per 4 characters. Always return
    at least 1 for non-empty text and 0 for empty text.
    """
    raise NotImplementedError("Implement estimate_tokens")


def estimate_cost_usd(
    input_tokens: int,
    output_tokens: int,
    *,
    input_per_million: float,
    output_per_million: float,
) -> float:
    """TODO: estimate request cost from token counts and per-million prices."""
    raise NotImplementedError("Implement estimate_cost_usd")


def build_request(config: ModelConfig, request: LLMRequest) -> dict:
    """TODO: build a provider-neutral request payload.

    Include provider, model, system, user, max_tokens, and temperature. Include
    endpoint only when config.endpoint is set.
    """
    raise NotImplementedError("Implement build_request")


def safe_log_record(config: ModelConfig, request: LLMRequest, response: LLMResponse) -> dict:
    """TODO: return a log-safe summary.

    The record must include provider, model_id, input_tokens, output_tokens, and
    total_tokens. It must not include API keys, raw prompt text, or raw output.
    """
    raise NotImplementedError("Implement safe_log_record")


def complete_with_retry(
    config: ModelConfig,
    request: LLMRequest,
    transport: Transport,
    *,
    max_attempts: int = 3,
    sleep: Callable[[float], None] = time.sleep,
) -> LLMResponse:
    """TODO: call transport with retry for transient provider errors.

    Requirements:
    - Call `require_api_key(config)` before the first transport call.
    - Pass the built payload and API key to `transport`.
    - Retry only `TransientProviderError`.
    - Sleep with exponential backoff: 0.2, 0.4, ...
    - Raise the final error after max_attempts.
    """
    raise NotImplementedError("Implement complete_with_retry")


def fake_echo_transport(payload: dict, api_key: str) -> LLMResponse:
    """Offline demo transport used by instructors and tests."""
    if not api_key:
        raise RuntimeError("missing api key")
    text = f"Echo from {payload['model']}: {payload['user']}"
    return LLMResponse(
        text=text,
        input_tokens=estimate_tokens(payload["system"] + payload["user"]),
        output_tokens=estimate_tokens(text),
        model_id=payload["model"],
        provider=payload["provider"],
    )
