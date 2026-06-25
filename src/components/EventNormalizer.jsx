import { useState } from "react";
import EventCard from "./EventCard";
import {
  copyToClipboard,
  formatEventJson,
  formatSocialPost,
  normalizeEventText,
} from "../utils/eventUtils";

export default function EventNormalizer({ onCopyFeedback }) {
  const [rawText, setRawText] = useState("");
  const [normalized, setNormalized] = useState(null);
  const [copyJsonLabel, setCopyJsonLabel] = useState("Copy JSON");
  const [copySocialLabel, setCopySocialLabel] = useState("Copy Social Post");

  const handleNormalize = () => {
    const result = normalizeEventText(rawText);
    setNormalized(result);
  };

  const handleCopyJson = async () => {
    if (!normalized) return;
    await copyToClipboard(formatEventJson(normalized));
    setCopyJsonLabel("Copied");
    onCopyFeedback?.("JSON copied");
    setTimeout(() => setCopyJsonLabel("Copy JSON"), 2000);
  };

  const handleCopySocial = async () => {
    if (!normalized) return;
    await copyToClipboard(formatSocialPost(normalized));
    setCopySocialLabel("Copied");
    onCopyFeedback?.("Social post copied");
    setTimeout(() => setCopySocialLabel("Copy Social Post"), 2000);
  };

  return (
    <section className="normalizer" id="event-normalizer" aria-label="Event normalizer">
      <div className="section-header">
        <h2 className="section-title mono">&gt; event_normalizer</h2>
        <p className="section-desc">
          Paste raw event text. MainTech OS converts it into a clean community event card.
        </p>
        <p className="normalizer__hint mono">
          MVP heuristics — later replaceable with AI agents for full extraction.
        </p>
      </div>

      <label htmlFor="raw-event-text" className="mono label">
        raw_input.txt
      </label>
      <textarea
        id="raw-event-text"
        className="normalizer__textarea mono"
        rows={6}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder={`AI Meetup Würzburg\n25.06.2026 · 18:30–21:00\nKostenlos, Einsteiger willkommen\nTalks zu LLMs und lokaler AI-Community...`}
      />

      <button type="button" className="btn btn--primary" onClick={handleNormalize}>
        Normalize Event
      </button>

      {normalized && (
        <div className="normalizer__result">
          <div className="normalizer__preview-header">
            <h3 className="mono">&gt; preview_card</h3>
            <span className="normalizer__preview-status mono">
              <span className="normalizer__preview-dot" aria-hidden="true" />
              live preview
            </span>
          </div>

          <div className="normalizer__preview-slot">
            <EventCard event={normalized} preview />
          </div>

          <div className="normalizer__actions">
            <button type="button" className="btn btn--ghost" onClick={handleCopyJson}>
              {copyJsonLabel}
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleCopySocial}>
              {copySocialLabel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
