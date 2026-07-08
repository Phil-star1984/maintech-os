import { useState } from "react";
import { downloadIcs } from "../utils/calendar";
import { copyToClipboard, formatShareText } from "../utils/eventUtils";
import { getEventImage } from "../utils/eventImages";

const topicClass = (topic) => {
  const key = topic.toLowerCase().replace(/\s+/g, "-");
  return `event-card__chip--${key}`;
};

const formatBadge = (event) => {
  if (event.topics?.some((t) => /hackathon/i.test(t))) return "Hackathon";
  if (event.topics?.some((t) => /meetup|community/i.test(t))) return "Meetup";
  if (event.topics?.some((t) => /ai|ki/i.test(t))) return "AI Event";
  return event.format === "Online" ? "Online" : "Event";
};

export default function EventCard({
  event,
  saved = false,
  preview = false,
  past = false,
  onToggleSave,
  onOpenDetail,
  onCopyFeedback,
}) {
  const [copyLabel, setCopyLabel] = useState("Share");
  const [imgError, setImgError] = useState(false);

  const imageSrc = getEventImage(event);
  const badge = formatBadge(event);

  const handleCopy = async (e) => {
    e.stopPropagation();
    await copyToClipboard(formatShareText(event));
    setCopyLabel("Copied");
    onCopyFeedback?.("Share text copied");
    setTimeout(() => setCopyLabel("Share"), 2000);
  };

  const cardProps = preview
    ? { "aria-label": `Vorschau: ${event.title}` }
    : {
        onClick: () => onOpenDetail?.(event),
        onKeyDown: (e) => e.key === "Enter" && onOpenDetail?.(event),
        tabIndex: 0,
        role: "button",
        "aria-label": `${event.title} — Details öffnen`,
      };

  return (
    <article
      className={`event-card${preview ? " event-card--preview" : ""}${past ? " event-card--past" : ""}`}
      {...cardProps}
    >
      <div className="event-card__banner">
        {!imgError && (
          <img
            className="event-card__image"
            src={imageSrc}
            alt=""
            loading={preview ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
        <div className="event-card__banner-overlay" aria-hidden="true" />
        <span className="event-card__format mono">{past ? "Archiv" : badge}</span>
        {!preview && (
          <button
            type="button"
            className={`event-card__bookmark ${saved ? "event-card__bookmark--saved" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(event.id);
            }}
            aria-pressed={saved}
            aria-label={saved ? "Event entfernen" : "Event speichern"}
          >
            {saved ? "★" : "☆"}
          </button>
        )}
        {event.price === "Free" && (
          <span className="event-card__badge">Free</span>
        )}
      </div>

      <div className="event-card__body">
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__when mono">
          {event.dateLabel} · {event.city}
        </p>
        <p className="event-card__desc">{event.description}</p>

        <div className="event-card__chips">
          {(event.topics ?? []).slice(0, 4).map((topic) => (
            <span key={topic} className={`event-card__chip mono ${topicClass(topic)}`}>
              {topic}
            </span>
          ))}
          {event.price === "Free" && (
            <span className="event-card__chip mono event-card__chip--free">Free</span>
          )}
        </div>

        {!preview && (
          <div className="event-card__actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="card-action card-action--primary" onClick={() => onOpenDetail?.(event)}>
              Details →
            </button>
            <button type="button" className="card-action" onClick={() => downloadIcs(event)}>
              Calendar
            </button>
            <button type="button" className="card-action" onClick={handleCopy}>
              {copyLabel}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
