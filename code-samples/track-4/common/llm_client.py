"""Provider-neutral LLM client used by every Track 4 lab.

Usage:

    from llm_client import get_client
    complete = get_client(provider="anthropic", model="claude-sonnet-4-5")
    text = complete(system="You are a classifier.", user="Hello.")

The function returned has signature:

    complete(system: str, user: str, *, max_tokens: int = 512,
             temperature: float = 0.0, response_format: dict | None = None) -> str

Supported providers: "anthropic" (default), "openai", "azure-openai".
The provider key is read from the matching environment variable.
"""

from __future__ import annotations

import os
from typing import Any, Callable, Optional


def get_client(
    provider: str = "anthropic",
    model: Optional[str] = None,
) -> Callable[..., str]:
    """Return a callable that takes (system, user) and returns the model's text."""
    provider = provider.lower()

    if provider == "anthropic":
        return _anthropic_client(model or "claude-sonnet-4-5")
    if provider == "openai":
        return _openai_client(model or "gpt-4o-mini")
    if provider == "azure-openai":
        return _azure_openai_client(model or os.environ.get("AZURE_OPENAI_DEPLOYMENT", ""))

    raise ValueError(f"Unknown provider: {provider}")


def _anthropic_client(model: str) -> Callable[..., str]:
    import anthropic

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")

    client = anthropic.Anthropic(api_key=api_key)

    def complete(
        system: str,
        user: str,
        *,
        max_tokens: int = 512,
        temperature: float = 0.0,
        response_format: dict[str, Any] | None = None,
    ) -> str:
        # response_format is unused on Anthropic; structured output is achieved
        # through prompt format and parsed downstream.
        del response_format
        msg = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        # Anthropic returns a list of content blocks; we expect one text block.
        return "".join(block.text for block in msg.content if block.type == "text")

    return complete


def _openai_client(model: str) -> Callable[..., str]:
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")

    client = OpenAI(api_key=api_key)

    def complete(
        system: str,
        user: str,
        *,
        max_tokens: int = 512,
        temperature: float = 0.0,
        response_format: dict[str, Any] | None = None,
    ) -> str:
        kwargs: dict[str, Any] = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        if response_format:
            kwargs["response_format"] = response_format
        rsp = client.chat.completions.create(**kwargs)
        return rsp.choices[0].message.content or ""

    return complete


def _azure_openai_client(deployment: str) -> Callable[..., str]:
    from openai import AzureOpenAI

    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    api_key = os.environ.get("AZURE_OPENAI_API_KEY")
    api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2024-10-01-preview")
    if not endpoint or not api_key:
        raise RuntimeError(
            "AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY must both be set."
        )

    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version,
    )

    def complete(
        system: str,
        user: str,
        *,
        max_tokens: int = 512,
        temperature: float = 0.0,
        response_format: dict[str, Any] | None = None,
    ) -> str:
        kwargs: dict[str, Any] = {
            "model": deployment,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
        if response_format:
            kwargs["response_format"] = response_format
        rsp = client.chat.completions.create(**kwargs)
        return rsp.choices[0].message.content or ""

    return complete
