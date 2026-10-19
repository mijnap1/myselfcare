export type SkyPeriod = "dawn" | "day" | "golden" | "dusk" | "late";

/** Which sky to paint for a local hour (0–23). Dark mode always shows the night sky. */
export function getSkyPeriod(hour: number): SkyPeriod {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "golden";
  if (hour >= 19 && hour < 22) return "dusk";
  return "late";
}
