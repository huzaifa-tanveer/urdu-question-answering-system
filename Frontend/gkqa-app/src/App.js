import React, { useState } from "react";

// Add this in index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">

const urdu = { fontFamily: "'Noto Nastaliq Urdu', serif" };

const EXAMPLES = [
  "پاکستان کا دارالحکومت کیا ہے؟",
  "اقبال کون تھے؟",
  "سورج کتنا بڑا ہے؟",
];

const CARDS = [
  { key: "question", label: "سوال",          color: "#888888", bg: "#f5f5f2" },
  { key: "short",    label: "مختصر جواب",    color: "#1D9E75", bg: "#E1F5EE" },
  { key: "long",     label: "تفصیلی جواب",   color: "#378ADD", bg: "#E6F1FB" },
  { key: "context",  label: "جواب کا حوالہ", color: "#7F77DD", bg: "#EEEDFE" },
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(false);
    setResult(null);
    try {
      const res  = await fetch(`http://127.0.0.1:8000/ask?q=${encodeURIComponent(question)}`);
      const data = await res.json();
      setResult({ ...data, question });
    } catch {
      setResult({
        question,
        short:   "کنکشن خطا",
        long:    "سرور سے جواب نہیں ملا۔ براہ کرم سرور چیک کریں۔",
        context: "",
      });
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "680px" }}>

        {/* ── Main card ── */}
        <div style={{ background: "white", borderRadius: "16px", border: "0.5px solid #e0e0d8", padding: "2rem", direction: "rtl", marginBottom: "1rem" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a", margin: 0, ...urdu }}>اردو سوال جواب سسٹم</h1>
              <p  style={{ fontSize: "13px", color: "#888", margin: 0, ...urdu }}>AI پر مبنی عمومی معلومات مددگار</p>
            </div>
          </div>

          <div style={{ height: "0.5px", background: "#e8e8e2", marginBottom: "1.5rem" }} />

          {/* Input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                placeholder="یہاں اپنا سوال لکھیں..."
                style={{ width: "100%", padding: "14px 16px 14px 44px", border: "0.5px solid #ccc", borderRadius: "12px", fontSize: "15px", color: "#1a1a1a", background: "white", outline: "none", direction: "rtl", boxSizing: "border-box", ...urdu }}
                onFocus={(e) => (e.target.style.borderColor = "#1D9E75")}
                onBlur={(e)  => (e.target.style.borderColor = "#ccc")}
              />
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#bbb", fontFamily: "sans-serif", pointerEvents: "none" }}>
                {question.length}
              </span>
            </div>
            <button
              onClick={askQuestion}
              disabled={loading}
              style={{ height: "52px", padding: "0 22px", borderRadius: "12px", border: "none", background: loading ? "#9FE1CB" : "#1D9E75", color: "white", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s", ...urdu }}
            >
              {loading ? "⏳" : "پوچھیں ←"}
            </button>
          </div>

          {/* Example chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuestion(ex)}
                style={{ padding: "6px 14px", borderRadius: "20px", border: "0.5px solid #ddd", fontSize: "13px", color: "#666", cursor: "pointer", background: "#fafaf8", transition: "all 0.15s", ...urdu }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1D9E75"; e.currentTarget.style.color = "#1D9E75"; e.currentTarget.style.background = "#E1F5EE"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ddd";    e.currentTarget.style.color = "#666";    e.currentTarget.style.background = "#fafaf8"; }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <>
            <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}} @keyframes shimmer{0%{opacity:0.4}50%{opacity:0.8}100%{opacity:0.4}}`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "12px", background: "white", border: "0.5px solid #e0e0d8", marginBottom: "1rem", fontSize: "14px", color: "#666", fontFamily: "sans-serif", direction: "rtl", ...urdu }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#1D9E75", animation: "pulse 1.2s infinite", flexShrink: 0 }} />
              جواب تیار ہو رہا ہے...
            </div>
            {/* Skeleton cards */}
            {CARDS.map((c) => (
              <div key={c.key} style={{ background: "white", borderRadius: "14px", border: "0.5px solid #e0e0d8", padding: "1.25rem 1.5rem", marginBottom: "10px", animation: "shimmer 1.5s infinite" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.color, opacity: 0.4 }} />
                  <div style={{ height: "12px", width: "80px", borderRadius: "6px", background: "#eee" }} />
                </div>
                <div style={{ height: "14px", width: "100%", borderRadius: "6px", background: "#f0f0f0", marginBottom: "8px" }} />
                <div style={{ height: "14px", width: "70%", borderRadius: "6px", background: "#f0f0f0" }} />
              </div>
            ))}
          </>
        )}

        {/* ── Empty state ── */}
        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#bbb" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px", opacity: 0.4 }}>💬</div>
            <div style={{ fontSize: "14px", fontFamily: "sans-serif" }}>اپنا سوال لکھ کر پوچھیں بٹن دبائیں</div>
          </div>
        )}

        {/* ── Result cards — all shown together ── */}
        {result && !loading && (
          <>
            {CARDS.map((card) => {
              const content = result[card.key];
              if (!content) return null;
              return (
                <div
                  key={card.key}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    border: `0.5px solid ${card.color}33`,
                    overflow: "hidden",
                    marginBottom: "10px",
                    direction: "rtl",
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: card.bg, borderBottom: `0.5px solid ${card.color}33` }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: card.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: card.color, ...urdu }}>
                      {card.label}
                    </span>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: "16px 18px", fontSize: "15px", lineHeight: "2.2", color: error && card.key !== "question" ? "#A32D2D" : "#1a1a1a", ...urdu }}>
                    {content}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ textAlign: "center", padding: "0.5rem 0 1rem", fontSize: "12px", color: "#bbb", fontFamily: "sans-serif" }}>
              جواب AI کی مدد سے تیار کیا گیا ہے — تصدیق ضروری ہے
            </div>
          </>
        )}

      </div>
    </div>
  );
}
