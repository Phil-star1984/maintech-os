import { useCallback, useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import StatsStrip from "./components/StatsStrip";
import EventTimeline from "./components/EventTimeline";
import EventDetail from "./components/EventDetail";
import RandomEvent from "./components/RandomEvent";
import EventNormalizer from "./components/EventNormalizer";
import Footer from "./components/Footer";
import NewsletterSection from "./components/NewsletterSection";
import ApiSection from "./components/ApiSection";
import RadarPage from "./components/RadarPage";
import { fallbackEvents } from "./data/fallbackEvents";
import {
  filterEvents,
  getUpcomingEvents,
  getSavedIds,
  getStats,
  toggleSaved,
} from "./utils/eventUtils";

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(["all"]);
  const [savedIds, setSavedIds] = useState(() => getSavedIds());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activePage, setActivePage] = useState(() =>
    window.location.hash === "#radar" ? "radar" : "home"
  );
  const [toast, setToast] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/events.json");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!cancelled) setEvents(data.events ?? []);
      } catch {
        if (!cancelled) setEvents(fallbackEvents);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = filterEvents(events, activeFilters, searchQuery);
  const upcomingEvents = getUpcomingEvents(events);
  const stats = getStats(events, savedIds.length);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }, []);

  const handleToggleFilter = (filterId) => {
    if (filterId === "all") {
      setActiveFilters(["all"]);
      return;
    }
    setActiveFilters((prev) => {
      const withoutAll = prev.filter((f) => f !== "all");
      if (withoutAll.includes(filterId)) {
        const next = withoutAll.filter((f) => f !== filterId);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, filterId];
    });
  };

  const handleToggleSave = (id) => {
    const next = toggleSaved(id);
    setSavedIds(next);
  };

  const scrollTo = (id) => {
    setActivePage("home");
    window.history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const showHome = () => {
    setActivePage("home");
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showRadar = () => {
    setActivePage("radar");
    window.history.replaceState(null, "", "#radar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRandom = () => {
    scrollTo("random-node");
    setTimeout(() => {
      document.querySelector(".random-section .btn--primary")?.click();
    }, 400);
  };

  return (
    <div className="app">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onHome={showHome}
        onExplore={() => scrollTo("events")}
        onRandom={handleRandom}
        onNormalize={() => scrollTo("event-normalizer")}
        onNewsletter={() => scrollTo("newsletter")}
        onApi={() => scrollTo("api")}
        onRadar={showRadar}
        onFeedback={showToast}
      />

      {activePage === "radar" ? (
        <>
          <RadarPage
            events={events.length ? upcomingEvents : getUpcomingEvents(fallbackEvents)}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onOpenDetail={setSelectedEvent}
            onBack={showHome}
            onFeedback={showToast}
          />
          <div className="page page--footer">
            <Footer />
          </div>
        </>
      ) : (
        <>
          <Header onExplore={() => scrollTo("events")} onRandom={handleRandom} onRadar={showRadar} />

          <div className="page">
            <StatsStrip stats={stats} />

            <main className="main">
              <section id="events" className="events-section">
                <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

                {loading ? (
                  <p className="loading mono" role="status">&gt; loading events.json…</p>
                ) : (
                  <EventTimeline
                    events={filteredEvents}
                    totalCount={events.length}
                    activeFilters={activeFilters}
                    searchQuery={searchQuery}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    onOpenDetail={setSelectedEvent}
                    onCopyFeedback={showToast}
                  />
                )}
              </section>
            </main>
          </div>

          <ApiSection onFeedback={showToast} />

          <div className="page">
            <main className="main">
              <RandomEvent events={upcomingEvents} onOpenDetail={setSelectedEvent} />
              <EventNormalizer onCopyFeedback={showToast} />
            </main>
          </div>

          <NewsletterSection onFeedback={showToast} />

          <div className="page page--footer">
            <Footer />
          </div>
        </>
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCopyFeedback={showToast}
        />
      )}

      {toast && (
        <div className="toast mono" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
