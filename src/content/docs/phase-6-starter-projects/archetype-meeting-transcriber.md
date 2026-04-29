---
title: Archetype — Meeting Transcriber
description: Transcribe agency meetings, summarize them, and extract action items — a universal pain point with visible time-savings.
sidebar:
  order: 4
---

Government work runs on meetings. Most agencies have several hundred staff sitting in meetings at any given moment of the workday, and a substantial fraction of those meetings end with the same problem: someone needs to write up what happened, who agreed to what, and what the action items are. Often it doesn't happen, or it happens late, or it captures only what the note-taker remembers.

A meeting-transcription-and-summarization starter is a tractable, visible win. Recordings already exist (Teams, Zoom, Google Meet); the AI work is well-trodden; the time saved is measurable; the failure modes are mostly recoverable (a wrong action item is corrected by anyone in the room). It exercises a different slice of the platform than the chatbot — heavier on document rendering, less heavy on conversational AI — and gives the team a different practice surface.

## What the project ships

A web application where staff can:

- **Submit a recording or join a live meeting** for transcription.
- **View the transcript** with speaker diarization (who said what).
- **Read the summary** — key decisions, discussion threads, action items.
- **Edit and approve the summary** — the system suggests; a human ratifies.
- **Export** the approved summary as a PDF or DOCX.
- **Distribute** to attendees via email or a shared workspace.

Plus the operator-facing surface:

- **Admin dashboard** for cost tracking, eval scores, retention compliance.
- **Per-team scope** — meetings are scoped to a team, not visible globally.
- **Retention controls** per the agency's records-management policy.

## Why this is a good starter

- **Universal pain point.** Almost every staff member sits through too many meetings; almost every staff member has felt the friction of writing up minutes. Adoption motivation is high.
- **Clear baseline.** "How long did the human note-taker spend?" is a measurable counterfactual. Time-savings are demonstrable.
- **Recordings already exist.** Teams, Zoom, and Google Meet routinely record. The data is in shape; no ETL.
- **Heavy module exercise on a different axis.** Document rendering, structured-output prompts, async job pipeline, retention policy. Things the RAG chatbot doesn't touch.
- **Failure mode is recoverable.** A wrong action item is corrected by anyone in the room. A missed nuance is added back. A bad summary is re-generated.

## Why it's not always the right starter

- **Recording policy.** Some agencies have not yet established consent and policy norms for routine meeting recording. The starter must not be the moment that policy is forced.
- **Sensitive meetings.** Personnel discussions, attorney-client meetings, hearings, deliberative-process meetings — these are not the right meetings to feed an AI starter. The system needs guardrails on which meetings it accepts.
- **Privacy expectations.** Staff who consented to live transcription for accessibility may not have consented to AI summarization stored beyond the meeting. Get clarity before launch.

If the recording policy isn't clear, the meeting transcriber is the second-quarter project after the policy lands, not the starter.

## Two starting modes

The agency picks one to start; v2 can add the other.

### Mode A: Upload a recording (recommended starter)

The user has a recording (Teams export, Zoom .mp4, audio file) and uploads it. The system transcribes asynchronously, summarizes, and notifies the user when ready. Total time: 2–10 minutes for a typical 30–60 minute meeting.

This is the better starter because:

- It's stateless. The agency doesn't need a live integration with the meeting platform.
- The user explicitly chose to share this meeting with the system.
- Bugs in the pipeline don't disrupt a live meeting.

### Mode B: Live transcription bot

A bot joins the meeting and transcribes in real time. After the meeting, the summary is generated.

Live mode is harder:

- The bot needs platform-specific integration (Teams Bot Framework, Zoom Marketplace App, Google Meet API).
- Live transcription has to handle network glitches, mute/unmute, multiple speakers.
- The "did everyone consent" question is sharper because consent is during the meeting.

Live mode is a great Phase 6 v2 or a second project. Don't start there.

## Modules exercised

| Module                                                             | How                                                              |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [Auth](/phase-5-platform/auth-module/)                             | SSO; per-user uploads                                            |
| [RBAC](/phase-5-platform/rbac-module/)                             | Per-team scoping; only attendees can view a meeting              |
| [API Framework](/phase-5-platform/api-framework-module/)           | Upload, status polling, summary fetch endpoints                  |
| [Data Grid](/phase-5-platform/data-grid-module/)                   | List of the user's past meetings; search by participant or topic |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/)     | Summarization prompts, action-item extraction, eval              |
| [Document Rendering](/phase-5-platform/document-rendering-module/) | PDF and DOCX export of the approved summary                      |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)       | Cost, retention, eval, feedback                                  |

This archetype exercises all seven modules — the broadest module exercise of any starter. That breadth is its primary platform-stress-test value.

## Architecture sketch

```
                Browser
                   │
       ┌───────────▼──────────┐
       │     Frontend         │  React, upload + transcript viewer + summary editor
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │    API Framework     │  Auth, RBAC, multi-part upload
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │  Object Storage      │  Recording lands here, presigned URL
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │    Job Queue         │  Async transcription job
       └───┬───────────┬──────┘
           │           │
   ┌───────▼──┐    ┌───▼─────────────┐
   │ Speech-  │    │ AI Orchestration │  Summarize, extract action items
   │ to-Text  │    │ (LLM)            │
   └──────────┘    └─────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  Doc Rendering   │  PDF / DOCX output
                  └──────────────────┘
```

The async pipeline:

1. User uploads recording. API framework validates, RBAC-checks, writes to object storage.
2. Job queued for transcription.
3. Worker fetches recording, calls speech-to-text adapter (Whisper-class or cloud-native).
4. Diarization assigns speakers to segments (vendor-specific or a separate diarization pass).
5. Transcript is stored alongside the recording.
6. Summarization job kicks off — LLM with a structured-output prompt produces summary + action items.
7. User notified.
8. User reviews, edits, approves.
9. Approved summary rendered to PDF/DOCX; distributed.
10. Audit log captures every step; retention timer starts.

## Speech-to-text choice

The platform's [AI orchestration](/phase-5-platform/ai-orchestration-module/) supports vendor-neutral speech-to-text via an adapter. Realistic options:

| Provider                            | Notes                                                       |
| ----------------------------------- | ----------------------------------------------------------- |
| OpenAI Whisper (API or self-hosted) | Open weights; high quality; multi-language; can run on-prem |
| Azure AI Speech                     | Strong real-time and batch; speaker diarization             |
| AWS Transcribe                      | Batch + streaming; speaker labels; PII redaction            |
| GCP Speech-to-Text                  | Strong on rare-word recall; speaker diarization             |
| Deepgram, AssemblyAI                | Specialty providers; competitive quality                    |
| Self-hosted Whisper.cpp             | Cost-effective; data stays on-prem; harder to operate       |

For a starter, **the cloud-native option matching Phase 3's primary cloud is the easiest path**. Self-hosted Whisper is a reasonable fit for agencies with on-prem requirements.

Speech-to-text costs are usually 5–10x the LLM summarization cost for an hour of audio. Track this in the cost dashboard from day one.

## The summarization prompt

Structured output — not free-form prose. The summary is a JSON object:

```json
{
  "title": "Weekly Region 4 Inspection Coordination",
  "date": "2026-04-29",
  "attendees": ["Alice Chen", "Bob Patel", "Carla Reyes"],
  "summary_short": "...",
  "summary_long": "...",
  "key_decisions": [{ "decision": "...", "owner": "...", "rationale": "..." }],
  "action_items": [
    {
      "task": "Send the revised inspection checklist to all field staff",
      "owner": "Alice Chen",
      "due_date": "2026-05-06",
      "context": "Discussed at minute 12; tied to the Q3 audit."
    }
  ],
  "open_questions": [{ "question": "...", "raised_by": "..." }],
  "follow_up_meetings": []
}
```

Why structured:

- **Composability.** Action items go to a task system; decisions go to a decision log; the prose summary is rendered to a document. One prompt, many destinations.
- **Eval-ability.** Eval can assert the structure (e.g., every action item has an owner and a due date).
- **Editability.** The UI presents a form, not a wall of text. Users edit individual action items.

The prompt instructs the model to return the JSON conforming to the schema, with explicit guidance:

- "If a name is mentioned but you can't tell who owns the action, leave owner null."
- "Quote the speaker for each action item; do not paraphrase."
- "If something was discussed but not decided, put it in open_questions."
- "If you are uncertain about a date, leave it null rather than guessing."

The output schema is enforced. A response that doesn't validate is regenerated.

## Action-item extraction quality

The hardest part of meeting summarization is action items. Common failures:

- **Phantom action items.** The model invents tasks that nobody actually committed to.
- **Missing action items.** Real commitments are lost in the summary.
- **Wrong owner.** "Bob said he'd do X" gets attributed to Alice.
- **Wrong deadline.** "Next week" gets converted to a specific date that's wrong.
- **Cumulative burden.** Action items pile up; the recipient can't tell which are real and which are model artifacts.

Mitigations:

- **Cite the timestamp.** Each action item carries the timestamp range from the transcript where it was discussed. The user can jump to that segment.
- **Quote, don't paraphrase.** The prompt instructs verbatim quoting for the originating utterance.
- **Human approval is mandatory.** No action item leaves the system without a human approving. The system suggests; the human ratifies.
- **Eval cases.** Run summarization against a curated set of meeting transcripts where action items are known. Track recall (action items found) and precision (action items that aren't phantom).

## Eval suite

Three eval groups:

| Group                 | Tests                                                              |
| --------------------- | ------------------------------------------------------------------ |
| **Golden meetings**   | 20–30 transcripts with manually-extracted action items + decisions |
| **Sensitive content** | Test transcripts containing PII; system must redact in the summary |
| **Adversarial**       | Transcripts where one speaker tries to manipulate the system       |

Metrics:

- **Action-item recall:** of human-identified action items, what fraction did the system capture?
- **Action-item precision:** of system-extracted action items, what fraction are real?
- **Decision recall:** same shape, for decisions.
- **Owner accuracy:** when an owner is named, is it the right person?
- **Date accuracy:** when a date is extracted, is it the right one?

Threshold for the starter: ≥ 85% recall + 90% precision on action items. Below these and the system suggests too many false positives or misses too many real ones; either way, users lose trust.

## Speaker diarization

Diarization (assigning utterances to specific speakers) is harder than transcription. Realistic accuracy: 85–95% on clean recordings; lower on noisy ones, on overlapping speech, on phone-call audio.

The platform's stance:

- **Diarization labels are advisory.** The UI shows them; users can edit them. The system does not depend on perfect diarization.
- **Action items quote the speaker** — when diarization is wrong, the action-item owner is wrong, but the timestamp lets the user verify.
- **Calibrate with attendee list.** When the user submits a meeting with a known attendee list, diarization is constrained to those names + "unknown speaker."

## Retention and privacy

Meetings are sensitive. The starter takes this seriously.

- **Recording retention.** The audio is retained per the agency's records policy. For a starter, default to 90 days unless the records officer requires longer.
- **Transcript retention.** Same as the recording. The transcript is the source of truth for the summary.
- **Summary retention.** Summaries are retained as records (longer retention may apply).
- **Default classification.** Meetings are tier-2 unless the team explicitly classifies higher.
- **PII redaction in summaries.** SSNs, account numbers, etc. that surface in the transcript are redacted from the summary.
- **Per-meeting access.** Only attendees and explicitly-shared users can view a meeting's transcript and summary.
- **Records hold.** When a meeting is part of a records hold (litigation, FOIA), retention extends per legal direction.

The records officer is part of the project from Month 7. Retention rules for AI-generated summaries are a new question for most records programs; resolve before launch.

## Consent and notification

The agency's policy decides:

- **Recording consent.** Required by jurisdiction; the meeting platform usually handles this.
- **AI processing consent.** Whether attendees need to be informed that an AI will summarize.
- **Joining bot disclosure.** If a bot joins (live mode), it announces itself.
- **Opt-out.** A meeting can be marked "do not summarize" — recorded but excluded from the AI pipeline.

For a starter — upload mode — the uploader has implicitly consented to share the meeting with the system. Attendees may not have consented to AI summarization. The agency's policy must address this; many agencies handle it with a calendar invite footer ("This meeting may be summarized by an AI tool").

## Cost ceiling

A typical meeting (45 min audio):

- **Transcription:** ~$0.30–$0.60 (cloud-native rates; lower with self-hosted Whisper).
- **Summarization:** ~$0.05–$0.20 (mid-tier model with structured output).
- **Total:** ~$0.50/meeting at the high end.

At 100 meetings/day across a pilot agency: $50/day, ~$15K/year. Manageable. The cost dashboard surfaces per-team and per-user totals; per-team budgets prevent runaway usage.

## Build sprints (Months 7–10)

| Sprint           | Output                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Month 7 (4 wks)  | Selection memo signed; consent / retention policy resolved; eval-set transcripts collected  |
| Month 8 (4 wks)  | Upload + transcription pipeline working; first summaries generated; eval at draft threshold |
| Month 9 (4 wks)  | Summary editor UI; PDF/DOCX export; UAT with two pilot teams                                |
| Month 10 (4 wks) | Production readiness: retention, RBAC scoping, on-call rehearsed                            |

## What launching looks like

- **Day 1:** Two pilot teams uploading their meetings. Approval-required summaries.
- **Week 1:** Quality + cost monitoring; eval of action-item recall on real meetings.
- **Week 2:** First wave of feedback; prompt iterations; UI refinements.
- **Month 1:** Open to a third team; adjust based on usage patterns.
- **Month 2:** If quality + cost are healthy, expand to division-wide.
- **Month 3+:** Public agency-wide launch decision.

## Common meeting-transcriber failures

- **Recording policy mismatch.** The starter ships before the agency's policy has caught up; an attendee complains; the project gets paused. Resolve policy first.
- **Phantom action items.** The summary suggests tasks nobody committed to; recipients lose trust. Tighten the prompt; add eval cases; require human approval.
- **Speaker confusion.** "Bob owes the document" was actually said by Alice and meant for Bob. Diarization quality matters; the UI must let users edit.
- **Long meeting handling.** A 3-hour all-hands generates a summary that's too long to act on. Implement chunked summarization (per-topic summaries) for long meetings.
- **Sensitive-meeting leakage.** A personnel discussion is uploaded by mistake; the summary leaks. Build the "do-not-summarize" flag and the per-meeting RBAC.
- **Auto-distribution gone wrong.** The summary is auto-emailed to attendees including a sensitive comment one attendee didn't realize the model captured. Default to approval-required, not auto-distribute.

## Plain-English Guide to Meeting Transcriber Terms

- **Speech-to-text (STT) / ASR.** Converting spoken audio to written text. Whisper is a common open model; major clouds offer it as a service.
- **Diarization.** Assigning each utterance to a specific speaker. "Speaker 1 said X; Speaker 2 said Y."
- **Structured output.** The model returns JSON conforming to a schema, not free-form prose. Easier to compose downstream.
- **Action item.** A task someone agreed to do, with an owner and (ideally) a due date.
- **Records hold.** A legal direction to preserve records for litigation or investigation; overrides normal retention.
- **Approval-required summary.** A summary is generated by AI but does not become "official" until a human approves it.

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — the five archetypes
- [Selection Guide](/phase-6-starter-projects/selection-guide/) — when to pick this archetype
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) — STT adapters and summarization
- [Document Rendering Module](/phase-5-platform/document-rendering-module/) — PDF / DOCX export of summaries
- [Risk Classification Policy (Phase 1)](/phase-1-governance/risk-classification/) — informs the meeting tier and retention
