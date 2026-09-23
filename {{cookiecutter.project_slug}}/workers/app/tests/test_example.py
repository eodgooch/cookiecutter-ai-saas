"""Example tests for __PROJECT_NAME__ worker."""

import pytest
from unittest.mock import AsyncMock, patch

from tools.example_tool import example_processing_step
from runner import _step_collect_data, _step_generate_results


@pytest.mark.asyncio
async def test_example_processing_step_with_query(sample_input_data):
    """Test that example tool returns results for a query."""
    result = await example_processing_step(sample_input_data)

    assert result["query"] == "test query"
    assert len(result["items"]) > 0
    assert result["metadata"]["source"] == "example_tool"


@pytest.mark.asyncio
async def test_example_processing_step_empty_query():
    """Test that example tool handles empty input."""
    result = await example_processing_step({})

    assert result["query"] == ""
    assert result["items"] == []


@pytest.mark.asyncio
async def test_collect_data_step(sample_input_data):
    """Test data collection pipeline step."""
    context = {"step_results": {}}
    result = await _step_collect_data(sample_input_data, context)

    assert result["status"] == "collected"
    assert "items_count" in result
    assert "data" in result


@pytest.mark.asyncio
async def test_generate_results_step():
    """Test results generation with prior step outputs."""
    context = {
        "step_results": {
            "Data Collection": {
                "status": "collected",
                "items_count": 5,
                "data": {"items": [1, 2, 3, 4, 5]},
            },
            "AI Processing": {
                "status": "processed",
                "analysis": {
                    "summary": "Test analysis",
                    "insights": ["insight 1"],
                    "recommendations": ["rec 1"],
                },
            },
        },
    }

    result = await _step_generate_results({}, context)

    assert result["status"] == "generated"
    assert result["items_processed"] == 5
    assert result["ai_enhanced"] is True
    assert len(result["insights"]) == 1
    assert len(result["recommendations"]) == 1


@pytest.mark.asyncio
async def test_generate_results_without_ai():
    """Test results generation when AI step was skipped."""
    context = {
        "step_results": {
            "Data Collection": {
                "status": "collected",
                "items_count": 3,
                "data": {},
            },
            "AI Processing": {
                "status": "skipped",
                "reason": "no_llm_configured",
            },
        },
    }

    result = await _step_generate_results({}, context)

    assert result["status"] == "generated"
    assert result["ai_enhanced"] is False
