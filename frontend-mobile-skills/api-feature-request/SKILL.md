---
name: API Feature Request
description: A specialized skill to evaluate API readiness during the frontend planning stage and generate standardized API feature request documents when necessary.
---

# API Feature Request Skill

## Overview
This skill acts as a crucial gate during the **planning / units of work stage** of frontend development. It enforces the philosophy that the API is the absolute source of truth and prevents the frontend from becoming bloated with complex data transformations.

The primary objective of this skill is to answer one fundamental question before any frontend code is written:

**"Do I have enough API surface to complete this plan?"**

## Workflow

When invoked, the AI assistant MUST evaluate the proposed frontend plan against the existing API surface (using provided OpenAPI specs, documentation, or currently known endpoints) and present the following assessment to the user:

### Step 1: The API Surface Check

The assistant will analyze the frontend data requirements to ensure a "thin client" implementation (meaning zero or near-zero data mapping/transformation on the frontend).

Based on this analysis, the assistant explicitly states the outcome:

**Outcome A: YES (All Good)**
> "Yes, the existing API surface is sufficient to complete this plan without requiring complex client-side data transformations."
> *(Proceed with frontend execution.)*

**Outcome B: NO (Gap Identified)**
> "No, the existing API surface is insufficient or requires excessive client-side mapping for this plan."

### Step 2: The Fork (If Outcome B)

If the outcome is **NO**, the assistant must explicitly ask the user which path to take:

1.  **"Do you want me to generate an API Feature Request Document for the backend team?"**
    *   *Path 1*: This maintains the ideal UI/UX vision. The frontend work pauses (or uses stubs) while the backend team builds the exact endpoint defined in the generated document.
2.  **"Or should I change my frontend plan to match the constraints of the existing OpenAPI endpoint?"**
    *   *Path 2*: This sacrifices the "ideal" frontend implementation to deliver the feature immediately using what is over-fetched, under-fetched, or requires client-side mapping using the existing API.

### Step 3: Generating the Request Document (If Path 1 is chosen)

If the user chooses Path 1, the assistant MUST generate a markdown document (e.g., `feature-request.md`) intended for the backend team.

This document serves as a strict contract and MUST include:

1.  **Context & Use Case**: A brief explanation of the frontend feature being built and why the current API is insufficient.
2.  **Proposed Route & Method**: Specify REST (`GET /api/v1/resource`, `POST`, etc.) or GraphQL equivalent.
3.  **Expected Request**: Detail any required query parameters, URL parameters, or JSON Body payloads (including types and validation expectations).
4.  **Exact Expected JSON Response Payload**: Detail the *exact* JSON shape the frontend expects to receive. This should be a direct 1:1 mapping to the frontend's ideal state to ensure a thin client.
5.  **Error Specifications**: Define expected HTTP status codes (e.g., `400 Bad Request`, `404 Not Found`) and the exact shape of the error response JSON.

*(See `examples/feature-request.md` for the expected format).*

## Core Principles
-   **API is the Source of Truth:** Do not invent dummy data on the frontend.
-   **Thin Client:** The backend should do the heavy lifting (joining tables, sorting, filtering, aggregating). The frontend should primarily be concerned with rendering.
-   **Strict Contracts:** The generated feature request must be specific enough that a backend engineer can implement it without needing further clarification on the data shape.
