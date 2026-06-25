import { useMemo, useState } from "react";
import EventCard from "./EventCard";

const RADAR_STORAGE_KEY = "maintech-radar-profile";

const topicOptions = ["AI", "Coding", "Startup", "Design", "Data", "Community", "Hackathon"];
const formatOptions = ["In person", "Online", "Hybrid"];

const defaultProfile = {
  topics: ["AI", "Startup"],
  formats: ["In person"],
  radiusKm: 50,
  digest: "weekly",
};

const loadProfile = () => {
  try {
    const stored = window.localStorage.getItem(RADAR_STORAGE_KEY);
    if (!stored) return defaultProfile;
    const parsed = JSON.parse(stored);
    const legacyRadius = parsed.radius === "Würzburg" ? 10 : 50;
    return {
      ...defaultProfile,
      ...parsed,
      radiusKm: Number(parsed.radiusKm ?? legacyRadius),
    };
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
    const localHit = profile.radiusKm >= 25 || event.city === "Würzburg" ? 1 : 0;
    const regionBoost = profile.radiusKm >= 50 ? 1 : 0;
    const score = topicHits * 2 + formatHit + localHit + regionBoost;
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
            <div className="radar-slider-head">
              <p className="radar-label mono">radius</p>
              <p className="radar-slider-value mono">{profile.radiusKm} km</p>
            </div>
            <label className="radar-range-label">
              <span className="visually-hidden">Radius in Kilometern</span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={profile.radiusKm}
                onChange={(e) => updateProfile({ ...profile, radiusKm: Number(e.target.value) })}
              />
            </label>
            <div className="radar-range-scale mono" aria-hidden="true">
              <span>5 km</span>
              <span>50 km</span>
              <span>100 km</span>
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
