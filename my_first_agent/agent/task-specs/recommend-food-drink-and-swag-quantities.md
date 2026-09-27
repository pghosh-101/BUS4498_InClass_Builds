# Recommend food, drink, and swag quantities Task Specification

## Basic Information

- **Task ID:** T7
- **Task name:** Recommend food, drink, and swag quantities
- **Task type:** Decide
- **Task owner:** Attendance planning system

## 1. Task Description

This task converts the attendance estimate into recommended quantities for food, drinks, and swag. It applies the workflow’s quantity-conversion rules after the data and confidence decision permits the recommendation path, without approving the recommendations.

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

- **Input name:** Validation result
- **Contents and format:** Data-quality findings and the route that permitted quantity recommendation or retained a human-review condition.
- **Source:** T5: Validate planning data and D1: Data and confidence sufficient?

- **If a required input is missing or invalid:** Record the missing input and hand the case to T8: Investigate attendance issues. Do not recommend quantities from an unverified estimate.

## 3. Outputs

### Output 1

- **Output name:** Supply recommendations
- **Contents and format:** Recommended quantities for food, drinks, and swag, linked to the attendance estimate, uncertainty range, confidence assessment, and any retained review condition.
- **Next task or recipient:** T9: Record forecast and assumptions
- **Complete when:** Each of the three supply categories has a recommendation or an explicit unresolved status, and the output is marked not yet approved.

## 4. Planned Tools

### Tool 1

- **Tool name:** `recommend_supply_quantities`
- **Input:** Attendance estimate; Confidence assessment; Validation result
- **Output:** Supply recommendations
- **Implementation Route:** Functions or scripts applying the workflow’s quantity-conversion rules
- **Integration approach:** Direct integration
- **Role in this task:** Convert the attendance estimate into food, drink, and swag quantities without approving or sending the recommendations.
- **Task timeout:** 120 seconds maximum for the task run.
- **Maximum retries:** 1
- **Retry only when:** A temporary calculation error prevents completion. Wait 2 seconds and retry only if the prior attempt produced no output. Do not retry a substantive unresolved condition.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the inputs, calculation status, failure category, and unresolved status. Hand the case to the designated organizer and do not continue to recording as if recommendations were produced.
