# Notify organizer Task Specification

## Basic Information

- **Task ID:** T10
- **Task name:** Notify organizer
- **Task type:** Act
- **Task owner:** Attendance planning system

## 1. Task Description

This task notifies the designated organizer that the forecast record and supply recommendations are available, including whether human review remains required. It keeps the organizer informed without approving or changing the planning record.

## 2. Inputs

### Input 1

- **Input name:** Forecast record
- **Contents and format:** The stored forecast, uncertainty range, assumptions, confidence level, supply recommendations, supporting data, rules, and review status.
- **Source:** T9: Record forecast and assumptions

- **If a required input is missing or invalid:** Record the missing forecast record and hand the case to the designated organizer. Do not send a notification that implies the forecast was recorded.

## 3. Outputs

### Output 1

- **Output name:** Organizer notification record
- **Contents and format:** Notification status, recipient, notification identifier, and reference to the forecast record.
- **Next task or recipient:** D3: Human review required?
- **Complete when:** The notification status is confirmed as sent to the designated organizer or the task is escalated with an unresolved send status.

## 4. Planned Tools

### Tool 1

- **Tool name:** `notify_organizer`
- **Input:** Forecast record
- **Output:** Organizer notification record
- **Implementation Route:** Web API call or messaging-service call
- **Integration approach:** Direct integration
- **Role in this task:** Send the forecast-record notification to the designated organizer and record the delivery status.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** The messaging service confirms that the first request was rejected before acceptance. Wait 2 seconds and reuse the same notification identifier to avoid duplicate messages. If delivery status is uncertain, do not retry.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the recipient, notification identifier, failure category, and unresolved status. Hand the case to the designated organizer and do not continue to approval as if notification succeeded.
