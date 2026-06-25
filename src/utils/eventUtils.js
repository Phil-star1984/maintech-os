import { resolveEventImageForTopics } from "./eventImages";

const SAVED_KEY = "maintech_saved_events";

export const FILTER_DEFINITIONS = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "coding", label: "Coding" },
  { id: "startup", label: "Startup" },
  { id: "design", label: "Design" },
  { id: "data", label: "Data" },
  { id: "community", label: "Community" },
  { id: "beginner", label: "Beginner-friendly" },
  { id: "free", label: "Free" },
  { id: "this-week", label: "This Week" },
  { id: "wuerzburg", label: "Würzburg" },
];

const topicMatches = (event, keywords) => {
  const haystack = [
    ...(event.topics ?? []),
    event.title,
    event.description,
  ]
    .join(" ")
    .toLowerCase();
  return keywords.some((k) => haystack.includes(k.toLowerCase()));
};

const isThisWeek = (startsAt) => {
  const start = new Date(startsAt);
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() + diffToMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return start >= weekStart && start < weekEnd;
};

export const matchesFilter = (event, filterId) => {
  if (filterId === "all") return true;
  if (filterId === "ai") return topicMatches(event, ["ai", "ki", "llm", "machine learning"]);
  if (filterId === "coding") return topicMatches(event, ["coding", "hackathon", "developer", "engineer"]);
  if (filterId === "startup") return topicMatches(event, ["startup", "founder", "pitch"]);
  if (filterId === "design") return topicMatches(event, ["design", "ux", "ui", "art"]);
  if (filterId === "data") return topicMatches(event, ["data", "science", "ml", "analytics"]);
  if (filterId === "community") return topicMatches(event, ["community", "meetup", "network"]);
  if (filterId === "beginner") return (event.level ?? "").toLowerCase().includes("beginner");
  if (filterId === "free") return (event.price ?? "").toLowerCase() === "free";
  if (filterId === "this-week") return isThisWeek(event.startsAt);
  if (filterId === "wuerzburg") return (event.city ?? "").toLowerCase() === "würzburg";
  return true;
};

export const filterEvents = (events, activeFilters, searchQuery) => {
  let result = [...events];

  const topicFilters = activeFilters.filter((f) => f !== "all");
  if (topicFilters.length > 0) {
    result = result.filter((event) =>
      topicFilters.every((filterId) => matchesFilter(event, filterId))
    );
  }

  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter((event) => {
      const searchable = [
        event.title,
        event.description,
        event.whyGo,
        event.location,
        event.city,
        event.organizer,
        event.level,
        event.price,
        ...(event.topics ?? []),
        ...(event.audience ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return result.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );
};

export const getStats = (events, savedCount) => {
  const topics = new Set();
  events.forEach((e) => (e.topics ?? []).forEach((t) => topics.add(t)));
  const freeCount = events.filter(
    (e) => (e.price ?? "").toLowerCase() === "free"
  ).length;
  return {
    total: events.length,
    topics: topics.size,
    free: freeCount,
    saved: savedCount,
  };
};

export const getSavedIds = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveSavedIds = (ids) => {
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
};

export const toggleSaved = (id) => {
  const ids = getSavedIds();
  const exists = ids.includes(id);
  const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
  saveSavedIds(next);
  return next;
};

export const isSaved = (id) => getSavedIds().includes(id);

export const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
};

export const formatEventJson = (event) => JSON.stringify(event, null, 2);

export const formatJsonLd = (event) =>
  JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      startDate: event.startsAt,
      endDate: event.endsAt,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: event.location,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressRegion: "Mainfranken",
          addressCountry: "DE",
        },
      },
      description: event.description,
      organizer: {
        "@type": "Organization",
        name: event.organizer,
      },
      offers: {
        "@type": "Offer",
        price: event.price === "Free" ? "0" : event.price,
        priceCurrency: "EUR",
      },
      url: event.signupUrl || event.sourceUrl,
    },
    null,
    2
  );

export const formatShareText = (event) =>
  [
    `📍 ${event.title}`,
    `🗓 ${event.dateLabel} · ${event.timeLabel}`,
    `📌 ${event.location}`,
    `💰 ${event.price} · ${event.level}`,
    "",
    event.description,
    "",
    `Why go? ${event.whyGo}`,
    "",
    event.signupUrl !== "#" ? `Signup: ${event.signupUrl}` : "",
    "",
    "— via MainTech OS · Mainfranken tech events",
  ]
    .filter(Boolean)
    .join("\n");

export const formatSocialPost = (event) =>
  [
    `🚀 ${event.title} in ${event.city}!`,
    "",
    `${event.dateLabel} · ${event.timeLabel}`,
    `${event.price} · ${event.level}`,
    "",
    event.description.slice(0, 180) + (event.description.length > 180 ? "…" : ""),
    "",
    `Tags: ${(event.topics ?? []).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}`,
    "",
    "#Mainfranken #TechEvents #MainTechOS",
  ].join("\n");

const MONTHS = {
  januar: 0,
  jan: 0,
  februar: 1,
  feb: 1,
  märz: 2,
  mar: 2,
  mär: 2,
  april: 3,
  apr: 3,
  mai: 4,
  may: 4,
  juni: 5,
  jun: 5,
  juli: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  oktober: 9,
  okt: 9,
  oct: 9,
  november: 10,
  nov: 10,
  dezember: 11,
  dez: 11,
  dec: 11,
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "normalized-event";

const extractTitle = (text) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[0]?.slice(0, 120) || "Community Event Mainfranken";
};

const extractDate = (text) => {
  const isoMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return { year: +y, month: +m - 1, day: +d };
  }

  const deMatch = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (deMatch) {
    const [, d, m, y] = deMatch;
    return { year: +y, month: +m - 1, day: +d };
  }

  const namedMatch = text.match(/(\d{1,2})\.\s*(?:–|-)?\s*(\d{1,2})?\.\s*([a-zäöü]+)\s*(\d{4})/i);
  if (namedMatch) {
    const [, d, , monthName, y] = namedMatch;
    const month = MONTHS[monthName.toLowerCase()];
    if (month !== undefined) return { year: +y, month, day: +d };
  }

  const monthOnly = text.match(/(\d{1,2})\.\s*([a-zäöü]+)\s*(\d{4})/i);
  if (monthOnly) {
    const [, d, monthName, y] = monthOnly;
    const month = MONTHS[monthName.toLowerCase()];
    if (month !== undefined) return { year: +y, month, day: +d };
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14);
  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth(),
    day: fallback.getDate(),
  };
};

const extractTime = (text) => {
  const range = text.match(/(\d{1,2})[:.](\d{2})\s*(?:–|-|bis|to)\s*(\d{1,2})[:.](\d{2})/i);
  if (range) {
    return {
      startH: +range[1],
      startM: +range[2],
      endH: +range[3],
      endM: +range[4],
      label: `${range[1]}:${range[2]}–${range[3]}:${range[4]}`,
    };
  }
  const single = text.match(/(\d{1,2})[:.](\d{2})\s*(?:Uhr|h)?/i);
  if (single) {
    return {
      startH: +single[1],
      startM: +single[2],
      endH: +single[1] + 2,
      endM: +single[2],
      label: `${single[1]}:${single[2]}`,
    };
  }
  return { startH: 18, startM: 0, endH: 21, endM: 0, label: "18:00–21:00" };
};

const extractCity = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("würzburg") || lower.includes("wuerzburg")) return "Würzburg";
  if (lower.includes("schweinfurt")) return "Schweinfurt";
  if (lower.includes("aschaffenburg")) return "Aschaffenburg";
  if (lower.includes("bamberg")) return "Bamberg";
  if (lower.includes("mainfranken")) return "Würzburg";
  return "Mainfranken";
};

const extractTopics = (text) => {
  const lower = text.toLowerCase();
  const topics = [];
  if (/(\bai\b|ki|llm|machine learning|künstliche)/i.test(lower)) topics.push("AI");
  if (/coding|code|developer|programm|hackathon/i.test(lower)) topics.push("Coding");
  if (/startup|founder|gründer|pitch/i.test(lower)) topics.push("Startup");
  if (/design|ux|ui|kreativ|art/i.test(lower)) topics.push("Design");
  if (/data|analytics|science|ml\b/i.test(lower)) topics.push("Data");
  if (/community|meetup|network|treffen/i.test(lower)) topics.push("Community");
  return topics.length ? [...new Set(topics)] : ["Community"];
};

const padTz = (n) => String(n).padStart(2, "0");

const toIsoLocal = (year, month, day, hour, minute) => {
  const offset = "+02:00";
  return `${year}-${padTz(month + 1)}-${padTz(day)}T${padTz(hour)}:${padTz(minute)}:00${offset}`;
};

const formatDateLabel = (year, month, day) => {
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${day}. ${months[month]} ${year}`;
};

export const normalizeEventText = (rawText) => {
  const text = rawText.trim();
  if (!text) return null;

  const title = extractTitle(text);
  const { year, month, day } = extractDate(text);
  const time = extractTime(text);
  const city = extractCity(text);
  const topics = extractTopics(text);

  const startsAt = toIsoLocal(year, month, day, time.startH, time.startM);
  const endH = time.endH >= 24 ? 23 : time.endH;
  const endsAt = toIsoLocal(year, month, day, endH, time.endM);

  const isFree = /free|kostenlos|gratis|0\s*€/i.test(text);
  const isBeginner = /beginner|einsteiger|anfänger|all levels/i.test(text);

  const description =
    text.split("\n").slice(1).join(" ").trim().slice(0, 280) ||
    "Community tech event in Mainfranken — details extracted via MainTech OS normalizer.";

  const event = {
    id: slugify(title),
    title,
    startsAt,
    endsAt,
    dateLabel: formatDateLabel(year, month, day),
    timeLabel: time.label,
    location: `${city}, Mainfranken`,
    city,
    format: "In person",
    price: isFree ? "Free" : "TBD",
    level: isBeginner ? "Beginner-friendly" : "All levels",
    organizer: "Community Organizer",
    topics,
    audience: ["Developers", "Creators", "Community"],
    description,
    whyGo: "Discover local tech culture and connect with the Mainfranken community.",
    sourceUrl: "#",
    signupUrl: "#",
    image: resolveEventImageForTopics(topics),
    status: "upcoming",
  };

  return event;
};

export const pickRandomEvent = (events) => {
  if (!events.length) return null;
  return events[Math.floor(Math.random() * events.length)];
};
