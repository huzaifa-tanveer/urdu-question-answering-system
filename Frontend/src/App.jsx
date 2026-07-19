import React, { useState } from "react";

// index.html <head> mein yeh add karo:
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">

const urdu  = { fontFamily: "'Noto Nastaliq Urdu', serif" };
const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans  = { fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif" };

const CARDS = [
  { key: "short_answer",    label: "مختصر جواب",    color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "detailed_answer", label: "تفصیلی جواب",   color: "#075985", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "answer_context",  label: "جواب کا حوالہ", color: "#6b21a8", bg: "#faf5ff", border: "#e9d5ff" },
];

const STATS = [
  { value: "2,079", label: "Total Questions", urduLabel: "کل سوالات",  icon: "❓" },
  { value: "53",    label: "Books Covered",   urduLabel: "کتابیں",     icon: "📚" },
  { value: "10+",   label: "Subjects",        urduLabel: "مضامین",     icon: "🎓" },
  { value: "1–12",  label: "All Grades",      urduLabel: "تمام درجات", icon: "📖" },
];

const HOW_TO_STEPS = [
  { num: "01", en: "Register or Login",                ur: "رجسٹر کریں یا لاگ ان کریں" },
  { num: "02", en: "Type your question in Urdu",       ur: "اردو میں سوال لکھیں" },
  { num: "03", en: "Press Enter or click پوچھیں",     ur: "انٹر دبائیں یا پوچھیں بٹن دبائیں" },
  { num: "04", en: "Get BERT + XLM-R answers",         ur: "BERT اور XLM-R دونوں کے جوابات پائیں" },
];

const SUBJECTS = [
  "اسلامیات","اردو","سماجی علوم","اخلاقیات",
  "تاریخ","پاکستان سٹڈیز","جغرافیہ","سائنس","جنرل نالج",
];

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0fdf4; }

  .navbar {
    position: sticky; top: 0; z-index: 100;
    background: #052e16;
    border-bottom: 2px solid #166534;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 68px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  }
  .nav-link {
    font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.65);
    cursor: pointer; padding: 6px 13px; border-radius: 6px;
    transition: all 0.2s; letter-spacing: 0.04em; text-transform: uppercase;
    border: none; background: none;
  }
  .nav-link:hover { background: rgba(255,255,255,0.1); color: #86efac; }
  .nav-link.active { color: #4ade80; background: rgba(74,222,128,0.12); }

  .hero {
    background: linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 75%, #15803d 100%);
    color: white; padding: 5.5rem 2rem 4.5rem; text-align: center; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px),
      repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px);
  }
  .hero-inner { position: relative; z-index: 1; }
  .hero-badge {
    display: inline-block; background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25); color: #86efac;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 5px 18px; border-radius: 20px; margin-bottom: 1.5rem;
  }
  .hero-title-en { font-size: clamp(28px,5vw,44px); font-weight: 700; color: white; line-height: 1.2; margin-bottom: 0.5rem; }
  .hero-title-ur { font-size: clamp(20px,3.5vw,32px); font-weight: 700; color: rgba(255,255,255,0.9); direction: rtl; margin-bottom: 1.25rem; }
  .hero-sub { font-size: 15px; color: rgba(255,255,255,0.72); max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.75; }
  .hero-btn {
    display: inline-block; background: #4ade80; color: #052e16;
    font-size: 14px; font-weight: 700; padding: 13px 34px; border-radius: 8px;
    border: none; cursor: pointer; letter-spacing: 0.04em; text-transform: uppercase;
    transition: all 0.2s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .hero-btn:hover { transform: translateY(-2px); background: #86efac; box-shadow: 0 8px 28px rgba(0,0,0,0.25); }

  .wrap { max-width: 900px; margin: 0 auto; padding: 4rem 2rem; }
  .section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #16a34a; margin-bottom: 0.5rem; }
  .section-h2 { font-size: clamp(22px,3vw,30px); font-weight: 700; color: #052e16; margin-bottom: 0.4rem; line-height: 1.3; }
  .section-h3 { font-size: clamp(17px,2.5vw,22px); color: #4b7a5e; direction: rtl; margin-bottom: 2rem; }
  .divider { width: 44px; height: 3px; background: linear-gradient(90deg,#16a34a,#4ade80); border-radius: 2px; margin-bottom: 2.5rem; }

  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 1.25rem; }

  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: start; }
  @media(max-width:640px){ .about-grid{ grid-template-columns:1fr; } }

  .subject-tag {
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px;
    padding: 6px 18px; font-size: 14px; color: #14532d; font-weight: 600;
    transition: all 0.2s; cursor: default;
  }
  .subject-tag:hover { background: #dcfce7; border-color: #86efac; color: #166534; }

  .step-card {
    display: flex; align-items: flex-start; gap: 1.25rem;
    background: white; border: 1px solid #bbf7d0; border-radius: 10px;
    padding: 1.25rem 1.5rem; margin-bottom: 1rem; transition: all 0.2s;
  }
  .step-card:hover { border-color: #4ade80; box-shadow: 0 4px 16px rgba(22,101,52,0.08); }

  .ask-box { background: white; border: 1px solid #bbf7d0; border-radius: 14px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .ask-input {
    flex: 1; padding: 15px 20px; border: 1.5px solid #bbf7d0; border-radius: 8px;
    font-size: 16px; color: #1e293b; outline: none; direction: rtl;
    transition: all 0.2s; background: #f0fdf4; width: 100%;
  }
  .ask-input:focus { border-color: #166534; background: white; box-shadow: 0 0 0 3px rgba(22,101,52,0.10); }
  .ask-submit {
    height: 52px; padding: 0 28px; border-radius: 8px; border: none;
    background: linear-gradient(135deg,#14532d,#166534); color: white;
    font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap;
    transition: all 0.2s; flex-shrink: 0;
  }
  .ask-submit:hover { opacity: 0.9; transform: translateY(-1px); }
  .ask-submit:disabled { background: #86efac; cursor: not-allowed; transform: none; }

  .result-card { background: white; border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
  .result-header { display: flex; align-items: center; gap: 10px; padding: 11px 18px; direction: rtl; }
  .result-body { padding: 16px 20px; font-size: 15px; line-height: 2.5; color: #1e293b; direction: rtl; text-align: right; }

  .book-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;
    font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; letter-spacing: 0.04em;
  }

  .footer { background: #052e16; color: rgba(255,255,255,0.55); text-align: center; padding: 3rem 2rem; }

  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
  .dot { width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 1s infinite;display:inline-block;flex-shrink:0; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fadeUp { animation: fadeUp 0.4s ease both; }

  .auth-wrap {
    min-height:100vh;
    background: linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 75%, #15803d 100%);
    display:flex; align-items:center; justify-content:center; padding:1.5rem; position:relative;
  }
  .auth-grid-bg {
    position:fixed; inset:0;
    background-image:
      repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px),
      repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px);
    pointer-events:none;
  }
  .auth-card {
    background:white; border-radius:16px; padding:2.5rem;
    box-shadow:0 20px 60px rgba(0,0,0,0.2); border:1px solid #bbf7d0;
    width:100%; max-width:420px; position:relative; z-index:1;
  }
  .tab-btn { flex:1; padding:10px; border:none; border-radius:8px; font-size:14px; cursor:pointer; transition:all 0.2s; }
  .field-input {
    width:100%; padding:13px 16px; background:#f0fdf4; border:1.5px solid #bbf7d0;
    border-radius:8px; font-size:14px; color:#1e293b; outline:none;
    transition:all 0.2s; box-sizing:border-box;
  }
  .field-input:focus { border-color:#166534; box-shadow:0 0 0 3px rgba(22,101,52,0.10); background:white; }
`;

// ── Auth Page ─────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode]         = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState("");
  const [msgType, setMsgType]   = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setMsg("براہ کرم تمام خانے پُر کریں"); setMsgType("error"); return;
    }
    setLoading(true); setMsg("");
    try {
      const res  = await fetch(`http://127.0.0.1:8000/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (mode === "login") { onLogin(username); }
        else { setMsg("اکاؤنٹ بن گیا! اب لاگ ان کریں"); setMsgType("success"); setMode("login"); setUsername(""); setPassword(""); }
      } else { setMsg(data.detail || "کچھ غلط ہوا"); setMsgType("error"); }
    } catch { setMsg("سرور سے رابطہ نہیں ہو سکا"); setMsgType("error"); }
    setLoading(false);
  };

  return (
    <div className="auth-wrap">
      <style>{CSS}</style>
      <div className="auth-grid-bg" />
      <div className="fadeUp" style={{ width:"100%", maxWidth:"420px" }}>

        {/* Logo block */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{
            width:"76px", height:"76px", borderRadius:"20px",
            background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 1.25rem",
          }}>
            <span style={{ fontSize:"34px" }}>📚</span>
          </div>
          <div style={{ fontSize:"10px", fontWeight:"700", letterSpacing:"0.16em", textTransform:"uppercase", color:"#86efac", marginBottom:"8px", ...sans }}>
            GKUQAS — Beta
          </div>
          <h1 style={{ fontSize:"20px", fontWeight:"700", color:"white", margin:"0 0 5px", lineHeight:1.6, ...urdu }}>
            جنرل نالج اردو سوال و جواب کا نظام
          </h1>
          <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.55)", ...sans }}>
            General Knowledge Urdu Question Answer System
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Green top strip */}
          <div style={{
            height:"4px", borderRadius:"4px 4px 0 0",
            background:"linear-gradient(90deg,#16a34a,#4ade80,#86efac)",
            margin:"-2.5rem -2.5rem 1.75rem",
          }} />

          {/* Tabs */}
          <div style={{ display:"flex", background:"#f0fdf4", borderRadius:"10px", padding:"4px", marginBottom:"1.75rem", border:"1px solid #bbf7d0" }}>
            {[["login","لاگ ان"],["register","رجسٹر"]].map(([m,label])=>(
              <button key={m} className="tab-btn"
                onClick={()=>{ setMode(m); setMsg(""); }}
                style={{
                  background: mode===m ? "white" : "transparent",
                  color:      mode===m ? "#166534" : "#94a3b8",
                  fontWeight: mode===m ? "700" : "400",
                  boxShadow:  mode===m ? "0 1px 8px rgba(22,101,52,0.12)" : "none",
                  border:     mode===m ? "1px solid #bbf7d0" : "1px solid transparent",
                  ...urdu,
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Username */}
          <div style={{ marginBottom:"1rem" }}>
            <label style={{ display:"block", fontSize:"11px", color:"#64748b", marginBottom:"6px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", ...sans }}>Username</label>
            <input className="field-input" type="text" value={username}
              onChange={(e)=>setUsername(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter"&&submit()}
              placeholder="username likhen" style={{ ...sans }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom:"1.5rem" }}>
            <label style={{ display:"block", fontSize:"11px", color:"#64748b", marginBottom:"6px", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", ...sans }}>Password</label>
            <input className="field-input" type="password" value={password}
              onChange={(e)=>setPassword(e.target.value)}
              onKeyDown={(e)=>e.key==="Enter"&&submit()}
              placeholder="password likhen" style={{ ...sans }} />
          </div>

          {/* Message */}
          {msg && (
            <div style={{
              padding:"11px 15px", borderRadius:"8px", marginBottom:"1rem", fontSize:"13px",
              background: msgType==="error" ? "#fef2f2" : "#f0fdf4",
              color:      msgType==="error" ? "#dc2626" : "#166534",
              border:     `1px solid ${msgType==="error" ? "#fecaca" : "#bbf7d0"}`,
              ...urdu,
            }}>
              {msg}
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading}
            style={{
              width:"100%", padding:"14px", borderRadius:"8px", border:"none",
              background:"linear-gradient(135deg,#14532d,#166534,#15803d)",
              color:"white", fontSize:"15px", fontWeight:"700",
              cursor: loading ? "not-allowed" : "pointer",
              transition:"all 0.2s", opacity: loading ? 0.7 : 1,
              ...urdu,
            }}>
            {loading ? "⏳ ..." : mode==="login" ? "لاگ ان کریں ←" : "اکاؤنٹ بنائیں ←"}
          </button>

          <p style={{ textAlign:"center", fontSize:"11px", color:"#94a3b8", marginTop:"1.25rem", ...sans }}>
            BERT + XLM-R &nbsp;·&nbsp; 2,079 Questions &nbsp;·&nbsp; 53 Books
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main App Page ─────────────────────────────────────────────
function AppPage({ username, onLogout }) {
  const [question, setQuestion]   = useState("");
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const scrollTo = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true); setError(false); setResult(null);
    scrollTo("ask");
    try {
      const res  = await fetch(`http://127.0.0.1:8000/ask?q=${encodeURIComponent(question)}`);
      const data = await res.json();
      setResult({
        question:        data.question        || question,
        bert_answer:     data.bert_answer     || "",
        xlmr_answer:     data.xlmr_answer     || "",
        short_answer:    data.short_answer    || "",
        detailed_answer: data.detailed_answer || "",
        answer_context:  data.answer_context  || "",
        book_name:       data.book_name       || "",
        page:            data.page            || "",
        score:           data.score           || 0,
      });
    } catch {
      setResult({
        question,
        bert_answer:     "",
        xlmr_answer:     "",
        short_answer:    "کنکشن خطا",
        detailed_answer: "سرور سے جواب نہیں ملا۔",
        answer_context:  "",
      });
      setError(true);
    }
    setLoading(false);
  };

  const initials = username.slice(0,2).toUpperCase();

  return (
    <div style={{ background:"#f0fdf4", minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"22px" }}>📚</span>
          <span style={{ fontSize:"16px", fontWeight:"700", color:"#86efac", ...serif }}>GKUQAS</span>
          <span style={{ fontSize:"10px", background:"#166534", color:"#86efac", padding:"2px 9px", borderRadius:"20px", fontWeight:"700", letterSpacing:"0.06em", border:"1px solid #4ade80", ...sans }}>BETA</span>
        </div>
        <div style={{ display:"flex", gap:"2px" }}>
          {[["home","Home"],["about","About"],["stats","Stats"],["howto","How To Use"],["ask","Ask Now"]].map(([id,label])=>(
            <button key={id} className={`nav-link${activeNav===id?" active":""}`} onClick={()=>scrollTo(id)} style={{ ...sans }}>{label}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,#14532d,#4ade80)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color:"#052e16", ...sans }}>{initials}</div>
          <span style={{ fontSize:"13px", color:"#86efac", fontWeight:"600", ...sans }}>{username}</span>
          <button onClick={onLogout} style={{ padding:"7px 15px", borderRadius:"7px", border:"1.5px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.08)", fontSize:"12px", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontWeight:"600", ...sans }}>Logout</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div id="home" className="hero">
        <div className="hero-inner">
          <div className="hero-badge" style={{ ...sans }}>📚 BERT + XLM-R Dual AI System</div>
          <h1 className="hero-title-en" style={{ ...serif }}>General Knowledge<br/>Question &amp; Answer</h1>
          <h2 className="hero-title-ur" style={{ ...urdu }}>جنرل نالج اردو سوال و جواب کا نظام</h2>
          <p className="hero-sub" style={{ ...sans }}>
            Powered by Urdu BERT + XLM-R — 53 books, 2,079 questions, Grades 1 to 12.
          </p>
          <button className="hero-btn" onClick={()=>scrollTo("ask")} style={{ ...sans }}>
            سوال پوچھیں — Ask Now →
          </button>
        </div>
      </div>

      {/* ── Stats — Green gradient background ── */}
      <div id="stats" style={{
        background:"linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)",
        borderTop:"1px solid #15803d", borderBottom:"1px solid #15803d",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px)," +
            "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px)",
        }} />
        <div className="wrap" style={{ paddingTop:"3rem", paddingBottom:"3rem", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <p style={{ fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", textTransform:"uppercase", color:"#86efac", marginBottom:"0.5rem", ...sans }}>By the Numbers</p>
            <h2 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:"700", color:"white", marginBottom:"0.4rem", lineHeight:"1.3", ...serif }}>Dataset Statistics</h2>
            <div style={{ width:"44px", height:"3px", background:"linear-gradient(90deg,#4ade80,#86efac)", borderRadius:"2px", margin:"0.5rem auto 0" }} />
          </div>

          <div className="stats-grid">
            {STATS.map((s)=>(
              <div key={s.label}
                style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(74,222,128,0.3)", borderTop:"3px solid #4ade80", borderRadius:"10px", padding:"1.75rem 1.5rem", textAlign:"center", transition:"all 0.2s", cursor:"default" }}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.14)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.transform="translateY(0)"; }}
              >
                <div style={{ fontSize:"28px", marginBottom:"0.75rem" }}>{s.icon}</div>
                <div style={{ fontSize:"32px", fontWeight:"700", color:"#86efac", marginBottom:"0.3rem", ...serif }}>{s.value}</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)", fontWeight:"600", letterSpacing:"0.04em", textTransform:"uppercase", ...sans }}>{s.label}</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)", direction:"rtl", marginTop:"3px", ...urdu }}>{s.urduLabel}</div>
              </div>
            ))}
          </div>

          {/* AI Models */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", marginTop:"1.5rem" }}>
            <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(251,191,36,0.35)", borderTop:"3px solid #fbbf24", borderRadius:"10px", padding:"1.5rem" }}>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#fcd34d", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px", ...sans }}>Model 1 — Urdu BERT</div>
              <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)", ...sans }}>Semantic similarity se best answer choose karta hai</div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(74,222,128,0.35)", borderTop:"3px solid #4ade80", borderRadius:"10px", padding:"1.5rem" }}>
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#86efac", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"8px", ...sans }}>Model 2 — XLM-R</div>
              <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)", ...sans }}>Context se exact answer extract karta hai</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <div id="about" style={{ background:"#f0fdf4" }}>
        <div className="wrap">
          <p className="section-eyebrow" style={{ ...sans }}>About the Project</p>
          <h2 className="section-h2" style={{ ...serif }}>What is GKUQAS?</h2>
          <h3 className="section-h3" style={{ ...urdu }}>یہ نظام کیا ہے؟</h3>
          <div className="divider" />
          <div className="about-grid">
            <div style={{ fontSize:"15px", color:"#374151", lineHeight:"1.85", ...sans }}>
              <p style={{ marginBottom:"1rem" }}><strong style={{ color:"#052e16" }}>GKUQAS</strong> is an AI-powered platform that answers Urdu general knowledge questions using a <strong style={{ color:"#052e16" }}>dual AI model pipeline</strong>.</p>
              <p style={{ marginBottom:"1rem" }}><strong style={{ color:"#b45309" }}>Urdu BERT</strong> uses semantic similarity to find the best answer. <strong style={{ color:"#166534" }}>XLM-R</strong> extracts the exact answer span from the context.</p>
              <p style={{ marginBottom:"1.5rem" }}>Built for students, teachers, and researchers.</p>
              <p style={{ fontSize:"12px", fontWeight:"700", letterSpacing:"0.1em", textTransform:"uppercase", color:"#166534", marginBottom:"0.75rem" }}>Subjects Covered</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", direction:"rtl" }}>
                {SUBJECTS.map((s)=>(<span key={s} className="subject-tag" style={{ ...urdu }}>{s}</span>))}
              </div>
            </div>
            <div style={{ fontSize:"15px", color:"#374151", lineHeight:"2.6", direction:"rtl", textAlign:"right", ...urdu }}>
              <p style={{ marginBottom:"1rem" }}><strong style={{ color:"#052e16" }}>جی کے یو کیو اے ایس</strong> ایک ڈوئل اے آئی ماڈل سسٹم ہے۔</p>
              <p style={{ marginBottom:"1rem" }}><strong style={{ color:"#b45309" }}>اردو BERT</strong> بہترین جواب منتخب کرتا ہے، <strong style={{ color:"#166534" }}>XLM-R</strong> سیاق و سباق سے عین جواب نکالتا ہے۔</p>
              <p>یہ نظام طلباء، اساتذہ اور محققین کے لیے بنایا گیا ہے۔</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── How To Use ── */}
      <div id="howto" style={{ background:"white", borderTop:"1px solid #bbf7d0", borderBottom:"1px solid #bbf7d0" }}>
        <div className="wrap">
          <p className="section-eyebrow" style={{ ...sans }}>Guide</p>
          <h2 className="section-h2" style={{ ...serif }}>How To Use</h2>
          <h3 className="section-h3" style={{ ...urdu }}>استعمال کا طریقہ</h3>
          <div className="divider" />
          {HOW_TO_STEPS.map((step)=>(
            <div key={step.num} className="step-card">
              <div style={{ fontSize:"22px", fontWeight:"700", color:"#166534", minWidth:"36px", lineHeight:1, opacity:0.5, ...serif }}>{step.num}</div>
              <div>
                <div style={{ fontSize:"15px", fontWeight:"600", color:"#052e16", marginBottom:"4px", ...sans }}>{step.en}</div>
                <div style={{ fontSize:"14px", color:"#4b7a5e", direction:"rtl", ...urdu }}>{step.ur}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ask Section ── */}
      <div id="ask" style={{
        background:"linear-gradient(160deg, #052e16 0%, #14532d 40%, #166534 75%, #15803d 100%)",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px)," +
            "repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.03) 40px,rgba(255,255,255,0.03) 41px)",
        }} />
        <div className="wrap" style={{ position:"relative", zIndex:1 }}>
          <p className="section-eyebrow" style={{ ...sans, color:"#86efac" }}>Ask Anything</p>
          <h2 className="section-h2" style={{ ...serif, color:"white" }}>Ask a Question</h2>
          <h3 className="section-h3" style={{ ...urdu, color:"rgba(255,255,255,0.75)" }}>سوال پوچھیں</h3>
          <div className="divider" style={{ background:"linear-gradient(90deg,#4ade80,#86efac)" }} />

          <div className="ask-box">
            <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
              <input
                className="ask-input"
                type="text"
                value={question}
                onChange={(e)=>setQuestion(e.target.value)}
                onKeyDown={(e)=>e.key==="Enter"&&askQuestion()}
                placeholder="یہاں اردو میں سوال لکھیں..."
                style={{ ...urdu }}
              />
              <button className="ask-submit" onClick={askQuestion} disabled={loading} style={{ ...urdu }}>
                {loading ? "⏳" : "پوچھیں ←"}
              </button>
            </div>
          </div>

          {loading && (
            <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px", background:"rgba(255,255,255,0.10)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"10px", marginTop:"1rem", direction:"rtl" }}>
              <span className="dot" />
              <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.9)", ...urdu }}>BERT + XLM-R دونوں کام کر رہے ہیں...</span>
            </div>
          )}

          {!result && !loading && (
            <div style={{ textAlign:"center", padding:"3.5rem 1rem" }}>
              <div style={{ fontSize:"48px", marginBottom:"1rem" }}>🔍</div>
              <p style={{ fontSize:"14px", fontWeight:"600", color:"rgba(255,255,255,0.7)", ...sans }}>Ask your first question above</p>
              <p style={{ fontSize:"13px", marginTop:"4px", color:"rgba(255,255,255,0.45)", ...urdu }}>اوپر اپنا سوال لکھ کر شروع کریں</p>
            </div>
          )}

          {result && !loading && (
            <div className="fadeUp" style={{ marginTop:"1.5rem" }}>
              {result.book_name && (
                <div style={{ marginBottom:"12px", display:"flex", justifyContent:"flex-end" }}>
                  <span className="book-badge" style={{ ...sans }}>
                    📖 {result.book_name}{result.page ? ` — Page ${result.page}` : ""}
                    <span style={{ background:"#166534", color:"white", padding:"1px 7px", borderRadius:"10px", fontSize:"10px", marginLeft:"6px" }}>
                      {Math.round(result.score * 100)}% match
                    </span>
                  </span>
                </div>
              )}

              {result.short_answer === "معذرت، اس سوال کا جواب ڈیٹاسیٹ میں نہیں ملا" ? (
                <div style={{ textAlign:"center", padding:"2rem", background:"#fef2f2", borderRadius:"12px", border:"1px solid #fecaca", direction:"rtl" }}>
                  <div style={{ fontSize:"32px", marginBottom:"8px" }}>😔</div>
                  <p style={{ fontSize:"15px", color:"#dc2626", fontWeight:"600", ...urdu }}>معذرت، اس سوال کا جواب نہیں ملا</p>
                  <p style={{ fontSize:"13px", color:"#94a3b8", marginTop:"6px", ...sans }}>براہ کرم پاکستانی نصاب سے متعلق سوال پوچھیں</p>
                </div>
              ) : (
                CARDS.map((card) => {
                  const content = result[card.key];
                  if (!content) return null;
                  return (
                    <div key={card.key} className="result-card" style={{ border:`1px solid ${card.border}` }}>
                      <div className="result-header" style={{ background:card.bg, borderBottom:`1px solid ${card.border}` }}>
                        <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:card.color, flexShrink:0 }} />
                        <span style={{ fontSize:"13px", fontWeight:"700", color:card.color, ...urdu }}>{card.label}</span>
                      </div>
                      <div className="result-body" style={{ color:error ? "#dc2626" : "#1e293b", ...urdu }}>
                        {content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div style={{ fontSize:"28px", marginBottom:"0.75rem" }}>📚</div>
        <p style={{ fontWeight:"700", fontSize:"17px", color:"#86efac", marginBottom:"5px", ...serif }}>GKUQAS</p>
        <p style={{ fontSize:"13px", marginBottom:"4px", ...sans }}>General Knowledge Urdu Question Answer System</p>
        <p style={{ fontSize:"14px", direction:"rtl", marginBottom:"1.75rem", color:"rgba(255,255,255,0.6)", ...urdu }}>جنرل نالج اردو سوال و جواب کا نظام</p>
        <div style={{ width:"40px", height:"1px", background:"rgba(74,222,128,0.3)", margin:"0 auto 1.5rem" }} />
        <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)", ...sans }}>
          <strong style={{ color:"#86efac" }}>2,079 Questions</strong> &nbsp;·&nbsp;
          <strong style={{ color:"#86efac" }}>53 Books</strong> &nbsp;·&nbsp;
          Grades 1–12 &nbsp;·&nbsp; Urdu BERT + XLM-R
        </p>
        <p style={{ fontSize:"11px", marginTop:"0.5rem", color:"rgba(255,255,255,0.25)", ...sans }}>Beta — FastAPI + React + Transformers</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <AuthPage onLogin={(u)=>setUser(u)} />;
  return <AppPage username={user} onLogout={()=>setUser(null)} />;
}
