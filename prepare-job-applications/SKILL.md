---
name: "prepare-job-applications"
description: "Turn a job posting and the user’s experience into tailored, truthful application materials. Use when the user asks to apply for a job, tailor a resume or cover letter, or answer application questions. This Skill drafts application materials; it does not submit applications or contact employers."
---

# prepare-job-applications

## User inputs
The user supplies a job posting or role description, their resume or work history, and the application materials they want prepared. They may also provide achievements, portfolio details, application questions, formatting requirements, deadlines, or tone preferences.

Ask for the job posting and relevant experience when either is essential and missing. Ask targeted questions when a required qualification or achievement cannot be supported by the supplied facts.

## Procedure
1. Read the supplied job posting, user experience, and requested deliverables.
2. Extract the role’s responsibilities, required qualifications, preferred qualifications, important keywords, and application questions. Separate stated requirements from assumptions.
3. Consult any supplied writing guide or prior approved application materials. Use supplied resume, cover-letter, portfolio, or application-form assets when they affect the content or format. Run an executable tool only when needed to inspect, convert, or validate a supplied file; ordinary drafting does not require one.
   - Use [job-application-writing-rules.md](references/job-application-writing-rules.md): Before drafting, consult this guide for consistent, truthful, and evidence-based application writing.
4. Map the user’s truthful experience and achievements to the role’s requirements. Identify missing evidence, unsupported claims, and useful details that need clarification.
5. Draft the requested materials using specific evidence, clear language, and relevant keywords. Do not invent qualifications, achievements, dates, metrics, or responsibilities.
   - Use [job-application-writing-rules.md](references/job-application-writing-rules.md): Before drafting, consult this guide for consistent, truthful, and evidence-based application writing.
6. Review the materials for accuracy, relevance, consistency, readability, length, and alignment with the job posting.
   - Use [job-application-template.md](assets/job-application-template.md): This file is a reusable output template. It organizes the final resume content, cover letter, application answers, verification notes, and review checklist. The Skill should fill in the placeholders with verified information, remove unused sections, and return the completed materials.
   - Use [job-application-writing-rules.md](references/job-application-writing-rules.md): Before drafting, consult this guide for consistent, truthful, and evidence-based application writing.
   - Use [check_application_text.r](scripts/check_application_text.r): The Skill should run this R script with Rscript, using the application text file and an optional maximum word count as arguments. It returns the word count, character count, whether the text fits the limit, and the number of unfinished placeholders. Use it in Procedure Step 6 when reviewing application materials for length and completeness.
7. Return the completed materials, unresolved questions, and any details the user must verify before submitting.
   - Use [job-application-template.md](assets/job-application-template.md): This file is a reusable output template. It organizes the final resume content, cover letter, application answers, verification notes, and review checklist. The Skill should fill in the placeholders with verified information, remove unused sections, and return the completed materials.

## Output
Return the requested application materials in the user’s preferred format. Include:

- Tailored resume content, cover letter, or application answers
- A brief summary of how the materials address the role
- Assumptions, placeholders, or missing details that need confirmation
- A short final-review checklist when useful

## Boundaries
Do not invent or exaggerate qualifications, achievements, employment history, or application answers. Do not submit applications, contact employers, edit external profiles, or make commitments on the user’s behalf.

The user must review and approve the final materials, verify all facts, and complete the submission. Ask for clarification when multiple jobs are involved, a required fact is missing, or the requested wording could misrepresent the user’s experience.
