# Record forecast and assumptions Task Specification

## Basic Information

- **Task ID:** T9
- **Task name:** Record forecast and assumptions
- **Task type:** Remember
- **Task owner:** Attendance planning system

## 1. Task Description

This task records the attendance forecast, assumptions, confidence level, recommended food, drink, and swag quantities, source data, and rules used in the planning dashboard. It creates the record required before automatic approval or human review.

## 2. Inputs

### Input 1

- **Input name:** Attendance estimate
- **Contents and format:** Expected attendance and uncertainty range.
- **Source:** T6: Estimate attendance

### Input 2

- **Input name:** Confidence assessment
- **Contents and format:** Forecast confidence and unresolved limitations.
- **Source:** T6: Estimate attendance

### Input 3

- **Input name:** Supply recommendations
- **Contents and format:** Recommended quantities for food, drinks, and swag, including any retained review condition.
- **Source:** T7: Recommend food, drink, and swag quantities

### Input 4

- **Input name:** Validated planning data
- **Contents and format:** The planning data, confirmation responses, validation statuses, and source references used for the forecast.
- **Source:** T5: Validate planning data

- **If a required input is missing or invalid:** Record the missing field and hand the case to the designated organizer. Do not create a complete forecast record from partial inputs.

## 3. Outputs

### Output 1

- **Output name:** Forecast record
- **Contents and format:** A planning-dashboard record containing the attendance forecast, uncertainty range, assumptions, confidence level, food, drink, and swag recommendations, source data, rules used, and review status.
- **Next task or recipient:** T10: Notify organizer
- **Complete when:** All required forecast fields, recommendations, supporting data, rules, and status are stored and retrievable from the planning dashboard.

## 4. Planned Tools

### Tool 1

- **Tool name:** `record_forecast`
- **Input:** Attendance estimate; Confidence assessment; Supply recommendations; Validated planning data
- **Output:** Forecast record
- **Implementation Route:** Database update, file operation, or planning-dashboard API call
- **Integration approach:** Direct integration
- **Role in this task:** Store the forecast package and preserve the evidence and rules used to produce it.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** The storage service confirms that the first write was rejected or did not create a record. Reuse the same run identifier and perform an idempotent update to avoid duplicate records. If write status is uncertain, do not retry.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the attempted fields, storage status, failure category, and unresolved status. Hand the case to the designated organizer and do not notify or approve the forecast as successfully recorded.
