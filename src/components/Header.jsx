import HeroVisual from "./HeroVisual";

export default function Header({ onExplore, onRandom, onRadar }) {
  return (
    <section className="hero-cd" aria-labelledby="hero-title">
      <div className="hero-cd__visual" aria-hidden="true">
        <HeroVisual />
        <div className="hero-cd__vignette" />
      </div>

      <div className="hero-cd__content">
        <h1 id="hero-title" className="hero-cd__headline">
          Mainfrankens{" "}
          <span className="hero-cd__headline-line">
            Event{" "}
            <span className="hero-cd__accent">Operating System</span>
          </span>
        </h1>
        <p className="hero-cd__sub">
          Tech- &amp; KI-Events an einem Ort — kuratiert, filterbar, offen als JSON-API.
        </p>
        <div className="hero-cd__actions">
          <button type="button" className="hero-cd__btn hero-cd__btn--primary" onClick={onExplore}>
            Events entdecken <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="hero-cd__btn hero-cd__btn--ghost" onClick={onRadar}>
            MainTech Radar
          </button>
          <button type="button" className="hero-cd__btn hero-cd__btn--ghost" onClick={onRandom}>
            <span className="hero-cd__shuffle" aria-hidden="true">⤨</span> Random Event
          </button>
        </div>
      </div>
    </section>
  );
}
