export function fmt(n: number, digits = 0): string {
  return n.toFixed(digits);
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
