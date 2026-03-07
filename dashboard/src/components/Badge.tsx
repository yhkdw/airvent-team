export default function Badge({
  children,
  tone = "info",
}: {
  children: string;
  tone?: "info" | "warn" | "ok" | "solana";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-900"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-300 border-amber-900"
        : tone === "solana"
          ? "bg-purple-500/15 text-purple-300 border-purple-900"
          : "bg-sky-500/15 text-sky-300 border-sky-900";

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{children}</span>
  );
}
