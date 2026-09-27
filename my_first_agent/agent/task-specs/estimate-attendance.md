# Estimate attendance Task Specification

## Basic Information

- **Task ID:** T6
- **Task name:** Estimate attendance
- **Task type:** Reason
- **Task owner:** Attendance planning system

## 1. Task Description

This task estimates expected attendance and an uncertainty range from validated planning data and confirmation responses. It also produces the confidence assessment used before quantities are recommended.

## 2. Inputs

### Input 1

- **Input name:** Validated planning data
- **Contents and format:** Registration count, comparable CPVC attendance rates, registration timing, voluntary confirmations, and validation statuses.
- **Source:** T5: Validate planning data or T8: Investigate attendance issues

### Input 2

- **Input name:** Confirmation responses
- **Contents and format:** Available voluntary attendance responses with their collection status.
- **Source:** T4: Collect confirmation responses

- **If a required input is missing or invalid:** Record the missing input and hand the case to T8: Investigate attendance issues. Do not produce a supported estimate from absent required inputs.

## 3. Outputs

### Output 1

- **Output name:** Attendance estimate
- **Contents and format:** Expected attendance and an uncertainty range derived from the supplied planning inputs.
- **Next task or recipient:** D1: Data and confidence sufficient?
- **Complete when:** The estimate and uncertainty range are recorded with the inputs used and any limitations identified.

### Output 2

- **Output name:** Confidence assessment
- **Contents and format:** A confidence assessment tied to the forecast evidence and unresolved limitations.
- **Next task or recipient:** D1: Data and confidence sufficient?
- **Complete when:** The assessment explains whether confidence is sufficient for the next decision or requires investigation.

## 4. Planned Tools

### Tool 1

- **Tool name:** `estimate_attendance`
- **Input:** Validated planning data; Confirmation responses
- **Output:** Attendance estimate; Confidence assessment
- **Implementation Route:** Functions, scripts, or model inference using the supplied planning information
- **Integration approach:** Direct integration
- **Role in this task:** Produce the expected attendance, uncertainty range, and confidence assessment without adding data or finalizing supply quantities.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary calculation or model-service error prevents a result. Wait 2 seconds and retry only if the inputs are valid and the task budget remains. A low-confidence result is not a tool failure and must route to D1.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the inputs, attempted calculation, failure category, and unresolved status. Hand the case to T8: Investigate attendance issues and do not continue to quantity recommendations.
