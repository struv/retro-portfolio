# Trace a Form Submission

Prepared October 13, 2026. Status: unattempted.

Practice explaining what happens when a small web application saves a form. Use plain language; an arrow diagram is optional. This first attempt will help calibrate the system design sessions.

## Scenario

A fictional team creates a form link. A visitor opens it, enters a display name and a short message, and presses Submit. Staff sign in to view their own team's submissions. A different team's staff must not see them. Saved submissions should survive an application restart.

For this first discussion, assume a single application instance and low traffic. Attachments, notifications, and multiple regions are outside this exercise. This is a practice system inspired by familiar web workflows; describe your actual work separately.

Example synthetic input: form `demo-7`, display name `Alex`, message `Please contact me`. The visitor should receive confirmation when the submission has been saved, and authorized staff should be able to retrieve it later.

## Opening question

When the visitor presses Submit, what should happen from the browser, through the application, into storage, and back to the browser?

Write a short sequence in your own words. Name where the data goes and what each part does. Mark anything you are unsure about. Spend roughly 5–10 minutes on this initial explanation if useful, then ask for review. Do not read a complete design first.

## Learner attempt

Date and actual time, if tracked:

Request sequence:

Questions or uncertainties:

References, hints, or AI used:

## Followups after the opening attempt

The coach should introduce one at a time:

1. What belongs in the request and response, and which checks must happen on the server?
2. What must be true before the service says the submission was saved? How would you check it survives a restart?
3. How does the service decide whether signed-in staff may retrieve this submission?
4. Storage saves the submission, but the response never reaches the visitor. What can the visitor conclude, and what could happen if they retry?

For each followup, record the prediction, any hint, and the revised explanation. The timeout question introduces a later duplicate-submission lesson; a complete retry design is not required to finish the opening trace.

## Review evidence

Coach review and assistance:

Supplied scenarios discussed:

Learner-added scenario and prediction:

Experiment or code checks, if any:

Next retrieval variant:

The prompt and examples are coach-provided. Blank sections are not completed work. Record guided explanation separately from tested implementation or an independent retest in [PROGRESS.md](PROGRESS.md).
