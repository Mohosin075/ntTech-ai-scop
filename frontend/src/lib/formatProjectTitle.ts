export const formatProjectTitle = (title: string, maxLength?: number) => {
  if (!title) return '';

  let cleaned = title
    .replace(/^[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D\s]+/u, '')
    .replace(/^(?:project|estimate)\s*[:—-]\s*/i, '')
    .replace(
      /^(?:to\s+)?(?:build|create|design|develop|make|implement|provide|deliver|launch|setup|set\s+up|we\s+need|i\s+need|i\s+want|need|want)\s+(?:a|an|the)?\s*/i,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  if (maxLength && cleaned.length > maxLength) {
    const truncated = cleaned.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const cut = lastSpace > 15 ? truncated.slice(0, lastSpace) : truncated;
    cleaned = cut.replace(/[\s,.;:!?-]+$/, '') + '…';
  }

  return cleaned;
};
