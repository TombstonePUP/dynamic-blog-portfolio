export function getThemeColor(tags: string[]): string {
  if (tags.includes("featured")) return "#F0D8A1"; // Gold
  if (tags.includes("why positive psychology?")) return "#F0D8A1"; // Gold
  if (tags.includes("movie Review")) return "#E29578"; // Coral
  if (tags.includes("personal blog")) return "#A8DADC"; // Soft Blue
  if (tags.includes("what's your worry?")) return "#F4A261"; // Sandy Orange
  if (tags.includes("advice")) return "#8AB17D"; // Sage Green
  return "#72dbcc"; // Teal (Default)
}
