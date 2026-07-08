import { useEffect, useMemo, useState } from "react";
import EventGrid from "./EventGrid";
import {
  hasActiveDiscoveryQuery,
  splitEventsForDisplay,
  UPCOMING_WINDOW_WEEKS,
} from "../utils/eventUtils";

export default function EventTimeline({
  events,
  totalCount,
  activeFilters,
  searchQuery,
  savedIds,
  onToggleSave,
  onOpenDetail,
  onCopyFeedback,
}) {
  const discoveryActive = hasActiveDiscoveryQuery(activeFilters, searchQuery);
  const { upcoming, past, later } = useMemo(
    () =>
      splitEventsForDisplay(events, {
        ignoreWindow: discoveryActive,
      }),
    [events, discoveryActive]
  );

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);

  useEffect(() => {
    if (discoveryActive && past.length && !upcoming.length && !later.length) {
      setArchiveOpen(true);
    }
  }, [discoveryActive, past.length, upcoming.length, later.length]);

  if (!events.length) {
    return (
      <div className="empty-state">
        <p className="mono">&gt; no matches found</p>
        <p>Adjust filters or search query.</p>
      </div>
    );
  }

  const windowHint = discoveryActive
    ? "Alle Treffer"
    : `Nächste ${UPCOMING_WINDOW_WEEKS} Wochen`;

  return (
    <div className="event-timeline">
      {upcoming.length > 0 ? (
        <EventGrid
          events={upcoming}
          totalCount={totalCount}
          title="Kommende Events"
          subtitle={windowHint}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
          onCopyFeedback={onCopyFeedback}
        />
      ) : (
        <div className="timeline-empty">
          <p className="mono">&gt; no upcoming events in window</p>
          <p>
            {discoveryActive
              ? "Keine kommenden Events für diese Suche."
              : `Keine Events in den nächsten ${UPCOMING_WINDOW_WEEKS} Wochen.`}
            {past.length > 0 && !archiveOpen && " Schau im Archiv nach."}
          </p>
        </div>
      )}

      {later.length > 0 && (
        <section className="event-timeline__section">
          <button
            type="button"
            className="event-timeline__toggle"
            onClick={() => setLaterOpen((open) => !open)}
            aria-expanded={laterOpen}
          >
            <span className="event-timeline__toggle-label">
              Später geplant
              <span className="mono event-timeline__toggle-count">({later.length})</span>
            </span>
            <span className="mono event-timeline__toggle-icon" aria-hidden="true">
              {laterOpen ? "−" : "+"}
            </span>
          </button>
          {laterOpen && (
            <EventGrid
              events={later}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
              onOpenDetail={onOpenDetail}
              onCopyFeedback={onCopyFeedback}
              variant="later"
              compactHeader
            />
          )}
        </section>
      )}

      {past.length > 0 && (
        <section className="event-timeline__section event-timeline__section--archive">
          <button
            type="button"
            className="event-timeline__toggle"
            onClick={() => setArchiveOpen((open) => !open)}
            aria-expanded={archiveOpen}
          >
            <span className="event-timeline__toggle-label">
              Archiv
              <span className="mono event-timeline__toggle-count">({past.length})</span>
            </span>
            <span className="mono event-timeline__toggle-hint">Vergangene Events</span>
            <span className="mono event-timeline__toggle-icon" aria-hidden="true">
              {archiveOpen ? "−" : "+"}
            </span>
          </button>
          {archiveOpen && (
            <EventGrid
              events={past}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
              onOpenDetail={onOpenDetail}
              onCopyFeedback={onCopyFeedback}
              variant="archive"
              compactHeader
            />
          )}
        </section>
      )}
    </div>
  );
}
