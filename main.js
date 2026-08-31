/* ============================================================
   AutomataLearn v2 — Main Application
   Light theme, Interactive Canvas, Proof Generator, Challenges
   ============================================================ */

// ===== APP STATE =====
let currentPage = 'home';
let convStep = 0;
let quizState = { qs: [], cur: 0, score: 0, answers: [], cat: 'all' };
const progress = JSON.parse(localStorage.getItem('al2_progress') || '{"visited":[],"quizBest":0}');

// ===== CANVAS STATE =====
let cvStates = [];
let cvTransitions = [];
let cvStart = null;
let cvSelected = null;
let cvMode = 'move'; // 'move','addState','setStart','toggleAccept','addTrans','delete'
let cvTransFrom = null;
let cvDragging = null;
let cvDragOff = { x: 0, y: 0 };
let cvSimStep = -1;
let cvSimTrace = [];
let cvStateId = 0;

// ===== ROUTER =====
window.navigate = function(page, push = true, subTab = null) {
  let targetPage = page;
  let targetSubTab = subTab;

  if (page.includes(':')) {
    const parts = page.split(':');
    targetPage = parts[0];
    targetSubTab = parts[1];
  }

  currentPage = targetPage;
  const hash = targetSubTab ? `#${targetPage}:${targetSubTab}` : `#${targetPage}`;
  if (push) history.pushState({ page: targetPage, subTab: targetSubTab }, '', hash);

  const app = document.getElementById('app');
  app.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'page-enter';
  el.innerHTML = PAGES[targetPage] ? PAGES[targetPage]() : PAGES.home();
  app.appendChild(el);
  updateNav(targetPage);
  afterRender(targetPage, targetSubTab);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!progress.visited.includes(targetPage)) {
    progress.visited.push(targetPage);
    localStorage.setItem('al2_progress', JSON.stringify(progress));
  }
  closeMenu();
};

window.addEventListener('popstate', e => {
  const hash = location.hash.slice(1) || 'home';
  navigate(hash, false);
});

function updateNav(page) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a =>
    a.classList.toggle('active', a.dataset.page === page));
}

// ===== NAV HELPERS =====
window.toggleMenu = () => document.getElementById('nav-links').classList.toggle('open');
function closeMenu() { document.getElementById('nav-links').classList.remove('open'); }

// ===== SVG HELPERS (static diagrams) =====
function svg(content, vw = 540, vh = 200) {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" overflow="visible" style="max-width:100%;height:auto">
  <defs>
    <marker id="ah" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0,9 3.5,0 7" fill="#94a3b8"/>
    </marker>
    <marker id="ah-p" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0,9 3.5,0 7" fill="#4f46e5"/>
    </marker>
    <marker id="ah-g" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0,9 3.5,0 7" fill="#059669"/>
    </marker>
  </defs>
  ${content}
</svg>`;
}

function sState(cx, cy, lbl, type = 'n', id = '') {
  const r = 28;
  const col = { n:'#4f46e5', a:'#0ea5e9', s:'#059669', sa:'#0ea5e9' }[type] || '#4f46e5';
  const dbl = (type === 'a' || type === 'sa')
    ? `<circle cx="${cx}" cy="${cy}" r="${r-5}" fill="none" stroke="${col}" stroke-width="1.5" opacity="0.7"/>` : '';
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" stroke="${col}" stroke-width="2" ${id ? `id="${id}"` : ''}/>
  ${dbl}
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#0f172a" font-family="JetBrains Mono,monospace" font-size="12" font-weight="600">${lbl}</text>`;
}

function sArrow(x1,y1,x2,y2,lbl,curve=false,col='n') {
  const m = `url(#ah${col==='p'?'-p':col==='g'?'-g':''})`;
  let d, lx, ly;
  if (curve) {
    const mx=(x1+x2)/2, my=(y1+y2)/2-44;
    d=`M${x1},${y1} Q${mx},${my} ${x2},${y2}`; lx=mx; ly=my-10;
  } else { d=`M${x1},${y1} L${x2},${y2}`; lx=(x1+x2)/2; ly=(y1+y2)/2-10; }
  return `<path d="${d}" stroke="#94a3b8" stroke-width="1.8" fill="none" marker-end="${m}"/>
  <text x="${lx}" y="${ly}" text-anchor="middle" fill="#0ea5e9" font-family="JetBrains Mono,monospace" font-size="12">${lbl}</text>`;
}

function sLoop(cx,cy,lbl) {
  return `<path d="M${cx-17},${cy-28} C${cx-44},${cy-80} ${cx+44},${cy-80} ${cx+17},${cy-28}" stroke="#94a3b8" stroke-width="1.8" fill="none" marker-end="url(#ah)"/>
  <text x="${cx}" y="${cy-88}" text-anchor="middle" fill="#0ea5e9" font-family="JetBrains Mono,monospace" font-size="12">${lbl}</text>`;
}

function sStart(cx,cy) {
  return `<line x1="${cx-60}" y1="${cy}" x2="${cx-30}" y2="${cy}" stroke="#059669" stroke-width="1.8" marker-end="url(#ah-g)"/>
  <text x="${cx-62}" y="${cy-7}" text-anchor="end" fill="#059669" font-family="JetBrains Mono,monospace" font-size="10">start</text>`;
}

// ===== ===== ALL PAGES ===== =====
const PAGES = {

// ====================================================
// HOME
// ====================================================
home: () => `
<div class="hero" style="padding-top:72px">
  <div class="hero-eyebrow"><span class="pulse-dot"></span>Theory of Computation · Interactive Learning</div>
  <h1>Learn Automata<br/><span class="grad">Theory, Hands-On.</span></h1>
  <p class="hero-sub">Master DFA &amp; NFA, Subset Construction, and Pumping Lemma with an interactive canvas builder, step-by-step proofs, and scored practice questions.</p>
  <div class="hero-cta">
    <button class="btn btn-primary btn-xl" onclick="navigate('dfa-nfa')">Start Learning →</button>
    <button class="btn btn-ghost btn-xl" onclick="navigate('practice')">Take Practice Quiz</button>
  </div>

  <!-- Hero illustration: animated automata -->
  <div class="hero-illustration">
    ${svg(`
      ${sStart(90,100)}
      ${sState(90,100,'q₀','s')}
      ${sState(250,100,'q₁','n')}
      ${sState(410,100,'q₂','a')}
      ${sLoop(90,100,'0')}
      ${sArrow(118,100,222,100,'1')}
      ${sArrow(278,100,382,100,'1')}
      ${sArrow(235,115,105,115,'0')}
      ${sLoop(410,100,'0,1')}
    `, 540, 210)}
    <p style="text-align:center;font-size:.78rem;color:var(--text-muted);margin-top:8px">
      Interactive state diagram — DFA accepting strings ending in "11" over {0,1}
    </p>
  </div>

  <div class="module-grid">
    <a class="module-card" onclick="navigate('dfa-nfa'); return false;" href="#dfa-nfa">
      <div class="module-icon icon-purple">🤖</div>
      <h3>Finite Automata</h3>
      <p>DFA &amp; NFA — formal definitions, transition tables, state diagrams + live canvas builder</p>
      <div style="margin-top:10px">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); navigate('dfa-nfa:canvas-tab'); return false;">🎨 Open Canvas Builder</button>
      </div>
    </a>
    <a class="module-card" onclick="navigate('conversion'); return false;" href="#conversion">
      <div class="module-icon icon-sky">🔄</div>
      <h3>NFA → DFA Conversion</h3>
      <p>Subset construction algorithm guided step-by-step with ε-closure worked examples</p>
    </a>
    <a class="module-card" onclick="navigate('pumping'); return false;" href="#pumping">
      <div class="module-icon icon-green">🧪</div>
      <h3>Pumping Lemma</h3>
      <p>Prove non-regularity with interactive proof generator and string decomposer</p>
    </a>
    <a class="module-card" onclick="navigate('practice'); return false;" href="#practice">
      <div class="module-icon icon-amber">📝</div>
      <h3>Practice Questions</h3>
      <p>20 scored MCQs with instant feedback, category filter, and answer review</p>
    </a>
  </div>

  <div class="stats-bar">
    <div class="stat-item"><div class="stat-val">4</div><div class="stat-key">Core Modules</div></div>
    <div class="stat-item"><div class="stat-val">20+</div><div class="stat-key">Practice Qs</div></div>
    <div class="stat-item"><div class="stat-val">10+</div><div class="stat-key">SVG Diagrams</div></div>
    <div class="stat-item"><div class="stat-val">Live</div><div class="stat-key">Canvas Builder</div></div>
    <div class="stat-item"><div class="stat-val">∞</div><div class="stat-key">Understanding</div></div>
  </div>
</div>`,

// ====================================================
// DFA & NFA
// ====================================================
'dfa-nfa': () => `
<div class="topic-header">
  <div class="topic-header-inner">
    <div class="topic-header-text">
      <div class="topic-label">Module 01</div>
      <h1>Finite Automata — <span>DFA &amp; NFA</span></h1>
      <p>Formal definitions, state diagrams, transition tables, string acceptance — plus a live interactive canvas to build and simulate your own automata.</p>
    </div>
    <div class="topic-badges">
      <span class="badge badge-primary">Theory</span>
      <span class="badge badge-accent">Diagrams</span>
      <span class="badge badge-success">Live Canvas</span>
    </div>
  </div>
</div>

<div class="topic-content">
  <!-- TABS -->
  <div class="tab-bar" id="dfa-tabs">
    <button class="tab-btn active" onclick="switchTab('dfa-tabs','dfa-tab',this)">DFA</button>
    <button class="tab-btn" onclick="switchTab('dfa-tabs','nfa-tab',this)">NFA</button>
    <button class="tab-btn" onclick="switchTab('dfa-tabs','compare-tab',this)">DFA vs NFA</button>
    <button class="tab-btn" onclick="switchTab('dfa-tabs','examples-tab',this)">Worked Examples</button>
    <button class="tab-btn" onclick="switchTab('dfa-tabs','canvas-tab',this)">🎨 Canvas Builder</button>
  </div>

  <!-- DFA TAB -->
  <div class="tab-pane active" id="dfa-tab">
    <h2 class="content-h2"><span class="h2-num">1</span>What is a DFA?</h2>
    <p class="content-p">A <strong>Deterministic Finite Automaton (DFA)</strong> is a 5-tuple model that reads an input string and either accepts or rejects it. It's "deterministic" because for every state and input symbol there is <em>exactly one</em> next state — no guessing, no branching.</p>
    <div class="formula-block" data-label="Formal Definition">
M = (Q, Σ, δ, q₀, F)
<span class="formula-cmt">where:</span>
  Q   → finite, non-empty set of states
  Σ   → finite input alphabet
  δ   → transition function  :  Q × Σ → Q
  q₀  → start state          (q₀ ∈ Q)
  F   → set of accept states  (F ⊆ Q)</div>

    <div class="callout callout-blue">
      <span class="callout-icon">💡</span>
      <div class="callout-body">
        <h4>Key Property — Total Function</h4>
        <p>δ must be defined for <em>every</em> (state, symbol) pair. Given input w = a₁a₂…aₙ, the DFA processes each character deterministically and accepts if the final state is in F.</p>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-num">2</span>State Diagram</h2>
    <p class="content-p">Example: DFA over {0,1} accepting all strings that <strong>end with "11"</strong>.</p>
    <div class="diagram-wrap">
      ${svg(`${sStart(90,100)}${sState(90,100,'q₀','s')}${sState(250,100,'q₁','n')}${sState(410,100,'q₂','a')}${sLoop(90,100,'0')}${sArrow(118,100,222,100,'1')}${sArrow(278,100,382,100,'1')}${sArrow(235,115,105,115,'0')}${sLoop(410,100,'0,1')}`,540,200)}
    </div>
    <p class="diagram-caption"><strong>Double circle</strong> = accept state &nbsp;·&nbsp; <strong>Green arrow</strong> = start &nbsp;·&nbsp; q₂ accepts strings ending in "11"</p>

    <h2 class="content-h2"><span class="h2-num">3</span>Transition Table</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>State</th><th>Input: 0</th><th>Input: 1</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td class="state-current">→ q₀ (start)</td><td>q₀</td><td>q₁</td><td class="state-reject">No</td></tr>
        <tr><td>q₁</td><td>q₀</td><td>q₂</td><td class="state-reject">No</td></tr>
        <tr><td>q₂ ✓</td><td>q₀</td><td>q₂</td><td class="state-accept">Yes ✓</td></tr>
      </tbody>
    </table></div>

    <h2 class="content-h2"><span class="h2-num">4</span>String Trace — How does "0110" get processed?</h2>
    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-body"><h4>Read '0' in q₀</h4><p>δ(q₀, 0) = q₀ &nbsp;→ self-loop, stay in q₀</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-body"><h4>Read '1' in q₀</h4><p>δ(q₀, 1) = q₁ &nbsp;→ advance to q₁</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-body"><h4>Read '1' in q₁</h4><p>δ(q₁, 1) = q₂ &nbsp;→ enter accept state q₂</p></div></div>
      <div class="step"><div class="step-num">4</div><div class="step-body"><h4>Read '0' in q₂</h4><p>δ(q₂, 0) = q₀ &nbsp;→ back to q₀. String ends at q₀ ∉ F → <strong style="color:var(--danger)">REJECT ✗</strong></p></div></div>
    </div>
  </div>

  <!-- NFA TAB -->
  <div class="tab-pane" id="nfa-tab">
    <h2 class="content-h2"><span class="h2-num">1</span>What is an NFA?</h2>
    <p class="content-p">A <strong>Non-deterministic Finite Automaton (NFA)</strong> relaxes the DFA constraint: from a state, on a given symbol, you may go to <em>zero, one, or multiple</em> states. You may also take ε-transitions (moves without consuming input). A string is <strong>accepted if at least one</strong> computation path leads to an accept state.</p>
    <div class="formula-block" data-label="Formal Definition">
M = (Q, Σ, δ, q₀, F)
<span class="formula-cmt">where:</span>
  δ  →  Q × (Σ ∪ {ε}) → <span class="formula-hl">𝒫(Q)</span>
<span class="formula-cmt">  (returns a SUBSET of Q — could be ∅, {q}, or {q₁,q₂,...})</span></div>

    <div class="callout callout-blue">
      <span class="callout-icon">⚡</span>
      <div class="callout-body">
        <h4>Superposition — parallel computation</h4>
        <p>Think of an NFA as exploring all computation paths simultaneously. If any branch reaches an accept state, the string is accepted. ε-transitions let the machine jump states without consuming a character.</p>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-num">2</span>NFA State Diagram</h2>
    <p class="content-p">NFA accepting strings over {a,b} that end with <code class="ic">ab</code>:</p>
    <div class="diagram-wrap">
      ${svg(`${sStart(80,110)}${sState(80,110,'q₀','s')}${sState(240,70,'q₁','n')}${sState(240,160,'q₂','n')}${sState(400,110,'q₃','a')}${sArrow(108,97,213,76,'a')}${sArrow(108,122,213,153,'b')}${sArrow(268,76,373,99,'b')}${sArrow(268,153,373,120,'a')}${sLoop(80,110,'a,b')}`,520,230)}
    </div>

    <h2 class="content-h2"><span class="h2-num">3</span>NFA Transition Table</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>State</th><th>a</th><th>b</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td class="state-current">→ q₀</td><td>{q₀, q₁}</td><td>{q₀, q₂}</td><td class="state-reject">No</td></tr>
        <tr><td>q₁</td><td>∅</td><td>{q₃}</td><td class="state-reject">No</td></tr>
        <tr><td>q₂</td><td>{q₃}</td><td>∅</td><td class="state-reject">No</td></tr>
        <tr><td>q₃ ✓</td><td>∅</td><td>∅</td><td class="state-accept">Yes ✓</td></tr>
      </tbody>
    </table></div>

    <div class="callout callout-yellow">
      <span class="callout-icon">⚠️</span>
      <div class="callout-body">
        <h4>ε-Transitions</h4>
        <p>An ε-NFA adds transitions on empty string ε. The <strong>ε-closure(q)</strong> is the set of all states reachable from q using zero or more ε-transitions (including q itself). This is critical for NFA→DFA conversion.</p>
      </div>
    </div>
  </div>

  <!-- COMPARE TAB -->
  <div class="tab-pane" id="compare-tab">
    <h2 class="content-h2"><span class="h2-num">1</span>Side-by-Side Comparison</h2>
    <div class="compare-grid">
      <div class="compare-card left">
        <h3>🤖 DFA — Deterministic</h3>
        <ul class="compare-list">
          <li>Exactly <strong>one</strong> transition per (state, symbol)</li>
          <li>No ε-transitions</li>
          <li>δ: Q × Σ → Q (returns single state)</li>
          <li>Simple to implement in software</li>
          <li>State always uniquely determined</li>
          <li>May need more states than NFA</li>
        </ul>
      </div>
      <div class="compare-card right">
        <h3>🔀 NFA — Non-deterministic</h3>
        <ul class="compare-list">
          <li><strong>Multiple or zero</strong> transitions per (state, symbol)</li>
          <li>ε-transitions allowed</li>
          <li>δ: Q × (Σ∪{ε}) → 𝒫(Q) (returns set)</li>
          <li>More compact for some languages</li>
          <li>Multiple states active simultaneously</li>
          <li>Requires subset construction to simulate</li>
        </ul>
      </div>
    </div>

    <div class="callout callout-green mt-24">
      <span class="callout-icon">🏆</span>
      <div class="callout-body">
        <h4>Rabin-Scott Equivalence Theorem (1959)</h4>
        <p>DFAs and NFAs recognize exactly the same class of languages — the <strong>Regular Languages</strong>. For every NFA there is an equivalent DFA. This is proven constructively by Subset Construction.</p>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-num">2</span>Property Comparison Table</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Property</th><th>DFA</th><th>NFA</th></tr></thead>
      <tbody>
        <tr><td>Transitions per (state,symbol)</td><td>Exactly 1</td><td>0, 1, or many</td></tr>
        <tr><td>ε-transitions</td><td>❌ No</td><td>✅ Yes</td></tr>
        <tr><td>Acceptance rule</td><td>End state ∈ F</td><td>Any path ends in F</td></tr>
        <tr><td>Max states (after NFA→DFA)</td><td>2ⁿ worst case</td><td>n states</td></tr>
        <tr><td>Expressiveness</td><td colspan="2" style="text-align:center;color:var(--success);font-weight:600">Equal — both recognize Regular Languages</td></tr>
      </tbody>
    </table></div>
  </div>

  <!-- EXAMPLES TAB -->
  <div class="tab-pane" id="examples-tab">
    <h2 class="content-h2"><span class="h2-num">1</span>Worked Examples</h2>
    <div class="accordion">
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">DFA: Even number of 0s over {0,1}</span>
          <span class="acc-chevron">▼</span>
        </div>
        <div class="acc-body"><div class="acc-inner">
          <p><strong>Language:</strong> L = { w ∈ {0,1}* | w has an even number of 0s }</p>
          <p style="margin-top:8px"><strong>States:</strong> q₀ (even 0s — start &amp; accept), q₁ (odd 0s)</p>
          <div class="diagram-wrap" style="margin-top:12px">
            ${svg(`${sStart(100,100)}${sState(100,100,'q₀','sa')}${sState(300,100,'q₁','n')}${sLoop(100,100,'1')}${sLoop(300,100,'1')}${sArrow(128,93,272,93,'0')}${sArrow(272,107,128,107,'0')}`,430,200)}
          </div>
          <p><strong>Trace "1001":</strong> q₀→(1)→q₀→(0)→q₁→(0)→q₀→(1)→q₀ ∈ F → <span style="color:var(--success)">ACCEPT ✓</span></p>
        </div></div>
      </div>
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">DFA: Strings starting with 'a' and ending with 'b'</span>
          <span class="acc-chevron">▼</span>
        </div>
        <div class="acc-body"><div class="acc-inner">
          <p><strong>Language:</strong> L = { w ∈ {a,b}* | w starts with 'a' and ends with 'b' }</p>
          <p style="margin-top:8px"><strong>States:</strong> q₀ (start), q₁ (seen 'a', last≠'b'), q₂ (accept: seen 'a', last='b'), qd (dead/trap)</p>
          <div class="diagram-wrap" style="margin-top:12px">
            ${svg(`${sStart(60,110)}${sState(60,110,'q₀','s')}${sState(200,65,'q₁','n')}${sState(350,65,'q₂','a')}${sState(200,160,'qd','n')}${sArrow(88,97,173,74,'a')}${sArrow(88,122,173,153,'b')}${sArrow(228,65,322,65,'b')}${sArrow(322,77,228,77,'a')}${sLoop(200,160,'a,b')}${sLoop(200,65,'a')}${sLoop(350,65,'b')}`,490,240)}
          </div>
          <p><strong>"ab"</strong> → q₀→q₁→q₂ ∈ F → <span style="color:var(--success)">ACCEPT ✓</span> &nbsp;|&nbsp; <strong>"ba"</strong> → q₀→qd (trap) → <span style="color:var(--danger)">REJECT ✗</span></p>
        </div></div>
      </div>
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">NFA: Strings containing "ab" as substring (compact 3-state NFA)</span>
          <span class="acc-chevron">▼</span>
        </div>
        <div class="acc-body"><div class="acc-inner">
          <p><strong>Language:</strong> L = { w ∈ {a,b}* | w contains "ab" as a substring }</p>
          <div class="diagram-wrap" style="margin-top:12px">
            ${svg(`${sStart(80,110)}${sState(80,110,'q₀','s')}${sState(240,110,'q₁','n')}${sState(400,110,'q₂','a')}${sLoop(80,110,'a,b')}${sArrow(108,110,212,110,'a')}${sArrow(268,110,372,110,'b')}${sLoop(400,110,'a,b')}`,520,195)}
          </div>
          <p><strong>NFA insight:</strong> q₀ non-deterministically "guesses" when "ab" starts. This 3-state NFA is equivalent to a 4-state DFA — NFAs can be more compact!</p>
        </div></div>
      </div>
    </div>
  </div>

  <!-- CANVAS TAB -->
  <div class="tab-pane" id="canvas-tab">
    <div style="margin-bottom:20px">
      <h2 class="content-h2" style="margin-top:0"><span class="h2-num">🎨</span>Interactive Canvas Builder</h2>
      <p class="content-p">Build your own DFA or NFA visually. Add states, mark start/accept, draw transitions, then simulate a string through your automaton.</p>
    </div>
    <div class="canvas-builder" id="canvas-builder">
      <div class="canvas-toolbar" id="canvas-toolbar">
        <button class="tool-btn active" id="tool-move" onclick="setMode('move',this)" title="Drag states to reposition">
          ↖ Move
        </button>
        <button class="tool-btn" id="tool-add" onclick="setMode('addState',this)" title="Click on canvas to add a state">
          + State
        </button>
        <div class="toolbar-sep"></div>
        <button class="tool-btn" id="tool-start" onclick="setMode('setStart',this)" title="Click a state to make it the start state">
          ▶ Set Start
        </button>
        <button class="tool-btn" id="tool-accept" onclick="setMode('toggleAccept',this)" title="Click a state to toggle accept">
          ◉ Accept
        </button>
        <div class="toolbar-sep"></div>
        <button class="tool-btn" id="tool-trans" onclick="setMode('addTrans',this)" title="Click first state, then second state to add a transition">
          → Transition
        </button>
        <button class="tool-btn danger" id="tool-del" onclick="setMode('delete',this)" title="Click a state or transition to delete it">
          🗑 Delete
        </button>
        <div class="toolbar-sep"></div>
        <button class="tool-btn success-btn" onclick="resetCanvas()" title="Clear the canvas">
          ↺ Reset
        </button>
        <button class="tool-btn" onclick="loadPreset('even0')" title="Load a preset automaton">
          📂 Load Preset
        </button>
      </div>
      <div class="canvas-body">
        <svg id="automata-canvas" height="340"></svg>
        <div class="canvas-mode-hint" id="mode-hint">↖ Move mode — drag states to reposition</div>
      </div>
      <div class="canvas-simulator">
        <span class="sim-label">Simulate:</span>
        <input type="text" class="sim-input" id="sim-input" placeholder="Enter string (e.g. 0110)" maxlength="30"/>
        <button class="btn btn-primary btn-sm" onclick="runSimulation()">▶ Run</button>
        <button class="btn btn-ghost btn-sm" onclick="stepSim(-1)">Reset</button>
        <button class="btn btn-ghost btn-sm" onclick="stepSim(0)">← Prev</button>
        <button class="btn btn-ghost btn-sm" onclick="stepSim(1)">Next →</button>
        <div class="sim-result idle" id="sim-result">No simulation</div>
      </div>
      <div class="sim-trace" id="sim-trace"></div>
    </div>
    <div class="callout callout-blue mt-16">
      <span class="callout-icon">📖</span>
      <div class="callout-body">
        <h4>How to use the Canvas Builder</h4>
        <p><strong>+ State</strong>: click blank area to place a state &nbsp;·&nbsp; <strong>▶ Set Start</strong>: click a state &nbsp;·&nbsp; <strong>◉ Accept</strong>: click to toggle &nbsp;·&nbsp; <strong>→ Transition</strong>: click from-state, then to-state, then enter symbol(s) &nbsp;·&nbsp; <strong>Move</strong>: drag states &nbsp;·&nbsp; <strong>Simulate</strong>: type a string and press Run</p>
      </div>
    </div>
  </div>

  <div class="text-center mt-48">
    <button class="btn btn-primary" onclick="navigate('conversion')">Next: NFA → DFA Conversion →</button>
  </div>
</div>`,

// ====================================================
// CONVERSION
// ====================================================
conversion: () => `
<div class="topic-header" style="background:linear-gradient(135deg,var(--accent-bg) 0%,var(--primary-bg) 100%)">
  <div class="topic-header-inner">
    <div class="topic-header-text">
      <div class="topic-label">Module 02</div>
      <h1>NFA → DFA <span>Subset Construction</span></h1>
      <p>Convert any NFA to an equivalent DFA using the Powerset Construction algorithm — guided step by step with visual diagrams and ε-closure examples.</p>
    </div>
    <div class="topic-badges">
      <span class="badge badge-accent">Step-by-Step</span>
      <span class="badge badge-primary">Algorithm</span>
    </div>
  </div>
</div>

<div class="topic-content">
  <div class="card card-pad-lg" style="margin-bottom:32px;border-left:3px solid var(--accent)">
    <h3 style="color:var(--accent);margin-bottom:12px;font-size:1.05rem;font-weight:700">🔑 The Algorithm in Brief</h3>
    <p class="content-p">Each DFA state corresponds to a <em>subset</em> of NFA states — hence "Subset" or "Powerset" construction. An NFA with n states produces at most 2ⁿ DFA states (worst case), but usually far fewer reachable ones.</p>
    <div class="formula-block" data-label="Algorithm">
1. DFA start state  =  ε-closure({ q₀ })
2. For each DFA state S and each symbol a ∈ Σ:
     next  =  ε-closure( MOVE(S, a) )
     where  MOVE(S,a) = ∪ δ_NFA(q, a)  for all q ∈ S
3. If next is new → add as DFA state
4. Repeat until no new states
5. Accept states = subsets S where S ∩ F_NFA ≠ ∅</div>
  </div>

  <!-- INTERACTIVE STEPPER -->
  <div class="i-stepper" id="conv-stepper">
    <div class="i-stepper-header">
      <h3>Guided Walkthrough — NFA accepting strings ending in "ab"</h3>
      <div class="step-dots" id="conv-dots"></div>
    </div>
    <div class="i-stepper-body" id="conv-body"></div>
    <div class="i-stepper-footer">
      <button class="btn btn-ghost btn-sm" id="conv-prev" onclick="convPrev()">← Prev</button>
      <span class="step-counter" id="conv-ctr"></span>
      <button class="btn btn-accent btn-sm" id="conv-next" onclick="convNext()">Next →</button>
    </div>
  </div>

  <!-- EPSILON CLOSURE -->
  <h2 class="content-h2"><span class="h2-num">★</span>ε-Closure Deep Dive</h2>
  <div class="accordion">
    <div class="acc-item">
      <div class="acc-header" onclick="toggleAcc(this)">
        <span class="acc-title">How to compute ε-closure(T)</span>
        <span class="acc-chevron">▼</span>
      </div>
      <div class="acc-body"><div class="acc-inner">
        <p><strong>ε-closure(T)</strong> = all states reachable from any state in T via <em>zero or more</em> ε-transitions.</p>
        <div class="formula-block" data-label="Algorithm" style="margin-top:12px">
ε-closure(T):
  stack ← T.copy()
  result ← T.copy()
  while stack not empty:
    t ← stack.pop()
    for u in δ(t, ε):
      if u ∉ result:
        result.add(u)
        stack.push(u)
  return result</div>
        <p style="margin-top:12px"><strong>Always includes</strong> every state in T itself (zero ε-moves is allowed).</p>
      </div></div>
    </div>
    <div class="acc-item">
      <div class="acc-header" onclick="toggleAcc(this)">
        <span class="acc-title">What is the dead state ∅ in the resulting DFA?</span>
        <span class="acc-chevron">▼</span>
      </div>
      <div class="acc-body"><div class="acc-inner">
        <p>When MOVE(S, a) = ∅ (no NFA states reachable), the DFA needs a <strong>dead / trap state</strong> ∅. All transitions from ∅ return to ∅, and ∅ ∩ F = ∅, so it is non-accepting. Some textbooks omit it if completeness isn't required.</p>
      </div></div>
    </div>
    <div class="acc-item">
      <div class="acc-header" onclick="toggleAcc(this)">
        <span class="acc-title">Exponential blowup — worst case example</span>
        <span class="acc-chevron">▼</span>
      </div>
      <div class="acc-body"><div class="acc-inner">
        <p>An NFA with <strong>n states</strong> may produce a DFA with up to <strong>2ⁿ states</strong>. The classic example is the language "all binary strings whose (n−k+1)-th from-last character is 1" — its minimal DFA requires 2ⁿ states while its NFA only needs n+1 states.</p>
        <p style="margin-top:8px">In practice, only <em>reachable</em> subsets are generated, and most real examples are much smaller than the worst case.</p>
      </div></div>
    </div>
  </div>

  <div class="text-center mt-48">
    <button class="btn btn-primary" onclick="navigate('pumping')">Next: Pumping Lemma →</button>
  </div>
</div>`,

// ====================================================
// PUMPING LEMMA
// ====================================================
pumping: () => `
<div class="topic-header" style="background:linear-gradient(135deg,var(--success-bg) 0%,var(--accent-bg) 100%)">
  <div class="topic-header-inner">
    <div class="topic-header-text">
      <div class="topic-label">Module 03</div>
      <h1>The Pumping <span>Lemma</span></h1>
      <p>Prove languages are NOT regular using the pigeonhole principle. Use the interactive proof generator to see formal proofs for classic languages.</p>
    </div>
    <div class="topic-badges">
      <span class="badge badge-success">Proof Technique</span>
      <span class="badge badge-accent">Interactive</span>
    </div>
  </div>
</div>

<div class="topic-content">
  <h2 class="content-h2"><span class="h2-num">1</span>The Formal Statement</h2>
  <div class="formula-block" data-label="Pumping Lemma">
If L is regular, then ∃ pumping length p ≥ 1 such that
∀ s ∈ L with |s| ≥ p, ∃ decomposition s = xyz where:

  (1)  |y|  ≥ 1          <span class="formula-cmt">// y is non-empty (the "pumpable" part)</span>
  (2)  |xy| ≤ p          <span class="formula-cmt">// xy fits within first p characters</span>
  (3)  ∀ i ≥ 0: xy<span class="formula-hl">ⁱ</span>z ∈ L <span class="formula-cmt">// pumping y any number of times stays in L</span></div>

  <div class="callout callout-blue">
    <span class="callout-icon">💡</span>
    <div class="callout-body">
      <h4>Intuition — Pigeonhole Principle</h4>
      <p>If a DFA with p states processes a string of length ≥ p, by pigeonhole it must revisit some state. The substring processed between those two visits is the "pumpable" part y — repeating it any number of times keeps you in the same cycle, so xyⁱz stays in the language.</p>
    </div>
  </div>

  <div class="callout callout-yellow">
    <span class="callout-icon">⚠️</span>
    <div class="callout-body">
      <h4>One-way Implication</h4>
      <p>The Pumping Lemma is only a <em>necessary</em> condition. If a language satisfies the lemma, it is NOT necessarily regular — you still need to find a DFA. The lemma is used exclusively to <strong>prove non-regularity</strong> by contradiction.</p>
    </div>
  </div>

  <h2 class="content-h2"><span class="h2-num">2</span>Interactive Proof Generator</h2>
  <p class="content-p">Select a language below and get a full formal proof of non-regularity, step by step:</p>
  <div class="proof-builder">
    <div class="proof-toolbar">
      <select id="proof-lang-select" onchange="generateProof(this.value)">
        <option value="">— Choose a language —</option>
        <option value="anbn">L = { aⁿbⁿ | n ≥ 0 }</option>
        <option value="ansq">L = { aⁿ² | n ≥ 0 } (perfect square lengths)</option>
        <option value="ww">L = { ww | w ∈ {a,b}* } (self-concatenation)</option>
        <option value="palin">L = { palindromes over {a,b} }</option>
        <option value="prime">L = { aᵖ | p is prime }</option>
      </select>
      <button class="btn btn-primary btn-sm" onclick="generateProof(document.getElementById('proof-lang-select').value)">Generate Proof</button>
    </div>
    <div class="proof-output" id="proof-output">
      <p style="color:var(--text-muted);text-align:center;padding:24px 0">Select a language above to generate its formal non-regularity proof.</p>
    </div>
  </div>

  <h2 class="content-h2"><span class="h2-num">3</span>String Decomposer — Visualize the Pump</h2>
  <p class="content-p">For L = {aⁿbⁿ}, watch what happens when we "pump" the string aᵖbᵖ. Since |xy| ≤ p, y consists only of a's. Adjust y length and see pumping i=2 break the language constraint:</p>
  <div class="pump-visual">
    <div style="font-size:.85rem;color:var(--text-secondary);margin-bottom:8px">s = aᵖbᵖ decomposed as <strong>x · y · z</strong> (with |xy| ≤ p, |y| ≥ 1):</div>
    <div class="pump-string" id="pump-str"></div>
    <div class="pump-legend">
      <span><span class="dot-x"></span>x (prefix)</span>
      <span><span class="dot-y"></span>y (pumped)</span>
      <span><span class="dot-z"></span>z (suffix)</span>
    </div>
    <div class="pump-slider-row">
      <label>Length of y: <strong id="y-len">2</strong> chars</label>
      <input type="range" min="1" max="4" value="2" id="pump-slider" oninput="pumpSlider(this.value)"/>
    </div>
    <div class="pump-verdict" id="pump-verdict"></div>
    <div style="font-size:.78rem;color:var(--text-muted);margin-top:8px;font-family:var(--font-mono)" id="pump-detail"></div>
  </div>

  <h2 class="content-h2"><span class="h2-num">4</span>The 5-Step Proof Structure</h2>
  <div class="steps">
    <div class="step"><div class="step-num">1</div><div class="step-body"><h4>Assume for contradiction</h4><p>Suppose L is regular. Then by the Pumping Lemma, ∃ pumping length p ≥ 1.</p></div></div>
    <div class="step"><div class="step-num">2</div><div class="step-body"><h4>Choose your string s ∈ L, |s| ≥ p</h4><p><em>You</em> choose s carefully. The adversary will pick the decomposition xyz. Choose s to make every possible decomposition fail.</p></div></div>
    <div class="step"><div class="step-num">3</div><div class="step-body"><h4>Analyze all possible decompositions</h4><p>Given the constraints |xy| ≤ p and |y| ≥ 1, reason about what x, y, z must look like. For s = aᵖbᵖ, xy must lie entirely within the first p a's, so y = aᵏ, k ≥ 1.</p></div></div>
    <div class="step"><div class="step-num">4</div><div class="step-body"><h4>Find an i that causes xyⁱz ∉ L</h4><p>Usually i = 0 or i = 2 works. For aᵖbᵖ with y = aᵏ: pump i=0 gives aᵖ⁻ᵏbᵖ (fewer a's) → not in L.</p></div></div>
    <div class="step"><div class="step-num">5</div><div class="step-body"><h4>Conclude non-regularity</h4><p>Contradiction: the Pumping Lemma should hold for all decompositions, but we found one that fails. ∴ L is NOT regular. ∎</p></div></div>
  </div>

  <h2 class="content-h2"><span class="h2-num">5</span>Regular vs Non-Regular at a Glance</h2>
  <div class="compare-grid">
    <div class="compare-card" style="border-top:3px solid var(--success)">
      <h3 style="color:var(--success)">✅ Regular Languages</h3>
      <ul class="compare-list">
        <li>Any finite language</li>
        <li>Strings ending in "11" over {0,1}</li>
        <li>Strings containing "ab" as substring</li>
        <li>Strings with even number of 0s</li>
        <li>Strings not containing "aa"</li>
        <li>Union / concatenation / star of regular languages</li>
      </ul>
    </div>
    <div class="compare-card" style="border-top:3px solid var(--danger)">
      <h3 style="color:var(--danger)">❌ Non-Regular Languages</h3>
      <ul class="compare-list">
        <li>L = { aⁿbⁿ | n ≥ 0 }</li>
        <li>L = { aⁿ² | n ≥ 0 }</li>
        <li>L = { ww | w ∈ {a,b}* }</li>
        <li>L = { balanced parentheses }</li>
        <li>L = { palindromes over {a,b} }</li>
        <li>L = { aᵖ | p is prime }</li>
      </ul>
    </div>
  </div>

  <div class="text-center mt-48">
    <button class="btn btn-primary" onclick="navigate('practice')">Next: Practice Questions →</button>
  </div>
</div>`,

// ====================================================
// PRACTICE
// ====================================================
practice: () => `
<div class="topic-header" style="background:linear-gradient(135deg,var(--warning-bg) 0%,var(--primary-bg) 100%)">
  <div class="topic-header-inner">
    <div class="topic-header-text">
      <div class="topic-label">Module 04</div>
      <h1>Practice <span>Questions</span></h1>
      <p>Test your understanding with 20 scored MCQs across DFA, NFA, Conversion, and Pumping Lemma. Get instant explanations for each answer.</p>
    </div>
    <div class="topic-badges">
      <span class="badge badge-warning">20 Questions</span>
      <span class="badge badge-primary">Scored</span>
      <span class="badge badge-accent">Explanations</span>
    </div>
  </div>
</div>
<div class="topic-content">
  <div class="quiz-shell" id="quiz-shell">
    <div id="quiz-home">
      <div class="card card-pad-lg text-center" style="margin-bottom:20px">
        <div style="font-size:3rem;margin-bottom:12px">📝</div>
        <h2 style="font-family:var(--font-sans);font-size:1.5rem;font-weight:800;margin-bottom:10px">Ready to Test Your Knowledge?</h2>
        <p style="color:var(--text-secondary);margin-bottom:24px">${QUESTIONS.length} MCQs · Instant feedback · Detailed explanations · Track your score</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:24px" id="cat-btns">
          <button class="btn btn-outline btn-sm active-cat" onclick="setCat('all',this)">All Topics</button>
          <button class="btn btn-outline btn-sm" onclick="setCat('DFA',this)">DFA</button>
          <button class="btn btn-outline btn-sm" onclick="setCat('NFA',this)">NFA</button>
          <button class="btn btn-outline btn-sm" onclick="setCat('Conversion',this)">Conversion</button>
          <button class="btn btn-outline btn-sm" onclick="setCat('Pumping',this)">Pumping Lemma</button>
        </div>
        <button class="btn btn-primary btn-lg" onclick="startQuiz()" id="start-btn">Start Quiz →</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
        ${['DFA','NFA','Conversion','Pumping'].map(c=>`<div class="card text-center card-no-hover" style="padding:18px">
          <div style="font-size:1.6rem;font-weight:800;color:var(--primary);font-family:var(--font-sans)">${QUESTIONS.filter(q=>q.cat===c).length}</div>
          <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">${c}</div>
        </div>`).join('')}
      </div>
    </div>
    <div id="quiz-main" class="hidden"></div>
  </div>
</div>`
}; // end PAGES

// ====================================================
// AFTER-RENDER HOOKS
// ====================================================
function afterRender(page, subTab = null) {
  if (page === 'conversion') setTimeout(initConvStepper, 50);
  if (page === 'pumping')    setTimeout(() => { pumpSlider(2); }, 50);
  if (page === 'dfa-nfa') {
    setTimeout(() => {
      initCanvas();
      if (subTab) {
        const btn = document.querySelector(`.tab-btn[onclick*="${subTab}"]`);
        if (btn) btn.click();
      }
    }, 80);
  }
}

// ====================================================
// CONVERSION STEPPER DATA
// ====================================================
const CONV_STEPS = [
  {
    title: 'The original NFA',
    note: 'NFA over {a,b} accepting strings ending in "ab". States: q₀(start), q₁, q₂(accept).',
    diagram: () => svg(`${sStart(80,110)}${sState(80,110,'q₀','s')}${sState(240,110,'q₁','n')}${sState(400,110,'q₂','a')}${sLoop(80,110,'a,b')}${sArrow(108,110,212,110,'a')}${sArrow(268,110,372,110,'b')}`,520,195),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>NFA State</th><th>a</th><th>b</th></tr></thead>
      <tbody>
        <tr><td class="state-current">→ q₀</td><td>{q₀, q₁}</td><td>{q₀}</td></tr>
        <tr><td>q₁</td><td>∅</td><td>{q₂}</td></tr>
        <tr><td>q₂ ✓</td><td>∅</td><td>∅</td></tr>
      </tbody></table></div>`,
    body: 'Note: δ(q₀,a) = {q₀,q₁} — two states at once. This is the non-determinism we need to eliminate.'
  },
  {
    title: 'Step 1 — DFA start = ε-closure({q₀}) = {q₀}',
    note: 'No ε-transitions, so ε-closure({q₀}) = {q₀}. This single subset becomes our DFA start state.',
    diagram: () => svg(`${sStart(130,110)}${sState(130,110,'{q₀}','s')}`, 280, 200),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>a</th><th>b</th><th>Accept?</th></tr></thead>
      <tbody><tr><td class="state-current">→ {q₀}</td><td>?</td><td>?</td><td class="state-reject">No</td></tr></tbody>
    </table></div>`,
    body: 'We start building the DFA table. {q₀} does not contain any NFA accept state, so it is non-accepting.'
  },
  {
    title: 'Step 2 — Expand {q₀} on "a": MOVE({q₀},a) = {q₀,q₁}',
    note: 'δ_NFA(q₀, a) = {q₀, q₁}. This is a new DFA state — add it to the work list.',
    diagram: () => svg(`${sStart(80,110)}${sState(80,110,'{q₀}','s')}${sState(280,110,'{q₀,q₁}','n')}${sArrow(115,110,242,110,'a')}`,430,195),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>a</th><th>b</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td>{q₀}</td><td class="state-accept">{q₀,q₁} ←new</td><td>?</td><td class="state-reject">No</td></tr>
        <tr><td class="state-current">{q₀,q₁}</td><td>?</td><td>?</td><td class="state-reject">No</td></tr>
      </tbody></table></div>`,
    body: 'δ_NFA(q₀,a) = {q₀,q₁}. ε-closure({q₀,q₁}) = {q₀,q₁}. No NFA accept state in this subset → non-accepting.'
  },
  {
    title: 'Step 3 — Expand {q₀} on "b" and {q₀,q₁} on both symbols',
    note: 'δ(q₀,b)={q₀}. δ({q₀,q₁},a)=δ(q₀,a)∪δ(q₁,a)={q₀,q₁}∪∅={q₀,q₁}. δ({q₀,q₁},b)={q₀}∪{q₂}={q₀,q₂} — NEW! Contains q₂∈F_NFA → accept!',
    diagram: () => svg(`${sStart(70,120)}${sState(70,120,'{q₀}','s')}${sState(250,60,'{q₀q₁}','n')}${sState(250,180,'{q₀q₂}','a')}${sArrow(99,107,220,72,'a')}${sArrow(91,132,220,167,'b')}${sLoop(250,60,'a')}${sArrow(250,88,250,152,'b')}`,430,265),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>a</th><th>b</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td>{q₀}</td><td>{q₀,q₁}</td><td>{q₀}</td><td class="state-reject">No</td></tr>
        <tr><td>{q₀,q₁}</td><td>{q₀,q₁}</td><td class="state-accept">{q₀,q₂} ←new</td><td class="state-reject">No</td></tr>
        <tr><td class="state-current">{q₀,q₂}</td><td>?</td><td>?</td><td class="state-accept">✓ Accept</td></tr>
      </tbody></table></div>`,
    body: '{q₀,q₂} is new AND contains q₂ ∈ F_NFA → it becomes a DFA accept state!'
  },
  {
    title: 'Step 4 — Expand {q₀,q₂}: no new states → DONE!',
    note: 'δ({q₀,q₂},a)=δ(q₀,a)∪δ(q₂,a)={q₀,q₁}∪∅={q₀,q₁}. δ({q₀,q₂},b)=δ(q₀,b)∪δ(q₂,b)={q₀}∪∅={q₀}. Both are already known states. Construction complete!',
    diagram: () => svg(`${sStart(65,130)}${sState(65,130,'{q₀}','s')}${sState(240,60,'{q₀q₁}','n')}${sState(240,200,'{q₀q₂}','a')}${sArrow(93,117,210,74,'a')}${sArrow(83,143,210,187,'b')}${sLoop(240,60,'a')}${sArrow(240,88,240,172,'b')}${sArrow(212,195,83,143,'b')}${sArrow(210,183,82,132,'a')}`,420,280),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>a</th><th>b</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td class="state-current">→ {q₀}</td><td>{q₀,q₁}</td><td>{q₀}</td><td class="state-reject">No</td></tr>
        <tr><td>{q₀,q₁}</td><td>{q₀,q₁}</td><td>{q₀,q₂}</td><td class="state-reject">No</td></tr>
        <tr><td>{q₀,q₂} ✓</td><td>{q₀,q₁}</td><td>{q₀}</td><td class="state-accept">Yes ✓</td></tr>
      </tbody></table></div>`,
    body: '🎉 Final DFA has 3 states — same as the NFA! (Lucky coincidence; worst case would be 2³ = 8.) It accepts exactly the same language: strings over {a,b} ending in "ab".'
  }
];

function initConvStepper() {
  convStep = 0;
  renderConvStep();
}

function renderConvStep() {
  const s = CONV_STEPS[convStep], total = CONV_STEPS.length;
  const dots = document.getElementById('conv-dots');
  if (dots) dots.innerHTML = CONV_STEPS.map((_,i) =>
    `<div class="step-dot ${i < convStep ? 'done' : i === convStep ? 'active' : ''}"></div>`).join('');

  const body = document.getElementById('conv-body');
  if (body) {
    body.innerHTML = `
      <span class="badge badge-accent" style="margin-bottom:14px;display:inline-block">${s.title}</span>
      <div class="diagram-wrap">${s.diagram()}</div>
      ${s.table}
      <div class="callout callout-blue" style="margin-top:16px">
        <span class="callout-icon">📌</span>
        <div class="callout-body"><p>${s.body}</p></div>
      </div>
      <p style="font-size:.8rem;color:var(--text-muted);margin-top:10px;font-style:italic">${s.note}</p>`;
    body.style.animation = 'none';
    requestAnimationFrame(() => { body.style.animation = 'fadeIn .3s ease'; });
  }

  const ctr = document.getElementById('conv-ctr');
  if (ctr) ctr.textContent = `Step ${convStep + 1} / ${total}`;

  const prev = document.getElementById('conv-prev');
  const next = document.getElementById('conv-next');
  if (prev) prev.disabled = convStep === 0;
  if (next) { next.textContent = convStep === total - 1 ? '✓ Done' : 'Next →'; next.disabled = convStep === total - 1; }
}

window.convNext = () => { if (convStep < CONV_STEPS.length - 1) { convStep++; renderConvStep(); } };
window.convPrev = () => { if (convStep > 0) { convStep--; renderConvStep(); } };

// ====================================================
// PUMPING LEMMA PROOF GENERATOR
// ====================================================
const PROOFS = {
  anbn: {
    lang: 'L = { aⁿbⁿ | n ≥ 0 }',
    steps: [
      { h: 'Assume L is regular', p: 'For contradiction, assume L is regular. Then by the Pumping Lemma, ∃ pumping length p ≥ 1 such that every string in L of length ≥ p can be pumped.' },
      { h: 'Choose the string', p: 'Let s = aᵖbᵖ ∈ L. Then |s| = 2p ≥ p ✓.' },
      { h: 'Analyze all decompositions s = xyz', p: 'Since |xy| ≤ p and s starts with p a\'s, both x and y must consist entirely of a\'s. So x = aʲ and y = aᵏ for some j ≥ 0, k ≥ 1, and z = aᵖ⁻ʲ⁻ᵏbᵖ.' },
      { h: 'Pump with i = 0: xy⁰z = xz', p: 'xz = aʲ · aᵖ⁻ʲ⁻ᵏ · bᵖ = aᵖ⁻ᵏbᵖ. Since k ≥ 1, this has fewer a\'s than b\'s (p−k < p), so xz ∉ L.' },
      { h: 'Contradiction → L is not regular ∎', p: 'The Pumping Lemma guarantees xy⁰z ∈ L for all valid decompositions, but we found xy⁰z ∉ L. Contradiction! Therefore L = {aⁿbⁿ | n ≥ 0} is NOT regular.' }
    ]
  },
  ansq: {
    lang: 'L = { aⁿ² | n ≥ 0 }',
    steps: [
      { h: 'Assume L is regular', p: 'Assume L is regular with pumping length p.' },
      { h: 'Choose s = aᵖ²', p: '|s| = p² ≥ p ✓. s ∈ L since p² is a perfect square.' },
      { h: 'Analyze decompositions', p: 'y = aᵏ for 1 ≤ k ≤ p. Then xyⁱz has length p² + (i−1)k.' },
      { h: 'Pump with i = 2: |xy²z| = p² + k', p: 'We need p² + k to be a perfect square. But p² < p² + k ≤ p² + p < (p+1)² = p²+2p+1. No perfect square lies strictly between p² and (p+1)². So xy²z ∉ L.' },
      { h: 'Contradiction → L is not regular ∎', p: 'Pumping breaks the perfect-square property. Therefore L = {aⁿ² | n ≥ 0} is NOT regular.' }
    ]
  },
  ww: {
    lang: 'L = { ww | w ∈ {a,b}* }',
    steps: [
      { h: 'Assume L is regular', p: 'Assume L is regular with pumping length p.' },
      { h: 'Choose s = aᵖbaᵖb', p: 's = ww where w = aᵖb. |s| = 2p+2 ≥ p ✓.' },
      { h: 'Analyze decompositions', p: 'Since |xy| ≤ p, x and y lie in the first p a\'s. So y = aᵏ, k ≥ 1.' },
      { h: 'Pump with i = 2: xy²z = aᵖ⁺ᵏbaᵖb', p: 'Length = 2p+k+2. For this to equal ww, both halves must match. The first half would need length p+k+1, giving w = aᵖ⁺ᵏb, but then ww = aᵖ⁺ᵏbaᵖ⁺ᵏb ≠ aᵖ⁺ᵏbaᵖb. So xy²z ∉ L.' },
      { h: 'Contradiction → L is not regular ∎', p: 'Pumping breaks the self-concatenation structure. Therefore L = {ww | w ∈ {a,b}*} is NOT regular.' }
    ]
  },
  palin: {
    lang: 'L = { palindromes over {a,b} }',
    steps: [
      { h: 'Assume L is regular', p: 'Assume L is regular with pumping length p.' },
      { h: 'Choose s = aᵖbaᵖ', p: 's is a palindrome (same forwards and backwards), s ∈ L. |s| = 2p+1 ≥ p ✓.' },
      { h: 'Analyze decompositions', p: 'Since |xy| ≤ p, both x and y lie in the first p a\'s. So y = aᵏ, k ≥ 1.' },
      { h: 'Pump with i = 2: xy²z = aᵖ⁺ᵏbaᵖ', p: 'This string has p+k a\'s on the left and p a\'s on the right of b. Since k ≥ 1, it is NOT a palindrome → ∉ L.' },
      { h: 'Contradiction → L is not regular ∎', p: 'Pumping destroys the palindrome symmetry. Therefore the set of palindromes over {a,b} is NOT regular.' }
    ]
  },
  prime: {
    lang: 'L = { aᵖ | p is prime }',
    steps: [
      { h: 'Assume L is regular', p: 'Assume L is regular with pumping length n (using n to avoid confusion with prime p).' },
      { h: 'Choose s = aᵖ where p is prime and p > n', p: '|s| = p ≥ n ✓. s ∈ L since p is prime.' },
      { h: 'Any decomposition y = aᵏ, 1 ≤ k ≤ n', p: 'By the Pumping Lemma, |y| ≥ 1 and |xy| ≤ n, so y = aᵏ for some k ≥ 1.' },
      { h: 'Pump with i = p: xyᵖz has length p + (p−1)k = p(1+k) − k', p: 'Actually: |xyᵖz| = (p−k) + pk + ... Simpler: |xyⁱz| = p + (i−1)k. Choose i = p+1: |xy^{p+1}z| = p + pk = p(1+k). This is composite (product of two integers > 1: p and 1+k ≥ 2). So xy^{p+1}z ∉ L.' },
      { h: 'Contradiction → L is not regular ∎', p: 'Pumping produces a string of composite length. Therefore L = {aᵖ | p prime} is NOT regular.' }
    ]
  }
};

window.generateProof = function(key) {
  const out = document.getElementById('proof-output');
  if (!key || !PROOFS[key]) {
    out.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px">Select a language above to generate its formal non-regularity proof.</p>';
    return;
  }
  const proof = PROOFS[key];
  out.innerHTML = `
    <div class="callout callout-blue" style="margin-bottom:20px">
      <span class="callout-icon">📋</span>
      <div class="callout-body"><h4>Proving</h4><p style="font-family:var(--font-mono);font-size:1rem;font-weight:700;color:var(--primary)">${proof.lang}</p><p style="margin-top:4px">is NOT a regular language.</p></div>
    </div>
    ${proof.steps.map((s,i) => `<div class="proof-step">
      <div class="proof-step-num">${i+1}</div>
      <div class="proof-step-body"><h4>${s.h}</h4><p>${s.p}</p></div>
    </div>`).join('')}
  `;
};

window.pumpSlider = function(yLen) {
  yLen = parseInt(yLen);
  const yLenEl = document.getElementById('y-len');
  if (yLenEl) yLenEl.textContent = yLen;
  const slider = document.getElementById('pump-slider');
  if (slider) slider.value = yLen;

  const p = 5;
  const xLen = 1;
  const x = 'a'.repeat(xLen);
  const y = 'a'.repeat(yLen);
  const z = 'a'.repeat(p - xLen - yLen) + 'b'.repeat(p);
  const pumped = x + y + y + z;
  const aCount = pumped.split('').filter(c => c === 'a').length;
  const bCount = pumped.split('').filter(c => c === 'b').length;

  const strEl = document.getElementById('pump-str');
  if (strEl) strEl.innerHTML =
    `<span class="pump-x">${x}</span>` +
    `<span class="pump-y">${y}</span>` +
    `<span class="pump-z">${z}</span>`;

  const verdict = document.getElementById('pump-verdict');
  const detail = document.getElementById('pump-detail');
  const ok = aCount === bCount;
  if (verdict) {
    verdict.className = 'pump-verdict ' + (ok ? 'valid' : 'invalid');
    verdict.textContent = ok
      ? `xy²z = "${pumped}" → ${aCount} a's, ${bCount} b's → still in L (try a different y!)`
      : `xy²z = "${pumped}" → ${aCount} a's ≠ ${bCount} b's → NOT in L ✗ Pumping Fails!`;
  }
  if (detail) detail.textContent = `x="${x}"  y="${y}"  z="${z}" | xy²z="${pumped}" | |xy|=${xLen+yLen}≤${p}✓ |y|=${yLen}≥1✓`;
};

// ====================================================
// QUIZ ENGINE
// ====================================================
const QUESTIONS = [
  { cat:'DFA', q:'The DFA transition function δ maps:', opts:['Q × Σ → Q','Q × Σ → 𝒫(Q)','Q × (Σ∪{ε}) → Q','Σ × Q → Q'], ans:0, exp:'DFA δ: Q × Σ → Q — exactly one next state. NFA uses 𝒫(Q) (power set).' },
  { cat:'DFA', q:'Which string is accepted by the DFA that accepts all {0,1}-strings ending in "11"?', opts:['0110','10111','101','11010'], ans:1, exp:'"10111" ends in "11" → accepted. Others end in "10","01","10" respectively.' },
  { cat:'DFA', q:'Minimum states for DFA accepting all non-empty strings over {a}:', opts:['1','2','3','n'], ans:1, exp:'2 states: q₀ (start, reject) → q₁ (accept, self-loop on a). δ(q₀,a)=q₁, δ(q₁,a)=q₁.' },
  { cat:'DFA', q:'L = {w ∈ {a,b}* | w starts with "ab"} — minimal DFA state count:', opts:['2','3','4','5'], ans:2, exp:'States: q₀(start), q₁(seen a), q₂(seen ab — accept), qd(dead). Total = 4.' },
  { cat:'DFA', q:'A DFA is "complete" when:', opts:['F = Q','δ is defined for every (state,symbol) pair','It has no dead states','|Q| = |Σ|'], ans:1, exp:'A complete DFA has δ total — defined for every (q,a) ∈ Q×Σ. Incomplete DFAs may leave some transitions undefined.' },
  { cat:'NFA', q:'The key difference between NFA and DFA transition functions:', opts:['NFA returns a SET of states; DFA returns exactly one state','NFA uses only ε-transitions','DFA can return ∅; NFA cannot','They are identical'], ans:0, exp:'NFA: δ: Q×(Σ∪{ε})→𝒫(Q) returns a subset. DFA: δ: Q×Σ→Q returns exactly one state.' },
  { cat:'NFA', q:'An NFA accepts string w if:', opts:['ALL paths end in an accept state','AT LEAST ONE path ends in an accept state','The DFA equivalent accepts w','The last character leads to F'], ans:1, exp:'NFA acceptance is existential — at least one of the parallel computation paths must reach an accept state.' },
  { cat:'NFA', q:'ε-closure({q}) always includes:', opts:['Only states reachable by exactly one ε-transition','All states reachable by ε-transitions, including q itself','The entire state set Q','Only states with outgoing ε-transitions'], ans:1, exp:'ε-closure includes q itself (zero ε-transitions is valid) plus all states reachable via ε-arrows.' },
  { cat:'NFA', q:'An NFA with n states may produce a DFA with at most how many states?', opts:['n','n²','2ⁿ','n!'], ans:2, exp:'Subset Construction can produce 2ⁿ DFA states (one per subset of Q). In practice usually much fewer.' },
  { cat:'NFA', q:'Which of the following allows ε-transitions?', opts:['DFA only','NFA only','Both DFA and NFA','Neither'], ans:1, exp:'Only NFAs allow ε-transitions (moves without consuming input). DFAs must consume one symbol per transition.' },
  { cat:'Conversion', q:'In Subset Construction, a DFA state (subset S) is an accept state when:', opts:['S = F_NFA','S contains ALL NFA accept states','S ∩ F_NFA ≠ ∅','S is the start subset'], ans:2, exp:'Any subset containing at least one NFA accept state becomes a DFA accept state. This mirrors NFA\'s existential acceptance.' },
  { cat:'Conversion', q:'The empty set ∅ in the DFA after Subset Construction is:', opts:['An accept state','A non-accepting trap state','Merged with start state','Always absent'], ans:1, exp:'∅ is a dead/trap state. ∅∩F=∅ (non-accepting). For any symbol a, MOVE(∅,a)=∅ (self-loop). It traps computation.' },
  { cat:'Conversion', q:'NFA has 3 states, alphabet {a}. δ(q₀,a)={q₁}, δ(q₁,a)={q₂}, δ(q₂,a)=∅, accept={q₂}. Reachable DFA states:', opts:['3','4','5','8'], ans:1, exp:'Reachable subsets: {q₀}(start), {q₁}(on a), {q₂}(on a, accept!), ∅(on a from q₂). Total = 4.' },
  { cat:'Conversion', q:'Which theorem guarantees NFA→DFA equivalence?', opts:['Pumping Lemma','Rabin-Scott (Subset Construction)','Myhill-Nerode Theorem','Rice\'s Theorem'], ans:1, exp:'Rabin-Scott (1959) constructively proves equivalence via Subset/Powerset Construction.' },
  { cat:'Conversion', q:'NFA has 4 states. Maximum DFA states via Subset Construction:', opts:['4','8','12','16'], ans:3, exp:'2⁴ = 16 — one state per subset of {q₀,q₁,q₂,q₃}. Worst-case exponential blowup.' },
  { cat:'Pumping', q:'Pumping Lemma conditions for s = xyz: which is CORRECT?', opts:['|y|≥1, |xy|≤p, ∀i≥0: xyⁱz∈L','|x|≥1, |xy|≤p, ∀i≥1: xyⁱz∈L','|y|≥1, |yz|≤p, ∀i≥0: xyⁱz∈L','|y|≥0, |xy|≤p, ∀i≥1: xyⁱz∈L'], ans:0, exp:'Three conditions: (1)|y|≥1 (non-empty), (2)|xy|≤p (within first p chars), (3)∀i≥0 xyⁱz∈L (i=0 means xy⁰z=xz also in L).' },
  { cat:'Pumping', q:'To prove L={aⁿbⁿ} non-regular, we choose s =', opts:['aᵖ','aᵖbᵖ','aᵖ⁺¹bᵖ','aᵖ⁻¹bᵖ⁻¹'], ans:1, exp:'s=aᵖbᵖ ∈ L with |s|=2p≥p. Forces |xy|≤p → y consists only of a\'s → pumping breaks balance.' },
  { cat:'Pumping', q:'The Pumping Lemma is used to:', opts:['Prove a language IS regular','Prove a language is NOT regular','Convert NFA to DFA','Minimize a DFA'], ans:1, exp:'Pumping Lemma is a proof by contradiction tool for non-regularity only. It cannot prove regularity.' },
  { cat:'Pumping', q:'For s=aᵖbᵖ in the {aⁿbⁿ} proof, why must y consist only of a\'s?', opts:['b\'s are not in the alphabet','|xy|≤p forces xy within first p characters (all a\'s)','y must be a single character','The pumping length equals p a\'s'], ans:1, exp:'Since s=aᵖbᵖ starts with p a\'s, and |xy|≤p, both x and y are confined to those first p characters — all a\'s.' },
  { cat:'Pumping', q:'Pumping s=aᵖbᵖ with y=aᵏ (k≥1), what is xy⁰z?', opts:['aᵖbᵖ','aᵖ⁺ᵏbᵖ','aᵖ⁻ᵏbᵖ','aᵖbᵖ⁺ᵏ'], ans:2, exp:'xy⁰z = xz. Since s=aʲ·aᵏ·aᵖ⁻ʲ⁻ᵏbᵖ, xz=aᵖ⁻ᵏbᵖ. k≥1 means fewer a\'s than b\'s → ∉ L.' }
];

window.setCat = function(cat, btn) {
  quizState.cat = cat;
  document.querySelectorAll('#cat-btns .btn').forEach(b => b.classList.remove('active-cat'));
  btn.classList.add('active-cat');
  const pool = cat === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.cat === cat);
  const sb = document.getElementById('start-btn');
  if (sb) sb.textContent = `Start Quiz (${pool.length} Questions) →`;
};

window.startQuiz = function() {
  const pool = quizState.cat === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.cat === quizState.cat);
  quizState.qs = [...pool].sort(() => Math.random() - 0.5);
  quizState.cur = 0; quizState.score = 0; quizState.answers = [];
  document.getElementById('quiz-home').classList.add('hidden');
  document.getElementById('quiz-main').classList.remove('hidden');
  renderQ();
};

function renderQ() {
  const { qs, cur, score } = quizState;
  const total = qs.length, q = qs[cur];
  const pct = (cur / total) * 100;
  const catBadge = { DFA:'badge-primary', NFA:'badge-accent', Conversion:'badge-warning', Pumping:'badge-success' }[q.cat] || 'badge-neutral';

  document.getElementById('quiz-main').innerHTML = `
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="quiz-meta">
      <span class="quiz-counter">Question ${cur+1} of ${total}</span>
      <span class="badge ${catBadge}">${q.cat}</span>
      <span class="quiz-live-score">Score: ${score}/${cur}</span>
    </div>
    <div class="q-card">
      <p class="q-text">${q.q}</p>
      <div class="options">
        ${q.opts.map((o,i) => `<button class="opt-btn" id="opt${i}" onclick="pickAns(${i})">
          <span class="opt-letter">${String.fromCharCode(65+i)}</span>
          <span>${o}</span>
        </button>`).join('')}
      </div>
      <div class="exp-box" id="exp"><h5>💡 Explanation</h5><p>${q.exp}</p></div>
    </div>
    <div id="next-row" class="hidden" style="text-align:right;margin-top:16px">
      ${cur < total - 1
        ? `<button class="btn btn-primary" onclick="nextQ()">Next Question →</button>`
        : `<button class="btn btn-accent" onclick="showResults()">See Results →</button>`}
    </div>`;
}

window.pickAns = function(chosen) {
  const q = quizState.qs[quizState.cur];
  quizState.answers.push({ chosen, correct: chosen === q.ans });
  if (chosen === q.ans) quizState.score++;
  document.querySelectorAll('.opt-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === q.ans) b.classList.add('correct');
    else if (i === chosen && chosen !== q.ans) b.classList.add('wrong');
  });
  document.getElementById('exp').classList.add('show');
  document.getElementById('next-row').classList.remove('hidden');
};

window.nextQ = function() { quizState.cur++; renderQ(); };

window.showResults = function() {
  const { score, qs } = quizState;
  const total = qs.length;
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? '🏆 Excellent!' : pct >= 70 ? '🎯 Great Work!' : pct >= 50 ? '📚 Keep Practicing' : '💪 More Study Needed';
  const col = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const conic = `conic-gradient(${col} ${pct*3.6}deg, #e2e8f0 0deg)`;

  if (pct > (progress.quizBest || 0)) {
    progress.quizBest = pct;
    localStorage.setItem('al2_progress', JSON.stringify(progress));
  }

  document.getElementById('quiz-main').innerHTML = `
    <div class="text-center" style="padding:40px 0">
      <div class="results-ring" style="background:${conic}">
        <div class="results-score-val" style="color:${col}">${score}/${total}</div>
      </div>
      <div style="font-size:1.4rem;font-weight:800;margin-bottom:8px;color:${col}">${grade}</div>
      <p style="color:var(--text-secondary);margin-bottom:28px">${pct}% accuracy · ${score} correct out of ${total}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:28px;max-width:500px;margin-left:auto;margin-right:auto">
        ${['DFA','NFA','Conversion','Pumping'].map(cat => {
          const catQs = qs.filter(q => q.cat === cat);
          const catRight = catQs.filter((q,_) => {
            const idx = qs.indexOf(q);
            return quizState.answers[idx] && quizState.answers[idx].correct;
          }).length;
          if (!catQs.length) return '';
          return `<div class="card text-center card-no-hover" style="padding:14px">
            <div style="font-size:1.2rem;font-weight:700;font-family:var(--font-sans);color:var(--primary)">${catRight}/${catQs.length}</div>
            <div style="font-size:.72rem;color:var(--text-muted)">${cat}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-lg" onclick="retryQuiz()">Try Again</button>
        <button class="btn btn-ghost btn-lg" onclick="reviewAnswers()">Review Answers</button>
        <button class="btn btn-ghost btn-lg" onclick="navigate('home')">Home</button>
      </div>
    </div>`;
};

window.retryQuiz = function() {
  document.getElementById('quiz-main').classList.add('hidden');
  document.getElementById('quiz-home').classList.remove('hidden');
};

window.reviewAnswers = function() {
  const { qs, answers } = quizState;
  document.getElementById('quiz-main').innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <h3 style="font-size:1.1rem;font-weight:700">Answer Review</h3>
      <button class="btn btn-ghost btn-sm" onclick="showResults()">← Back to Results</button>
    </div>
    ${qs.map((q,i) => {
      const a = answers[i], ok = a && a.correct;
      return `<div class="card" style="margin-bottom:12px;border-left:3px solid ${ok?'var(--success)':'var(--danger)'}">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
          <span class="badge badge-neutral">${q.cat}</span>
          <span style="font-size:.82rem;font-weight:600;color:${ok?'var(--success)':'var(--danger)'}">${ok?'✓ Correct':'✗ Incorrect'}</span>
        </div>
        <p style="font-size:.9rem;font-weight:600;color:var(--text-primary);margin-bottom:8px">${q.q}</p>
        <p style="font-size:.82rem;color:var(--text-muted)">Your answer: <strong style="color:${ok?'var(--success)':'var(--danger)'}">${a?q.opts[a.chosen]:'—'}</strong></p>
        ${!ok?`<p style="font-size:.82rem;color:var(--text-muted)">Correct: <strong style="color:var(--success)">${q.opts[q.ans]}</strong></p>`:''}
        <div class="exp-box show" style="margin-top:10px"><h5>💡 Explanation</h5><p>${q.exp}</p></div>
      </div>`;
    }).join('')}
    <div class="text-center mt-24"><button class="btn btn-primary" onclick="retryQuiz()">Try Again</button></div>`;
};

// ====================================================
// CANVAS BUILDER
// ====================================================
function initCanvas() {
  cvStates = []; cvTransitions = []; cvStart = null; cvSelected = null;
  cvMode = 'move'; cvTransFrom = null; cvDragging = null; cvStateId = 0;
  cvSimStep = -1; cvSimTrace = [];

  const canvas = document.getElementById('automata-canvas');
  if (!canvas) return;
  renderCanvas();
  canvas.addEventListener('click', canvasClick);
  canvas.addEventListener('mousedown', canvasMouseDown);
  canvas.addEventListener('mousemove', canvasMouseMove);
  canvas.addEventListener('mouseup', canvasMouseUp);
  canvas.addEventListener('dblclick', canvasDblClick);
}

window.setMode = function(mode, btn) {
  cvMode = mode; cvTransFrom = null; cvSelected = null;
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const hints = {
    move: '↖ Move mode — drag states to reposition',
    addState: '+ State mode — click on blank canvas to add a state',
    setStart: '▶ Set Start — click a state to make it the start',
    toggleAccept: '◉ Accept — click a state to toggle accept/non-accept',
    addTrans: '→ Transition — click FROM state, then TO state, then enter symbol(s)',
    delete: '🗑 Delete — click a state or transition label to remove it'
  };
  const hint = document.getElementById('mode-hint');
  if (hint) hint.textContent = hints[mode] || '';
  renderCanvas();
};

window.resetCanvas = function() {
  cvStates = []; cvTransitions = []; cvStart = null; cvSelected = null;
  cvTransFrom = null; cvStateId = 0; cvSimStep = -1; cvSimTrace = [];
  setMode('move', document.getElementById('tool-move'));
  renderCanvas();
  const sr = document.getElementById('sim-result');
  if (sr) { sr.className = 'sim-result idle'; sr.textContent = 'No simulation'; }
  const st = document.getElementById('sim-trace');
  if (st) st.textContent = '';
};

window.loadPreset = function(name) {
  resetCanvas();
  if (name === 'even0') {
    cvStates = [
      { id: 0, x: 120, y: 170, isAccept: true, label: 'q₀' },
      { id: 1, x: 320, y: 170, isAccept: false, label: 'q₁' }
    ];
    cvTransitions = [
      { from: 0, to: 1, symbol: '0' },
      { from: 1, to: 0, symbol: '0' },
      { from: 0, to: 0, symbol: '1' },
      { from: 1, to: 1, symbol: '1' }
    ];
    cvStart = 0; cvStateId = 2;
    renderCanvas();
    const hint = document.getElementById('mode-hint');
    if (hint) hint.textContent = 'Preset loaded: DFA accepting strings with even number of 0s — try simulating "1001"';
  }
};

function getSVGPoint(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
}

function getStateAt(x, y) {
  const R = 28;
  return cvStates.find(s => Math.hypot(s.x - x, s.y - y) <= R);
}

function canvasClick(e) {
  const canvas = document.getElementById('automata-canvas');
  if (!canvas) return;
  const pt = getSVGPoint(canvas, e);
  const hit = getStateAt(pt.x, pt.y);

  if (cvMode === 'addState' && !hit) {
    cvStates.push({ id: cvStateId, x: pt.x, y: pt.y, isAccept: false, label: `q${cvStateId}` });
    if (cvStates.length === 1) cvStart = cvStateId;
    cvStateId++;
    renderCanvas();
  } else if (cvMode === 'setStart' && hit) {
    cvStart = hit.id;
    renderCanvas();
  } else if (cvMode === 'toggleAccept' && hit) {
    hit.isAccept = !hit.isAccept;
    renderCanvas();
  } else if (cvMode === 'addTrans') {
    if (hit) {
      if (cvTransFrom === null) {
        cvTransFrom = hit.id;
        cvSelected = hit.id;
        renderCanvas();
      } else {
        const sym = prompt(`Transition symbol(s) from ${cvStates.find(s=>s.id===cvTransFrom).label} to ${hit.label}\n(separate multiple with comma, e.g. 0,1):`);
        if (sym && sym.trim()) {
          sym.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
            cvTransitions.push({ from: cvTransFrom, to: hit.id, symbol: s });
          });
        }
        cvTransFrom = null; cvSelected = null;
        renderCanvas();
      }
    }
  } else if (cvMode === 'select' || cvMode === 'move') {
    cvSelected = hit ? hit.id : null;
    renderCanvas();
  } else if (cvMode === 'delete' && hit) {
    cvTransitions = cvTransitions.filter(t => t.from !== hit.id && t.to !== hit.id);
    cvStates = cvStates.filter(s => s.id !== hit.id);
    if (cvStart === hit.id) cvStart = cvStates.length ? cvStates[0].id : null;
    if (cvSelected === hit.id) cvSelected = null;
    renderCanvas();
  }
}

function canvasDblClick(e) {
  const canvas = document.getElementById('automata-canvas');
  if (!canvas || cvMode !== 'move') return;
  const pt = getSVGPoint(canvas, e);
  const hit = getStateAt(pt.x, pt.y);
  if (hit) { hit.isAccept = !hit.isAccept; renderCanvas(); }
}

function canvasMouseDown(e) {
  if (cvMode !== 'move') return;
  const canvas = document.getElementById('automata-canvas');
  if (!canvas) return;
  const pt = getSVGPoint(canvas, e);
  const hit = getStateAt(pt.x, pt.y);
  if (hit) {
    cvDragging = hit.id;
    cvDragOff = { x: pt.x - hit.x, y: pt.y - hit.y };
    canvas.style.cursor = 'grabbing';
  }
}

function canvasMouseMove(e) {
  if (cvDragging === null) return;
  const canvas = document.getElementById('automata-canvas');
  if (!canvas) return;
  const pt = getSVGPoint(canvas, e);
  const s = cvStates.find(s => s.id === cvDragging);
  if (s) { s.x = pt.x - cvDragOff.x; s.y = pt.y - cvDragOff.y; renderCanvas(); }
}

function canvasMouseUp(e) {
  cvDragging = null;
  const canvas = document.getElementById('automata-canvas');
  if (canvas) canvas.style.cursor = cvMode === 'addState' ? 'crosshair' : 'default';
}

function renderCanvas() {
  const canvas = document.getElementById('automata-canvas');
  if (!canvas) return;
  const W = canvas.clientWidth || 700, H = 340;
  canvas.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Group transitions by (from,to) pair to merge labels
  const edgeMap = {};
  cvTransitions.forEach(t => {
    const key = `${t.from}-${t.to}`;
    if (!edgeMap[key]) edgeMap[key] = { from: t.from, to: t.to, symbols: [] };
    edgeMap[key].symbols.push(t.symbol);
  });

  let html = `<defs>
    <marker id="cv-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#94a3b8"/>
    </marker>
    <marker id="cv-arr-s" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0,8 3,0 6" fill="#059669"/>
    </marker>
  </defs>`;

  if (!cvStates.length) {
    html += `<text x="${W/2}" y="${H/2-10}" text-anchor="middle" fill="#94a3b8" font-family="Inter,sans-serif" font-size="14">
      Click "+ State" then click here to add states
    </text>
    <text x="${W/2}" y="${H/2+14}" text-anchor="middle" fill="#94a3b8" font-family="Inter,sans-serif" font-size="12">
      Use the toolbar above to build your automaton
    </text>`;
    canvas.innerHTML = html;
    return;
  }

  // Draw transitions
  Object.values(edgeMap).forEach(edge => {
    const from = cvStates.find(s => s.id === edge.from);
    const to   = cvStates.find(s => s.id === edge.to);
    if (!from || !to) return;
    const lbl = edge.symbols.join(',');
    const R = 28;

    if (from.id === to.id) {
      // Self-loop
      const lx = from.x, ly = from.y - R - 28;
      html += `<path d="M${from.x-16},${from.y-R} C${from.x-44},${from.y-R-60} ${from.x+44},${from.y-R-60} ${from.x+16},${from.y-R}" stroke="#94a3b8" stroke-width="1.8" fill="none" marker-end="url(#cv-arr)"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" fill="#0ea5e9" font-family="JetBrains Mono,monospace" font-size="12">${lbl}</text>`;
    } else {
      // Check if reverse edge exists for curve
      const revKey = `${edge.to}-${edge.from}`;
      const curved = !!edgeMap[revKey];
      const dx = to.x - from.x, dy = to.y - from.y;
      const dist = Math.hypot(dx, dy);
      const ux = dx / dist, uy = dy / dist;
      // offset perpendicular for curved edges
      const ox = curved ? -uy * 28 : 0, oy = curved ? ux * 28 : 0;
      const x1 = from.x + ux * R + ox, y1 = from.y + uy * R + oy;
      const x2 = to.x - ux * R + ox, y2 = to.y - uy * R + oy;

      let pathD, lx, ly;
      if (curved) {
        const mx = (x1+x2)/2 + ox*0.8, my = (y1+y2)/2 + oy*0.8;
        pathD = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
        lx = mx; ly = my - 10;
      } else {
        pathD = `M${x1},${y1} L${x2},${y2}`;
        lx = (x1+x2)/2 - uy*14; ly = (y1+y2)/2 + ux*14;
      }
      html += `<path d="${pathD}" stroke="#94a3b8" stroke-width="1.8" fill="none" marker-end="url(#cv-arr)"/>
      <text x="${lx}" y="${ly}" text-anchor="middle" fill="#0ea5e9" font-family="JetBrains Mono,monospace" font-size="12">${lbl}</text>`;
    }
  });

  // Draw states
  cvStates.forEach(s => {
    const R = 28;
    const isStart = s.id === cvStart;
    const isSel   = s.id === cvSelected || s.id === cvTransFrom;
    const isHighl = cvSimStep >= 0 && cvSimTrace.length > 0 && cvSimTrace[cvSimStep] && cvSimTrace[cvSimStep].id === s.id;

    const strokeCol = isHighl ? '#d97706' : isSel ? '#0ea5e9' : isStart ? '#059669' : '#4f46e5';
    const fillCol   = isHighl ? '#fef3c7' : isSel ? '#f0f9ff' : '#ffffff';
    const strokeW   = isHighl ? 3 : isSel ? 2.5 : 2;

    if (isStart) {
      html += `<line x1="${s.x-60}" y1="${s.y}" x2="${s.x-R-4}" y2="${s.y}" stroke="#059669" stroke-width="1.8" marker-end="url(#cv-arr-s)"/>
      <text x="${s.x-62}" y="${s.y-7}" text-anchor="end" fill="#059669" font-family="JetBrains Mono,monospace" font-size="10">start</text>`;
    }

    html += `<circle cx="${s.x}" cy="${s.y}" r="${R}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${strokeW}"/>`;
    if (s.isAccept) html += `<circle cx="${s.x}" cy="${s.y}" r="${R-5}" fill="none" stroke="${strokeCol}" stroke-width="1.5" opacity=".7"/>`;
    html += `<text x="${s.x}" y="${s.y}" text-anchor="middle" dominant-baseline="central" fill="#0f172a" font-family="JetBrains Mono,monospace" font-size="12" font-weight="600">${s.label}</text>`;
  });

  canvas.innerHTML = html;
}

// ===== SIMULATION =====
window.runSimulation = function() {
  const input = document.getElementById('sim-input');
  if (!input) return;
  const str = input.value;
  cvSimTrace = buildSimTrace(str);
  cvSimStep = -1;
  renderSimResult(str);
};

function buildSimTrace(str) {
  if (!cvStates.length || cvStart === null) return [];
  const trace = [];
  let cur = cvStates.find(s => s.id === cvStart);
  if (!cur) return [];
  trace.push({ ...cur, symbol: null, idx: -1 });
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const edge = cvTransitions.find(t => t.from === cur.id && t.symbol === ch);
    if (!edge) {
      trace.push({ id: null, label: 'DEAD', symbol: ch, idx: i, dead: true });
      break;
    }
    cur = cvStates.find(s => s.id === edge.to);
    if (!cur) break;
    trace.push({ ...cur, symbol: ch, idx: i });
  }
  return trace;
}

window.stepSim = function(dir) {
  if (dir === -1) {
    cvSimStep = -1;
    const sr = document.getElementById('sim-result');
    if (sr) { sr.className = 'sim-result idle'; sr.textContent = 'No simulation'; }
    const st = document.getElementById('sim-trace');
    if (st) st.textContent = '';
    renderCanvas(); return;
  }
  if (!cvSimTrace.length) { runSimulation(); return; }
  cvSimStep = Math.max(0, Math.min(cvSimTrace.length - 1, cvSimStep + dir));
  renderSimResult(document.getElementById('sim-input')?.value || '');
};

function renderSimResult(str) {
  const sr = document.getElementById('sim-result');
  const st = document.getElementById('sim-trace');

  if (!cvSimTrace.length) {
    if (sr) { sr.className = 'sim-result idle'; sr.textContent = 'No automaton defined'; }
    return;
  }

  const last = cvSimTrace[cvSimTrace.length - 1];
  const accepted = !last.dead && cvStates.find(s => s.id === last.id)?.isAccept;
  const stepState = cvSimStep >= 0 ? cvSimTrace[cvSimStep] : null;

  if (sr) {
    if (cvSimStep < 0 || cvSimStep === cvSimTrace.length - 1) {
      sr.className = `sim-result ${accepted ? 'accept' : 'reject'}`;
      sr.textContent = accepted ? `"${str}" → ACCEPT ✓` : `"${str}" → REJECT ✗`;
    } else {
      sr.className = 'sim-result idle';
      sr.textContent = `Step ${cvSimStep}/${cvSimTrace.length-1}`;
    }
  }

  if (st) {
    const traceStr = cvSimTrace.map((t,i) => {
      const active = i === cvSimStep;
      const s = `${t.symbol !== null ? `→(${t.symbol})→` : ''}${t.label || '?'}`;
      return active ? `<strong style="color:var(--warning)">[${t.label||'?'}]</strong>` : (t.label||'?');
    }).join(' ');
    st.innerHTML = `<span style="color:var(--text-muted)">Trace: </span>${traceStr}`;
  }

  renderCanvas();
}

// ====================================================
// UI HELPERS
// ====================================================
window.switchTab = function(groupId, paneId, btn) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panes = group.nextElementSibling ? group.parentElement.querySelectorAll('.tab-pane') : [];
  panes.forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
  if (paneId === 'canvas-tab') setTimeout(initCanvas, 80);
};

window.toggleAcc = function(header) {
  const item = header.parentElement;
  const body = item.querySelector('.acc-body');
  const open = item.classList.contains('open');
  document.querySelectorAll('.acc-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.acc-body').style.maxHeight = '0';
  });
  if (!open) { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
};

// ====================================================
// INIT
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll shadow
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Keyboard nav
  window.addEventListener('keydown', e => {
    if (currentPage === 'conversion') {
      if (e.key === 'ArrowRight') convNext();
      if (e.key === 'ArrowLeft')  convPrev();
    }
  });

  // Hash routing
  const hash = location.hash.slice(1) || 'home';
  const valid = ['home','dfa-nfa','conversion','pumping','practice'];
  navigate(valid.includes(hash) ? hash : 'home', false);
});
