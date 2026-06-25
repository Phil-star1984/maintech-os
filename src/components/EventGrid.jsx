import EventCard from "./EventCard";

export default function EventGrid({
  events,
  totalCount,
  savedIds,
  onToggleSave,
  onOpenDetail,
  onCopyFeedback,
}) {
  if (!events.length) {
    return (
      <div className="empty-state">
        <p className="mono">&gt; no matches found</p>
        <p>Adjust filters or search query.</p>
      </div>
    );
  }

  return (
    <>
      <div className="results-header">
        <h2 className="results-header__title">
          Ergebnisse
          <span className="results-header__count mono">({events.length}{totalCount !== events.length ? ` / ${totalCount}` : ""})</span>
        </h2>
      </div>
      <section className="event-grid" aria-label="Event list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            saved={savedIds.includes(event.id)}
            onToggleSave={onToggleSave}
            onOpenDetail={onOpenDetail}
            onCopyFeedback={onCopyFeedback}
          />
        ))}
      </section>
    </>
  );
}
