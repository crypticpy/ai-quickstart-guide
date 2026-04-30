"""Lab 4.1 solution: provider-neutral LLM API wrapper."""

from __future__ import annotations

import math
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
    """Return a ModelConfig for a supported provider.

    Model IDs are provider slugs used in API calls. They change over time, so
    production code should set them from configuration after checking current
    provider docs and the agency approved-tools list.
    """
    provider = provider.lower()
    generic_model = os.environ.get("LLM_MODEL_ID")

    if provider == "anthropic":
        return ModelConfig(
            provider=provider,
            model_id=os.environ.get("ANTHROPIC_MODEL_ID") or generic_model or "example-model-id",
            api_key_env="ANTHROPIC_API_KEY",
        )
    if provider == "openai":
        return ModelConfig(
            provider=provider,
            model_id=os.environ.get("OPENAI_MODEL_ID") or generic_model or "example-model-id",
            api_key_env="OPENAI_API_KEY",
        )
    if provider == "azure-openai":
        return ModelConfig(
            provider=provider,
            model_id=os.environ.get("AZURE_OPENAI_DEPLOYMENT") or generic_model or "example-deployment-name",
            api_key_env="AZURE_OPENAI_API_KEY",
            endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        )

    raise ValueError(f"Unknown provider: {provider}")


def require_api_key(config: ModelConfig) -> str:
    """Read the configured API key from the environment."""
    api_key = os.environ.get(config.api_key_env)
    if not api_key:
        raise RuntimeError(f"{config.api_key_env} is not set in the environment.")
    return api_key


def estimate_tokens(text: str) -> int:
    """Return a rough token estimate for plain English text."""
    if not text:
        return 0
    return max(1, math.ceil(len(text) / 4))


def estimate_cost_usd(
    input_tokens: int,
    output_tokens: int,
    *,
    input_per_million: float,
    output_per_million: float,
) -> float:
    """Estimate request cost from token counts and per-million prices."""
    return (input_tokens / 1_000_000 * input_per_million) + (
        output_tokens / 1_000_000 * output_per_million
    )


def build_request(config: ModelConfig, request: LLMRequest) -> dict:
    """Build a provider-neutral request payload."""
    payload = {
        "provider": config.provider,
        "model": config.model_id,
        "system": request.system,
        "user": request.user,
        "max_tokens": request.max_tokens,
        "temperature": request.temperature,
    }
    if config.endpoint:
        payload["endpoint"] = config.endpoint
    return payload


def safe_log_record(config: ModelConfig, request: LLMRequest, response: LLMResponse) -> dict:
    """Return a log-safe summary without secrets, prompts, or raw output."""
    del request
    return {
        "provider": config.provider,
        "model_id": config.model_id,
        "input_tokens": response.input_tokens,
        "output_tokens": response.output_tokens,
        "total_tokens": response.input_tokens + response.output_tokens,
    }


def complete_with_retry(
    config: ModelConfig,
    request: LLMRequest,
    transport: Transport,
    *,
    max_attempts: int = 3,
    sleep: Callable[[float], None] = time.sleep,
) -> LLMResponse:
    """Call transport with retry for transient provider errors."""
    api_key = require_api_key(config)
    payload = build_request(config, request)
    attempt = 0

    while True:
        attempt += 1
        try:
            return transport(payload, api_key)
        except TransientProviderError:
            if attempt >= max_attempts:
                raise
            sleep(0.2 * (2 ** (attempt - 1)))


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
