# Investigate Attendance Issues Task Specification

```yaml
# BASIC INFORMATION
task_id: "T8"
task_name: "Investigate attendance issues"
task_owner: "designated organizer"

# Agent Inference Configuration
Provider: [e.g., Groq, OpenAI, Claude, Google Gemini]
Model: "[Exact supported API model ID.]"
Role: [permitted subtasks the model supports]
Maximum inference requests per task run: "[Whole-number limit.]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [human role].
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

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** [Maximum elapsed time for one task run, with units; include tool calls, retries, and waiting.]
- **Maximum tool calls:** [Maximum total calls across all tools during one task run; retries count toward this total.]

### Tool 1

- **Tool name:** [Proposed verb-object name, used consistently throughout the project.]
- **Tool type:** [For example: Python script, pretrained model, API request, database query, or language-model call.]
- **Supports these permitted subtasks:** [Names from Section 4.]
- **Allowed use:** [What the tool may read, create, change, or send; identify permitted data sources and destinations.]
- **Prohibited use:** [Actions, data, or destinations outside this tool's authority.]
- **Approval required:** [What requires approval, who provides it, and when. Write "None within the allowed use" if applicable.]
- **Timeout per call:** [Maximum duration of a single attempt, with units.]
- **Maximum retries per call:** [Nonnegative whole number of additional attempts after the first; 0 means no retries.]
- **Retry conditions and failure response:** [When a retry is allowed, any waiting interval, and what happens on timeout or exhausted retries. For actions that change state, avoid duplicate actions and hand off if the outcome is uncertain.]

*Copy the Tool block as needed. Tool-specific and task-wide limits both apply; stop at whichever is reached first. Naming a tool does not authorize uses outside its stated permissions.*

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
