"""Job orchestrator — runs pipeline steps in sequence and returns structured results."""

import json
import logging
import time
from typing import Callable, Awaitable, Any

from tools.example_tool import example_processing_step
import llm_utils

logger = logging.getLogger("runner")


class JobCancelled(Exception):
    pass


# Pipeline steps: (name, function, progress_weight)
# Each step receives (input_data, context) and returns a result dict.
PIPELINE_STEPS = [
    ("Data Collection", "collect_data", 30),
    ("AI Processing", "process_with_ai", 40),
    ("Results Generation", "generate_results", 30),
]


async def run_job(
    job_id: str,
    job_type: str,
    user_id: str | None,
    input_data: dict,
    progress_callback: Callable[..., Awaitable] | None = None,
    cancel_check: Callable[[], Awaitable[bool]] | None = None,
) -> dict:
    """Run a job through the pipeline steps.

    Args:
        job_id: Unique job identifier
        job_type: Type of job (determines pipeline behavior)
        user_id: User who initiated the job
        input_data: Job input parameters
        progress_callback: Async callback for progress updates (pct, step_name, status, message)
        cancel_check: Async function that returns True if job should be cancelled

    Returns:
        Dict with job results including all step outputs.
    """
    logger.info("Starting job pipeline for %s (type=%s)", job_id, job_type)
    start_time = time.monotonic()

    context = {
        "job_id": job_id,
        "job_type": job_type,
        "user_id": user_id,
        "input_data": input_data,
        "step_results": {},
    }

    # Calculate progress ranges for each step
    total_weight = sum(w for _, _, w in PIPELINE_STEPS)
    progress_base = 0

    try:
        for step_name, step_func_name, weight in PIPELINE_STEPS:
            # Check for cancellation before each step
            if cancel_check and await cancel_check():
                raise JobCancelled()

            step_pct_start = int(progress_base / total_weight * 100)
            step_pct_end = int((progress_base + weight) / total_weight * 100)

            if progress_callback:
                await progress_callback(step_pct_start, step_name, "running", f"Starting {step_name}")

            logger.info("Job %s: running step '%s'", job_id, step_name)
            step_start = time.monotonic()

            # Execute the pipeline step
            step_result = await _execute_step(step_func_name, input_data, context)
            context["step_results"][step_name] = step_result

            elapsed = time.monotonic() - step_start
            logger.info("Job %s: step '%s' completed in %.1fs", job_id, step_name, elapsed)

            if progress_callback:
                await progress_callback(step_pct_end, step_name, "running", f"Completed {step_name}")

            progress_base += weight

        total_elapsed = time.monotonic() - start_time

        if progress_callback:
            await progress_callback(100, "Complete", "completed", "Job completed")

        return {
            "job_id": job_id,
            "job_type": job_type,
            "user_id": user_id,
            "status": "completed",
            "duration_seconds": round(total_elapsed, 2),
            "results": context["step_results"],
        }
    except JobCancelled:
        raise
    except Exception as exc:
        if progress_callback:
            await progress_callback(0, "", "failed", f"Job failed: {type(exc).__name__}")
        raise


async def _execute_step(step_func_name: str, input_data: dict, context: dict) -> dict:
    """Execute a single pipeline step by name."""
    steps = {
        "collect_data": _step_collect_data,
        "process_with_ai": _step_process_with_ai,
        "generate_results": _step_generate_results,
    }

    func = steps.get(step_func_name)
    if not func:
        raise ValueError(f"Unknown pipeline step: {step_func_name}")

    return await func(input_data, context)


async def _step_collect_data(input_data: dict, context: dict) -> dict:
    """Step 1: Collect and prepare data for processing.

    Replace this with your actual data collection logic — API calls,
    database queries, file reads, web scraping, etc.
    """
    # Example: use the example tool for data collection
    collected = await example_processing_step(input_data)

    return {
        "status": "collected",
        "items_count": len(collected.get("items", [])),
        "data": collected,
    }


async def _step_process_with_ai(input_data: dict, context: dict) -> dict:
    """Step 2: Process collected data with an LLM.

    Uses the configured LLM provider to analyze/transform data.
    """
    import asyncio
    from langchain_core.messages import SystemMessage, HumanMessage

    llm = llm_utils.get_llm()
    if llm is None:
        logger.warning("No LLM configured, returning raw data")
        return {
            "status": "skipped",
            "reason": "no_llm_configured",
        }

    collected_data = context["step_results"].get("Data Collection", {})

    system_prompt = """You are a helpful AI assistant for __PROJECT_NAME__.
Analyze the provided data and return a structured JSON response with your analysis.

Respond with a JSON object containing:
- "summary": A brief summary of the analysis
- "insights": An array of key insights found
- "recommendations": An array of recommended actions
"""

    user_prompt = f"Please analyze the following data:\n\n{json.dumps(collected_data, indent=2)}"

    try:
        limiter = llm_utils.get_rate_limiter()
        await limiter.acquire()
        try:
            response = await asyncio.to_thread(
                llm.invoke,
                [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)],
            )
        finally:
            limiter.release()

        content = getattr(response, "content", "") or ""

        # Strip markdown code fences if present
        stripped = content.strip()
        if stripped.startswith("```"):
            stripped = stripped.split("\n", 1)[-1]
            if stripped.endswith("```"):
                stripped = stripped[:-3]
            stripped = stripped.strip()

        try:
            analysis = json.loads(stripped)
        except json.JSONDecodeError:
            analysis = {"summary": content, "insights": [], "recommendations": []}

        return {
            "status": "processed",
            "analysis": analysis,
        }
    except Exception as exc:
        logger.warning("LLM processing failed: %s", exc)
        return {
            "status": "error",
            "error": str(exc),
        }


async def _step_generate_results(input_data: dict, context: dict) -> dict:
    """Step 3: Generate final results from all previous steps.

    Combines data collection and AI processing outputs into
    the final result format.
    """
    collected = context["step_results"].get("Data Collection", {})
    ai_result = context["step_results"].get("AI Processing", {})

    return {
        "status": "generated",
        "summary": ai_result.get("analysis", {}).get("summary", "Processing complete"),
        "items_processed": collected.get("items_count", 0),
        "ai_enhanced": ai_result.get("status") == "processed",
        "insights": ai_result.get("analysis", {}).get("insights", []),
        "recommendations": ai_result.get("analysis", {}).get("recommendations", []),
    }
