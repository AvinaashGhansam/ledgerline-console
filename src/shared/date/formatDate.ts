export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  // Pinned to UTC to prevent per-viewer date shifting
  // True business-date semantics will be deferred to the backend (LSB-2)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};
