"""Test fixtures shared across the integration tests."""

from __future__ import annotations

from dataclasses import dataclass

import pytest


@dataclass
class StubBlock:
    type: str
    text: str | None = None
    id: str | None = None
    name: str | None = None
    input: dict | None = None


@dataclass
class StubResponse:
    content: list[StubBlock]
    stop_reason: str


class StubMessages:
    def __init__(self, scripted: list[StubResponse]):
        self._scripted = list(scripted)
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if not self._scripted:
            raise AssertionError("StubMessages ran out of scripted responses")
        return self._scripted.pop(0)


class StubClient:
    def __init__(self, scripted: list[StubResponse]):
        self.messages = StubMessages(scripted)


@pytest.fixture
def stub_client_factory():
    return StubClient


@pytest.fixture
def stub_block():
    return StubBlock


@pytest.fixture
def stub_response():
    return StubResponse
