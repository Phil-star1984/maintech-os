const DEFAULT_IMAGE = "/images/events/meetup.jpg";

const TOPIC_IMAGES = {
  AI: "/images/events/ai.jpg",
  Coding: "/images/events/web.jpg",
  Startup: "/images/events/startup.jpg",
  Design: "/images/events/web.jpg",
  Data: "/images/events/analytics.jpg",
  Community: "/images/events/networking.jpg",
  Hackathon: "/images/events/hackathon.jpg",
};

export const resolveEventImageForTopics = (topics) => {
  const topic = topics?.[0];
  if (topic && TOPIC_IMAGES[topic]) return TOPIC_IMAGES[topic];
  return DEFAULT_IMAGE;
};

export const getEventImage = (event) => {
  if (event?.image) return event.image;
  if (event?.id && event.id !== "normalized-event") {
    return `/images/events/${event.id}.jpg`;
  }
  const topic = event?.topics?.[0];
  if (topic && TOPIC_IMAGES[topic]) return TOPIC_IMAGES[topic];
  return DEFAULT_IMAGE;
};
