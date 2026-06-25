import { useMemo, useState } from "react";

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
    .slice(0, 3)
    .map(({ event }) => event);
};

export default function RadarPage({ events, onBack, onFeedback }) {
  const [profile, setProfile] = useState(loadProfile);
  const matches = useMemo(() => getMatches(events, profile), [events, profile]);

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
            Sag uns, was dich interessiert — wir zeigen dir die Events, die wirklich passen.
          </h1>
          <p className="radar-hero__sub">
            Der Radar ist die Onboarding-Unterseite für deinen persönlichen Tech-Event-Feed:
            Interessen wählen, Radius setzen und direkt sehen, welche Veranstaltungen relevant sind.
          </p>
          <div className="radar-hero__actions">
            <button type="button" className="radar-btn radar-btn--primary" onClick={handleSave}>
              Radar aktivieren <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="radar-btn radar-btn--ghost" onClick={onBack}>
              Zurück zu allen Events
            </button>
          </div>
        </div>
        <aside className="radar-terminal" aria-label="Radar Vorschau">
          <p className="radar-terminal__line mono">$ maintech radar --for you</p>
          <p className="radar-terminal__big">{matches.length || events.length}</p>
          <p className="radar-terminal__label mono">relevante Signale gefunden</p>
          <div className="radar-terminal__chips">
            {profile.topics.slice(0, 4).map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </aside>
      </section>

      <section className="radar-grid" aria-label="Radar Einstellungen">
        <div className="radar-panel">
          <div className="radar-panel__head">
            <p className="radar-step mono">01</p>
            <h2>Interessen wählen</h2>
          </div>
          <p className="radar-panel__copy">
            Damit MainTech OS nicht nur ein Kalender bleibt, sondern dein persönlicher Event-Radar wird.
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
        </div>

        <div className="radar-panel">
          <div className="radar-panel__head">
            <p className="radar-step mono">02</p>
            <h2>Wie willst du Events finden?</h2>
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

        <div className="radar-panel radar-panel--preview">
          <div className="radar-panel__head">
            <p className="radar-step mono">03</p>
            <h2>Dein erster Radar</h2>
          </div>
          <div className="radar-recs">
            {(matches.length ? matches : events.slice(0, 3)).map((event) => (
              <article className="radar-rec" key={event.id}>
                <p className="radar-rec__date mono">{event.dateLabel} · {event.city}</p>
                <h3>{event.title}</h3>
                <p>{event.whyGo}</p>
                <div className="radar-rec__tags">
                  {event.topics?.slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
