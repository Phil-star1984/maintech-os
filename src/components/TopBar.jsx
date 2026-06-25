import { useEffect, useId, useRef, useState } from "react";
import BrandLogo from "./BrandLogo";
import { isSoundEnabled, toggleSound } from "../utils/sounds";

export default function TopBar({
  searchQuery,
  onSearchChange,
  onHome,
  onExplore,
  onRandom,
  onNormalize,
  onNewsletter,
  onApi,
  onRadar,
  onFeedback,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const menuId = useId();
  const userMenuId = useId();
  const userWrapRef = useRef(null);

  const navItems = [
    { label: "Events", action: onExplore },
    { label: "Radar", action: onRadar },
    { label: "API", action: onApi },
    { label: "Random", action: onRandom },
    { label: "Normalize", action: onNormalize },
    { label: "Newsletter", action: onNewsletter },
  ];

  const handleNav = (action) => {
    action();
    setMenuOpen(false);
  };

  const handleSoundToggle = () => {
    setSoundOn(toggleSound());
  };

  const handleRadar = () => {
    setUserOpen(false);
    setMenuOpen(false);
    onRadar();
  };

  const handleAuthHint = (label) => {
    setUserOpen(false);
    setMenuOpen(false);
    onFeedback?.(`${label} — demnächst verfügbar`);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!userOpen) return;
    const onPointer = (e) => {
      if (userWrapRef.current && !userWrapRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setUserOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a
          href="#"
          className="topbar__brand"
          onClick={(e) => {
            e.preventDefault();
            onHome();
          }}
        >
          <BrandLogo />
        </a>

        <div className="topbar__search">
          <label htmlFor="event-search" className="visually-hidden">
            Events durchsuchen
          </label>
          <span className="topbar__prompt mono" aria-hidden="true">$</span>
          <input
            id="event-search"
            type="search"
            className="topbar__input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="find events --topic ai --near würzburg"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <nav className="topbar__nav topbar__nav--desktop" aria-label="Hauptnavigation">
          {navItems.map(({ label, action }) => (
            <button key={label} type="button" className="topbar__link" onClick={() => handleNav(action)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            className={`topbar__sound mono ${soundOn ? "topbar__sound--on" : ""}`}
            onClick={handleSoundToggle}
            aria-pressed={soundOn}
            title={soundOn ? "Sound FX aus" : "Sound FX an"}
          >
            {soundOn ? "♪ on" : "♪ off"}
          </button>
        </nav>

        <div className="topbar__user-wrap" ref={userWrapRef}>
          <button
            type="button"
            className={`topbar__user topbar__user--on mono ${userOpen ? "topbar__user--open" : ""}`}
            onClick={() => setUserOpen((open) => !open)}
            aria-expanded={userOpen}
            aria-controls={userMenuId}
            aria-haspopup="menu"
            aria-label="Anmelden und Radar öffnen"
          >
            Anmelden
          </button>

          {userOpen && (
            <div id={userMenuId} className="topbar__user-menu" role="menu">
              <div className="topbar__user-menu-profile">
                <div>
                  <p className="topbar__user-menu-name">Noch kein Profil</p>
                  <p className="topbar__user-menu-email mono">Radar-Interessen in 30 Sekunden wählen</p>
                </div>
              </div>
              <button
                type="button"
                className="topbar__user-menu-btn topbar__user-menu-btn--primary"
                role="menuitem"
                onClick={handleRadar}
              >
                MainTech Radar starten
              </button>
              <button
                type="button"
                className="topbar__user-menu-btn"
                role="menuitem"
                onClick={handleRadar}
              >
                Interessen auswählen
              </button>
              <button
                type="button"
                className="topbar__user-menu-btn"
                role="menuitem"
                onClick={() => handleAuthHint("Login")}
              >
                Mit E-Mail anmelden
              </button>
              <p className="topbar__user-menu-fine mono">Demo-Onboarding — speichert lokal im Browser</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="topbar__burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
        >
          <span className={`topbar__burger-icon ${menuOpen ? "topbar__burger-icon--open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="topbar__backdrop"
            aria-label="Menü schließen"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={menuId}
            className="topbar__menu"
            aria-label="Mobile Navigation"
          >
            <p className="topbar__menu-label mono">navigation</p>
            {navItems.map(({ label, action }) => (
              <button
                key={label}
                type="button"
                className="topbar__menu-link"
                onClick={() => handleNav(action)}
              >
                <span className="mono topbar__menu-prompt">&gt;</span>
                {label}
              </button>
            ))}

            <div className="topbar__menu-divider" aria-hidden="true" />

            <p className="topbar__menu-label mono">einstellungen</p>
            <button
              type="button"
              className="topbar__menu-link topbar__menu-link--toggle"
              onClick={handleSoundToggle}
              aria-pressed={soundOn}
            >
              <span className="mono topbar__menu-prompt">&gt;</span>
              Sound FX {soundOn ? "♪ an" : "♪ aus"}
            </button>

            <div className="topbar__menu-divider" aria-hidden="true" />

            <p className="topbar__menu-label mono">account</p>
            <button
              type="button"
              className="topbar__menu-link"
              onClick={handleRadar}
            >
              <span className="mono topbar__menu-prompt">&gt;</span>
              MainTech Radar starten
            </button>
            <button
              type="button"
              className="topbar__menu-link"
              onClick={handleRadar}
            >
              <span className="mono topbar__menu-prompt">&gt;</span>
              Interessen auswählen
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
