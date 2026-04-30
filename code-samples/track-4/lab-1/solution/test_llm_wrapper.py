from __future__ import annotations

import pytest

from llm_wrapper import (
    LLMRequest,
    LLMResponse,
    ModelConfig,
    TransientProviderError,
    build_request,
    complete_with_retry,
    estimate_cost_usd,
    estimate_tokens,
    fake_echo_transport,
    load_config,
    require_api_key,
    safe_log_record,
)


def test_load_config_uses_provider_specific_model_env(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_MODEL_ID", "provider-docs-example")
    cfg = load_config("anthropic")
    assert cfg.provider == "anthropic"
    assert cfg.model_id == "provider-docs-example"
    assert cfg.api_key_env == "ANTHROPIC_API_KEY"


def test_load_config_uses_azure_deployment_and_endpoint(monkeypatch):
    monkeypatch.setenv("AZURE_OPENAI_DEPLOYMENT", "agency-approved-deployment")
    monkeypatch.setenv("AZURE_OPENAI_ENDPOINT", "https://example.openai.azure.com")
    cfg = load_config("azure-openai")
    assert cfg.model_id == "agency-approved-deployment"
    assert cfg.endpoint == "https://example.openai.azure.com"


def test_load_config_rejects_unknown_provider():
    with pytest.raises(ValueError):
        load_config("mystery-ai")


def test_require_api_key_reads_secret_without_logging(monkeypatch):
    monkeypatch.setenv("EXAMPLE_KEY", "secret-value")
    assert require_api_key(ModelConfig("example", "model", "EXAMPLE_KEY")) == "secret-value"


def test_require_api_key_raises_when_missing(monkeypatch):
    monkeypatch.delenv("MISSING_KEY", raising=False)
    with pytest.raises(RuntimeError):
        require_api_key(ModelConfig("example", "model", "MISSING_KEY"))


def test_estimate_tokens_uses_rough_character_rule():
    assert estimate_tokens("") == 0
    assert estimate_tokens("abcd") == 1
    assert estimate_tokens("abcde") == 2


def test_estimate_cost_uses_per_million_prices():
    cost = estimate_cost_usd(
        1_000_000,
        500_000,
        input_per_million=3.0,
        output_per_million=15.0,
    )
    assert cost == pytest.approx(10.5)


def test_build_request_contains_no_secret():
    cfg = ModelConfig("anthropic", "agency-model-id", "ANTHROPIC_API_KEY")
    payload = build_request(cfg, LLMRequest("system", "user"))
    assert payload["provider"] == "anthropic"
    assert payload["model"] == "agency-model-id"
    assert "api_key" not in payload


def test_safe_log_record_omits_prompts_and_output():
    cfg = ModelConfig("anthropic", "agency-model-id", "ANTHROPIC_API_KEY")
    req = LLMRequest("secret system", "resident data")
    rsp = LLMResponse("private output", 10, 20, "agency-model-id", "anthropic")
    record = safe_log_record(cfg, req, rsp)
    assert record["total_tokens"] == 30
    assert "secret system" not in str(record)
    assert "resident data" not in str(record)
    assert "private output" not in str(record)


def test_complete_with_retry_succeeds_after_transient_error(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    cfg = ModelConfig("anthropic", "agency-model-id", "ANTHROPIC_API_KEY")
    calls = {"count": 0}
    sleeps: list[float] = []

    def flaky_transport(payload, api_key):
        calls["count"] += 1
        if calls["count"] == 1:
            raise TransientProviderError("rate limited")
        return fake_echo_transport(payload, api_key)

    rsp = complete_with_retry(
        cfg,
        LLMRequest("You are helpful.", "Hello"),
        flaky_transport,
        sleep=sleeps.append,
    )
    assert calls["count"] == 2
    assert sleeps == [0.2]
    assert rsp.text.startswith("Echo from agency-model-id")
