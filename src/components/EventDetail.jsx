import { useEffect, useRef } from "react";
import { downloadIcs } from "../utils/calendar";
import {
  copyToClipboard,
  formatEventJson,
  formatJsonLd,
  formatSocialPost,
} from "../utils/eventUtils";

import { getEventImage } from "../utils/eventImages";

export default function EventDetail({ event, onClose, onCopyFeedback }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleCopy = async (text, message) => {
    await copyToClipboard(text);
    onCopyFeedback?.(message);
  };

  return (
    <div
      className="modal-backdrop"
      ref={dialogRef}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-detail-title"
    >
      <div className="modal">
        <div className="modal__hero">
          <img
            className="modal__hero-img"
            src={getEventImage(event)}
            alt=""
          />
          <div className="modal__hero-overlay" aria-hidden="true" />
        </div>
        <header className="modal__header">
          <div>
            <p className="mono modal__cmd">&gt; inspect node --id {event.id}</p>
            <h2 id="event-detail-title">{event.title}</h2>
          </div>
          <button
            type="button"
            className="btn btn--ghost modal__close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close details"
          >
            ✕
          </button>
        </header>

        <div className="modal__body">
          <dl className="detail-grid">
            <div>
              <dt>Date</dt>
              <dd>{event.dateLabel}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{event.timeLabel}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>{event.city}</dd>
            </div>
            <div>
              <dt>Format</dt>
              <dd>{event.format}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>{event.price}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{event.level}</dd>
            </div>
            <div>
              <dt>Organizer</dt>
              <dd>{event.organizer}</dd>
            </div>
            <div className="detail-grid__full">
              <dt>Audience</dt>
              <dd>{(event.audience ?? []).join(", ")}</dd>
            </div>
            <div className="detail-grid__full">
              <dt>Description</dt>
              <dd>{event.description}</dd>
            </div>
            <div className="detail-grid__full">
              <dt>Why go?</dt>
              <dd>{event.whyGo}</dd>
            </div>
            <div className="detail-grid__full">
              <dt>Source URL</dt>
              <dd>
                <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {event.sourceUrl}
                </a>
              </dd>
            </div>
          </dl>

          <div className="code-block">
            <div className="code-block__header">
              <span className="mono">event.json</span>
            </div>
            <pre><code>{formatEventJson(event)}</code></pre>
          </div>

          <div className="code-block">
            <div className="code-block__header">
              <span className="mono">json-ld preview</span>
            </div>
            <pre><code>{formatJsonLd(event)}</code></pre>
          </div>
        </div>

        <footer className="modal__footer">
          <button type="button" className="btn btn--primary" onClick={() => downloadIcs(event)}>
            Add to Calendar
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => handleCopy(formatEventJson(event), "JSON copied")}
          >
            Copy JSON
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => handleCopy(formatSocialPost(event), "Social post copied")}
          >
            Copy Social Post
          </button>
        </footer>
      </div>
    </div>
  );
}
