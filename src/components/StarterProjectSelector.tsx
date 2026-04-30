/** @jsxImportSource preact */
import { useMemo, useState } from "preact/hooks";

type Archetype =
  | "RAG Chatbot"
  | "Meeting Transcriber"
  | "Document Intelligence"
  | "Workflow Automation"
  | "NL Data Dashboard";

const LINKS: Record<Archetype, string> = {
  "RAG Chatbot": "/phase-6-starter-projects/archetype-rag-chatbot/",
  "Meeting Transcriber": "/phase-6-starter-projects/archetype-meeting-transcriber/",
  "Document Intelligence": "/phase-6-starter-projects/archetype-document-intelligence/",
  "Workflow Automation": "/phase-6-starter-projects/archetype-workflow-automation/",
  "NL Data Dashboard": "/phase-6-starter-projects/archetype-data-dashboard/",
};

interface Scores {
  corpus: boolean;
  meetings: boolean;
  intake: boolean;
  data: boolean;
  citations: boolean;
  lowRisk: boolean;
}

const EMPTY: Scores = {
  corpus: false,
  meetings: false,
  intake: false,
  data: false,
  citations: false,
  lowRisk: true,
};

export default function StarterProjectSelector() {
  const [scores, setScores] = useState<Scores>(EMPTY);

  const recommendation = useMemo(() => {
    const points: Record<Archetype, number> = {
      "RAG Chatbot": 0,
      "Meeting Transcriber": 0,
      "Document Intelligence": 0,
      "Workflow Automation": 0,
      "NL Data Dashboard": 0,
    };

    if (scores.corpus) points["RAG Chatbot"] += 3;
    if (scores.corpus && scores.citations) points["Document Intelligence"] += 4;
    if (scores.meetings) points["Meeting Transcriber"] += 4;
    if (scores.intake) points["Workflow Automation"] += 4;
    if (scores.data) points["NL Data Dashboard"] += 4;
    if (scores.lowRisk) {
      points["RAG Chatbot"] += 1;
      points["Meeting Transcriber"] += 1;
    } else {
      points["Workflow Automation"] -= 2;
      points["NL Data Dashboard"] -= 1;
    }

    const sorted = Object.entries(points).sort((a, b) => b[1] - a[1]);
    return sorted[0] as [Archetype, number];
  }, [scores]);

  const [name, score] = recommendation;
  const reason =
    score <= 0
      ? "No option is starter-ready yet. Fix audience, data, or governance readiness first."
      : `${name} is the best fit based on the signals you selected. Confirm with the scoring rubric before committing.`;

  const toggle = (key: keyof Scores) =>
    setScores((current) => ({ ...current, [key]: !current[key] }));

  return (
    <section class="aqg-tier">
      <fieldset class="aqg-tier__options">
        <legend>Starter signals</legend>
        {[
          ["corpus", "We have a clean policy / FAQ / procedure document corpus."],
          ["meetings", "Meeting summaries and action items are a visible pain point."],
          ["intake", "We have a high-volume intake, routing, or classification queue."],
          ["data", "Leaders need answers from structured operational data."],
          ["citations", "Users need citations and multi-document synthesis."],
          ["lowRisk", "The failure mode is observable, reversible, and non-binding."],
        ].map(([key, label]) => (
          <label>
            <input
              id={`aqg-starter-signal-${key}`}
              name={`aqg-starter-signal-${key}`}
              type="checkbox"
              checked={scores[key as keyof Scores]}
              onChange={() => toggle(key as keyof Scores)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <div class="aqg-tier__result">
        <h3>{score <= 0 ? "No starter-ready fit" : name}</h3>
        <p>{reason}</p>
        {score > 0 && (
          <p>
            <a href={LINKS[name]}>Open the {name} architecture brief</a>
          </p>
        )}
      </div>
    </section>
  );
}
