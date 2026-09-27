# Collect confirmation responses Task Specification

## Basic Information

- **Task ID:** T4
- **Task name:** Collect confirmation responses
- **Task type:** Sense
- **Task owner:** Attendance planning system

## 1. Task Description

This task collects voluntary attendance responses resulting from the approved confirmation communication and combines them with any available existing confirmations. It provides the response set used to validate and estimate attendance.

## 2. Inputs

### Input 1

- **Input name:** Confirmation request
- **Contents and format:** The communication send status and communication identifier, including whether the approved message was sent.
- **Source:** T3: Send approved confirmation

### Input 2

- **Input name:** Planning data
- **Contents and format:** Available voluntary attendance confirmations retrieved before this run.
- **Source:** T2: Retrieve planning data

- **If a required input is missing or invalid:** Record the missing communication or source data and hand the case to the designated organizer. Do not represent unavailable responses as confirmations.

## 3. Outputs

### Output 1

- **Output name:** Confirmation responses
- **Contents and format:** A structured response set containing available voluntary attendance responses, their collection status, and any unavailable or missing response status.
- **Next task or recipient:** T5: Validate planning data
- **Complete when:** Available responses are recorded and the response set states whether additional responses were unavailable at the planning checkpoint.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_confirmation_responses`
- **Input:** Confirmation request; Planning data
- **Output:** Confirmation responses
- **Implementation Route:** Database queries, file operations, or functions that read the permitted response source
- **Integration approach:** Direct integration
- **Role in this task:** Read available voluntary responses and preserve their availability status without contacting participants or changing responses.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary read or processing error prevents collection. Wait 2 seconds and retry only if enough task time remains. Do not retry invalid source references or treat missing responses as affirmative responses.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the available responses, affected source, failure category, and unresolved status. Hand the case to the designated organizer if no usable response set can be produced; otherwise mark the response set partial for T5.
