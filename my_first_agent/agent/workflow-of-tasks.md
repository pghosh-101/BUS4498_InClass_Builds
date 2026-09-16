# Workflow of Tasks

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow run starts when an organizer requests an attendance forecast or at an organizer-defined planning checkpoint before the hackathon.

### 1.3 Completion Condition at Runtime

A run is complete when the attendance forecast, recommended quantities for food, drinks, and swag, the data and rules used to produce them, and the confidence level are recorded and either approved automatically or, when human judgment is required, a human-review request is created and marked "Awaiting Review".

### 1.4 General Workflow

The system retrieves the current registration count, historical attendance rates from comparable CPVC events, registration timing, and any available voluntary attendance confirmations. It validates the data, estimates expected attendance and an uncertainty range, then converts the estimate into recommended quantities for food, drinks, and swag. The system records the forecast, assumptions, confidence level, and recommendations in the planning dashboard and notifies the designated organizer. When the data is complete, non-contradictory, not unusually different from historical patterns, and produces sufficient forecast confidence, the system approves the recommendations automatically, completing the normal path. 

If the data is incomplete, contradictory, unusually different from historical patterns, or produces low forecast confidence, the system investigates unresolved attendance discrepancies by selecting and sequencing permitted analyses based on intermediate evidence within predefined limits. If the investigation resolves the issue, the system returns to the forecasting steps. If the issue remains unresolved, the system flags the run for human review, creates a human-review request, and marks it "Awaiting Review" instead of automatically finalizing the recommendations. An organizer may then confirm or adjust the forecast and supply quantities. The system uses only necessary event-planning information, excludes sensitive personal data, and sends at most the approved attendance-confirmation communication.

### 1.5 Workflow Diagram

```mermaid
flowchart TD
    T1["T1: Start the workflow run at an organizer request or planning checkpoint"] --> T2["T2: Retrieve current registration count, historical attendance rates from comparable CPVC events, registration timing, and available voluntary attendance confirmations"]
    T2 --> T3["T3: Validate the data using only necessary event-planning information and excluding sensitive personal data"]
    T3 --> T4["T4: Estimate expected attendance and uncertainty range"]
    T4 --> T5["T5: Convert the estimate into recommended quantities for food, drinks, and swag"]
    T5 --> T6["T6: Record the forecast, assumptions, confidence level, recommendations, data, and rules used"]
    T6 --> T7["T7: Notify the designated organizer and send at most the approved attendance-confirmation communication"]
    T7 --> D1{"D1: Are the data complete, non-contradictory, not unusually different from historical patterns, and is forecast confidence sufficient?"}
    D1 -->|Yes| T9["T9: Approve the recommendations automatically"]
    D1 -->|No| T8["T8: Investigate unresolved attendance discrepancies by selecting and sequencing permitted analyses within predefined limits"]
    T8 --> D2{"D2: Did the investigation resolve the data or confidence issue?"}
    D2 -->|Yes| T4
    D2 -->|No| H1["H1: Create a human-review request and mark it Awaiting Review"]
    T9 --> C1([C1: Completion state])
    H1 --> C2([C2: Completion state])
```
