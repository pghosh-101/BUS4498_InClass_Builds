# Investigate Attendance Issues Task Specification

```yaml
# BASIC INFORMATION
task_id: "T8"
task_name: "Investigate attendance issues"
task_owner: "designated organizer"

# Agent Inference Configuration
Provider: Groq
Model: "llama-3.3-70b-versatile"
Role: Analyze planning data, compare attendance signals, and recalculate attendance estimates within permitted boundaries.
Maximum inference requests per task run: "6"
On inference failure or exhausted limits: Record the unresolved status and hand the case to the designated organizer.
```

## 1. Task Goal

- **Objective:** Resolve attendance-data or forecast-confidence issues so the workflow can continue with reliable recommendations or proceed to human review.

## 2. Inbound Inputs

### Input 1

- **Input name:** Planning data
- **What it contains:** Current registration count, historical attendance rates from comparable CPVC events, and registration timing in a structured planning-data record.
- **Source:** T2: Retrieve planning data

### Input 2

- **Input name:** Confirmation responses
- **What it contains:** Available voluntary attendance confirmations and newly collected confirmation responses.
- **Source:** T4: Collect confirmation responses

### Input 3

- **Input name:** Preliminary forecast
- **What it contains:** Expected attendance and the uncertainty range.
- **Source:** T6: Estimate attendance

### Input 4

- **Input name:** Exception condition
- **What it contains:** The data or forecast-confidence condition requiring investigation, such as incomplete, contradictory, unusually different, or insufficiently confident information.
- **Source:** D1: Data and confidence sufficient?
  
## 3. Tool Permissions and Boundaries

### Task-Wide Limits

- **Total task timeout:** 120 seconds for one task run, including tool calls, retries, reasoning, and waiting.
- **Maximum tool calls:** 6 calls across all tools during one task run; retries count toward this total.

Tools may use only the supplied planning data, confirmation responses, preliminary forecast, and exception condition. Tools are read-only and may not collect sensitive personal data, contact participants, modify records, recommend quantities, approve recommendations, or notify the organizer.

### Tool 1

- **Tool name:** check_planning_data
- **Input:** Planning data; Confirmation responses; Exception condition
- **Output:** Evidence summary; Unresolved issues
- **Implementation Route:** Functions or scripts for read-only checks of supplied planning information
- **Integration approach:** Direct integration
- **Role in this task:** Support Check data completeness and Compare attendance signals
- **Task timeout:** Subject to the same 120-second total task deadline. Each call may take at most 10 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 1 additional attempt
- **Retry only when:** A temporary read or processing error prevents completion. Wait 2 seconds and retry only if enough time and call budget remain. Do not retry missing inputs, invalid references, denied access, or contradictory data. The tool is read-only, so retries do not create duplicate records or messages.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the affected input, attempted check, failure category, and attempts in Subtasks performed and Unresolved issues. Set Status to escalated to human, set Result or recommendation to undetermined, and hand the case to the designated organizer.

### Tool 2

- **Tool name:** recalculate_attendance_estimate
- **Input:** Planning data; Confirmation responses; Preliminary forecast; Exception condition
- **Output:** Result or recommendation; Evidence summary; Unresolved issues
- **Implementation Route:** Functions or scripts for read-only attendance calculations using supplied planning information
- **Integration approach:** Direct integration
- **Role in this task:** Support Recalculate attendance estimate
- **Task timeout:** Subject to the same 120-second total task deadline. Each call may take at most 10 seconds or the remaining task time, whichever is shorter.
- **Maximum retries:** 1 additional attempt
- **Retry only when:** A temporary calculation or processing error prevents completion. Wait 2 seconds and retry only if enough time and call budget remain. Do not retry missing inputs, invalid references, or unsupported calculations. Do not treat an uncertain result as a successful resolution.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the failed calculation, input references, failure category, and attempts in Subtasks performed and Unresolved issues. Set Status to escalated to human, set Result or recommendation to undetermined, and hand the case to the designated organizer.

## 4. How the Agent Should Reason

### Permitted Subtask 1

- **Subtask name:** Check data completeness
- **Subtask description:** Examine the planning inputs and confirmation responses to identify missing or unusable information.
- **Subtask boundary:** May inspect the provided event-planning information only. May not infer missing values, collect sensitive personal data, contact participants, or change workflow rules.
- **Retry limits:** Maximum one additional attempt. If no useful finding is produced, select another permitted subtask or hand off.

### Permitted Subtask 2

- **Subtask name:** Compare attendance signals
- **Subtask description:** Examine registration, historical attendance, registration timing, and confirmation responses to identify agreement, contradiction, or unusual patterns.
- **Subtask boundary:** May compare only the provided planning information. May not add external data, alter source data, approve recommendations, or contact participants.
- **Retry limits:** Maximum one additional attempt. If the same evidence produces no new finding, select another permitted subtask or hand off.

### Permitted Subtask 3

- **Subtask name:** Recalculate attendance estimate
- **Subtask description:** Use available planning inputs and intermediate findings to produce a revised expected attendance and uncertainty range, or explain why a supported revision cannot be produced.
- **Subtask boundary:** May recalculate the attendance estimate using permitted workflow inputs. May not finalize quantities, approve recommendations, or use sensitive personal data.
- **Retry limits:** Maximum one additional attempt. If the estimate remains unsupported, hand off to a person.

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The investigation resolves the data or confidence issue and produces a supported basis for returning to T6: Estimate attendance.
- **Hand off early when:** Required information remains missing or contradictory, permitted subtasks produce no useful progress, the task requires sensitive data or new data collection, or the issue cannot be resolved within the retry limits.
- **Hand off to:** The designated organizer through a human-review request marked "Awaiting Review".

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Resolved for re-estimation or escalated to human.
- **Result or recommendation:** A supported finding that either returns the workflow to T6: Estimate attendance or requires human review; write undetermined if no supported finding was reached.
- **Evidence summary:** The key completeness checks, attendance-signal comparisons, and estimate findings supporting the result.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Remaining data conflicts, missing information, or confidence concerns; use none only if the issue was resolved.
- **Handoff note:** Reason for escalation, unresolved questions, and what the designated organizer needs to decide; write "Not applicable" for a resolved task.
- **Next task or recipient:** T6: Estimate attendance if resolved; the designated organizer if escalated.
