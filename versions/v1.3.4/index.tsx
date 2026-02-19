import React from "react";
import { createRoot } from "react-dom/client";

function AirVentApp() {
  return <div>AirVent Homepage + Dashboard v1.3.4</div>;
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(
  <React.StrictMode>
    <AirVentApp />
  </React.StrictMode>
);
