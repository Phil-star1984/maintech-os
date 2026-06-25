import { useCallback, useEffect, useRef, useState } from "react";
import { downloadIcs } from "../utils/calendar";
import { pickRandomEvent } from "../utils/eventUtils";
import { getEventImage } from "../utils/eventImages";
import {
  createShakeDetector,
  getShakeSetupError,
  isSecureContextForSensors,
  requestMotionPermissions,
  supportsMotionSensors,
} from "../utils/shakeDetection";
import { playNodeSelectSound, unlockShakeAudio, lockShakeAudio } from "../utils/sounds";

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches);

export default function RandomEvent({ events, onOpenDetail }) {
  const [randomEvent, setRandomEvent] = useState(null);
  const [glitching, setGlitching] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakeError, setShakeError] = useState("");
  const [touchDevice, setTouchDevice] = useState(false);
  const detectorRef = useRef(null);
  const healthCheckRef = useRef(null);

  const triggerRandom = useCallback((fromShake = false) => {
    if (!events.length) return;
    playNodeSelectSound({ fromShake });
    const picked = pickRandomEvent(events);
    setGlitching(true);
    setRandomEvent(picked);
    setTimeout(() => setGlitching(false), 600);
  }, [events]);

  const stopShake = useCallback(() => {
    if (healthCheckRef.current) {
      clearTimeout(healthCheckRef.current);
      healthCheckRef.current = null;
    }
    detectorRef.current?.stop();
    detectorRef.current = null;
    lockShakeAudio();
    setShakeEnabled(false);
  }, []);

  const startShake = useCallback(() => {
    if (healthCheckRef.current) {
      clearTimeout(healthCheckRef.current);
      healthCheckRef.current = null;
    }
    detectorRef.current?.stop();

    const detector = createShakeDetector(() => triggerRandom(true));
    detector.start();
    detectorRef.current = detector;
    setShakeEnabled(true);
    setShakeError("");

    healthCheckRef.current = setTimeout(() => {
      if (detector.getEventCount() === 0) {
        setShakeError(
          isSecureContextForSensors()
            ? "Keine Sensordaten — Gerät kurz bewegen oder Browser neu laden."
            : "Shake braucht HTTPS. Öffne die App über https:// (nicht http://192.168…)."
        );
      }
    }, 2500);
  }, [triggerRandom]);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      e.preventDefault();
      triggerRandom();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [triggerRandom]);

  useEffect(() => () => stopShake(), [stopShake]);

  const enableShake = () => {
    setShakeError("");
    // MUST be sync in tap handler before any await (Safari audio policy)
    unlockShakeAudio();

    void (async () => {
      const setupError = getShakeSetupError();
      if (setupError && !supportsMotionSensors()) {
        setShakeError(setupError);
        lockShakeAudio();
        return;
      }

      if (!isSecureContextForSensors()) {
        setShakeError("Shake braucht HTTPS. Öffne https://192.168.178.62:5173 auf dem Handy.");
        lockShakeAudio();
        return;
      }

      try {
        const granted = await requestMotionPermissions();
        if (!granted) {
          setShakeError("Sensor-Zugriff verweigert. In iOS: Einstellungen → Safari → Bewegung erlauben.");
          lockShakeAudio();
          return;
        }

        unlockShakeAudio();
        startShake();
      } catch {
        setShakeError("Shake-Modus konnte nicht gestartet werden.");
        stopShake();
      }
    })();
  };

  return (
    <section className="random-section" id="random-node" aria-label="Random event">
      <div className="section-header">
        <h2 className="section-title mono">&gt; random_node</h2>
        <p className="section-desc">
          {touchDevice
            ? "Shake Mode aktivieren, dann schütteln — Sound bei jedem Treffer."
            : "Random Event wählen. Leertaste auf Desktop."}
        </p>
      </div>

      <div className="random-actions">
        <button type="button" className="btn btn--primary" onClick={() => triggerRandom(false)}>
          Shake / Random Node
        </button>
        {touchDevice && !shakeEnabled && (
          <button type="button" className="btn btn--ghost" onClick={enableShake}>
            Enable Shake Mode
          </button>
        )}
        {shakeEnabled && (
          <>
            <span className="mono shake-status" role="status">
              shake mode active
            </span>
            <button type="button" className="btn btn--ghost btn--small" onClick={stopShake}>
              Stop
            </button>
          </>
        )}
        {shakeError && (
          <span className="shake-error" role="alert">
            {shakeError}
          </span>
        )}
      </div>

      {randomEvent && (
        <article className={`random-card ${glitching ? "random-card--glitch" : ""}`}>
          <div className="random-card__hero">
            <img
              className="random-card__hero-img"
              src={getEventImage(randomEvent)}
              alt=""
              loading="lazy"
            />
            <div className="random-card__hero-overlay" aria-hidden="true" />
          </div>
          <p className="mono random-card__label">selected node</p>
          <h3>{randomEvent.title}</h3>
          <p className="random-card__meta">
            {randomEvent.dateLabel} · {randomEvent.timeLabel} · {randomEvent.city}
          </p>
          <p>{randomEvent.description}</p>
          <div className="random-card__actions">
            <button type="button" className="btn btn--primary" onClick={() => onOpenDetail(randomEvent)}>
              Details
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => downloadIcs(randomEvent)}>
              Add to Calendar
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => triggerRandom(false)}>
              Reroll
            </button>
          </div>
        </article>
      )}
    </section>
  );
}
