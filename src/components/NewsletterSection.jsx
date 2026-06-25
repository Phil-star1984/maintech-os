import { useState } from "react";

const STORAGE_KEY = "maintech_newsletter_signups";

const getSignupCount = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).length : 0;
  } catch {
    return 0;
  }
};

export default function NewsletterSection({ onFeedback }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [count, setCount] = useState(() => getSignupCount());

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      onFeedback?.("Bitte gültige E-Mail eingeben.");
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (existing.includes(trimmed)) {
        setStatus("duplicate");
        onFeedback?.("Du bist schon auf der Liste.");
        return;
      }
      const next = [...existing, trimmed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCount(next.length);
      setEmail("");
      setStatus("success");
      onFeedback?.("Newsletter-Anmeldung gespeichert (MVP).");
    } catch {
      setStatus("error");
      onFeedback?.("Speichern fehlgeschlagen.");
    }
  };

  return (
    <section id="newsletter" className="newsletter-section" aria-labelledby="newsletter-title">
      <div className="newsletter-section__glow" aria-hidden="true" />

      <div className="newsletter-section__inner">
        <div className="newsletter-section__copy">
          <p className="newsletter-section__eyebrow mono">&gt; subscribe --channel mainfranken</p>
          <h2 id="newsletter-title" className="newsletter-section__title">
            Newsletter
          </h2>
          <p className="newsletter-section__desc">
            KI-, Tech- und Startup-Events in Mainfranken — kuratiert, maschinenlesbar, direkt in dein Postfach.
          </p>
          <ul className="newsletter-section__perks mono">
            <li>wöchentlicher Event-Digest</li>
            <li>neue Nodes entlang des Main</li>
            <li>kein Spam, jederzeit abmeldbar</li>
          </ul>
          {count > 0 && (
            <p className="newsletter-section__stat mono">
              <span className="newsletter-section__stat-num">{count}</span> early subscribers
            </p>
          )}
        </div>

        <form className="newsletter-section__form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="newsletter-email" className="visually-hidden">
            E-Mail für Newsletter
          </label>
          <div className={`newsletter-section__field ${status === "error" ? "newsletter-section__field--error" : ""}`}>
            <span className="newsletter-section__prompt mono" aria-hidden="true">$</span>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              className="newsletter-section__input"
              placeholder="you@startup.de"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              autoComplete="email"
              spellCheck="false"
              disabled={status === "success"}
            />
          </div>
          <button
            type="submit"
            className="btn newsletter-section__submit"
            disabled={status === "success"}
          >
            {status === "success" ? "Angemeldet ✓" : "Anmelden"}
          </button>
          <p className="newsletter-section__fine mono">
            MVP: Speicherung lokal im Browser — kein Backend.
          </p>
        </form>
      </div>
    </section>
  );
}
