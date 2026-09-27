# Create review request and mark Awaiting Review Task Specification

## Basic Information

- **Task ID:** H1
- **Task name:** Create review request and mark Awaiting Review
- **Task type:** Act
- **Task owner:** Attendance planning system

## 1. Task Description

This task creates a human-review request when the data or forecast confidence remains unresolved, or when automatic approval cannot be completed safely. It records the request as Awaiting Review and prevents the recommendations from being treated as automatically approved.

## 2. Inputs

### Input 1

- **Input name:** Forecast record
- **Contents and format:** Recorded attendance forecast, uncertainty range, assumptions, confidence level, supply recommendations, supporting data, and rules used.
- **Source:** T9: Record forecast and assumptions

### Input 2

- **Input name:** Review condition
- **Contents and format:** The unresolved data, confidence, approval, or tool-failure condition requiring human judgment.
- **Source:** D3: Human review required? or the failed task handoff

- **If a required input is missing or invalid:** Record the missing review context and hand the case to the designated organizer. Do not create a review request without the forecast record and reason.

## 3. Outputs

### Output 1

- **Output name:** Human-review request
- **Contents and format:** A review request linked to the forecast record, containing the unresolved condition, relevant evidence, current recommendations, and status Awaiting Review.
- **Next task or recipient:** C2: Run complete: Awaiting Review and H2: Confirm or adjust forecast and supply quantities
- **Complete when:** The request exists, is linked to the forecast record, and its status is stored as Awaiting Review.

## 4. Planned Tools

### Tool 1

- **Tool name:** `create_review_request`
- **Input:** Forecast record; Review condition
- **Output:** Human-review request
- **Implementation Route:** Database update, file operation, or planning-dashboard API call
- **Integration approach:** Direct integration
- **Role in this task:** Create the review request, attach the evidence and unresolved condition, and set its status to Awaiting Review.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** The storage service confirms that the first request was rejected before acceptance. Reuse the same request identifier to avoid duplicate review requests. If creation or status is uncertain, do not retry.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the attempted request, forecast-record reference, failure category, and unresolved status. Hand the case to the designated organizer and do not claim that the request is Awaiting Review.
