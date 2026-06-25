import { useEffect, useState } from "react";
import { copyToClipboard } from "../utils/eventUtils";

const API_PATH = "/api/events.json";

export default function ApiSection({ onFeedback }) {
  const [apiUrl, setApiUrl] = useState(API_PATH);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiUrl(`${window.location.origin}${API_PATH}`);
    }
  }, []);

  const handleCopy = async () => {
    await copyToClipboard(apiUrl);
    onFeedback?.("API-URL kopiert");
  };

  return (
    <section id="api" className="api-section" aria-labelledby="api-title">
      <div className="api-section__glow" aria-hidden="true" />

      <div className="api-section__inner">
        <div className="api-section__copy">
          <p className="api-section__eyebrow mono">&gt; fetch --open /api/events.json</p>
          <h2 id="api-title" className="api-section__title">
            Eine Plattform. Eine offene API.
          </h2>
          <p className="api-section__desc">
            Dieselben Events, die du hier siehst, liefert MainTech OS als JSON —
            frei nutzbar für Apps, Partner und Unternehmen.
          </p>
          <ul className="api-section__perks mono">
            <li>maschinenlesbares JSON</li>
            <li>ohne API-Key (MVP)</li>
            <li>ein Endpoint, sofort startklar</li>
          </ul>
        </div>

        <div className="api-section__panel">
          <p className="api-section__label mono">GET · public endpoint</p>
          <div className="api-section__field">
            <span className="api-section__prompt mono" aria-hidden="true">$</span>
            <a
              href={API_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="api-section__url mono"
            >
              {apiUrl}
            </a>
          </div>
          <pre className="api-section__snippet mono">
            <code>{`fetch("${API_PATH}")`}</code>
          </pre>
          <button type="button" className="btn api-section__submit" onClick={handleCopy}>
            URL kopieren
          </button>
          <a
            href={API_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="btn api-section__submit api-section__submit--outline"
          >
            JSON öffnen →
          </a>
          <p className="api-section__fine mono">
            Offen abrufbar — ideal für Integrationen &amp; Partner-Tools.
          </p>
        </div>
      </div>
    </section>
  );
}
