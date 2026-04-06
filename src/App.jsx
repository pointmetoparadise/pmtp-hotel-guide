import { useState, useRef, useEffect } from "react";

const DEFAULT_INFO_BANK = `## Company Policies

**PTO Policy**
Employees receive 15 days of PTO per year, accrued monthly. PTO requests must be submitted at least 2 weeks in advance through the HR portal. Unused PTO can be rolled over up to 5 days.

**Remote Work**
Employees may work remotely up to 3 days per week. Remote work must be approved by your direct manager. Core hours are 10am–3pm in your local timezone.

**Health Benefits**
Full-time employees are eligible for health, dental, and vision insurance starting on day 1. Open enrollment is held every November. Contact hr@company.com for plan details.

**Expense Reimbursement**
Submit expense reports within 30 days of purchase via Concur. Meals are reimbursable up to $75/day. All expenses over $500 require pre-approval.

**IT Support**
Submit IT tickets at helpdesk.company.com or call ext. 4357. Response time is within 4 business hours for standard requests, 1 hour for critical issues.

**Payroll**
Payroll is processed bi-weekly on Fridays. Direct deposit setup is available through the employee portal. Contact payroll@company.com for any discrepancies.

**Onboarding**
New employees should complete all onboarding paperwork within the first week. Your manager will schedule a 30-60-90 day check-in to review your progress.

**Performance Reviews**
Annual reviews are conducted every December. Mid-year check-ins are held in June. Self-assessments are due 2 weeks before your scheduled review.`;

const SYSTEM_PROMPT_TEMPLATE = (infoBank) => `You are a helpful internal employee assistant for our company. You answer questions based ONLY on the information provided in the company knowledge base below. Be concise, friendly, and professional. If the answer isn't in the knowledge base, say you don't have that information and suggest contacting HR or the relevant department.

COMPANY KNOWLEDGE BASE:
${infoBank}`;

export default function EmployeeChatbot() {
  const [view, setView] = useState("chat"); // "chat" | "settings"
  const [infoBank, setInfoBank] = useState(DEFAULT_INFO_BANK);
  const [draftInfoBank, setDraftInfoBank] = useState(DEFAULT_INFO_BANK);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm your internal company assistant. Ask me anything about policies, benefits, IT, payroll, or other workplace topics.",
      id: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [saved, setSaved] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim(), id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT_TEMPLATE(infoBank),
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, id: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again.", id: Date.now() }]);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([{
      role: "assistant",
      content: "Hi there! 👋 I'm your internal company assistant. Ask me anything about policies, benefits, IT, payroll, or other workplace topics.",
      id: Date.now(),
    }]);
  };

  const saveInfoBank = () => {
    setInfoBank(draftInfoBank);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f5f0e8", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        background: "#1a1a2e",
        color: "#f5f0e8",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        borderBottom: "3px solid #c9a84c",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "linear-gradient(135deg, #c9a84c, #e8c97a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>🏢</div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "0.05em" }}>INTERNAL ASSISTANT</div>
            <div style={{ fontSize: "11px", color: "#c9a84c", letterSpacing: "0.1em", textTransform: "uppercase" }}>Employee Knowledge Base</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["chat", "settings"].map((v) => (
            <button
              key={v}
              onClick={() => { setView(v); if (v === "settings") setDraftInfoBank(infoBank); }}
              style={{
                padding: "6px 16px",
                borderRadius: "6px",
                border: "1.5px solid",
                borderColor: view === v ? "#c9a84c" : "rgba(201,168,76,0.3)",
                background: view === v ? "#c9a84c" : "transparent",
                color: view === v ? "#1a1a2e" : "#c9a84c",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}
            >
              {v === "chat" ? "💬 Chat" : "⚙️ Info Bank"}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "820px", width: "100%", margin: "0 auto", padding: "24px 20px", boxSizing: "border-box", minHeight: 0 }}>
        
        {view === "chat" ? (
          <>
            {/* Chat History */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingRight: "4px",
              minHeight: "300px",
              maxHeight: "calc(100vh - 240px)",
            }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    fontSize: "11px",
                    color: "#888",
                    marginBottom: "4px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'Georgia', serif",
                  }}>
                    {msg.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div style={{
                    maxWidth: "75%",
                    padding: "14px 18px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user" ? "#1a1a2e" : "#fff",
                    color: msg.role === "user" ? "#f5f0e8" : "#2a2a2a",
                    fontSize: "14.5px",
                    lineHeight: "1.65",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    border: msg.role === "assistant" ? "1px solid #e8e0d0" : "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}>
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      style={{
                        marginTop: "6px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        background: "transparent",
                        border: "1px solid #ccc",
                        borderRadius: "20px",
                        cursor: "pointer",
                        color: copiedId === msg.id ? "#2a7a4b" : "#888",
                        borderColor: copiedId === msg.id ? "#2a7a4b" : "#ccc",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {copiedId === msg.id ? "✓ Copied" : "Copy"}
                    </button>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <div style={{
                    padding: "14px 18px",
                    background: "#fff",
                    borderRadius: "18px 18px 18px 4px",
                    border: "1px solid #e8e0d0",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          background: "#c9a84c",
                          animation: "pulse 1.2s ease-in-out infinite",
                          animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Clear history */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px", marginBottom: "4px" }}>
              <button onClick={clearHistory} style={{
                fontSize: "12px", color: "#aaa", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em",
                textDecoration: "underline",
              }}>Clear history</button>
            </div>

            {/* Input */}
            <div style={{
              display: "flex",
              gap: "10px",
              background: "#fff",
              border: "1.5px solid #d4c8b0",
              borderRadius: "14px",
              padding: "10px 14px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
              alignItems: "flex-end",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about policies, benefits, IT support..."
                rows={1}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  fontSize: "14.5px",
                  color: "#2a2a2a",
                  background: "transparent",
                  lineHeight: "1.5",
                  minHeight: "24px",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: input.trim() && !loading ? "#1a1a2e" : "#ddd",
                  border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", transition: "all 0.15s", flexShrink: 0,
                }}
              >
                ↑
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", color: "#bbb", marginTop: "8px", letterSpacing: "0.04em" }}>
              Answers are based on your company info bank · Enter to send · Shift+Enter for new line
            </div>
          </>
        ) : (
          /* Info Bank View -- Password Protected */
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", height: "100%" }}>
            {infoLocked ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>[Lock]</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: C.navy, letterSpacing: "0.06em", marginBottom: "6px" }}>Admin Access Only</div>
                  <div style={{ fontSize: "13px", color: C.textMid }}>Enter the admin password to edit the Info Bank.</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "320px" }}>
                  <input
                    type="password"
                    value={pwInput}
                    onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                    onKeyDown={e => { if (e.key === "Enter") { if (pwInput === "Alohahowdy808@@") { setInfoLocked(false); setPwError(false); } else { setPwError(true); setPwInput(""); } } }}
                    placeholder="Enter password"
                    style={{ padding: "12px 16px", borderRadius: "8px", border: pwError ? "1.5px solid #e05a5a" : "1.5px solid " + C.creamBorder, fontFamily: "inherit", fontSize: "14px", color: C.navy, outline: "none", background: C.white }}
                  />
                  {pwError && <div style={{ color: "#e05a5a", fontSize: "12px", textAlign: "center" }}>Incorrect password. Try again.</div>}
                  <button
                    onClick={() => { if (pwInput === "Alohahowdy808@@") { setInfoLocked(false); setPwError(false); } else { setPwError(true); setPwInput(""); } }}
                    style={{ padding: "11px", borderRadius: "8px", background: "linear-gradient(135deg, " + C.navy + ", " + C.navyMid + ")", border: "1px solid " + C.gold, color: C.goldLight, fontFamily: "inherit", fontSize: "12px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Unlock
                  </button>
                </div>
              </div>
            ) : (
            <React.Fragment>
            <div style={{ borderBottom: "1px solid " + C.creamBorder, paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <div style={{ width: "3px", height: "22px", background: "linear-gradient(to bottom, " + C.gold + ", " + C.teal + ")", borderRadius: "2px" }} />
                <h2 style={{ margin: 0, fontSize: "21px", color: C.navy, fontWeight: "700", letterSpacing: "0.04em" }}>Agent Info Bank</h2>
              </div>
              <p style={{ margin: 0, color: C.textMid, fontSize: "15px", lineHeight: "1.6", paddingLeft: "13px" }}>
                This is the knowledge Solei draws from. Edit or add information here — changes take effect immediately after saving.
              </p>
            </div>
            <textarea
              value={draftInfoBank}
              onChange={(e) => setDraftInfoBank(e.target.value)}
              style={{
                flex: 1,
                minHeight: "420px",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid " + C.creamBorder,
                fontFamily: "'Courier New', monospace",
                fontSize: "15px",
                lineHeight: "1.75",
                color: C.text,
                background: C.creamCard,
                resize: "vertical",
                outline: "none",
                boxShadow: "inset 0 2px 8px rgba(27,45,58,0.04)",
              }}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={saveInfoBank}
                style={{
                  padding: "11px 30px",
                  borderRadius: "6px",
                  background: saved ? C.success : "linear-gradient(135deg, " + C.navy + ", " + C.navyMid + ")",
                  color: C.white,
                  border: "1px solid " + (saved ? C.success : C.gold),
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 12px rgba(27,45,58,0.2)",
                }}
              >
                {saved ? "v Saved" : "Save Info Bank"}
              </button>
              <button
                onClick={() => setDraftInfoBank(DEFAULT_INFO_BANK)}
                style={{
                  padding: "11px 22px",
                  borderRadius: "6px",
                  background: "transparent",
                  color: C.textMid,
                  border: "1px solid " + C.creamBorder,
                  fontFamily: "inherit",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              {saved && (
                <span style={{ color: C.success, fontSize: "12px", fontStyle: "italic", letterSpacing: "0.04em" }}>
                  Solei will now use your updated info.
                </span>
              )}
            </div>
            </React.Fragment>
            )}
          </div>
        )}
      </div>

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
        * { box-sizing: border-box; }
        @keyframes pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 4px; }
        textarea::placeholder { color: #7a6e5f; font-style: italic; }
        button:hover { filter: brightness(1.06); }

        @media (max-width: 640px) {
          .pmtp-teal-stripe span { font-size: 14px !important; letter-spacing: 0.05em !important; }
          .pmtp-banner span { font-size: 12px !important; letter-spacing: 0.03em !important; }
          .pmtp-header { padding: 0 14px !important; height: 60px !important; }
          .pmtp-header-title { font-size: 26px !important; }
          .pmtp-header-subtitle { font-size: 12px !important; }
          .pmtp-nav-btn { padding: 7px 12px !important; font-size: 14px !important; }
          .pmtp-main { padding: 12px !important; }
          .pmtp-bubble { max-width: 93% !important; padding: 14px 16px !important; font-size: 20px !important; line-height: 1.6 !important; }
          .pmtp-category-btn { font-size: 20px !important; padding: 14px 16px !important; }
          .pmtp-prompt-btn { font-size: 18px !important; padding: 14px 18px !important; }
          .pmtp-input-textarea { font-size: 20px !important; }
          .pmtp-footer-hint { font-size: 14px !important; }
          .pmtp-speaker-label { font-size: 15px !important; }
          .pmtp-copy-btn { font-size: 14px !important; padding: 5px 14px !important; }
        }
      `}</style>
    </div>
  );
}
