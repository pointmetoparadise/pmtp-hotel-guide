import { useState } from "react";

const A = {
  navy:      "#162d42", gold:      "#c9a84c", goldLight: "#f5e9c8",
  teal:      "#3a9a9a", tealLight: "#e0f5f5", border:    "#ddd5c0",
  muted:     "#7a6e5f", beige:     "#f5f0e6", cream:     "#faf7f2",
  red:       "#b83232", redLight:  "#fdecea", slate:     "#f0ebe0",
  dark:      "#162d42",
};

const VOICES = [
  { id: "pmtp", label: "PMTP Voice", icon: "🌴", tagline: "Concierge-level · warm · expert",
    description: "The signature Point Me to Paradise voice — professional, personal, and deeply knowledgeable. Feels like a trusted advisor who has personally stayed at this property.",
    prompt: `Write in the signature voice of Point Me to Paradise Travel. Professional yet warm, deeply knowledgeable yet personal — always concierge-level. Like a trusted advisor who has personally stayed at this property and is sharing everything a client needs to know. Expert without being showy. Personal without being casual.` },
  { id: "morgan", label: "Morgan Freeman", icon: "🎙️", tagline: "Wise · cinematic · deeply moving",
    description: "Deep, unhurried, and poetic. Rich imagery, timeless observations. Like a warm hand guiding someone toward something beautiful.",
    prompt: `Write in the style of Morgan Freeman narrating a documentary — deep, unhurried, poetic, and profoundly wise. Use rich imagery and timeless observations about place, hospitality, and the art of rest. The voice should feel like a calm, knowing presence guiding someone toward a truly transformative experience.` },
  { id: "bourdain", label: "Anthony Bourdain", icon: "🍷", tagline: "Raw · honest · street-level poetry",
    description: "Unapologetically honest, gritty-poetic, and deeply curious. Celebrates what is real about a property. Never oversells — reveals.",
    prompt: `Write in the style of Anthony Bourdain — unapologetically honest, gritty-poetic, and deeply curious. Celebrate what is real and extraordinary about this property without overselling it. Talk about the food, the bar, the staff, the feeling of the place at midnight. Write as if you actually stayed there and it meant something.` },
  { id: "samantha", label: "Samantha Brown", icon: "✈️", tagline: "Warm · enthusiastic · welcoming",
    description: "Like hotel advice from your most well-traveled best friend bursting with excitement for you. Upbeat, accessible, and encouraging.",
    prompt: `Write in the style of Samantha Brown — warm, genuinely enthusiastic, and deeply welcoming. Make the client feel like they are getting hotel advice from their most well-traveled best friend who has stayed there and is bursting with excitement for them. Be upbeat, accessible, and encouraging.` },
  { id: "funny", label: "Funny & Witty", icon: "😄", tagline: "Sharp humor · real insight · Bill Bryson energy",
    description: "Makes you laugh out loud while still being genuinely useful. Unexpected analogies, perfect comic timing, honest about resort clichés.",
    prompt: `Write with sharp, clever wit and genuine humor — hotel writing that makes the reader laugh out loud while still being genuinely useful. Gently poke fun at resort tropes while celebrating what genuinely makes this property worth staying at. Be funny but never at the expense of accuracy.` },
  { id: "mcconaughey", label: "Matthew McConaughey", icon: "🤠", tagline: "Laid back · philosophical · all right all right",
    description: "Unhurried, sun-soaked, and full of easy wisdom. Finds the deeper meaning in a pool deck. Makes every property feel like somewhere you were always meant to end up.",
    prompt: `Write in the style of Matthew McConaughey — unhurried, warm, and effortlessly philosophical. Use a laid-back cadence that never rushes, finds meaning in small moments of a hotel stay, and treats the experience of a great property as a journey of the soul. Make it feel sun-drenched and easy.` },
];

function buildPerplexityPrompt(form) {
  const prop = form.propertyName.trim();
  const dest = form.destination.trim();
  if (!prop && !dest) return null;
  const propFull = prop && dest ? `${prop} in ${dest}` : prop || dest;
  const lines = [
    `You are researching ${propFull} for a luxury concierge property guide. I need guidebook-depth research — thorough, specific, and rich with detail. Do not summarize. Go deep.`,
    ``,
    `SOURCES: Draw widely from hotel review blogs, travel blogger stays, guest reviews on TripAdvisor, Google, Booking.com, and Expedia, luxury travel publications (Conde Nast Traveler, Travel + Leisure, Forbes Travel Guide, Fodor's, Frommer's), hotel loyalty forums (TripAdvisor forums, FlyerTalk, View from the Wing), Instagram location tags, YouTube hotel tour videos, the property's own website, and press coverage. Prioritize first-hand guest accounts and travel blogger stays over marketing material.`,
    ``,
  ];
  if (form.travelDates) { lines.push(`Travel dates: ${form.travelDates}.`, ``); }
  if (form.roomType)    { lines.push(`Room/suite category of interest: ${form.roomType}.`, ``); }
  lines.push(
    `Research ALL sections below in full detail:`,
    ``,
    `1. PROPERTY OVERVIEW & VIBE`,
    `Overall character and atmosphere. Who is it best suited for? Design aesthetic and style? Size? What sets it apart? Awards? What guests consistently rave about vs. criticize?`,
    ``,
    `2. ROOMS & SUITES`,
    `Every room and suite category. For each: name, size, layout, view options, standout features, who it is best for. Which categories are worth upgrading? Which rooms or floors to request or avoid? Specific room numbers known for best views? Bathroom details? Bathtub? Bed situation?`,
    ``,
    `3. DINING & BARS`,
    `Every restaurant, bar, cafe on property. For each: name, cuisine, atmosphere, meal periods, signature dishes or drinks, dress code, reservations needed, honest quality assessment. Breakfast situation — included? Room service? Off-menu items worth asking for?`,
    ``,
    `4. POOLS, BEACH & OUTDOOR SPACES`,
    `Number and character of pools. Private, semi-private, or shared beach? Chair situation? Swim-up bars, infinity edges, adults-only areas, kids pools? What time do attendants set up? Cabanas and cost? Water quality? Hidden outdoor spots guests love?`,
    ``,
    `5. SPA, FITNESS & WELLNESS`,
    `Spa facilities — treatment rooms, thermal circuit, steam, sauna, plunge pools? Signature treatments and recommendations? Pricing range. Fitness center. Wellness programming, yoga, meditation, classes? How far in advance to book?`,
    ``,
    `6. SERVICE & STAFF`,
    `Service style — formal, relaxed, butler-led? Concierge team quality? Staff consistently praised? Butler service details? What guests say about check-in, room readiness, how issues are handled? Tips for getting the best service?`,
    ``,
    `7. ACTIVITIES, EXCURSIONS & AMENITIES`,
    `On-property activities and what is included vs. extra. Off-property excursions. Activities that book up fast. Family programming. Any activity guests consistently highlight?`,
    ``,
    `8. PRACTICAL LOGISTICS & INSIDER TIPS`,
    `Airport transfer options, times, costs. Check-in and check-out times — early/late strategies. What is included vs. resort fees? Tipping culture. Best time of year to visit. What to request before arrival. What to bring. Any quirks, limitations, or honest downsides.`,
    ``,
    `Be as specific as possible. Use real room names, real dish names, real pricing where available, real guest experiences. This research goes directly to Claude AI to write a luxury concierge property guide.`
  );
  return lines.join("\n");
}

function buildClaudePrompt(form, voiceId) {
  const prop = form.propertyName.trim();
  const dest = form.destination.trim();
  if (!prop && !dest) return null;
  const propFull = prop && dest ? `${prop}, ${dest}` : prop || dest;
  const voice = VOICES.find(v => v.id === voiceId) || VOICES[0];
  const details = [];
  if (form.clientName)  details.push(`Client name: ${form.clientName}`);
  if (form.agentName)   details.push(`Travel advisor name: ${form.agentName}`);
  if (prop)             details.push(`Property name: ${prop}`);
  if (dest)             details.push(`Location: ${dest}`);
  if (form.travelDates) details.push(`Travel dates: ${form.travelDates}`);
  if (form.roomType)    details.push(`Room/suite category: ${form.roomType}`);
  const researchBlock = form.researchPaste.trim()
    ? `\n\n--- PERPLEXITY RESEARCH (use this heavily) ---\n${form.researchPaste.trim()}\n--- END RESEARCH ---`
    : "";
  return `You are a senior travel advisor at Point Me to Paradise Travel. Write a complete, personal, concierge-level property guide directly to the client about ${propFull}.

WRITING VOICE:
${voice.prompt}

Always write in first-person from the advisor to the client. Use "you" and "your" throughout. Pull specific room names, restaurant names, pool details, service tips, and insider knowledge from the research provided.

OUTPUT STRUCTURE — use these exact section headers:

# A Personal Note
Warm intro. Use client's name if provided. Reference agent's name naturally. Explain why this property was chosen specifically for them.

## Why This Property
What makes ${prop || "this property"} the right choice — character, atmosphere, design, setting, who it is truly made for.

## Your Room
Guidance on their room or suite category. What to expect, standout features, views, bathroom details, what to request at check-in, room-specific tips.

## Dining On Property
Personal walkthrough of every restaurant, bar, and dining experience. Specific dishes to order, best times, reservation tips, honest assessments.

## The Pool & Beach
Everything they need — layout, chair strategy, best spots, timing, cabana options, swim-up bars, water quality, hidden outdoor gems.

## Spa, Fitness & Wellness
What the spa offers, which treatments to book and how far ahead, fitness facilities, wellness programming.

## Activities & Excursions
What to do on and off property — what is included, what costs extra, what books up fast, personal picks.

## Service, Tips & Insider Knowledge
What separates a good stay from a great one — who to contact, pre-arrival requests, tipping norms, check-in and check-out strategies, what the property does not tell you, honest limitations.

## A Final Word
Warm, personal close. Reinforce why this property is right for them. Mention Point Me to Paradise Travel. Sign off with agent's name if provided.

RULES:
- Flowing narrative paragraphs — not bullet lists
- Specific — use real room names, real dish names, real pool details from the research
- Every section feels like personal advice, not a brochure
- Do not use filler phrases like "of course" or "needless to say"
- Brand every guide for Point Me to Paradise Travel

TRIP DETAILS:
${details.join("\n")}${researchBlock}

Write the complete property guide now.`;
}

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; background: ${A.beige}; color: ${A.navy}; min-height: 100dvh; -webkit-text-size-adjust: 100%; }
  .hd-stripe { background: ${A.teal}; height: 28px; display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #fff; }
  .hd-warn { background: ${A.navy}; padding: 6px 16px; text-align: center; font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: ${A.gold}; }
  .hd-nav { background: ${A.navy}; border-bottom: 3px solid ${A.gold}; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 200; }
  .hd-logo { border-left: 3px solid ${A.teal}; padding-left: 14px; display: flex; flex-direction: column; gap: 3px; }
  .hd-logo-name { font-family: Georgia, serif; font-size: 17px; letter-spacing: 0.15em; text-transform: uppercase; color: #fff; line-height: 1; }
  .hd-logo-sub { font-family: Georgia, serif; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: ${A.gold}; }
  .page { max-width: 840px; margin: 0 auto; padding: 36px 20px 72px; }
  .page-eyebrow { font-family: Georgia, serif; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: ${A.teal}; margin-bottom: 5px; }
  .page-title { font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase; color: ${A.navy}; margin-bottom: 6px; }
  .page-desc { font-size: 13px; color: ${A.muted}; line-height: 1.6; margin-bottom: 32px; max-width: 580px; }
  .card { background: ${A.cream}; border: 1px solid ${A.border}; border-radius: 9px; box-shadow: 0 2px 16px rgba(22,45,66,0.07); margin-bottom: 14px; overflow: hidden; animation: fadeUp 0.4s ease both; }
  .card-head { display: flex; align-items: center; gap: 13px; padding: 15px 20px; border-bottom: 1px solid ${A.border}; }
  .step-num { width: 30px; height: 30px; border-radius: 50%; background: ${A.teal}; color: #fff; font-family: Georgia, serif; font-size: 13px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-num.done { background: ${A.gold}; color: ${A.navy}; }
  .step-head-text { flex: 1; }
  .step-title { font-family: Georgia, serif; font-size: 13px; letter-spacing: 0.09em; text-transform: uppercase; color: ${A.navy}; line-height: 1; }
  .step-sub { font-size: 11px; color: ${A.muted}; margin-top: 3px; }
  .step-badge { font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; flex-shrink: 0; }
  .step-badge.pending { background: ${A.beige}; color: ${A.muted}; border: 1px solid ${A.border}; }
  .step-badge.ready   { background: ${A.tealLight}; color: ${A.teal}; border: 1px solid ${A.teal}; }
  .step-badge.done    { background: ${A.goldLight}; color: #8a6820; border: 1px solid ${A.gold}; }
  .card-body { padding: 20px 20px 22px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
  @media (max-width: 520px) { .form-grid { grid-template-columns: 1fr; } }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field-label { font-family: Georgia, serif; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: ${A.muted}; }
  input, textarea { width: 100%; padding: 11px 13px; border: 1px solid ${A.border}; border-radius: 7px; background: #fff; font-family: system-ui, -apple-system, sans-serif; font-size: max(16px, 13px); color: ${A.navy}; outline: none; appearance: none; transition: border-color 0.15s, box-shadow 0.15s; }
  input:focus, textarea:focus { border-color: ${A.teal}; box-shadow: 0 0 0 3px rgba(58,154,154,0.12); }
  input::placeholder, textarea::placeholder { color: ${A.muted}; opacity: 0.65; }
  textarea { resize: vertical; line-height: 1.6; }
  .voice-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 4px; }
  @media (max-width: 460px) { .voice-grid { grid-template-columns: repeat(2, 1fr); } }
  .voice-card { border: 1.5px solid ${A.border}; border-radius: 8px; padding: 12px 10px; cursor: pointer; background: #fff; text-align: center; transition: all 0.15s; -webkit-tap-highlight-color: transparent; display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .voice-card:hover { border-color: ${A.teal}; background: ${A.tealLight}; }
  .voice-card.selected { border-color: ${A.teal}; background: ${A.tealLight}; box-shadow: 0 0 0 2px ${A.teal}; }
  .voice-icon { font-size: 22px; line-height: 1; }
  .voice-name { font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.04em; color: ${A.navy}; font-weight: bold; line-height: 1.2; text-align: center; }
  .voice-tagline { font-size: 10px; color: ${A.muted}; line-height: 1.3; text-align: center; }
  .voice-desc-box { background: ${A.tealLight}; border-left: 2px solid ${A.teal}; border-radius: 0 6px 6px 0; padding: 10px 14px; font-size: 12px; color: ${A.navy}; line-height: 1.6; margin-top: 12px; }
  .voice-desc-label { font-family: Georgia, serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: ${A.teal}; display: block; margin-bottom: 3px; }
  .prompt-label { font-family: Georgia, serif; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: ${A.teal}; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .prompt-label::after { content: ''; flex: 1; height: 1px; background: ${A.border}; }
  .prompt-box { background: ${A.navy}; border-radius: 8px; padding: 16px 18px; font-size: 12px; color: #d8ceb8; line-height: 1.75; white-space: pre-wrap; min-height: 80px; max-height: 340px; overflow-y: auto; border: 1px solid rgba(201,168,76,0.15); }
  .prompt-box.tall { max-height: 500px; }
  .prompt-empty { color: ${A.teal}; font-style: italic; }
  .prompt-actions { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; align-items: center; }
  .btn-copy { padding: 9px 20px; min-height: 44px; background: ${A.navy}; color: ${A.gold}; border: 1px solid rgba(201,168,76,0.4); border-radius: 7px; font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.15s; display: inline-flex; align-items: center; gap: 7px; }
  .btn-copy:hover:not(:disabled) { border-color: ${A.gold}; background: #1e3d5a; }
  .btn-copy:disabled { opacity: 0.35; cursor: not-allowed; }
  .btn-copy.copied { background: ${A.teal}; color: #fff; border-color: ${A.teal}; }
  .btn-link { padding: 9px 20px; min-height: 44px; background: transparent; color: ${A.teal}; border: 1px solid ${A.teal}; border-radius: 7px; font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.09em; text-transform: uppercase; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
  .btn-link:hover { background: ${A.tealLight}; }
  .paste-hint { font-size: 12px; color: ${A.muted}; line-height: 1.55; margin-bottom: 10px; padding: 10px 14px; background: ${A.tealLight}; border-left: 2px solid ${A.teal}; border-radius: 0 7px 7px 0; }
  .paste-hint strong { color: ${A.navy}; }
  .tip { background: ${A.tealLight}; border-left: 2px solid ${A.teal}; padding: 10px 14px; border-radius: 0 7px 7px 0; font-size: 11px; color: ${A.navy}; line-height: 1.6; margin-top: 14px; }
  .tip-label { font-family: Georgia, serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: ${A.teal}; display: block; margin-bottom: 3px; }
  .connector { width: 1px; height: 14px; background: ${A.border}; margin: 0 auto -2px; position: relative; z-index: 1; }
  .format-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .format-card { border: 1.5px solid ${A.border}; border-radius: 8px; padding: 16px 14px; cursor: pointer; background: #fff; text-align: center; transition: all 0.15s; -webkit-tap-highlight-color: transparent; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .format-card:hover { border-color: ${A.teal}; background: ${A.tealLight}; }
  .format-card.selected { border-color: ${A.teal}; background: ${A.tealLight}; box-shadow: 0 0 0 2px ${A.teal}; }
  .format-icon { font-size: 26px; line-height: 1; }
  .format-name { font-family: Georgia, serif; font-size: 13px; letter-spacing: 0.04em; color: ${A.navy}; font-weight: bold; }
  .format-desc { font-size: 11px; color: ${A.muted}; line-height: 1.4; }
  .delivery-box { background: ${A.goldLight}; border-left: 3px solid ${A.gold}; border-radius: 0 8px 8px 0; padding: 14px 16px; margin-top: 16px; font-size: 12px; color: ${A.navy}; line-height: 1.65; }
  .delivery-label { font-family: Georgia, serif; font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #8a6820; display: block; margin-bottom: 6px; font-weight: bold; }
  .delivery-box ol { padding-left: 18px; margin-top: 6px; }
  .delivery-box li { margin-bottom: 5px; }
  .delivery-box strong { color: ${A.navy}; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
`;

export default function App() {
  const [form, setForm] = useState({
    clientName: "", agentName: "", propertyName: "", destination: "",
    travelDates: "", roomType: "", researchPaste: "",
  });
  const [voice,        setVoice]        = useState("pmtp");
  const [copiedPerp,   setCopiedPerp]   = useState(false);
  const [copiedClaude, setCopiedClaude] = useState(false);
  const [guideText,    setGuideText]    = useState("");
  const [exportFormat, setExportFormat] = useState("html");
  const [copiedExport, setCopiedExport] = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const perpPrompt   = buildPerplexityPrompt(form);
  const claudePrompt = buildClaudePrompt(form, voice);
  const hasDetails   = (form.propertyName.trim() || form.destination.trim()).length > 0;
  const hasResearch  = form.researchPaste.trim().length > 0;
  const selectedVoice = VOICES.find(v => v.id === voice);

  const copy = (text, setFn) => {
    if (!text) return;
    const finish = () => { setFn(true); setTimeout(() => setFn(false), 2800); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(finish).catch(() => fallback());
      } else { fallback(); }
    } catch { fallback(); }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand("copy"); finish(); } catch {}
      document.body.removeChild(ta);
    }
  };

  function buildHTMLPrompt(text) {
    return `You are a document formatter for Point Me to Paradise Travel. Your ONLY job is to take the exact guide text below and wrap it in a complete, beautifully styled HTML file. Do NOT change, rewrite, shorten, expand, reorder, or alter any of the guide content in any way — every single word must appear exactly as written. Your only role is HTML structure and styling.

BRAND COLORS — use ONLY these exact values. Do not invent or substitute any other color:
#E9DEC0 — cream — cover background, footer background
#DAC396 — sand — borders, horizontal rules, dividers, h1 bottom border
#75AFB1 — teal — h2 headings, links, brand name, cover accent bar
#9AD0CE — light teal — bullet list markers, secondary accents
#C4E4E1 — mint — h2 bottom border only
#2a2219 — dark — ALL body text, h1 headings, cover destination title
#f4f0e8 — warm off-white — outer page background
#ffffff — white — guide body content area background

FONTS: import from Google Fonts — Playfair Display for cover title and h1. Lato for everything else.

REQUIRED STRUCTURE:
1. Full HTML5 document with DOCTYPE, html, head (Google Fonts import, charset, viewport, title set to property/destination name), body
2. COVER: cream background (#E9DEC0), 4px teal bottom border (#75AFB1). Contains: teal circle 32px with white "P" + "POINT ME TO PARADISE TRAVEL" in teal Lato 11px uppercase. Property name in Playfair Display 52px bold dark. Client byline italic teal if present. Agent name small dark if present. Sand horizontal rule 2px.
3. GUIDE BODY: white background #ffffff, max-width 820px, centered, padding 56px 40px 80px
4. Wrap EACH heading + its content in a <section> with: break-inside:avoid; page-break-inside:avoid; margin-bottom:8px
5. h1: Playfair Display 28px italic weight-600 color #2a2219, border-bottom 2px solid #DAC396, break-after:avoid
6. h2: Lato 11px bold uppercase letter-spacing:0.18em color #75AFB1, border-bottom 1px solid #C4E4E1, break-after:avoid
7. p: Lato 15px color #2a2219 line-height:1.85 margin-bottom:14px
8. ul: padding-left 20px. li::marker color #9AD0CE. li: Lato 15px color #2a2219 line-height:1.75
9. a: color #75AFB1, text-decoration-color #9AD0CE
10. FOOTER: background #E9DEC0, border-top 2px solid #DAC396, centered Lato 11px uppercase: "Point Me to Paradise Travel · Curating Expert Custom Trips"
11. Include @media print { section { break-inside:avoid; page-break-inside:avoid; } h1,h2 { break-after:avoid; page-break-after:avoid; } .cover { break-after:page; page-break-after:page; } }

PAGE BREAK RULES — CRITICAL: A heading must NEVER appear alone at the bottom of a page. If a section cannot fit on the current page, the ENTIRE section moves to the next page — never split mid-paragraph.

CONTENT RULE: Every word must appear exactly as written. Do not change anything. Output ONLY the complete HTML starting with <!DOCTYPE html>. No explanation. No markdown fences.

--- GUIDE TO FORMAT ---
${text}
--- END GUIDE ---`;
  }

  function buildDOCXPrompt(text) {
    return `You are a document formatter for Point Me to Paradise Travel. Your ONLY job is to take the exact guide text below and produce a beautifully formatted Microsoft Word document (.docx). Do NOT change, rewrite, shorten, expand, reorder, or alter any of the guide content — every single word must appear exactly as written.

Write a complete Node.js script using the docx library (v8.x) that generates the file. Include all imports. Use Packer.toBuffer() to write to "PropertyGuide.docx".

BRAND COLORS — hex strings without # as docx color values:
"E9DEC0" cream · "DAC396" sand · "75AFB1" teal · "9AD0CE" light teal · "C4E4E1" mint · "2a2219" dark

DOCUMENT: US Letter width:12240 height:15840. Margins: top:1260 right:1260 bottom:1260 left:1440. Default: Calibri size 22.

COVER:
1. "POINT ME TO PARADISE TRAVEL" — Calibri 18, color "75AFB1", allCaps, characterSpacing 80, spacing after 120
2. Property name — Georgia 56, bold, color "75AFB1", spacing after 180, border bottom SINGLE size 12 color "DAC396"
3. Client byline if present — Georgia 22, italic, color "2a2219", spacing after 60
4. Agent name if present — Calibri 20, color "75AFB1", spacing after 600

HEADINGS:
# (h1): Georgia 40, bold italic, color "2a2219", spacing before:480 after:200, keepNext:true, border bottom SINGLE size:8 color:"DAC396"
## (h2): Calibri 22, bold, allCaps, color "75AFB1", characterSpacing:60, spacing before:400 after:160, keepNext:true, border bottom SINGLE size:4 color:"C4E4E1"

BODY: Calibri 22, color "2a2219", spacing after:160. keepNext:true on every paragraph EXCEPT the last paragraph before the next heading (keepNext:false there).

BULLETS: LevelFormat.BULLET "•", Calibri 22, color "2a2219", indent left:720 hanging:360, keepNext:true except last bullet in each list.

FOOTER: "Point Me to Paradise Travel · Curating Expert Custom Trips" — Calibri 18, italic, color "75AFB1", centered, border top SINGLE size:6 color:"DAC396", spacing before:720.

PAGE BREAK RULES — CRITICAL:
- keepNext:true on headings — heading NEVER appears alone at bottom of page
- keepNext:true on body paragraphs EXCEPT the last in each section
- NEVER use PageBreak elements — keepNext handles all pagination naturally
- Sections move to the next page intact — never split mid-paragraph

After the script, add a brief note reminding the agent:
1. Run: node PropertyGuide.js to generate PropertyGuide.docx
2. Open in Microsoft Word or Google Docs — review that no section is split mid-page
3. Word: File → Save As → PDF. Google Docs: File → Download → PDF Document
4. Send PDF to client via email, Google Drive link, or WeTransfer

CONTENT RULE: Every word must appear exactly as written. Output ONLY the complete Node.js script plus the brief agent note.

--- GUIDE TO FORMAT ---
${text}
--- END GUIDE ---`;
  }

  function handleCopyExportPrompt() {
    const prompt = exportFormat === "html" ? buildHTMLPrompt(guideText) : buildDOCXPrompt(guideText);
    copy(prompt, setCopiedExport);
  }

  return (
    <>
      <style>{css}</style>
      <div className="hd-stripe">Point Me to Paradise Travel — Hotel & Resort Guide Generator</div>
      <div className="hd-warn">⚠ Internal Use Only — Point Me to Paradise Travel · Unauthorized use, sharing, or distribution is strictly prohibited</div>
      <nav className="hd-nav">
        <div className="hd-logo">
          <span className="hd-logo-name">PMTP</span>
          <span className="hd-logo-sub">Hotel & Resort Guide Generator</span>
        </div>
      </nav>

      <div className="page">
        <div className="page-eyebrow">Point Me to Paradise Travel</div>
        <h1 className="page-title">Hotel & Resort Guide Generator</h1>
        <p className="page-desc">You booked the property — now give your client a guide that makes them feel like an insider before they even arrive. Fill in the details, follow the steps, and walk away with a personalized property guide ready to send.</p>

        {/* STEP 1 */}
        <div className="card" style={{ animationDelay: "0s" }}>
          <div className="card-head">
            <div className={`step-num${hasDetails ? " done" : ""}`}>{hasDetails ? "✓" : "1"}</div>
            <div className="step-head-text"><div className="step-title">Enter Property Details</div><div className="step-sub">Client, agent, property name, location, and travel dates</div></div>
            <span className={`step-badge ${hasDetails ? "done" : "pending"}`}>{hasDetails ? "✓ Complete" : "Required"}</span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field"><label className="field-label">Client Name(s)</label><input name="clientName" value={form.clientName} onChange={set} placeholder="e.g. Sarah & James" /></div>
              <div className="field"><label className="field-label">Your Name (Agent)</label><input name="agentName" value={form.agentName} onChange={set} placeholder="e.g. Maria" /></div>
              <div className="field"><label className="field-label">Property Name *</label><input name="propertyName" value={form.propertyName} onChange={set} placeholder="e.g. Four Seasons Bora Bora" /></div>
              <div className="field"><label className="field-label">Location / Destination</label><input name="destination" value={form.destination} onChange={set} placeholder="e.g. Bora Bora, French Polynesia" /></div>
              <div className="field"><label className="field-label">Travel Dates</label><input name="travelDates" value={form.travelDates} onChange={set} placeholder="e.g. July 5–12, 2025" /></div>
              <div className="field"><label className="field-label">Room / Suite Category</label><input name="roomType" value={form.roomType} onChange={set} placeholder="e.g. Overwater Bungalow" /></div>
            </div>
          </div>
        </div>

        <div className="connector" />

        {/* STEP 2 */}
        <div className="card" style={{ animationDelay: "0.06s" }}>
          <div className="card-head">
            <div className="step-num">2</div>
            <div className="step-head-text"><div className="step-title">Copy Perplexity Research Prompt</div><div className="step-sub">Paste into Perplexity Deep Research for thorough property intelligence</div></div>
            <span className={`step-badge ${hasDetails ? "ready" : "pending"}`}>{hasDetails ? "Ready to Copy" : "Enter property first"}</span>
          </div>
          <div className="card-body">
            <div className="prompt-label">Perplexity Deep Research Prompt</div>
            <div className="prompt-box">{perpPrompt ? perpPrompt : <span className="prompt-empty">Enter a property name in Step 1 and your research prompt will appear here.</span>}</div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedPerp ? " copied" : ""}`} onClick={() => perpPrompt && copy(perpPrompt, setCopiedPerp)} disabled={!perpPrompt}>{copiedPerp ? "✓ Copied!" : "⎘ Copy Prompt"}</button>
              <a className="btn-link" href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer">Open Perplexity ↗</a>
            </div>
            <div className="tip"><span className="tip-label">How to run this</span>Open Perplexity → start a new search → switch to <strong>Deep Research</strong> mode → paste the prompt → run. Deep Research pulls from guest reviews, travel blogs, loyalty forums, and live sources for the most thorough property intel available.</div>
          </div>
        </div>

        <div className="connector" />

        {/* STEP 3 */}
        <div className="card" style={{ animationDelay: "0.12s" }}>
          <div className="card-head">
            <div className={`step-num${hasResearch ? " done" : ""}`}>{hasResearch ? "✓" : "3"}</div>
            <div className="step-head-text"><div className="step-title">Paste Perplexity Results</div><div className="step-sub">Copy the full Perplexity response and paste it below</div></div>
            <span className={`step-badge ${hasResearch ? "done" : "pending"}`}>{hasResearch ? "✓ Research Added" : "Waiting"}</span>
          </div>
          <div className="card-body">
            <p className="paste-hint">Paste the <strong>complete Perplexity response</strong> below — don't trim or edit it. Claude will read through everything and pull the best property-specific details into the guide automatically.</p>
            <textarea name="researchPaste" value={form.researchPaste} onChange={set} placeholder="Paste the full Perplexity Deep Research response here…" style={{ minHeight: 160 }} />
          </div>
        </div>

        <div className="connector" />

        {/* STEP 4 */}
        <div className="card" style={{ animationDelay: "0.18s" }}>
          <div className="card-head">
            <div className="step-num">4</div>
            <div className="step-head-text"><div className="step-title">Choose Voice & Copy Claude Prompt</div><div className="step-sub">Select a writing voice, then paste the prompt into Claude at claude.ai</div></div>
            <span className={`step-badge ${hasDetails ? "ready" : "pending"}`}>{hasDetails ? "Ready to Copy" : "Enter details first"}</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 18 }}>
              <div className="field-label" style={{ marginBottom: 10 }}>Select Guide Voice</div>
              <div className="voice-grid">
                {VOICES.map(v => (
                  <div key={v.id} className={`voice-card${voice === v.id ? " selected" : ""}`} onClick={() => setVoice(v.id)}>
                    <div className="voice-icon">{v.icon}</div>
                    <div className="voice-name">{v.label}</div>
                    <div className="voice-tagline">{v.tagline}</div>
                  </div>
                ))}
              </div>
              {selectedVoice && <div className="voice-desc-box"><span className="voice-desc-label">About this voice</span>{selectedVoice.description}</div>}
            </div>
            <div className="prompt-label">Claude Guide Generation Prompt — {selectedVoice?.label}</div>
            <div className="prompt-box tall">{claudePrompt ? claudePrompt : <span className="prompt-empty">Complete Steps 1–3 and your Claude prompt will appear here.</span>}</div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedClaude ? " copied" : ""}`} onClick={() => claudePrompt && copy(claudePrompt, setCopiedClaude)} disabled={!claudePrompt}>{copiedClaude ? "✓ Copied!" : "⎘ Copy Prompt"}</button>
              <a className="btn-link" href="https://claude.ai" target="_blank" rel="noopener noreferrer">Open Claude ↗</a>
            </div>
            <div className="tip"><span className="tip-label">How to use this</span>Go to <strong>claude.ai</strong> → start a new conversation → paste the full prompt → Claude generates a complete, PMTP-branded property guide in the voice you selected.</div>
          </div>
        </div>

        <div className="connector" />

        {/* STEP 5 */}
        <div className="card" style={{ animationDelay: "0.24s" }}>
          <div className="card-head">
            <div className={`step-num${copiedExport ? " done" : ""}`}>{copiedExport ? "✓" : "5"}</div>
            <div className="step-head-text"><div className="step-title">Format & Export Your Guide</div><div className="step-sub">Paste your completed guide, choose a format, copy the prompt, and run it in Claude</div></div>
            <span className={`step-badge ${guideText.trim() ? "ready" : "pending"}`}>{guideText.trim() ? "Ready to Format" : "Paste guide first"}</span>
          </div>
          <div className="card-body">
            <div className="field" style={{ marginBottom: 18 }}>
              <label className="field-label">Step 5a — Paste Your Completed Claude Guide Here</label>
              <textarea value={guideText} onChange={e => setGuideText(e.target.value)} placeholder="Go to your Claude conversation, copy the full guide that was generated, and paste it here. Do not edit it — paste it exactly as Claude wrote it." style={{ minHeight: 180 }} />
            </div>
            <div className="field-label" style={{ marginBottom: 10 }}>Step 5b — Choose Your Export Format</div>
            <div className="format-grid" style={{ marginBottom: 18 }}>
              <div className={`format-card${exportFormat === "html" ? " selected" : ""}`} onClick={() => setExportFormat("html")}>
                <div className="format-icon">🌐</div>
                <div className="format-name">HTML Guide</div>
                <div className="format-desc">Beautiful, branded, browser-ready. Share via email, Drive, or WeTransfer.</div>
              </div>
              <div className={`format-card${exportFormat === "docx" ? " selected" : ""}`} onClick={() => setExportFormat("docx")}>
                <div className="format-icon">📄</div>
                <div className="format-name">Word Doc → PDF</div>
                <div className="format-desc">Claude outputs the code. Run it, open in Word, Save As PDF, then send.</div>
              </div>
            </div>
            <div className="prompt-label">Step 5c — Your {exportFormat === "html" ? "HTML" : "DOCX"} Formatting Prompt for Claude</div>
            <div className="prompt-box tall">
              {guideText.trim()
                ? (exportFormat === "html" ? buildHTMLPrompt(guideText) : buildDOCXPrompt(guideText))
                : <span className="prompt-empty">Paste your guide above and choose a format — your formatting prompt will appear here.</span>
              }
            </div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedExport ? " copied" : ""}`} onClick={handleCopyExportPrompt} disabled={!guideText.trim()}>{copiedExport ? "✓ Copied!" : "⎘ Copy Formatting Prompt"}</button>
              <a className="btn-link" href="https://claude.ai" target="_blank" rel="noopener noreferrer">Open Claude ↗</a>
            </div>
            <div className="tip" style={{ marginTop: 16 }}>
              <span className="tip-label">Step 5d — How to use this prompt</span>
              Go to <strong>claude.ai</strong> → start a <strong>new conversation</strong> → paste the formatting prompt → Claude outputs your fully branded, formatted guide. Copy the output and follow the delivery instructions below.
            </div>
            {exportFormat === "html" ? (
              <div className="delivery-box" style={{ marginTop: 16 }}>
                <span className="delivery-label">📬 Getting & Sharing the HTML Guide</span>
                <ol>
                  <li><strong>After running the prompt in Claude:</strong> Select all of Claude's output — it will be a full HTML document starting with &lt;!DOCTYPE html&gt;. Copy everything.</li>
                  <li><strong>Save as a file:</strong> Open Notepad (Windows) or TextEdit in plain text mode (Mac). Paste the HTML. Save the file — name it <em>ClientName_Guide.html</em> and make sure the extension is .html not .txt.</li>
                  <li><strong>Test it:</strong> Double-click the file — it should open in your browser looking beautifully formatted. If it does, you are ready to send.</li>
                  <li><strong>Email attachment:</strong> Attach the .html file directly to your email. The client double-clicks it and it opens in their browser — no software needed.</li>
                  <li><strong>Google Drive:</strong> Upload the .html file → right-click → Get Link → set to "Anyone with the link can view" → paste the link in your email. Client clicks and it opens in their browser.</li>
                  <li><strong>WeTransfer:</strong> Go to wetransfer.com → upload the .html file → enter the client's email → send. They receive a download link good for 7 days.</li>
                  <li><strong>Dropbox / OneDrive:</strong> Upload and share a direct link — client views it right in the browser.</li>
                </ol>
              </div>
            ) : (
              <div className="delivery-box" style={{ marginTop: 16 }}>
                <span className="delivery-label">📄 Getting Your Word Doc & Converting to PDF</span>
                <ol>
                  <li><strong>After running the prompt in Claude:</strong> Claude will output a complete Node.js script. Copy the entire script.</li>
                  <li><strong>Run the script:</strong> Paste into a file called <em>generate.js</em>, then run <em>node generate.js</em> in your terminal. This creates <em>PropertyGuide.docx</em>.</li>
                  <li><strong>Open in Word:</strong> Open the .docx and scroll through — no section should be split mid-page. Each section stays together or moves intact to the next page.</li>
                  <li><strong>Convert to PDF in Word:</strong> File → Save As → select PDF → Save.</li>
                  <li><strong>Convert to PDF in Google Docs:</strong> File → Download → PDF Document (.pdf).</li>
                  <li><strong>Send the PDF:</strong> Email attachment, Google Drive link, or WeTransfer. PDF looks identical on every device and cannot be accidentally edited.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
