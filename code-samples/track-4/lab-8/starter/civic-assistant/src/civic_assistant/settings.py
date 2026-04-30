"""Env-var-driven configuration for the civic-assistant service.

Every knob the service can be tuned with comes through this module. The
DEPLOYMENT.md handoff lists each name, default, and effect.
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = PACKAGE_DIR.parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    llm_provider: str = "anthropic"
    llm_model: str = "claude-sonnet-4-5"

    policy_corpus_dir: Path = PROJECT_DIR / "data" / "policy_corpus"
    permits_path: Path = PROJECT_DIR / "data" / "permits" / "permits.json"

    retrieval_score_floor: float = 0.05
    triage_max_iterations: int = 6

    cors_allow_origins: str = ""

    feature_flags: str = "triage_enabled,answer_enabled,classify_enabled"

    log_level: str = "INFO"


def get_settings() -> Settings:
    return Settings()
