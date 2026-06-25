const SHAKE_COOLDOWN = 1200;
const MOTION_DELTA_THRESHOLD = 11;
const ORIENTATION_DELTA_THRESHOLD = 18;

export const isSecureContextForSensors = () =>
  typeof window !== "undefined" && window.isSecureContext === true;

export const supportsMotionSensors = () => {
  if (typeof window === "undefined") return false;
  return (
    "Accelerometer" in window ||
    "ondevicemotion" in window ||
    "ondeviceorientation" in window ||
    typeof DeviceMotionEvent !== "undefined" ||
    typeof DeviceOrientationEvent !== "undefined"
  );
};

export const requestMotionPermissions = async () => {
  const requests = [];

  if (typeof DeviceMotionEvent?.requestPermission === "function") {
    requests.push(DeviceMotionEvent.requestPermission());
  }
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    requests.push(DeviceOrientationEvent.requestPermission());
  }

  if (!requests.length) return true;

  const results = await Promise.all(requests);
  return results.every((result) => result === "granted");
};

/**
 * Multi-source shake detector: Accelerometer API, devicemotion, deviceorientation.
 */
export const createShakeDetector = (onShake, options = {}) => {
  const cooldown = options.cooldown ?? SHAKE_COOLDOWN;
  const motionThreshold = options.motionThreshold ?? MOTION_DELTA_THRESHOLD;
  const orientationThreshold = options.orientationThreshold ?? ORIENTATION_DELTA_THRESHOLD;

  let lastShake = 0;
  let lastMotion = null;
  let lastOrientation = null;
  let eventCount = 0;
  let accelerometer = null;

  const fireIfReady = (delta, threshold) => {
    const now = Date.now();
    if (delta > threshold && now - lastShake > cooldown) {
      lastShake = now;
      navigator.vibrate?.(40);
      onShake();
    }
  };

  const onDeviceMotion = (event) => {
    eventCount += 1;
    const acc = event.accelerationIncludingGravity ?? event.acceleration;
    if (!acc) return;

    const current = {
      x: acc.x ?? 0,
      y: acc.y ?? 0,
      z: acc.z ?? 0,
    };
    const previous = lastMotion;
    lastMotion = current;
    if (!previous) return;

    const delta =
      Math.abs(current.x - previous.x) +
      Math.abs(current.y - previous.y) +
      Math.abs(current.z - previous.z);

    fireIfReady(delta, motionThreshold);
  };

  const onDeviceOrientation = (event) => {
    if (event.beta == null || event.gamma == null) return;
    eventCount += 1;

    const current = { beta: event.beta, gamma: event.gamma };
    const previous = lastOrientation;
    lastOrientation = current;
    if (!previous) return;

    const delta =
      Math.abs(current.beta - previous.beta) +
      Math.abs(current.gamma - previous.gamma);

    fireIfReady(delta, orientationThreshold);
  };

  const startAccelerometer = () => {
    if (!("Accelerometer" in window)) return false;

    try {
      accelerometer = new Accelerometer({ frequency: 30 });
      accelerometer.addEventListener("reading", () => {
        eventCount += 1;
        const current = {
          x: accelerometer.x ?? 0,
          y: accelerometer.y ?? 0,
          z: accelerometer.z ?? 0,
        };
        const previous = lastMotion;
        lastMotion = current;
        if (!previous) return;

        const delta =
          Math.abs(current.x - previous.x) +
          Math.abs(current.y - previous.y) +
          Math.abs(current.z - previous.z);

        fireIfReady(delta, motionThreshold);
      });
      accelerometer.addEventListener("error", () => {
        accelerometer = null;
      });
      accelerometer.start();
      return true;
    } catch {
      accelerometer = null;
      return false;
    }
  };

  const start = () => {
    eventCount = 0;
    lastMotion = null;
    lastOrientation = null;

    const hasAccelerometer = startAccelerometer();

    window.addEventListener("devicemotion", onDeviceMotion, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });

    return hasAccelerometer;
  };

  const stop = () => {
    window.removeEventListener("devicemotion", onDeviceMotion);
    window.removeEventListener("deviceorientation", onDeviceOrientation);
    if (accelerometer) {
      try {
        accelerometer.stop();
      } catch {
        /* ignore */
      }
      accelerometer = null;
    }
    lastMotion = null;
    lastOrientation = null;
  };

  const getEventCount = () => eventCount;

  return { start, stop, getEventCount };
};

export const getShakeSetupError = () => {
  if (!isSecureContextForSensors()) {
    return "Sensoren brauchen HTTPS. Nutze https://… oder localhost.";
  }
  if (!supportsMotionSensors()) {
    return "Keine Bewegungssensoren in diesem Browser.";
  }
  return null;
};
