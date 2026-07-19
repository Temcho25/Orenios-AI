export function formatUpdatedDate(date: string) {
  const value = new Date(date);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function getPreview(content: string | null) {
  const normalizedContent = content?.trim();

  if (!normalizedContent) {
    return "No additional content.";
  }

  if (normalizedContent.length <= 150) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 150)}...`;
}
