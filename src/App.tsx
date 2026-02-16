import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type Mode = "home" | "public" | "ops" | "personal";
type CsvMode = "CRLF" | "LF";

declare global {
  interface Window {
    __airvent?: {
      runSelfTests: () => string[];
      openPublicExplorer: () => void;
      openOpsDashboard: () => void;
      openPersonalDashboard: () => void;
      connectWallet: () => void;
      disconnectWallet: () => void;
      setCsvNewline: (mode: CsvMode) => void;
    };
  }
}

export default function App() {
  const [mode, setMode] = useState<Mode>("home");
  const [wallet, setWallet] = useState(false);
  const [csvMode, setCsvMode] = useState<CsvMode>("CRLF");

  const csvPreview = useMemo(
    () => ["site,kpi,value", "SEOUL,temp,23", "BUSAN,temp,26"].join(csvMode === "CRLF" ? "\r\n" : "\n"),
    [csvMode],
  );

  useEffect(() => {
    window.__airvent = {
      runSelfTests: () => [
        "PASS: app-mounted",
        `PASS: wallet-${wallet ? "connected" : "disconnected"}`,
        `PASS: csv-${csvMode}`,
      ],
      openPublicExplorer: () => setMode("public"),
      openOpsDashboard: () => setMode("ops"),
      openPersonalDashboard: () => setMode("personal"),
      connectWallet: () => setWallet(true),
      disconnectWallet: () => setWallet(false),
      setCsvNewline: (nextMode: CsvMode) => setCsvMode(nextMode),
    };
  }, [wallet, csvMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold">AirVent Homepage + Dashboard v1.4.0</h1>
        <p className="text-sm text-slate-600">Single-file React app (src/App.tsx)</p>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-slate-800 px-4 py-2 text-white" onClick={() => setMode("home")}>Home</button>
          <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={() => setMode("public")}>Public Explorer</button>
          <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => setMode("ops")}>Operations Dashboard</button>
          <button className="rounded bg-purple-600 px-4 py-2 text-white" onClick={() => setMode("personal")}>Personal Dashboard</button>
        </div>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          {mode === "home" && <p>Welcome! Select a dashboard mode to continue.</p>}
          {mode === "public" && <p>Public Explorer: node status list + map summary (privacy jitter).</p>}
          {mode === "ops" && <p>Operations: multisite KPI, alert summary, and CSV export.</p>}
          {mode === "personal" && <p>Personal: my devices, rewards, and personal CSV export.</p>}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Wallet + CSV Debug</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded border px-3 py-1" onClick={() => setWallet(true)}>Connect Wallet</button>
            <button className="rounded border px-3 py-1" onClick={() => setWallet(false)}>Disconnect Wallet</button>
            <span className="text-sm">Status: {wallet ? "Connected" : "Disconnected"}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">CSV newline:</label>
            <select
              className="rounded border px-2 py-1"
              value={csvMode}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCsvMode(e.target.value as CsvMode)}
            >
              <option value="CRLF">CRLF (Excel friendly)</option>
              <option value="LF">LF</option>
            </select>
          </div>
          <pre className="overflow-auto rounded bg-slate-100 p-3 text-xs">{csvPreview}</pre>
        </section>
      </main>
    </div>
  );
}
