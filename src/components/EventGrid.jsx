import EventCard from "./EventCard";

export default function EventGrid({
  events,
  totalCount,
  title = "Ergebnisse",
  subtitle,
  variant = "default",
  compactHeader = false,
  savedIds,
  onToggleSave,
  onOpenDetail,
  onCopyFeedback,
}) {
  if (!events.length) return null;

  const isArchive = variant === "archive";

  return (
    <>
      {!compactHeader && (
        <div className="results-header">
          <div>
            <h2 className="results-header__title">
              {title}
              <span className="results-header__count mono">
                ({events.length}
                {totalCount != null && totalCount !== events.length
                  ? ` / ${totalCount}`
                  : ""}
                )
              </span>
            </h2>
            {subtitle && (
              <p className="results-header__subtitle mono">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <section
        className={`event-grid${isArchive ? " event-grid--archive" : ""}`}
        aria-label={isArchive ? "Vergangene Events" : "Event list"}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            saved={savedIds.includes(event.id)}
            past={isArchive}
            onToggleSave={onToggleSave}
            onOpenDetail={onOpenDetail}
            onCopyFeedback={onCopyFeedback}
          />
        ))}
      </section>
    </>
  );
}
