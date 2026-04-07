import { useState } from "react";

const A = {
  navy:"#162d42",gold:"#c9a84c",goldLight:"#f5e9c8",
  teal:"#3a9a9a",tealLight:"#e0f5f5",border:"#ddd5c0",
  muted:"#7a6e5f",beige:"#f5f0e6",cream:"#faf7f2",
  red:"#b83232",redLight:"#fdecea",slate:"#f0ebe0",
};

const VOICES=[
  {id:"pmtp",label:"PMTP Voice",icon:"🌴",tagline:"Concierge-level · warm · expert",
   description:"The signature Point Me to Paradise voice — professional, personal, deeply knowledgeable. Like a trusted advisor who has personally stayed at this property.",
   prompt:"Write in the signature voice of Point Me to Paradise Travel. Professional yet warm, deeply knowledgeable yet personal — always concierge-level. Expert without being showy. Personal without being casual."},
  {id:"morgan",label:"Morgan Freeman",icon:"🎙️",tagline:"Wise · cinematic · deeply moving",
   description:"Deep, unhurried, and poetic. Rich imagery and timeless observations that make readers stop and reflect.",
   prompt:"Write in the style of Morgan Freeman narrating a documentary — deep, unhurried, poetic, and profoundly wise. Use rich imagery and timeless observations about place and hospitality."},
  {id:"bourdain",label:"Anthony Bourdain",icon:"🍷",tagline:"Raw · honest · street-level poetry",
   description:"Unapologetically honest and gritty-poetic. Never oversells — reveals.",
   prompt:"Write in the style of Anthony Bourdain — unapologetically honest, gritty-poetic, deeply curious. Celebrate what is real and extraordinary without overselling it. Write as if you actually stayed there and it meant something."},
  {id:"samantha",label:"Samantha Brown",icon:"✈️",tagline:"Warm · enthusiastic · welcoming",
   description:"Like hotel advice from your most well-traveled best friend who is genuinely bursting with excitement for you.",
   prompt:"Write in the style of Samantha Brown — warm, genuinely enthusiastic, deeply welcoming. Make the client feel like they are getting advice from their most well-traveled best friend."},
  {id:"funny",label:"Funny & Witty",icon:"😄",tagline:"Sharp humor · real insight · Bill Bryson energy",
   description:"Makes you laugh out loud while still being genuinely useful. Gentle mockery of resort clichés alongside honest celebration of what is great.",
   prompt:"Write with sharp, clever wit and genuine humor. Use self-deprecating observations and unexpected analogies. Gently poke fun at resort tropes while celebrating what genuinely makes this property worth staying at."},
  {id:"mcconaughey",label:"Matthew McConaughey",icon:"🤠",tagline:"Laid back · philosophical · all right all right",
   description:"Unhurried, sun-soaked, and full of easy wisdom. Makes every property feel like somewhere you were always meant to end up.",
   prompt:"Write in the style of Matthew McConaughey — unhurried, warm, and effortlessly philosophical. A laid-back cadence that never rushes, finds meaning in small hotel moments. Make it feel sun-drenched and easy."},
];

function buildPerplexityPrompt(form){
  const prop=form.propertyName.trim();
  const dest=form.destination.trim();
  if(!prop&&!dest)return null;
  const propFull=prop&&dest?`${prop} in ${dest}`:prop||dest;
  const lines=[
    `You are researching ${propFull} for a luxury concierge property guide. I need guidebook-depth research — thorough, specific, rich with detail. Do not summarize. Go deep.`,
    ``,
    `SOURCES: Hotel review blogs, travel blogger stays, guest reviews on TripAdvisor/Google/Booking.com/Expedia, luxury publications (Conde Nast Traveler, Travel + Leisure, Forbes Travel Guide, Fodors, Frommers), loyalty forums (TripAdvisor forums, FlyerTalk, View from the Wing), Instagram location tags, YouTube hotel tours, the property website, press coverage. Prioritize first-hand guest accounts over marketing material.`,
    ``,
  ];
  if(form.travelDates){lines.push(`Travel dates: ${form.travelDates}.`);lines.push(``);}
  if(form.roomType){lines.push(`Room/suite of interest: ${form.roomType}.`);lines.push(``);}
  lines.push(
    `Research ALL sections in full detail:`,``,
    `1. PROPERTY OVERVIEW & VIBE`,
    `Overall character, atmosphere, who it suits, design, scale, what sets it apart, awards, what guests consistently praise vs. criticize.`,``,
    `2. ROOMS & SUITES`,
    `Every room and suite category. Name, size, layout, view, standout features, inclusions, who it suits. Which upgrades are worth it. Specific floors or room numbers to request or avoid. Bathroom details. Upgrade logic.`,``,
    `3. DINING & BARS`,
    `Every restaurant, bar, cafe on property. Name, cuisine, atmosphere, meal periods, signature dishes/drinks, dress code, reservation needs, honest quality. Breakfast situation. Room service. Any off-menu items worth requesting.`,``,
    `4. POOLS, BEACH & OUTDOOR SPACES`,
    `Number of pools, type, best one. Beach — private/semi/public. Chair strategy. Cabanas — cost, booking. Swim-up bars. Adults-only areas. Water quality. Hidden outdoor gems.`,``,
    `5. SPA, FITNESS & WELLNESS`,
    `Spa facilities, signature treatments, pricing, how far ahead to book. Fitness center quality and hours. Wellness programming.`,``,
    `6. SERVICE & STAFF`,
    `Service style. Concierge responsiveness. Butler service. Check-in experience. Issue handling. Tips for best service. Staff or departments worth engaging directly.`,``,
    `7. ACTIVITIES, EXCURSIONS & AMENITIES`,
    `On-property activities — included vs. extra cost. Off-property excursions the hotel arranges. What books up fast. Family programming. Guest favorite activities.`,``,
    `8. PRACTICAL LOGISTICS & INSIDER TIPS`,
    `Airport transfers — options, time, cost. Check-in/out times and early/late strategies. Inclusions vs. resort fees. Tipping norms. Best season. Pre-arrival requests. Honest quirks or limitations.`,``,
    `Be as specific as possible. Use real room names, dish names, pricing where available. This research powers a luxury concierge property guide.`
  );
  return lines.join("\n");
}

function buildClaudePrompt(form,voiceId){
  const prop=form.propertyName.trim();
  const dest=form.destination.trim();
  if(!prop&&!dest)return null;
  const propFull=prop&&dest?`${prop}, ${dest}`:prop||dest;
  const voice=VOICES.find(v=>v.id===voiceId)||VOICES[0];
  const details=[];
  if(form.clientName)details.push(`Client name: ${form.clientName}`);
  if(form.agentName)details.push(`Travel advisor name: ${form.agentName}`);
  if(prop)details.push(`Property name: ${prop}`);
  if(dest)details.push(`Location: ${dest}`);
  if(form.travelDates)details.push(`Travel dates: ${form.travelDates}`);
  if(form.roomType)details.push(`Room/suite category: ${form.roomType}`);
  const researchBlock=form.researchPaste.trim()
    ?`\n\n--- PERPLEXITY RESEARCH (use this heavily) ---\n${form.researchPaste.trim()}\n--- END RESEARCH ---`
    :"";
  return `You are ${form.agentName || "a senior travel advisor"} at Point Me to Paradise Travel, writing directly to ${form.clientName || "your client"} about ${propFull}.

CRITICAL PERSPECTIVE RULES — read these first:
- You ARE the advisor. Write as yourself, in first person: "I chose this property for you," "I want you to," "when I stayed here," "trust me on this one."
- NEVER refer to the advisor in third person. NEVER write "your advisor," "Christina wants you to," "your agent chose," or any sentence where the advisor is talked ABOUT rather than talking.
- The client is reading a letter written BY their advisor, not a document written ABOUT their advisor.
- If the agent name is provided, sign off as that person — but never mention them by name anywhere else in the guide.
- Every sentence should pass this test: could the advisor have written this sentence directly to the client? If not, rewrite it.

VOICE: ${voice.prompt}
Apply this voice ONLY in the 1-to-2 sentence hook after each bold label. NOT in long paragraphs. The voice is the flavor in the details.

CORE FORMAT RULES:
- Mirror the research format: organized, labeled, scannable
- Every piece of info findable in under 10 seconds
- Bold every named item: restaurant, room type, pool feature, tip topic
- After each bold label: 1-2 sentences in voice written as the advisor speaking to the client, then tight bullet details
- NO paragraphs longer than 3 sentences except opening note and final word
- NO walls of text — more than 4 lines without a bullet: break it up
- Use tables for property overview, room comparison, dining summary
- Include ALL research — organized, not compressed

SECTION STRUCTURE:

# A Personal Note
3-4 sentences. Warm, direct, personal. Use client name if provided. Do NOT introduce yourself. Tell them why this property was chosen for them. Build excitement. Stop.

## Property at a Glance
| | |
|---|---|
| **Property type** | [boutique / large resort / historic / overwater / city hotel] |
| **Best for** | [couples / families / romance / relaxation / adventure] |
| **Vibe** | [one clear line] |
| **Size** | [number of rooms] |
| **Location** | [where it sits, what surrounds it] |
| **Standout feature** | [the one thing that sets it apart] |
| **Rating / Recognition** | [AAA, Forbes, awards if notable] |

## Your Room
1-sentence personal line. Then for each relevant room type:

**[Room or Suite Name]**
[1-2 sentences in voice]
- **Size:** ...
- **View:** ...
- **Bathroom:** [tub / shower / outdoor / soaking tub]
- **Standout feature:** ...
- **Best for:** ...

**Room Request Strategy**
- **Request:** [floor, orientation, what to ask and how]
- **Avoid:** [locations or floors to skip and why]
- **Upgrade worth it?** [honest answer]

## Dining On Property
| Venue | Type | Meals | Reservation |
|---|---|---|---|
| [Name] | [cuisine] | [B/L/D/Brunch] | [Yes/No/Recommended] |

**[Restaurant or Bar Name]**
[1-2 sentences in voice]
- **Must order:** [specific dishes or drinks]
- **Vibe:** ...
- **Best time:** ...
- **Dress code:** ...

**Breakfast** — [buffet / a la carte / included / cost]
**Room service** — [available / hours / worth it?]

## Pool & Beach

**The Pool**
[1-2 sentences in voice]
- **Type:** [heated / saline / infinity / free-form]
- **Chair strategy:** [what time, how to secure best spot]
- **Cabanas:** [available / cost / how to book]
- **Swim-up bar:** [yes/no, what to order]
- **Adults-only area:** [yes/no and where]
- **Hidden gem:** [outdoor spot most guests miss]

**The Beach**
[1-2 sentences in voice — honest framing]
- **Access:** [private / semi-private / public]
- **Setup:** [hotel loungers / bring your own / public]
- **Water:** [quality and conditions for their dates]
- **Best time:** ...

## Spa, Fitness & Wellness

**The Spa**
[1-2 sentences in voice]
- **Facilities:** [treatment rooms, thermal circuit, jacuzzi, relaxation area]
- **Must-book treatment:** [specific name and why] — book [X weeks] ahead
- **Price range:** [approximate cost before gratuity]
- **Tip:** [one insider note]

**Fitness**
- **Equipment:** ...
- **Hours:** ...
- **Classes:** [yoga / spin / meditation]

## Activities & Excursions

**Included in Your Stay**
- **[Activity]:** [details]

**Worth the Extra Cost**
- **[Activity]:** [cost range, what makes it worth it, book ahead?]

**Off-Property**
- **[Excursion]:** [what it is, time required, how to arrange]

**Book Before You Arrive**
- [what needs advance reservation and how far ahead]

## Service & Insider Tips

Only include information that appears directly in the research provided. Do NOT invent phone numbers, booking windows, specific dollar amounts, or policies that are not in the research. If the research does not cover a sub-topic below, skip it entirely rather than guessing.

**Before You Arrive — Pre-Arrival Checklist**
[Only if confirmed in research] Include what the client should do, prepare, or request before arrival — such as: submitting room preferences, flagging special occasions, booking spa appointments, reserving dining. Do NOT include phone numbers, booking platform advice, "book direct vs. OTA" guidance, or any agent-side operational instructions. This section is for the client, not the agent.

**At Check-In**
[Only if confirmed in research] Include: official check-in time, early check-in strategy, what to say at the desk for room requests, how loyalty status applies here.

**During Your Stay**
[Only if confirmed in research] Include: tipping norms specific to this property, who to contact for what, any operational quirks worth knowing.

**Check-Out**
[Only if confirmed in research] Include: official check-out time, late check-out strategy.

**Honest Limitations**
[Only if confirmed in research] State real downsides directly — room size, beach access, service gaps, noise, value concerns. Do not soften or omit.

## A Final Word
3-4 sentences. Warm, personal, in the selected voice. Reinforce why this property is right for them. Mention Point Me to Paradise Travel. Sign off with the agent name if provided.

STRICT RULES:
- Write exclusively in first person as the advisor speaking TO the client — never third person about the advisor
- NEVER write sentences like "your advisor," "Christina wants," "your agent chose" — the advisor IS writing this, not being written about
- Voice ONLY in the 1-2 sentence hooks — nowhere else
- NEVER more than 3 sentences in a row outside opening and closing
- Every named venue, room, tip must be bolded
- Every practical detail in a bullet or table — never buried in prose
- Include ALL research — organized, not compressed
- NEVER introduce yourself by name in the opening — the client knows who you are
- NEVER invent phone numbers, booking URLs, specific prices, policies, or operational details not present in the research — if it is not in the research, skip it or write that the client should confirm directly with the property
- NEVER include booking platform advice, 'book direct vs. OTA' guidance, or hotel contact information — that is agent-side operational information and does not belong in a client-facing guide
- Brand the guide for Point Me to Paradise Travel
- Sign off with the agent name in the Final Word only

TRIP DETAILS:
${details.join("\n")}${researchBlock}

Write the complete property guide now.`;
}

const css=`
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:system-ui,-apple-system,sans-serif;background:#f5f0e6;color:#162d42;min-height:100dvh;-webkit-text-size-adjust:100%;}
  .hd-stripe{background:#3a9a9a;height:28px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#fff;}
  .hd-warn{background:#162d42;padding:6px 16px;text-align:center;font-family:Georgia,serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#c9a84c;}
  .hd-nav{background:#162d42;border-bottom:3px solid #c9a84c;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;position:sticky;top:0;z-index:200;}
  .hd-logo{border-left:3px solid #3a9a9a;padding-left:14px;display:flex;flex-direction:column;gap:3px;}
  .hd-logo-name{font-family:Georgia,serif;font-size:17px;letter-spacing:0.15em;text-transform:uppercase;color:#fff;line-height:1;}
  .hd-logo-sub{font-family:Georgia,serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#c9a84c;}
  .page{max-width:840px;margin:0 auto;padding:36px 20px 72px;}
  .page-eyebrow{font-family:Georgia,serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#3a9a9a;margin-bottom:5px;}
  .page-title{font-family:Georgia,serif;font-size:24px;letter-spacing:0.08em;text-transform:uppercase;color:#162d42;margin-bottom:6px;}
  .page-desc{font-size:13px;color:#7a6e5f;line-height:1.6;margin-bottom:32px;max-width:580px;}
  .card{background:#faf7f2;border:1px solid #ddd5c0;border-radius:9px;box-shadow:0 2px 16px rgba(22,45,66,0.07);margin-bottom:14px;overflow:hidden;animation:fadeUp 0.4s ease both;}
  .card-head{display:flex;align-items:center;gap:13px;padding:15px 20px;border-bottom:1px solid #ddd5c0;background:#faf7f2;}
  .step-num{width:30px;height:30px;border-radius:50%;background:#3a9a9a;color:#fff;font-family:Georgia,serif;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .step-num.done{background:#c9a84c;color:#162d42;}
  .step-head-text{flex:1;}
  .step-title{font-family:Georgia,serif;font-size:13px;letter-spacing:0.09em;text-transform:uppercase;color:#162d42;line-height:1;}
  .step-sub{font-size:11px;color:#7a6e5f;margin-top:3px;}
  .step-badge{font-family:Georgia,serif;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;padding:3px 10px;border-radius:20px;flex-shrink:0;}
  .step-badge.pending{background:#f5f0e6;color:#7a6e5f;border:1px solid #ddd5c0;}
  .step-badge.ready{background:#e0f5f5;color:#3a9a9a;border:1px solid #3a9a9a;}
  .step-badge.done{background:#f5e9c8;color:#8a6820;border:1px solid #c9a84c;}
  .card-body{padding:20px 20px 22px;}
  .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px;}
  @media(max-width:520px){.form-grid{grid-template-columns:1fr;}}
  .field{display:flex;flex-direction:column;gap:5px;}
  .field-label{font-family:Georgia,serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#7a6e5f;}
  input,textarea{width:100%;padding:11px 13px;border:1px solid #ddd5c0;border-radius:7px;background:#fff;font-family:system-ui,-apple-system,sans-serif;font-size:max(16px,13px);color:#162d42;outline:none;appearance:none;transition:border-color 0.15s,box-shadow 0.15s;}
  input:focus,textarea:focus{border-color:#3a9a9a;box-shadow:0 0 0 3px rgba(58,154,154,0.12);}
  input::placeholder,textarea::placeholder{color:#7a6e5f;opacity:0.65;}
  textarea{resize:vertical;line-height:1.6;}
  .voice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px;}
  @media(max-width:460px){.voice-grid{grid-template-columns:repeat(2,1fr);}}
  .voice-card{border:1.5px solid #ddd5c0;border-radius:8px;padding:12px 10px;cursor:pointer;background:#fff;text-align:center;transition:all 0.15s;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;gap:5px;}
  .voice-card:hover{border-color:#3a9a9a;background:#e0f5f5;}
  .voice-card.selected{border-color:#3a9a9a;background:#e0f5f5;box-shadow:0 0 0 2px #3a9a9a;}
  .voice-icon{font-size:22px;line-height:1;}
  .voice-name{font-family:Georgia,serif;font-size:11px;letter-spacing:0.04em;color:#162d42;font-weight:bold;line-height:1.2;text-align:center;}
  .voice-tagline{font-size:10px;color:#7a6e5f;line-height:1.3;text-align:center;}
  .voice-desc-box{background:#e0f5f5;border-left:2px solid #3a9a9a;border-radius:0 6px 6px 0;padding:10px 14px;font-size:12px;color:#162d42;line-height:1.6;margin-top:12px;}
  .voice-desc-label{font-family:Georgia,serif;font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#3a9a9a;display:block;margin-bottom:3px;}
  .prompt-label{font-family:Georgia,serif;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#3a9a9a;margin-bottom:8px;display:flex;align-items:center;gap:8px;}
  .prompt-label::after{content:'';flex:1;height:1px;background:#ddd5c0;}
  .prompt-box{background:#162d42;border-radius:8px;padding:16px 18px;font-size:12px;color:#d8ceb8;line-height:1.75;white-space:pre-wrap;min-height:80px;max-height:340px;overflow-y:auto;border:1px solid rgba(201,168,76,0.15);}
  .prompt-box.tall{max-height:500px;}
  .prompt-empty{color:#3a9a9a;font-style:italic;}
  .prompt-actions{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;align-items:center;}
  .btn-copy{padding:9px 20px;min-height:44px;background:#162d42;color:#c9a84c;border:1px solid rgba(201,168,76,0.4);border-radius:7px;font-family:Georgia,serif;font-size:10px;letter-spacing:0.09em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 0.15s;display:inline-flex;align-items:center;gap:7px;}
  .btn-copy:hover:not(:disabled){border-color:#c9a84c;background:#1e3d5a;}
  .btn-copy:disabled{opacity:0.35;cursor:not-allowed;}
  .btn-copy.copied{background:#3a9a9a;color:#fff;border-color:#3a9a9a;}
  .btn-link{padding:9px 20px;min-height:44px;background:transparent;color:#3a9a9a;border:1px solid #3a9a9a;border-radius:7px;font-family:Georgia,serif;font-size:10px;letter-spacing:0.09em;text-transform:uppercase;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;display:inline-flex;align-items:center;gap:6px;transition:all 0.15s;}
  .btn-link:hover{background:#e0f5f5;}
  .paste-hint{font-size:12px;color:#7a6e5f;line-height:1.55;margin-bottom:10px;padding:10px 14px;background:#e0f5f5;border-left:2px solid #3a9a9a;border-radius:0 7px 7px 0;}
  .paste-hint strong{color:#162d42;}
  .tip{background:#e0f5f5;border-left:2px solid #3a9a9a;padding:10px 14px;border-radius:0 7px 7px 0;font-size:11px;color:#162d42;line-height:1.6;margin-top:14px;}
  .tip-label{font-family:Georgia,serif;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#3a9a9a;display:block;margin-bottom:3px;}
  .connector{width:1px;height:14px;background:#ddd5c0;margin:0 auto -2px;position:relative;z-index:1;}
  .format-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;}
  .format-card{border:1.5px solid #ddd5c0;border-radius:8px;padding:16px 14px;cursor:pointer;background:#fff;text-align:center;transition:all 0.15s;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;gap:6px;}
  .format-card:hover{border-color:#3a9a9a;background:#e0f5f5;}
  .format-card.selected{border-color:#3a9a9a;background:#e0f5f5;box-shadow:0 0 0 2px #3a9a9a;}
  .format-icon{font-size:26px;line-height:1;}
  .format-name{font-family:Georgia,serif;font-size:13px;letter-spacing:0.04em;color:#162d42;font-weight:bold;}
  .format-desc{font-size:11px;color:#7a6e5f;line-height:1.4;}
  .export-btn{width:100%;padding:14px;min-height:48px;background:#162d42;color:#fff;border:none;border-radius:7px;font-family:Georgia,serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background 0.15s;margin-top:4px;}
  .export-btn:hover:not(:disabled){background:#1e3d5a;}
  .export-btn:disabled{opacity:0.45;cursor:not-allowed;}
  .export-btn.success{background:#3a9a9a;}
  .delivery-box{background:#f5e9c8;border-left:3px solid #c9a84c;border-radius:0 8px 8px 0;padding:14px 16px;margin-top:16px;font-size:12px;color:#162d42;line-height:1.65;}
  .delivery-label{font-family:Georgia,serif;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;color:#8a6820;display:block;margin-bottom:6px;font-weight:bold;}
  .delivery-box ol{padding-left:18px;margin-top:6px;}
  .delivery-box li{margin-bottom:5px;}
  .delivery-box strong{color:#162d42;}

  /* ── RESEARCH TOOL SELECTOR ── */
  .research-tools { display: flex; gap: 10px; margin: 14px 0 0; flex-wrap: wrap; }
  .research-tool-btn { flex: 1; min-width: 120px; padding: 11px 10px 9px; border-radius: 8px; border: 1.5px solid #ddd5c0; background: #fff; cursor: pointer; text-align: center; transition: all 0.15s; -webkit-tap-highlight-color: transparent; display: flex; flex-direction: column; align-items: center; gap: 4px; text-decoration: none; }
  .research-tool-btn:hover { border-color: #3a9a9a; background: #e0f5f5; }
  .research-tool-icon { font-size: 20px; line-height: 1; }
  .research-tool-name { font-family: Georgia, serif; font-size: 11px; font-weight: bold; color: #162d42; letter-spacing: 0.04em; }
  .research-tool-tag { font-size: 9px; color: #7a6e5f; text-transform: uppercase; letter-spacing: 0.08em; }
  .research-instructions { margin-top: 14px; border-radius: 7px; overflow: hidden; border: 1px solid #ddd5c0; }
  .research-instr-row { display: flex; gap: 0; border-bottom: 1px solid #ddd5c0; }
  .research-instr-row:last-child { border-bottom: none; }
  .research-instr-tool { width: 110px; flex-shrink: 0; background: #f5f0e6; padding: 10px 12px; font-family: Georgia, serif; font-size: 10px; font-weight: bold; color: #3a9a9a; text-transform: uppercase; letter-spacing: 0.08em; display: flex; align-items: center; gap: 6px; border-right: 1px solid #ddd5c0; }
  .research-instr-text { padding: 10px 14px; font-size: 12px; color: #162d42; line-height: 1.6; flex: 1; }
  .research-instr-text strong { color: #162d42; }

  .style-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .style-card{border:1.5px solid #ddd5c0;border-radius:8px;padding:14px 12px;cursor:pointer;background:#fff;transition:all 0.15s;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;gap:4px;}
  .style-card:hover{border-color:#3a9a9a;background:#e0f5f5;}
  .style-card.selected{border-color:#3a9a9a;background:#e0f5f5;box-shadow:0 0 0 2px #3a9a9a;}
  .style-card-top{display:flex;align-items:center;gap:8px;}
  .style-icon{font-size:20px;line-height:1;}
  .style-name{font-family:Georgia,serif;font-size:12px;font-weight:bold;color:#162d42;letter-spacing:0.04em;}
  .style-tag{font-size:10px;color:#7a6e5f;font-style:italic;}
  .style-swatches{display:flex;gap:4px;margin-top:6px;}
  .style-swatch{width:16px;height:16px;border-radius:3px;border:1px solid rgba(0,0,0,0.08);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
`;

export default function App(){
  const [form,setForm]=useState({clientName:"",agentName:"",propertyName:"",destination:"",travelDates:"",roomType:"",researchPaste:""});
  const [voice,setVoice]=useState("pmtp");
  const [copiedPerp,setCopiedPerp]=useState(false);
  const [copiedClaude,setCopiedClaude]=useState(false);
  const [guideText,setGuideText]=useState("");
  const [exportFormat,setExportFormat]=useState("docx");
  const [copiedExport,setCopiedExport]=useState(false);
  const [guideStyle,setGuideStyle]=useState("classic");

  const set=e=>setForm(f=>({...f,[e.target.name]:e.target.value}));
  const perpPrompt=buildPerplexityPrompt(form);
  const claudePrompt=buildClaudePrompt(form,voice);
  const hasDetails=(form.propertyName.trim()||form.destination.trim()).length>0;
  const hasResearch=form.researchPaste.trim().length>0;
  const selectedVoice=VOICES.find(v=>v.id===voice);

  const copy=(text,setFn)=>{
    if(!text)return;
    const finish=()=>{setFn(true);setTimeout(()=>setFn(false),2800);};
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(finish).catch(()=>fallback());}
      else{fallback();}
    }catch{fallback();}
    function fallback(){
      const ta=document.createElement("textarea");
      ta.value=text;ta.style.cssText="position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(ta);ta.focus();ta.select();
      try{document.execCommand("copy");finish();}catch{}
      document.body.removeChild(ta);
    }
  };

  function buildHTMLPrompt(text){
    return `Here is a property guide that needs to be formatted as a beautiful branded HTML file.

${text}

---

Now format the above guide as a complete HTML file. Do NOT change, summarize, reorder, or alter any content. Every word exactly as written. Your only job is formatting.

BRAND COLORS — use ONLY these: #E9DEC0 cream, #DAC396 sand, #75AFB1 teal, #9AD0CE light teal, #C4E4E1 mint, #2a2219 dark text, #f4f0e8 page background, #ffffff content area.

FONTS: Google Fonts — Playfair Display for h1 and cover title, Lato for everything else.

STRUCTURE:
- Full valid HTML5 with DOCTYPE html head body
- Cover: #E9DEC0 background, 4px solid #75AFB1 bottom border, teal circle "P" logo, "Point Me to Paradise Travel" in teal uppercase Lato, property name in large Playfair Display dark, client byline in teal italic if present, agent name if present, #DAC396 rule at bottom
- Body: #ffffff white, max-width 820px, centered, padding 56px 40px
- # → h1: Playfair Display italic dark, 2px solid #DAC396 border-bottom
- ## → h2: Lato uppercase #75AFB1, 1px solid #C4E4E1 border-bottom
- Body text: Lato 15px #2a2219, line-height 1.85
- Tables: teal header row (#75AFB1) white text, clean borders
- Bullets: #9AD0CE markers
- Links: #75AFB1 color #9AD0CE underline
- Footer: #E9DEC0 background, #DAC396 top border, "Point Me to Paradise Travel · Curating Expert Custom Trips"
- PAGE BREAKS: every section has break-inside:avoid; h1 and h2 have break-after:avoid

Output ONLY the complete HTML. No explanation, no markdown fences.`;
  }
    function buildDOCXPrompt(text){
    return `Here is a property guide that needs to be formatted as a branded Word document.

${text}

---

Now format the above guide as a complete Word document using the docx npm library (v8.x). Do NOT change, summarize, reorder, or alter any content. Every word exactly as written. Your only job is formatting.

COLORS (hex without #): 75AFB1 teal, DAC396 sand, C4E4E1 mint, 2a2219 dark, 9AD0CE light teal, E9DEC0 cream.

SETUP: US Letter width 12240 height 15840 DXA. Margins top 1260 right 1260 bottom 1260 left 1440. Default Calibri size 22.

COVER: "POINT ME TO PARADISE TRAVEL" Calibri 18 color 75AFB1 allCaps characterSpacing 80 after 120. Property name Georgia 64 bold color 75AFB1 after 180 border-bottom SINGLE size 12 DAC396. Client byline Georgia 24 italic 2a2219 after 60. Agent name Calibri 20 75AFB1 after 480.

# headings: Georgia 40 bold italic 2a2219, keepNext true, before 480 after 200, border-bottom SINGLE size 8 DAC396.
## headings: Calibri 22 bold allCaps 75AFB1, keepNext true, pageBreakBefore true, before 400 after 160, border-bottom SINGLE size 4 C4E4E1.
Body: Calibri 22 2a2219, after 160, keepNext true except last paragraph before new section.
Bullets: LevelFormat.BULLET "•" Calibri 22 2a2219, indent left 720 hanging 360, keepNext true between bullets.
Tables: proper Table elements, header row 75AFB1 white bold.
Footer: "Point Me to Paradise Travel · Curating Expert Custom Trips" Calibri 18 italic 75AFB1 centered, border-top SINGLE size 6 DAC396, before 720.

PAGE FLOW RULES:
- Add pageBreakBefore: true to every H2 heading — each major section always starts on its own page
- Chain keepNext: true through all paragraphs within a section as a secondary safeguard against orphaned subheadings
- Set keepNext: false only on the last item before the next H2 or end of document
- Add keepLines: true to all body paragraphs to prevent single-line orphans within paragraphs
- Do NOT attempt conditional page breaks — Word has no mechanism for "break only if needed" and any attempt will be unreliable, especially when tables are present in the section
- Tables break the keepNext chain — Word does not bridge keepNext from a paragraph across a Table into the paragraphs that follow it, so do not rely on keepNext alone to hold sections together when tables are present
- Never use explicit PageBreak elements separate from pageBreakBefore on headings

Output ONLY complete runnable JavaScript using Packer.toBuffer() saving to output.docx. No explanation, no markdown fences.`;
  }
    function buildEditorialHTMLPrompt(guideText) {
    return `Here is a property guide that needs to be formatted as a rich, editorial branded HTML file.

${guideText}

---

You are a professional travel document designer for Point Me to Paradise Travel. The content above has already been written and researched. Your job is ONLY to render it into a polished, beautifully formatted branded document. Do not rewrite, summarize, reorganize, or add to the content. Render it exactly as provided.

BRAND SPECIFICATIONS:
Agency: Point Me to Paradise Travel | Tagline: Curated Journeys · Expert Advisors
Colors: #FFFFFF page background, #75AFB1 header/footer bands, #DAC396 gold accents, #9AD0CE secondary accent, #C4E4E1 soft backgrounds, #E9DEC0 warm cream, #C8975A amber notices with #FDF3E3 background, #2C2C2C dark text, #4A6070 secondary text
Fonts: Georgia serif for ALL headings, property names, section titles, pull quotes, labels. Arial sans-serif for ALL body text, descriptions, amenity lists, practical details.

DESIGN DIRECTION — HOTEL & RESORT GUIDE:
Elegant, editorial. Think high-end travel magazine meets trusted advisor. Not a brochure. A guide that feels curated and personal.

HEADER every page: #75AFB1 band — agency name left Georgia white bold, guide title right in #DAC396 gold badge uppercase. 5px #DAC396 gold bar below.

FOOTER every page: #75AFB1 band — agent name in #DAC396 Georgia left, "Curated Journeys · Expert Advisors" center italic pale teal, page number right.

COVER PAGE: Full-width #75AFB1 teal hero band — property name large white Georgia, destination below in #DAC396 italic. Prepared for [client name] in elegant layout. Agent name right-aligned.

PROPERTY OVERVIEW: #DAC396 gold rule above section title. Property name Georgia 20-22px navy. Location, category as small #9AD0CE teal pill badges. Key details (check-in, check-out, room category) in #C4E4E1 pale teal detail grid — Georgia uppercase label, Arial bold value. 2-3 sentence positioning statement in #E9DEC0 cream left-bordered pull quote.

ROOM & SUITE SECTION: Each room type — teal left accent bar, room name Georgia bold, description Arial body.

AMENITIES & EXPERIENCES: Two or three column layout. #75AFB1 teal dot bullets. Grouped by category (Dining, Spa, Beach, Activities) with small Georgia uppercase category label in #4A6070.

PRACTICAL INFORMATION: Clean table — Georgia uppercase labels, Arial values. Subtle #9AD0CE borders.

IMPORTANT NOTICES: #C8975A amber left border, #FDF3E3 background.

CLOSING: #C4E4E1 pale teal outer box, white inner box, #75AFB1 left border. Full closing exactly as written, then agent contact card in #75AFB1 teal rounded block.

PAGE BREAK RULES: Never split a section across two pages. If a section cannot fit completely on the current page, move the entire section to the next page. Every section wrapper: break-inside:avoid; page-break-inside:avoid. h1 and h2: break-after:avoid.

Output ONLY the complete self-contained HTML file. No explanation, no markdown code fences.`;
  }

    function buildEditorialDOCXPrompt(guideText) {
    return `Here is a property guide that needs to be formatted as a rich, editorial branded Word document.

${guideText}

---

You are a professional travel document designer for Point Me to Paradise Travel. The content above has already been written and researched. Your job is ONLY to render it into a polished, beautifully formatted branded document using the docx npm library (v8.x). Do not rewrite, summarize, reorganize, or add to the content. Render it exactly as provided.

BRAND COLORS (hex without #): 75AFB1 teal, DAC396 gold, 9AD0CE light teal, C4E4E1 pale teal, E9DEC0 warm cream, C8975A amber, 2C2C2C dark text, 4A6070 secondary text, FFFFFF white.
Fonts: Georgia serif for headings, property names, labels, pull quotes. Arial/Calibri sans-serif for body text, descriptions, amenity lists.

DOCUMENT SETUP: US Letter width 12240 height 15840 DXA. Margins top 1440 right 1080 bottom 1440 left 1080.

COVER PAGE: Full-width 75AFB1 header block — property name Georgia 48 bold white. Destination Georgia 22 italic DAC396. "Prepared for [client]" label/value layout. Agent name right-aligned.

HEADER on every page: 75AFB1 background — agency name left Georgia 10 white bold, guide title right Georgia 10 DAC396 uppercase. 5px DAC396 rule below.

FOOTER on every page: 75AFB1 background — agent name left DAC396 Georgia, "Curated Journeys · Expert Advisors" center italic pale teal, page number right.

SECTION HEADINGS (## in guide): Georgia 14 bold navy 162d42, allCaps, DAC396 gold rule above, keepNext true, pageBreakBefore true.
SECTION BODY: Arial/Calibri 11, color 2C2C2C, keepNext true except last paragraph per section, keepLines true on all body paragraphs.

PROPERTY OVERVIEW: C4E4E1 shaded key details grid — Georgia uppercase 9 labels, Arial bold 11 values. E9DEC0 shaded pull quote with DAC396 left border 4px.

ROOM BLOCKS: Each room type — 75AFB1 left border 3px, room name Georgia 13 bold, description Arial 11.

AMENITIES: Two-column layout with Georgia uppercase 9 category labels in 4A6070. 75AFB1 teal bullets.

PRACTICAL INFO TABLE: Two columns, Georgia uppercase labels, Arial values, 9AD0CE borders.

CLOSING BLOCK: C4E4E1 outer shading, white inner, 75AFB1 left border 4px. Full closing then agent contact in 75AFB1 shaded block.

PAGE FLOW RULES:
- Add pageBreakBefore: true to every H2 heading — each major section always starts on its own page
- Chain keepNext: true through all paragraphs within a section as a secondary safeguard against orphaned subheadings
- Set keepNext: false only on the last item before the next H2 or end of document
- Add keepLines: true to all body paragraphs to prevent single-line orphans within paragraphs
- Do NOT attempt conditional page breaks — Word has no mechanism for "break only if needed" and any attempt will be unreliable, especially when tables are present in the section
- Tables break the keepNext chain — Word does not bridge keepNext from a paragraph across a Table into the paragraphs that follow it, so do not rely on keepNext alone to hold sections together when tables are present
- Never use explicit PageBreak elements separate from pageBreakBefore on headings

Output ONLY complete runnable JavaScript using Packer.toBuffer() saving to output.docx. No explanation, no markdown code fences.`;
  }

    function handleCopyExportPrompt(){
    const prompt=exportFormat==="html"?(guideStyle==="editorial"?buildEditorialHTMLPrompt(guideText):buildHTMLPrompt(guideText)):(guideStyle==="editorial"?buildEditorialDOCXPrompt(guideText):buildDOCXPrompt(guideText));
    copy(prompt,setCopiedExport);
  }

  return(
    <>
      <style>{css}</style>
      <div className="hd-stripe">Point Me to Paradise Travel — Hotel &amp; Resort Guide Generator</div>
      <div className="hd-warn">Internal Use Only — Point Me to Paradise Travel · Unauthorized use is strictly prohibited</div>
      <nav className="hd-nav">
        <div className="hd-logo">
          <span className="hd-logo-name">PMTP</span>
          <span className="hd-logo-sub">Hotel &amp; Resort Guide Generator</span>
        </div>
      </nav>
      <div className="page">
        <div className="page-eyebrow">Point Me to Paradise Travel</div>
        <h1 className="page-title">Hotel &amp; Resort Guide Generator</h1>
        <p className="page-desc">You booked the property — now give your client a guide that makes them feel like an insider before they even arrive. Fill in the details, follow the steps, and walk away with a personalized property guide ready to send.</p>

        {/* STEP 1 */}
        <div className="card" style={{animationDelay:"0s"}}>
          <div className="card-head">
            <div className={`step-num${hasDetails?" done":""}`}>{hasDetails?"✓":"1"}</div>
            <div className="step-head-text">
              <div className="step-title">Enter Property Details</div>
              <div className="step-sub">Client, agent, property name, location, and travel dates</div>
            </div>
            <span className={`step-badge ${hasDetails?"done":"pending"}`}>{hasDetails?"✓ Complete":"Required"}</span>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field"><label className="field-label">Client Name(s)</label><input name="clientName" value={form.clientName} onChange={set} placeholder="e.g. Sarah & James"/></div>
              <div className="field"><label className="field-label">Your Name (Agent)</label><input name="agentName" value={form.agentName} onChange={set} placeholder="e.g. Maria"/></div>
              <div className="field"><label className="field-label">Property Name *</label><input name="propertyName" value={form.propertyName} onChange={set} placeholder="e.g. Four Seasons Bora Bora"/></div>
              <div className="field"><label className="field-label">Location / Destination</label><input name="destination" value={form.destination} onChange={set} placeholder="e.g. Bora Bora, French Polynesia"/></div>
              <div className="field"><label className="field-label">Travel Dates</label><input name="travelDates" value={form.travelDates} onChange={set} placeholder="e.g. July 5-12, 2025"/></div>
              <div className="field"><label className="field-label">Room / Suite Category</label><input name="roomType" value={form.roomType} onChange={set} placeholder="e.g. Overwater Bungalow"/></div>
            </div>
          </div>
        </div>

        <div className="connector"/>

        {/* STEP 2 */}
        <div className="card" style={{animationDelay:"0.06s"}}>
          <div className="card-head">
            <div className="step-num">2</div>
            <div className="step-head-text">
              <div className="step-title">Copy Perplexity Research Prompt</div>
              <div className="step-sub">Run in Perplexity, Claude, or ChatGPT — then paste results in Step 3</div>
            </div>
            <span className={`step-badge ${hasDetails?"ready":"pending"}`}>{hasDetails?"Ready to Copy":"Enter property first"}</span>
          </div>
          <div className="card-body">
            <div className="prompt-label">Research Prompt — Copy &amp; Run in Your AI Tool of Choice</div>
            <div className="prompt-box">{perpPrompt?perpPrompt:<span className="prompt-empty">Enter a property name in Step 1 and your research prompt will appear here.</span>}</div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedPerp?" copied":""}`} onClick={()=>perpPrompt&&copy(perpPrompt,setCopiedPerp)} disabled={!perpPrompt}>{copiedPerp?"✓ Copied!":"⎘ Copy Prompt"}</button>
            </div>
            <div className="research-tools">
              <a className="research-tool-btn" href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer">
                <span className="research-tool-icon">🔍</span>
                <span className="research-tool-name">Perplexity</span>
                <span className="research-tool-tag">Best results</span>
              </a>
              <a className="research-tool-btn" href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                <span className="research-tool-icon">🤖</span>
                <span className="research-tool-name">Claude</span>
                <span className="research-tool-tag">Great depth</span>
              </a>
              <a className="research-tool-btn" href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">
                <span className="research-tool-icon">💬</span>
                <span className="research-tool-name">ChatGPT</span>
                <span className="research-tool-tag">Works well</span>
              </a>
            </div>
            <div className="research-instructions">
              <div className="research-instr-row">
                <div className="research-instr-tool">🔍 Perplexity</div>
                <div className="research-instr-text"><strong>Best option.</strong> Go to perplexity.ai → new search → switch to <strong>Deep Research</strong> mode → paste the prompt → run. Searches live web, guest reviews, travel blogs, and loyalty forums in real time. Paste the full response in Step 3.</div>
              </div>
              <div className="research-instr-row">
                <div className="research-instr-tool">🤖 Claude</div>
                <div className="research-instr-text"><strong>Great depth.</strong> Go to claude.ai → new conversation → paste the prompt. Add this line first: <strong>"Please research this thoroughly — go deep, be specific, use real names, prices, and details."</strong> Paste the full response in Step 3.</div>
              </div>
              <div className="research-instr-row">
                <div className="research-instr-tool">💬 ChatGPT</div>
                <div className="research-instr-text"><strong>Works well.</strong> Go to chat.openai.com → new chat → enable <strong>Search</strong> if available → paste the prompt. Add: <strong>"Use web search and be as specific and detailed as possible."</strong> Paste the full response in Step 3.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="connector"/>

        {/* STEP 3 */}
        <div className="card" style={{animationDelay:"0.12s"}}>
          <div className="card-head">
            <div className={`step-num${hasResearch?" done":""}`}>{hasResearch?"✓":"3"}</div>
            <div className="step-head-text">
              <div className="step-title">Paste Perplexity Results</div>
              <div className="step-sub">Copy the full Perplexity response and paste it below</div>
            </div>
            <span className={`step-badge ${hasResearch?"done":"pending"}`}>{hasResearch?"✓ Research Added":"Waiting"}</span>
          </div>
          <div className="card-body">
            <p className="paste-hint">Paste the <strong>complete Perplexity response</strong> — do not trim or edit it. Claude will read through everything and pull the best details into the guide.</p>
            <textarea name="researchPaste" value={form.researchPaste} onChange={set} placeholder="Paste the full research response here — from Perplexity, Claude, or ChatGPT. Do not trim or edit it." style={{minHeight:160}}/>
          </div>
        </div>

        <div className="connector"/>

        {/* STEP 4 */}
        <div className="card" style={{animationDelay:"0.18s"}}>
          <div className="card-head">
            <div className="step-num">4</div>
            <div className="step-head-text">
              <div className="step-title">Choose Voice &amp; Copy Claude Prompt</div>
              <div className="step-sub">Select a writing voice, then paste the prompt into Claude at claude.ai</div>
            </div>
            <span className={`step-badge ${hasDetails?"ready":"pending"}`}>{hasDetails?"Ready to Copy":"Enter details first"}</span>
          </div>
          <div className="card-body">
            <div style={{marginBottom:18}}>
              <div className="field-label" style={{marginBottom:10}}>Select Guide Voice</div>
              <div className="voice-grid">
                {VOICES.map(v=>(
                  <div key={v.id} className={`voice-card${voice===v.id?" selected":""}`} onClick={()=>setVoice(v.id)}>
                    <div className="voice-icon">{v.icon}</div>
                    <div className="voice-name">{v.label}</div>
                    <div className="voice-tagline">{v.tagline}</div>
                  </div>
                ))}
              </div>
              {selectedVoice&&(
                <div className="voice-desc-box">
                  <span className="voice-desc-label">About this voice</span>
                  {selectedVoice.description}
                </div>
              )}
            </div>
            <div className="prompt-label">Claude Guide Generation Prompt — {selectedVoice?.label}</div>
            <div className="prompt-box tall">{claudePrompt?claudePrompt:<span className="prompt-empty">Complete Steps 1-3 and your Claude prompt will appear here.</span>}</div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedClaude?" copied":""}`} onClick={()=>claudePrompt&&copy(claudePrompt,setCopiedClaude)} disabled={!claudePrompt}>{copiedClaude?"✓ Copied!":"⎘ Copy Prompt"}</button>
              <a className="btn-link" href="https://claude.ai" target="_blank" rel="noopener noreferrer">Open Claude ↗</a>
            </div>
            <div className="tip"><span className="tip-label">How to use this</span>Go to <strong>claude.ai</strong> → new conversation → paste the full prompt → Claude generates a complete, PMTP-branded property guide in the voice you selected.</div>
            <div style={{marginTop:16,borderRadius:9,overflow:"hidden",border:"2px solid #c9a84c"}}>
              <div style={{background:"#162d42",padding:"12px 18px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:22}}>🛑</span>
                <span style={{fontFamily:"Georgia, serif",fontSize:13,letterSpacing:"0.1em",textTransform:"uppercase",color:"#c9a84c",fontWeight:"bold"}}>Stop — Before You Move to Step 5</span>
              </div>
              <div style={{background:"#f5e9c8",padding:"16px 18px"}}>
                <p style={{fontSize:13,color:"#162d42",lineHeight:1.7,marginBottom:10}}>
                  <strong>Did you ask your AI to do a full fact-check before you copy the guide?</strong> This is an important step that protects your clients and your reputation.
                </p>
                <p style={{fontSize:12,color:"#5a4a2a",lineHeight:1.65,marginBottom:12}}>
                  AI can confidently present outdated hours, closed restaurants, incorrect prices, and changed policies as current fact. A quick fact-check challenge catches these before your client does.
                </p>
                <div style={{background:"#162d42",borderRadius:7,padding:"13px 16px",marginBottom:12}}>
                  <div style={{fontFamily:"Georgia, serif",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"#c9a84c",marginBottom:7}}>Copy &amp; Send This to Your AI Before Moving On</div>
                  <div style={{fontSize:12,color:"#d8ceb8",lineHeight:1.7,fontStyle:"italic"}}>
                    "Before I use this guide, please do a full fact-check sweep. Flag anything that may be outdated, unverifiable, or potentially inaccurate — including restaurant hours, prices, policies, property details, and any specific claims. Note your confidence level on each flagged item and suggest corrections where possible."
                  </div>
                </div>
                <p style={{fontSize:11,color:"#7a6e5f",lineHeight:1.6}}>
                  Review any flags, update the guide as needed, <strong>then</strong> copy and paste into Step 5.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="connector"/>

        {/* STEP 5 */}
        <div className="card" style={{animationDelay:"0.24s"}}>
          <div className="card-head">
            <div className={`step-num${copiedExport?" done":""}`}>{copiedExport?"✓":"5"}</div>
            <div className="step-head-text">
              <div className="step-title">Format &amp; Export Your Guide</div>
              <div className="step-sub">Paste your completed guide, choose a format, copy the prompt, run it in Claude</div>
            </div>
            <span className={`step-badge ${guideText.trim()?"ready":"pending"}`}>{guideText.trim()?"Ready to Format":"Paste guide first"}</span>
          </div>
          <div className="card-body">
            <div className="field" style={{marginBottom:18}}>
              <label className="field-label">Step 5a — Paste Your Completed Claude Guide Here</label>
              <textarea value={guideText} onChange={e=>setGuideText(e.target.value)} placeholder="Go to your Claude conversation, copy the full property guide that was generated, and paste it here. Do not edit it." style={{minHeight:180}}/>
            </div>
            <div className="field-label" style={{marginBottom:10}}>Step 5b — Choose Export Format</div>
            <div className="format-grid" style={{marginBottom:16}}>
              <div className={`format-card${exportFormat==="html"?" selected":""}`} onClick={()=>setExportFormat("html")}>
                <div className="format-icon">🌐</div>
                <div className="format-name">HTML Guide</div>
                <div className="format-desc">Browser-ready. Share via email, Drive, or WeTransfer.</div>
              </div>
              <div className={`format-card${exportFormat==="docx"?" selected":""}`} onClick={()=>setExportFormat("docx")}>
                <div className="format-icon">📄</div>
                <div className="format-name">Word Doc → PDF</div>
                <div className="format-desc">Open in Word, Save As PDF, then send.</div>
              </div>
            </div>

            <div className="field-label" style={{marginBottom:10}}>Step 5c — Choose Guide Style</div>
            <div className="style-grid" style={{marginBottom:18}}>
              <div className={`style-card${guideStyle==="classic"?" selected":""}`} onClick={()=>setGuideStyle("classic")}>
                <div className="style-card-top">
                  <span className="style-icon">🎯</span>
                  <span className="style-name">Classic</span>
                </div>
                <div className="style-tag">Clean · minimal · brand-consistent</div>
                <div className="style-swatches">
                  <div className="style-swatch" style={{background:"#E9DEC0"}}/>
                  <div className="style-swatch" style={{background:"#75AFB1"}}/>
                  <div className="style-swatch" style={{background:"#DAC396"}}/>
                  <div className="style-swatch" style={{background:"#ffffff",border:"1px solid #ddd"}}/>
                </div>
              </div>
              <div className={`style-card${guideStyle==="editorial"?" selected":""}`} onClick={()=>setGuideStyle("editorial")}>
                <div className="style-card-top">
                  <span className="style-icon">✨</span>
                  <span className="style-name">Editorial</span>
                </div>
                <div className="style-tag">Rich · magazine-style · full color</div>
                <div className="style-swatches">
                  <div className="style-swatch" style={{background:"#75AFB1"}}/>
                  <div className="style-swatch" style={{background:"#DAC396"}}/>
                  <div className="style-swatch" style={{background:"#C4E4E1"}}/>
                  <div className="style-swatch" style={{background:"#E9DEC0"}}/>
                </div>
              </div>
            </div>
            <div className="prompt-label">Step 5d — Your Formatting Prompt for Claude</div>
            <div className="prompt-box tall">
              {guideText.trim()
                ?(exportFormat==="html"?(guideStyle==="editorial"?buildEditorialHTMLPrompt(guideText):buildHTMLPrompt(guideText)):(guideStyle==="editorial"?buildEditorialDOCXPrompt(guideText):buildDOCXPrompt(guideText)))
                :<span className="prompt-empty">Paste your guide above and choose a format — your formatting prompt will appear here.</span>
              }
            </div>
            <div className="prompt-actions">
              <button className={`btn-copy${copiedExport?" copied":""}`} onClick={handleCopyExportPrompt} disabled={!guideText.trim()}>{copiedExport?"✓ Copied!":"⎘ Copy Formatting Prompt"}</button>
              <a className="btn-link" href="https://claude.ai" target="_blank" rel="noopener noreferrer">Open Claude ↗</a>
            </div>
            <div className="tip" style={{marginTop:16}}>
              <span className="tip-label">Step 5d — How to use this prompt</span>
              Go to <strong>claude.ai</strong> → start a <strong>new conversation</strong> → paste the formatting prompt → Claude outputs your fully branded, formatted guide.
            </div>
            {exportFormat==="html"?(
              <div className="delivery-box" style={{marginTop:16}}>
                <span className="delivery-label">How to Get and Share the HTML Guide</span>
                <ol>
                  <li><strong>After running in Claude:</strong> Select all output (full HTML starting with &lt;!DOCTYPE html&gt;). Copy it.</li>
                  <li><strong>Save as a file:</strong> Open Notepad (Windows) or TextEdit plain text mode (Mac). Paste. Save as ClientName_Guide.html — extension must be .html not .txt.</li>
                  <li><strong>Test it:</strong> Double-click the file. It opens in your browser fully formatted. If it looks right, ready to send.</li>
                  <li><strong>Email:</strong> Attach the .html file. Client opens in their browser — no software needed.</li>
                  <li><strong>Google Drive:</strong> Upload → right-click → Get Link → Anyone with link → share. Opens in their browser.</li>
                  <li><strong>WeTransfer:</strong> wetransfer.com → upload → enter client email → send. Link valid 7 days.</li>
                  <li><strong>Dropbox / OneDrive:</strong> Upload and share a direct view link.</li>
                </ol>
              </div>
            ):(
              <div className="delivery-box" style={{marginTop:16}}>
                <span className="delivery-label">Getting Your Word Doc and Converting to PDF</span>
                <ol>
                  <li><strong>After running in Claude:</strong> If there is a download link, click it. If Claude outputs text, copy it all → open Microsoft Word → paste → save as ClientName_PropertyGuide.docx.</li>
                  <li><strong>Review in Word:</strong> Confirm no section is cut off mid-page. Each section should flow to the next page intact.</li>
                  <li><strong>Convert to PDF in Word:</strong> File → Save As → select PDF → Save.</li>
                  <li><strong>Convert to PDF in Google Docs:</strong> File → Download → PDF Document.</li>
                  <li><strong>Send the PDF:</strong> Email attachment, Google Drive link, or WeTransfer. PDF looks identical on every device.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}


  
