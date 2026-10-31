import { useEffect, useRef, useState } from "react";
import { T } from "./i18n.js";
import { buildMessages, parseAnswer } from "./prompt.js";
import Result from "./Result.jsx";
import Pulse from "./Pulse.jsx";

export default function App() {
  const [lang, setLang] = useState("fr");
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("checking");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      const v = localStorage.getItem("mediks-theme");
      if (v) return v;
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const abortRef = useRef(null);
  const t = T[lang];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mediks-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    fetch("/ollama/api/tags")
      .then((r) => r.json())
      .then((d) => {
        const names = (d.models || []).map((m) => m.name);
        setModels(names);
        setModel(names[0] || "");
        setStatus(names.length ? "ready" : "no-model");
      })
      .catch(() => setStatus("offline"));
  }, []);

  async function send() {
    if (!input.trim() || !model) return;
    setBusy(true);
    setData(null);
    setRaw("");
    setError("");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let full = "";
    try {
      const res = await fetch("/ollama/api/chat", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: true,
          format: "json",
          options: { temperature: 0.2 },
          messages: buildMessages(input, lang),
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const part = JSON.parse(line);
          if (part.message?.content) full += part.message.content;
        }
      }
      const parsed = parseAnswer(full);
      if (parsed) setData(parsed);
      else setRaw(full);
    } catch (e) {
      if (e.name !== "AbortError") setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <header className="top">
        <div>
          <h1>Mediks</h1>
          <p className="tagline">{t.tagline}</p>
        </div>
        <div className="tools">
          <button className="icon" aria-label={t.theme} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            )}
          </button>
          <button className="icon" aria-label={t.lang} onClick={() => setLang(lang === "fr" ? "en" : "fr")}>
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>
      </header>
      <Pulse active={busy} />
      <p className={"status " + status}><span className="dot" />{t.status[status]}</p>

      <label className="field">
        {t.model}
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {models.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>

      <textarea
        rows={7}
        placeholder={t.placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="row">
        <button className="primary" onClick={send} disabled={busy || status !== "ready"}>
          {t.explain}
        </button>
        {busy && <button className="ghost" onClick={() => abortRef.current?.abort()}>{t.stop}</button>}
      </div>

      {busy && <p className="wait" role="status">{t.working}</p>}
      {error && <p className="error">{error}</p>}
      {data && <Result data={data} t={t} />}
      {raw && (
        <>
          <p className="error">{t.raw}</p>
          <pre className="output">{raw}</pre>
        </>
      )}
      <p className="disclaimer">{t.disclaimer}</p>
    </main>
  );
}
