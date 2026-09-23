"""Example tool / pipeline step implementation.

This module demonstrates how to create a processing step for the job pipeline.
Each tool should be an async function that takes input data and returns results.

Replace this with your actual processing logic — API calls, data transformations,
external service integrations, etc.
"""

import logging

logger = logging.getLogger("tools.example")


async def example_processing_step(input_data: dict) -> dict:
    """Example data collection / processing step.

    Args:
        input_data: The job's input parameters.

    Returns:
        Dict with collected/processed data.
    """
    logger.info("Running example processing step")

    # TODO: Replace with your actual data collection logic
    # Examples:
    #   - Fetch data from an external API
    #   - Query a database
    #   - Read and parse files
    #   - Scrape web content

    items = []
    query = input_data.get("query", "")

    if query:
        # Simulated data collection
        items = [
            {"id": 1, "title": f"Result for: {query}", "score": 0.95},
            {"id": 2, "title": f"Related to: {query}", "score": 0.82},
        ]

    return {
        "query": query,
        "items": items,
        "metadata": {
            "source": "example_tool",
            "version": "1.0",
        },
    }
