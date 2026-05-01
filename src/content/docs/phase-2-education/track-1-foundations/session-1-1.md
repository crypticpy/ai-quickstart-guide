---
title: "Session 1.1 — What AI Actually Is"
description: Plain-language definitions, three live AI demonstrations, and the two things AI cannot do.
sidebar:
  order: 1
---

The first session of Track 1 sets the tone for the entire program. The goal is not to make staff into AI experts; it is to give them a shared vocabulary, a calibrated sense of what AI can do, and a calibrated sense of what it cannot.

## Learning objectives

By the end of this session, every attendee can:

1. Distinguish AI, machine learning, and generative AI in a single sentence each.
2. Identify three real government AI use cases by category (drafting, summarization, search, translation, etc.).
3. Name two things AI cannot reliably do.

## Audience

All staff. No prerequisites. Mixed technical and non-technical groups.

## Materials

- AI deck source markdown: [Download the deck source](/deck-sources/phase-2/track-1-foundations/session-1-1-what-ai-actually-is.md). Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.
- Three working AI tools accessible during the session: a chatbot, a summarization tool, an image generator (or OCR/document-reader if image generation is restricted by AUP).
- Three printed example outputs (one good, one mediocre, one wrong) for the comparison activity.
- Sample text for the live demo: a one-page public document (board minutes, public report, or policy excerpt). **No staff PII or case files.**

## 30-minute presentation

Topics, in order:

1. **The vocabulary, in one slide each.** AI is a category of techniques that mimic some kind of intelligent behavior. ML is the subset of AI where systems learn from examples instead of being explicitly programmed. Generative AI is ML that produces new content (text, images, code, audio) instead of just classifying or scoring existing content. Most "AI" in the news today is generative AI. Don't go deeper than that.
2. **Three real categories of tool.** Chatbots and writing assistants. Summarization and extraction tools. Search and retrieval tools (RAG). Use one slide each, with a one-sentence description and an example deployment from another government agency.
3. **What's underneath.** A large language model (LLM) is a system trained on enormous amounts of text that learned the statistical patterns of language. When you ask it a question, it predicts what comes next, one piece at a time. It does not know things; it predicts plausible-sounding things. This is the most important slide in the deck — every misuse of AI traces back to forgetting it.
4. **The two things AI cannot reliably do.** First, AI cannot tell you whether something is true. It can produce confident, well-formed text that is wrong. Second, AI cannot make decisions for which it lacks context — including the context only the people in this room have about your community, your policies, and the people you serve. This is a rule, not an opinion.
5. **Where the agency is going with this.** One slide on the program — the 12-month roadmap, who's involved, what's already approved, what's coming.

Take questions throughout. The presentation is conversational, not a lecture.

## 30-minute live demo

Three tools, ten minutes each. The same task in each: process the one-page public document the facilitator brought.

### Demo 1 — Chatbot (10 min)

- "Summarize this document in three bullet points." (paste the document)
- Show the result. Read it aloud. Ask the room: is anything wrong?
- "Now summarize it in one sentence for a fifth grader."
- Show the result. Note how the output changes with the framing.
- **Demonstrate the failure mode.** Ask: "Who attended the meeting on March 14th?" — choose a date the document doesn't mention. Watch the chatbot make something up. Stop. Name it: "It just hallucinated. The document doesn't say anything about March 14th. The model made it sound plausible. This is the most important thing to remember."

### Demo 2 — Summarization tool (10 min)

If a dedicated summarization tool is on the approved list (e.g., a tool that does extractive summarization rather than generative), demo it on the same document. Compare: more conservative, less fluent, sometimes more accurate. Different tradeoff.

If no separate tool is approved, use the same chatbot with a different prompt: "Summarize this document using only sentences that appear in the original." Note the change in tone — sometimes useful, sometimes too rigid.

### Demo 3 — Image generator OR OCR (10 min)

If image generation is approved: prompt for a simple, public-facing image (a generic city skyline, a stylized logo). Demonstrate that subject control is hard, and that prompt engineering matters. Avoid prompts that depict people, since that introduces likeness, race, and bias issues this session does not have time to address.

If image generation is restricted: use an OCR / document-reader tool to extract structured data from a scanned form. Show how the tool handles a clean document and how it struggles with a noisy or handwritten one.

## 30-minute hands-on activity

Attendees split into pairs. Each pair has 25 minutes plus 5 to share.

- Each attendee picks one of three guided prompts from the activity sheet (drafting, summarizing, searching).
- They run their prompt with their partner present.
- They compare the output to a printed "expected output" and rate it: useful as-is, useful with edits, not useful.
- They discuss with their partner: what would you change about your prompt?

The goal is not to produce a perfect output. The goal is to feel what it's like to direct an AI tool — and to notice that the prompt matters more than the model.

## Closing 5 minutes

Circle the room. Each attendee names one thing they will try in the next two weeks — a specific task with a specific tool. The facilitator captures the list on a flip-chart or shared document.

This is the behavioral commitment. Skipping it forfeits the Kirkpatrick Level 3 measurement.

## Common questions and how to handle them

- **"Will AI take my job?"** Refer to the leadership commitment letter. Then: "We'll go deeper on this in Session 1.3, with a role-by-role map. The short answer is the agency has committed in writing that AI will not be the cause of layoffs during this program." Don't try to fully address it here.
- **"What about deepfakes / disinformation?"** Real concern. The session is not the place to address it; the AUP and Phase 1 governance pages are. Note that the agency is taking it seriously and point to the Risk Classification page.
- **"Why can't I just use [consumer chatbot] for work?"** Refer to the AUP. Specifically: data leaving the agency, vendor data-use clauses, and what's on the Approved AI Tools List. Don't moralize; explain the policy.
- **"This seems like a lot of hype."** Acknowledge. "It is partly hype. The reason we're investing time is the categories of tool we just demoed are the ones that are actually working in real agencies right now. We're being deliberate about which uses we adopt. That's what the rest of the program is about."

## Async fallback

- 18-minute recorded video covering the presentation portion.
- 12-minute recorded demo (one tool only — chatbot).
- Guided worksheet asking attendees to run three prompts on their own and rate the outputs.
- 5-question self-assessment quiz.
- Discussion forum prompt: _Share one prompt you ran and what you got back. What surprised you?_

## Evaluation

- **Level 1.** Post-session 5-question survey. Target 4.2/5.0 average across the four sessions.
- **Level 2.** Quiz embedded in Session 1.4 covers Session 1.1 vocabulary.
- **Level 3.** Closing share-out commitments tracked. Two-week follow-up email asks: did you try the thing you committed to? Target ≥60% yes.

## What to leave out

- A history of AI from 1956 to today.
- Architectural details of transformers.
- A taxonomy of every AI subfield.
- Specific predictions about AGI timelines.

These are interesting. They are not what staff need from the first 90 minutes.

## Related

- [Track 1 — overview](/phase-2-education/track-1-foundations/) — where this session fits
- [Glossary of AI Terms](/getting-started/glossary/) — for facilitator reference and async attendees
- [AUP](/phase-1-governance/acceptable-use-policy/) — the policy attendees should know exists
- [Session 1.2 — AI in Government](/phase-2-education/track-1-foundations/session-1-2/) — the next session
