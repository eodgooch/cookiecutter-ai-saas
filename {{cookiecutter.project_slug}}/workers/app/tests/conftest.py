"""Pytest fixtures for __PROJECT_NAME__ worker tests."""

import asyncio
import os
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_redis():
    """Mock Redis connection for tests."""
    redis = AsyncMock()
    redis.publish = AsyncMock(return_value=1)
    redis.exists = AsyncMock(return_value=0)
    return redis


@pytest.fixture
def mock_llm():
    """Mock LLM for tests that don't need real API calls."""
    llm = MagicMock()
    llm.invoke.return_value = MagicMock(
        content='{"summary": "test", "insights": [], "recommendations": []}'
    )
    return llm


@pytest.fixture
def sample_input_data():
    """Sample job input data for testing."""
    return {
        "query": "test query",
        "options": {"format": "json"},
    }


@pytest.fixture
def sample_job_data(sample_input_data):
    """Sample BullMQ job data."""
    return {
        "jobId": "test-job-123",
        "type": "default",
        "userId": "user-456",
        "input": sample_input_data,
    }
