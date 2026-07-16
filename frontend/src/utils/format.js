// Minutes -> "18m", "1h 20m", "2h". Matches the backend's formatDuration so
// durations read the same everywhere in the app.
export const formatDuration = (mins) => {
  const total = Math.round(mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};
