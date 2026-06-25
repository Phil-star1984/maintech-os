import { useMemo, useState } from "react";
import EventCard from "./EventCard";

const RADAR_STORAGE_KEY = "maintech-radar-profile";

const topicOptions = ["AI", "Coding", "Startup", "Design", "Data", "Community", "Hackathon"];
const formatOptions = ["In person", "Online", "Hybrid"];
const radiusOptions = ["Würzburg", "Mainfranken", "+50 km", "Online first"];

const defaultProfile = {
  topics: ["AI", "Startup"],
  formats: ["In person"],
  radius: "Mainfranken",
  digest: "weekly",
};

const loadProfile = () => {
  try {
    const stored = window.localStorage.getItem(RADAR_STORAGE_KEY);
    return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

const toggleValue = (values, value) => {
  if (values.includes(value)) return values.filter((item) => item !== value);
  return [...values, value];
};

const getMatches = (events, profile) => {
  const scored = events.map((event) => {
    const topicHits = event.topics?.filter((topic) => profile.topics.includes(topic)).length ?? 0;
    const formatHit = profile.formats.includes(event.format) ? 1 : 0;
    const cityHit = profile.radius === "Würzburg" ? event.city === "Würzburg" : true;
    const score = topicHits * 2 + formatHit + (cityHit ? 1 : 0);
    return { event, score, topicHits };
  });

  return scored
    .filter(({ score, topicHits, event }) => score > 0 && topicHits > 0 && event.status !== "past")
    .sort((a, b) => b.score - a.score || a.event.startsAt.localeCompare(b.event.startsAt))
    .slice(0, 6)
    .map(({ event }) => event);
};

export default function RadarPage({
  events,
  savedIds = [],
  onToggleSave,
  onOpenDetail,
  onBack,
  onFeedback,
}) {
  const [profile, setProfile] = useState(loadProfile);
  const matches = useMemo(() => getMatches(events, profile), [events, profile]);
  const recommendedEvents = matches.length ? matches : events.slice(0, 6);

  const updateProfile = (nextProfile) => {
    setProfile(nextProfile);
    window.localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(nextProfile));
  };

  const handleTopic = (topic) => {
    updateProfile({ ...profile, topics: toggleValue(profile.topics, topic) });
  };

  const handleFormat = (format) => {
    updateProfile({ ...profile, formats: toggleValue(profile.formats, format) });
  };

  const handleSave = () => {
    window.localStorage.setItem(RADAR_STORAGE_KEY, JSON.stringify(profile));
    onFeedback?.("MainTech Radar gespeichert — Empfehlungen werden personalisiert");
  };

  return (
    <main className="radar-page" aria-labelledby="radar-title">
      <section className="radar-hero">
        <div className="radar-hero__content">
          <p className="radar-eyebrow mono">maintech radar // private beta</p>
          <h1 id="radar-title" className="radar-hero__title">
            Dein persönlicher Event-Radar für Mainfranken.
          </h1>
          <p className="radar-hero__sub">
            Wähle kurz deine Interessen. Danach zeigt MainTech OS dieselben Event-Karten wie auf
            der Startseite — nur vorsortiert nach dem, was für dich wirklich relevant ist.
          </p>
          <div className="radar-hero__actions">
            <button type="button" className="hero-cd__btn hero-cd__btn--primary" onClick={handleSave}>
              Radar aktivieren <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="hero-cd__btn hero-cd__btn--ghost" onClick={onBack}>
              Zurück zu allen Events
            </button>
          </div>
        </div>
        <aside className="radar-terminal" aria-label="Radar Vorschau">
          <p className="radar-terminal__line mono">$ maintech radar --for-you</p>
          <p className="radar-terminal__big">{recommendedEvents.length}</p>
          <p className="radar-terminal__label mono">Event-Karten im persönlichen Feed</p>
          <div className="radar-terminal__chips">
            {profile.topics.slice(0, 4).map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </aside>
      </section>

      <section className="radar-grid" aria-label="Radar Einstellungen und Empfehlungen">
        <div className="radar-panel radar-panel--setup">
          <div className="radar-panel__head">
            <p className="radar-step mono">01</p>
            <h2>Interessen wählen</h2>
          </div>
          <p className="radar-panel__copy">
            Das ist der Onboarding-Moment: Der User sagt, was er sehen will — und bekommt danach
            einen personalisierten Feed statt einer generischen Liste.
          </p>
          <div className="radar-options">
            {topicOptions.map((topic) => (
              <button
                key={topic}
                type="button"
                className={`radar-chip ${profile.topics.includes(topic) ? "radar-chip--active" : ""}`}
                onClick={() => handleTopic(topic)}
                aria-pressed={profile.topics.includes(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="radar-fieldset">
            <p className="radar-label mono">format</p>
            <div className="radar-options radar-options--compact">
              {formatOptions.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`radar-chip ${profile.formats.includes(format) ? "radar-chip--active" : ""}`}
                  onClick={() => handleFormat(format)}
                  aria-pressed={profile.formats.includes(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="radar-fieldset">
            <p className="radar-label mono">radius</p>
            <div className="radar-options radar-options--compact">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  type="button"
                  className={`radar-chip ${profile.radius === radius ? "radar-chip--active" : ""}`}
                  onClick={() => updateProfile({ ...profile, radius })}
                  aria-pressed={profile.radius === radius}
                >
                  {radius}
                </button>
              ))}
            </div>
          </div>

          <label className="radar-select-label">
            <span className="mono">digest</span>
            <select
              value={profile.digest}
              onChange={(e) => updateProfile({ ...profile, digest: e.target.value })}
            >
              <option value="weekly">Wöchentliches Briefing</option>
              <option value="instant">Sofort bei Top-Match</option>
              <option value="friday">Freitag: Was geht am Wochenende?</option>
            </select>
          </label>
        </div>

        <div className="radar-panel radar-panel--events">
          <div className="radar-panel__head radar-panel__head--split">
            <div>
              <p className="radar-step mono">02</p>
              <h2>Deine Radar-Empfehlungen</h2>
            </div>
            <p className="radar-count mono">{recommendedEvents.length} matches</p>
          </div>
          <p className="radar-panel__copy">
            Gleiche Karten, gleiche Bilder, gleiche Informationen und Aktionen wie auf der Hauptseite —
            nur vom Radar kuratiert.
          </p>
          <section className="event-grid radar-event-grid" aria-label="Personalisierte Event-Empfehlungen">
            {recommendedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                saved={savedIds.includes(event.id)}
                onToggleSave={onToggleSave}
                onOpenDetail={onOpenDetail}
                onCopyFeedback={onFeedback}
              />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
