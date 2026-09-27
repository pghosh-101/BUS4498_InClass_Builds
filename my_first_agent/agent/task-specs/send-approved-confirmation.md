# Send approved confirmation Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Send approved confirmation
- **Task type:** Act
- **Task owner:** Attendance planning system

## 1. Task Description

This task sends at most the approved attendance-confirmation communication to participants before the forecast is finalized. It creates an opportunity to collect voluntary attendance responses that can inform the forecast.

## 2. Inputs

### Input 1

- **Input name:** Planning data
- **Contents and format:** The retrieved planning-data package and its source and availability status.
- **Source:** T2: Retrieve planning data

### Input 2

- **Input name:** Approved confirmation communication
- **Contents and format:** The approved attendance-confirmation communication and its permitted recipient group.
- **Source:** Planning workflow or designated organizer

- **If a required input is missing or invalid:** Record that no approved communication was available and hand the case to the designated organizer. Do not send an unapproved message.

## 3. Outputs

### Output 1

- **Output name:** Confirmation request
- **Contents and format:** A send status containing the communication identifier, recipient group, and whether the approved message was sent or not sent.
- **Next task or recipient:** T4: Collect confirmation responses
- **Complete when:** The approved message has been sent no more than once, or the record states that no approved message was sent.

## 4. Planned Tools

### Tool 1

- **Tool name:** `send_approved_confirmation`
- **Input:** Approved confirmation communication
- **Output:** Confirmation request
- **Implementation Route:** Web API call or messaging service call
- **Integration approach:** Direct integration
- **Role in this task:** Send only the approved attendance-confirmation communication and record its status.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** The service confirms that the first request was rejected before acceptance. Wait 2 seconds and reuse the same message identifier to avoid duplicate participant messages. If delivery status is uncertain, do not retry; record the uncertainty and hand the case to the designated organizer.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the send status, message identifier, failure category, and unresolved status. Hand the case to the designated organizer and do not continue as if the communication was sent.
