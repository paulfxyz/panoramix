import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadCatalog } from "./data";
import "./index.css";

function Boot() {
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    loadCatalog()
      .then(() => setReady(true))
      .catch((e) => setError(e.message));
  }, []);
  if (ready) return <App />;
  return (
    <main className="boot">
      <a className="wordmark" href="./">
        panoramix<span className="brand-dot">.</span>
      </a>
      <h1>
        {error ? "The ingredients are missing." : "Opening the apothecary…"}
      </h1>
      <p>
        {error
          ? `${error} Make sure catalog.json is uploaded beside index.html and serve the site over HTTP or HTTPS, not file://.`
          : "Loading the local, open-source catalogue. No sign-in needed."}
      </p>
      {error && (
        <button
          className="button dark"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Boot />);
