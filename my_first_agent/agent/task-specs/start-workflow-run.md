# Start workflow run Task Specification

## Basic Information

- **Task ID:** T1
- **Task name:** Start workflow run
- **Task type:** Act
- **Task owner:** Attendance planning system

## 1. Task Description

This task opens an attendance-forecast run when an organizer requests a forecast or reaches an organizer-defined planning checkpoint. It creates the active run context needed by the retrieval task and preserves the trigger that initiated the run.

## 2. Inputs

### Input 1

- **Input name:** Workflow trigger
- **Contents and format:** An organizer forecast request or an organizer-defined planning checkpoint event.
- **Source:** Organizer or planning schedule

- **If a required input is missing or invalid:** Record the invalid trigger and hand the case to the designated organizer. Do not start the run.

## 3. Outputs

### Output 1

- **Output name:** Active forecast run
- **Contents and format:** A run context containing the trigger and run status.
- **Next task or recipient:** T2: Retrieve planning data
- **Complete when:** The trigger is recorded and the run is marked ready for data retrieval.

## 4. Planned Tools

### Tool 1

- **Tool name:** `initialize_forecast_run`
- **Input:** Workflow trigger
- **Output:** Active forecast run
- **Implementation Route:** Functions or scripts that create the run context
- **Integration approach:** Direct integration
- **Role in this task:** Record the trigger and open one forecast run.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary record-creation failure occurs and the first request was confirmed not to have been accepted. Reuse the same run identifier to avoid duplicate runs. If the outcome is uncertain, do not retry and hand off the case.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the trigger, failure category, and unresolved status. Hand the case to the designated organizer and do not continue to T2.
