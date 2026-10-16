// src/theme.js

export function getSkyTheme(altitude) {
  if (altitude > 6) return "day";
  if (altitude > 0) return "dawn";
  if (altitude > -6) return "dusk";

  return "night";
}

export function applySkyTheme(altitude) {
  const theme = getSkyTheme(altitude);

  document.body.dataset.theme = theme;
}