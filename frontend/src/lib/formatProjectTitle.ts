export const formatProjectTitle = (title: string) =>
  title
    .replace(/^[\p{Extended_Pictographic}\uFE0E\uFE0F\u200D\s]+/u, '')
    .replace(/^(?:project|estimate)\s*[:—-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
