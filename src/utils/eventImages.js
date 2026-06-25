const DEFAULT_IMAGE = "/images/events/open-coding-night.jpg";

const TOPIC_IMAGES = {
  AI: "/images/events/llm-engineering-workshop.jpg",
  Coding: "/images/events/open-coding-night.jpg",
  Startup: "/images/events/startup-night-mainfranken.jpg",
  Design: "/images/events/ux-ui-design-jam.jpg",
  Data: "/images/events/data-science-meetup-wuerzburg.jpg",
  Community: "/images/events/repair-cafe-tech-edition.jpg",
  Hackathon: "/images/events/ai-vibe-hackathon-4.jpg",
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
