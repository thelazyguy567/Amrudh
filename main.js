/* ========================================
   AutomataLearn — Main Application Script
   SPA with hash-based routing, all modules
   ======================================== */

// ===== STATE =====
let currentPage = 'home';
let quizState = { questions: [], current: 0, score: 0, answers: [], category: 'all', completed: false };
let conversionStep = 0;
let pumpingI = 2;
const progress = JSON.parse(localStorage.getItem('al_progress') || '{"visited":[]}');

// ===== ROUTER =====
function navigate(page, pushState = true) {
  currentPage = page;
  if (pushState) history.pushState({ page }, '', '#' + page);
  renderPage(page);
  updateNav(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!progress.visited.includes(page)) {
    progress.visited.push(page);
    localStorage.setItem('al_progress', JSON.stringify(progress));
  }
  closeMenu();
}

window.addEventListener('popstate', e => {
  const page = (e.state && e.state.page) || 'home';
  navigate(page, false);
});

window.navigate = navigate;

function updateNav(page) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

function renderPage(page) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'page-enter';
  switch (page) {
    case 'home':       div.innerHTML = renderHome(); break;
    case 'dfa-nfa':    div.innerHTML = renderDFANFA(); break;
    case 'conversion': div.innerHTML = renderConversion(); break;
    case 'pumping':    div.innerHTML = renderPumping(); break;
    case 'practice':   div.innerHTML = renderPractice(); break;
    default:           div.innerHTML = renderHome();
  }
  app.appendChild(div);
  bindPageEvents(page);
}

// ===== NAVIGATION ====
function toggleMenu() {
  document.getElementById('nav-links').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('nav-links').classList.remove('open');
}
window.toggleMenu = toggleMenu;

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#7c3aed', '#06b6d4', '#a855f7', '#3b82f6'];

  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist/180)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2,'0');
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== SVG HELPERS =====
function makeSVG(content, vw = 560, vh = 200) {
  return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;max-width:100%;height:auto">
    <defs>
      <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
      </marker>
      <marker id="arr-acc" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4"/>
      </marker>
      <marker id="arr-start" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#10b981"/>
      </marker>
    </defs>
    ${content}
  </svg>`;
}

function svgState(cx, cy, label, type = 'normal', id = '') {
  const r = 30;
  const stroke = type === 'accept' ? '#06b6d4' : type === 'start-accept' ? '#06b6d4' : type === 'start' ? '#10b981' : '#7c3aed';
  const dbl = (type === 'accept' || type === 'start-accept') ?
    `<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="0.6"/>` : '';
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(13,17,23,0.9)" stroke="${stroke}" stroke-width="2" id="${id}"/>
    ${dbl}
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#f1f5f9" font-family="JetBrains Mono,monospace" font-size="13" font-weight="600">${label}</text>
  `;
}

function svgArrow(x1, y1, x2, y2, label, curved = false, type = 'normal') {
  const markerId = type === 'accept' ? 'arr-acc' : 'arr';
  let pathD, lx, ly;
  if (curved) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 45;
    pathD = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
    lx = mx; ly = my - 10;
  } else {
    pathD = `M${x1},${y1} L${x2},${y2}`;
    lx = (x1 + x2) / 2; ly = (y1 + y2) / 2 - 10;
  }
  return `
    <path d="${pathD}" stroke="#64748b" stroke-width="1.8" fill="none" marker-end="url(#${markerId})"/>
    <text x="${lx}" y="${ly}" text-anchor="middle" fill="#06b6d4" font-family="JetBrains Mono,monospace" font-size="12">${label}</text>
  `;
}

function svgSelfLoop(cx, cy, label, pos = 'top') {
  const dy = pos === 'top' ? -60 : 60;
  return `
    <path d="M${cx-18},${cy - 30} C${cx-40},${cy + dy} ${cx+40},${cy + dy} ${cx+18},${cy - 30}" stroke="#64748b" stroke-width="1.8" fill="none" marker-end="url(#arr)"/>
    <text x="${cx}" y="${cy - 30 + dy/2 - 8}" text-anchor="middle" fill="#06b6d4" font-family="JetBrains Mono,monospace" font-size="12">${label}</text>
  `;
}

function svgStartArrow(cx, cy) {
  return `
    <line x1="${cx - 60}" y1="${cy}" x2="${cx - 32}" y2="${cy}" stroke="#10b981" stroke-width="1.8" marker-end="url(#arr-start)"/>
    <text x="${cx - 62}" y="${cy - 8}" text-anchor="end" fill="#10b981" font-family="JetBrains Mono,monospace" font-size="11">start</text>
  `;
}

// ===== HOME PAGE =====
function renderHome() {
  return `
  <section class="hero">
    <div class="hero-tag">
      <span class="dot"></span>
      Theory of Computation · Interactive Learning
    </div>
    <h1>
      Master Automata
      <span class="line2">Theory, Visually.</span>
    </h1>
    <p class="hero-desc">
      Learn Finite Automata, DFA &amp; NFA, Subset Construction, and Pumping Lemma — 
      with clear explanations, formal definitions, and scored practice questions.
    </p>
    <div class="hero-cta">
      <button class="btn btn-primary btn-lg" onclick="navigate('dfa-nfa')">Start Learning →</button>
      <button class="btn btn-secondary btn-lg" onclick="navigate('practice')">Take Practice Quiz</button>
    </div>

    <div class="hero-modules">
      <a class="module-card" onclick="navigate('dfa-nfa')" href="#">
        <span class="module-arrow">→</span>
        <div class="module-icon">🤖</div>
        <h3>Finite Automata</h3>
        <p>DFA &amp; NFA — formal definitions, transition tables, state diagrams, and string acceptance</p>
      </a>
      <a class="module-card cyan-hover" onclick="navigate('conversion')" href="#">
        <span class="module-arrow">→</span>
        <div class="module-icon">🔄</div>
        <h3>NFA → DFA Conversion</h3>
        <p>Subset construction algorithm with step-by-step worked examples and ε-closure</p>
      </a>
      <a class="module-card green-hover" onclick="navigate('pumping')" href="#">
        <span class="module-arrow">→</span>
        <div class="module-icon">🧪</div>
        <h3>Pumping Lemma</h3>
        <p>Prove languages non-regular with formal proofs and interactive decomposition</p>
      </a>
      <a class="module-card yellow-hover" onclick="navigate('practice')" href="#">
        <span class="module-arrow">→</span>
        <div class="module-icon">📝</div>
        <h3>Practice Questions</h3>
        <p>20 scored MCQs across all topics with instant feedback and explanations</p>
      </a>
    </div>

    <div class="stats-row">
      <div class="stat-item"><div class="stat-num">4</div><div class="stat-label">Core Topics</div></div>
      <div class="stat-item"><div class="stat-num">20+</div><div class="stat-label">Practice Questions</div></div>
      <div class="stat-item"><div class="stat-num">10+</div><div class="stat-label">State Diagrams</div></div>
      <div class="stat-item"><div class="stat-num">∞</div><div class="stat-label">Understanding</div></div>
    </div>
  </section>`;
}

// ===== DFA & NFA PAGE =====
function renderDFANFA() {
  const dfaDiagram = makeSVG(`
    ${svgStartArrow(100, 100)}
    ${svgState(100, 100, 'q₀', 'start')}
    ${svgState(260, 100, 'q₁', 'normal')}
    ${svgState(420, 100, 'q₂', 'accept')}
    ${svgSelfLoop(100, 100, '0', 'top')}
    ${svgArrow(130, 100, 230, 100, '1')}
    ${svgArrow(290, 100, 390, 100, '1')}
    ${svgArrow(245, 116, 115, 116, '0', false)}
    ${svgSelfLoop(420, 100, '0,1', 'top')}
  `, 560, 200);

  const nfaDiagram = makeSVG(`
    ${svgStartArrow(80, 110)}
    ${svgState(80, 110, 'q₀', 'start')}
    ${svgState(240, 70, 'q₁', 'normal')}
    ${svgState(240, 150, 'q₂', 'normal')}
    ${svgState(400, 110, 'q₃', 'accept')}
    ${svgArrow(110, 97, 210, 76, 'a')}
    ${svgArrow(110, 122, 210, 143, 'b')}
    ${svgArrow(270, 76, 370, 100, 'b')}
    ${svgArrow(270, 143, 370, 118, 'a')}
    ${svgSelfLoop(80, 110, 'a,b', 'top')}
  `, 530, 220);

  return `
  <div class="topic-hero">
    <div class="topic-hero-inner">
      <div class="topic-hero-text">
        <div class="topic-tag">Module 01</div>
        <h1>Finite Automata<br/><span style="color:var(--primary-light)">DFA &amp; NFA</span></h1>
        <p>Understand Deterministic and Non-deterministic Finite Automata — the foundation of formal language theory and compiler design.</p>
      </div>
      <div class="topic-hero-meta">
        <span class="badge badge-primary">Theory</span>
        <span class="badge badge-accent">Diagrams</span>
        <span class="badge badge-success">Examples</span>
      </div>
    </div>
  </div>

  <div class="topic-content">
    <!-- TABS -->
    <div class="tab-container">
      <div class="tab-bar">
        <button class="tab-btn active" onclick="switchTab(this,'dfa-tab')">Deterministic FA (DFA)</button>
        <button class="tab-btn" onclick="switchTab(this,'nfa-tab')">Non-deterministic FA (NFA)</button>
        <button class="tab-btn" onclick="switchTab(this,'compare-tab')">DFA vs NFA</button>
        <button class="tab-btn" onclick="switchTab(this,'examples-tab')">Worked Examples</button>
      </div>

      <!-- DFA TAB -->
      <div class="tab-content active" id="dfa-tab">
        <h2 class="content-h2"><span class="h2-icon">📌</span> What is a DFA?</h2>
        <p class="content-p">A <strong>Deterministic Finite Automaton (DFA)</strong> is a 5-tuple mathematical model that reads an input string and either <em>accepts</em> or <em>rejects</em> it. It's called "deterministic" because for every state and input symbol, there is exactly <strong>one</strong> next state — no ambiguity.</p>

        <div class="formula-block">
          <span class="formula-line"><span class="formula-highlight">M = (Q, Σ, δ, q₀, F)</span></span>
          <span class="formula-line formula-comment">where:</span>
          <span class="formula-line">  Q  → finite set of states</span>
          <span class="formula-line">  Σ  → finite input alphabet</span>
          <span class="formula-line">  δ  → transition function:  Q × Σ → Q</span>
          <span class="formula-line">  q₀ → start state  (q₀ ∈ Q)</span>
          <span class="formula-line">  F  → set of accept states  (F ⊆ Q)</span>
        </div>

        <div class="key-insight">
          <h4>Key Property of DFA</h4>
          <p>The transition function δ is <strong>total</strong> — defined for every (state, symbol) pair. Given input string <code class="inline">w = a₁a₂...aₙ</code>, the DFA processes each character deterministically and accepts if it ends in a state in F.</p>
        </div>

        <h2 class="content-h2"><span class="h2-icon">📐</span> State Diagram</h2>
        <p class="content-p">Example: DFA that accepts all strings over <code class="inline">{0,1}</code> that <strong>end with 11</strong>.</p>
        <div class="diagram-container">${dfaDiagram}</div>
        <p class="content-p" style="font-size:0.82rem;color:var(--text-muted);text-align:center">▸ Double circle = accept state &nbsp;|&nbsp; Green arrow = start state &nbsp;|&nbsp; q₂ accepts strings ending in "11"</p>

        <h2 class="content-h2"><span class="h2-icon">📋</span> Transition Table</h2>
        <p class="content-p">Every DFA can be represented as a transition table. For the above DFA (accepts strings ending in 11):</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>State</th><th>Input: 0</th><th>Input: 1</th><th>Accept?</th></tr>
            </thead>
            <tbody>
              <tr><td class="current-state">→ q₀ (start)</td><td>q₀</td><td>q₁</td><td class="reject">No</td></tr>
              <tr><td>q₁</td><td>q₀</td><td>q₂</td><td class="reject">No</td></tr>
              <tr><td>q₂ ✓</td><td>q₀</td><td>q₂</td><td class="accept">Yes ✓</td></tr>
            </tbody>
          </table>
        </div>

        <h2 class="content-h2"><span class="h2-icon">▶</span> String Acceptance</h2>
        <p class="content-p">How does DFA process the string <code class="inline">0110</code> (not ending in 11)?</p>
        <div class="stepper">
          <div class="step-item"><div class="step-num">1</div><div class="step-content"><h4>Read '0' in state q₀</h4><p>δ(q₀, 0) = q₀ → stay in q₀</p></div></div>
          <div class="step-item"><div class="step-num">2</div><div class="step-content"><h4>Read '1' in state q₀</h4><p>δ(q₀, 1) = q₁ → move to q₁</p></div></div>
          <div class="step-item"><div class="step-num">3</div><div class="step-content"><h4>Read '1' in state q₁</h4><p>δ(q₁, 1) = q₂ → move to q₂ (accept state)</p></div></div>
          <div class="step-item"><div class="step-num">4</div><div class="step-content"><h4>Read '0' in state q₂</h4><p>δ(q₂, 0) = q₀ → move back to q₀. String ends at q₀ ∉ F → <strong style="color:var(--danger)">REJECT</strong></p></div></div>
        </div>

        <div class="example-block">
          <h5>Accepted Strings</h5>
          <p>Strings accepted by this DFA: <code class="inline">11</code>, <code class="inline">011</code>, <code class="inline">111</code>, <code class="inline">0011</code>, <code class="inline">1011</code>, <code class="inline">0111</code>, ...</p>
          <p>Strings rejected: <code class="inline">0</code>, <code class="inline">1</code>, <code class="inline">10</code>, <code class="inline">0110</code>, <code class="inline">110</code> (ends with 0), ...</p>
        </div>
      </div>

      <!-- NFA TAB -->
      <div class="tab-content" id="nfa-tab">
        <h2 class="content-h2"><span class="h2-icon">📌</span> What is an NFA?</h2>
        <p class="content-p">A <strong>Non-deterministic Finite Automaton (NFA)</strong> allows multiple transitions for the same symbol, or even transitions on empty string (ε). When the NFA reads a symbol, it can <em>branch</em> into multiple states simultaneously. A string is accepted if <strong>at least one</strong> path leads to an accept state.</p>

        <div class="formula-block">
          <span class="formula-line"><span class="formula-highlight">M = (Q, Σ, δ, q₀, F)</span></span>
          <span class="formula-line formula-comment">where:</span>
          <span class="formula-line">  Q  → finite set of states</span>
          <span class="formula-line">  Σ  → finite input alphabet</span>
          <span class="formula-line">  δ  → transition function:  Q × (Σ ∪ {ε}) → <span class="formula-highlight">𝒫(Q)</span></span>
          <span class="formula-line formula-comment">  (returns a SET of states, not a single state)</span>
          <span class="formula-line">  q₀ → start state</span>
          <span class="formula-line">  F  → set of accept states</span>
        </div>

        <div class="key-insight">
          <h4>NFA Superposition</h4>
          <p>Think of an NFA as a machine that explores all possible paths in <em>parallel</em>. If any parallel computation ends in an accept state, the string is accepted. ε-transitions allow moving to new states without consuming any input.</p>
        </div>

        <h2 class="content-h2"><span class="h2-icon">📐</span> NFA State Diagram</h2>
        <p class="content-p">Example: NFA that accepts strings ending with <code class="inline">ab</code> or <code class="inline">ba</code>.</p>
        <div class="diagram-container">${nfaDiagram}</div>
        <p class="content-p" style="font-size:0.82rem;color:var(--text-muted);text-align:center">▸ NFA has 2 possible branches from q₀ — on 'a' go to q₁, on 'b' go to q₂ (plus self-loop)</p>

        <h2 class="content-h2"><span class="h2-icon">📋</span> NFA Transition Table</h2>
        <p class="content-p">The transition table for an NFA returns <strong>sets of states</strong> (or ∅ if no transition):</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>State</th><th>Input: a</th><th>Input: b</th><th>Accept?</th></tr>
            </thead>
            <tbody>
              <tr><td class="current-state">→ q₀</td><td>{q₀, q₁}</td><td>{q₀, q₂}</td><td class="reject">No</td></tr>
              <tr><td>q₁</td><td>∅</td><td>{q₃}</td><td class="reject">No</td></tr>
              <tr><td>q₂</td><td>{q₃}</td><td>∅</td><td class="reject">No</td></tr>
              <tr><td>q₃ ✓</td><td>∅</td><td>∅</td><td class="accept">Yes ✓</td></tr>
            </tbody>
          </table>
        </div>

        <div class="info-box">
          <h4>ε-NFA (NFA with Epsilon Transitions)</h4>
          <p>An ε-NFA includes transitions on the empty string ε. These allow the automaton to move between states without consuming any character. The set of all states reachable via ε-transitions is called the <strong>ε-closure</strong>.</p>
          <br/>
          <p><strong>ε-closure(q)</strong> = set of all states reachable from q using only ε-transitions (including q itself).</p>
        </div>

        <h2 class="content-h2"><span class="h2-icon">▶</span> String Acceptance in NFA</h2>
        <p class="content-p">Trace string <code class="inline">ab</code> through the NFA above:</p>
        <div class="stepper">
          <div class="step-item"><div class="step-num">1</div><div class="step-content"><h4>Start: {q₀}</h4><p>Initial configuration — we are in state q₀</p></div></div>
          <div class="step-item"><div class="step-num">2</div><div class="step-content"><h4>Read 'a': {q₀, q₁}</h4><p>δ(q₀, a) = {q₀, q₁} → NFA branches into two states simultaneously</p></div></div>
          <div class="step-item"><div class="step-num">3</div><div class="step-content"><h4>Read 'b': {q₀, q₂, q₃}</h4><p>δ(q₀, b) ∪ δ(q₁, b) = {q₀, q₂} ∪ {q₃} = {q₀, q₂, q₃}</p></div></div>
          <div class="step-item"><div class="step-num">4</div><div class="step-content"><h4>Final: q₃ ∈ F → <span style="color:var(--success)">ACCEPT ✓</span></h4><p>Since q₃ is in the final state set, the string "ab" is accepted!</p></div></div>
        </div>
      </div>

      <!-- COMPARE TAB -->
      <div class="tab-content" id="compare-tab">
        <h2 class="content-h2"><span class="h2-icon">⚡</span> DFA vs NFA — Key Differences</h2>

        <div class="comparison-grid">
          <div class="compare-card dfa">
            <h3>🤖 DFA</h3>
            <ul class="compare-list">
              <li>Exactly ONE transition per (state, symbol) pair</li>
              <li>No ε (epsilon) transitions allowed</li>
              <li>Transition function: δ: Q × Σ → Q</li>
              <li>Easier to implement in hardware/software</li>
              <li>Each state is uniquely determined at all times</li>
              <li>Generally requires more states for same language</li>
              <li>Direct simulation possible</li>
            </ul>
          </div>
          <div class="compare-card nfa">
            <h3>🔀 NFA</h3>
            <ul class="compare-list">
              <li>MULTIPLE or ZERO transitions per (state, symbol)</li>
              <li>ε transitions allowed (move without input)</li>
              <li>Transition function: δ: Q × (Σ∪{ε}) → 𝒫(Q)</li>
              <li>More intuitive for certain language designs</li>
              <li>Multiple states active simultaneously</li>
              <li>Can be more compact (fewer states)</li>
              <li>Requires subset construction for simulation</li>
            </ul>
          </div>
        </div>

        <div class="key-insight">
          <h4>Equivalence Theorem (Rabin-Scott, 1959)</h4>
          <p>Despite their differences, DFAs and NFAs recognize exactly the <strong>same class of languages</strong> — the Regular Languages. For every NFA, there exists an equivalent DFA that recognizes the same language. This is proven by the Subset Construction algorithm.</p>
        </div>

        <div class="table-wrap" style="margin-top:24px">
          <table>
            <thead><tr><th>Property</th><th>DFA</th><th>NFA</th></tr></thead>
            <tbody>
              <tr><td>Transitions per (state, symbol)</td><td>Exactly 1</td><td>0, 1, or many</td></tr>
              <tr><td>ε-transitions</td><td>❌ Not allowed</td><td>✅ Allowed</td></tr>
              <tr><td>Acceptance</td><td>End state ∈ F</td><td>ANY path ends in F</td></tr>
              <tr><td>State count</td><td>≤ 2^n states (after conversion)</td><td>n states</td></tr>
              <tr><td>Expressive power</td><td>Regular Languages</td><td>Regular Languages</td></tr>
              <tr><td>Determinism</td><td>✅ Fully deterministic</td><td>❌ Non-deterministic</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- EXAMPLES TAB -->
      <div class="tab-content" id="examples-tab">
        <h2 class="content-h2"><span class="h2-icon">📚</span> Worked Examples</h2>

        <div class="accordion">
          <div class="acc-item">
            <div class="acc-header" onclick="toggleAcc(this)">
              <span class="acc-title">Example 1: DFA accepting strings with even number of 0s</span>
              <span class="acc-icon">▼</span>
            </div>
            <div class="acc-body"><div class="acc-body-inner">
              <p><strong>Language:</strong> L = { w ∈ {0,1}* | w contains an even number of 0s }</p>
              <br/>
              <p><strong>States:</strong> q₀ (even 0s seen — accept), q₁ (odd 0s seen)</p>
              <br/>
              <div class="diagram-container">${makeSVG(`
                ${svgStartArrow(100, 100)}
                ${svgState(100, 100, 'q₀', 'start-accept')}
                ${svgState(300, 100, 'q₁', 'normal')}
                ${svgSelfLoop(100, 100, '1', 'top')}
                ${svgSelfLoop(300, 100, '1', 'top')}
                ${svgArrow(130, 93, 270, 93, '0')}
                ${svgArrow(270, 107, 130, 107, '0')}
              `, 430, 200)}</div>
              <p><strong>Logic:</strong> Start in q₀ (0 zeros = even). Each time we read a '0', toggle state. Reading '1' keeps same state. Accept when in q₀.</p>
              <br/>
              <p><strong>Test:</strong> String "1001" → q₀ →(1)→ q₀ →(0)→ q₁ →(0)→ q₀ →(1)→ q₀ ∈ F → <span style="color:var(--success)">ACCEPT ✓</span></p>
            </div></div>
          </div>

          <div class="acc-item">
            <div class="acc-header" onclick="toggleAcc(this)">
              <span class="acc-title">Example 2: DFA accepting strings starting with 'a' and ending with 'b'</span>
              <span class="acc-icon">▼</span>
            </div>
            <div class="acc-body"><div class="acc-body-inner">
              <p><strong>Language:</strong> L = { w ∈ {a,b}* | w starts with 'a' and ends with 'b' }</p>
              <br/>
              <p><strong>States:</strong> q₀ (start/dead), q₁ (seen 'a', last char not 'b'), q₂ (accept: seen 'a', last char 'b'), qd (dead/trap state)</p>
              <br/>
              <div class="diagram-container">${makeSVG(`
                ${svgStartArrow(60, 110)}
                ${svgState(60, 110, 'q₀', 'start')}
                ${svgState(200, 70, 'q₁', 'normal')}
                ${svgState(350, 70, 'q₂', 'accept')}
                ${svgState(200, 160, 'qd', 'normal')}
                ${svgArrow(90, 97, 172, 77, 'a')}
                ${svgArrow(90, 120, 172, 155, 'b')}
                ${svgArrow(230, 70, 320, 70, 'b')}
                ${svgArrow(320, 82, 230, 82, 'a')}
                ${svgSelfLoop(200, 160, 'a,b', 'top')}
                ${svgSelfLoop(200, 70, 'a', 'top')}
                ${svgSelfLoop(350, 70, 'b', 'top')}
              `, 500, 240)}</div>
              <p><strong>Test:</strong> "ab" → q₀ →(a)→ q₁ →(b)→ q₂ ∈ F → <span style="color:var(--success)">ACCEPT ✓</span><br/>
              "ba" → q₀ →(b)→ qd → qd → <span style="color:var(--danger)">REJECT ✗</span></p>
            </div></div>
          </div>

          <div class="acc-item">
            <div class="acc-header" onclick="toggleAcc(this)">
              <span class="acc-title">Example 3: NFA for strings containing "ab" as substring</span>
              <span class="acc-icon">▼</span>
            </div>
            <div class="acc-body"><div class="acc-body-inner">
              <p><strong>Language:</strong> L = { w ∈ {a,b}* | w contains "ab" as a substring }</p>
              <br/>
              <div class="diagram-container">${makeSVG(`
                ${svgStartArrow(80, 110)}
                ${svgState(80, 110, 'q₀', 'start')}
                ${svgState(240, 110, 'q₁', 'normal')}
                ${svgState(400, 110, 'q₂', 'accept')}
                ${svgSelfLoop(80, 110, 'a,b', 'top')}
                ${svgArrow(110, 110, 210, 110, 'a')}
                ${svgArrow(270, 110, 370, 110, 'b')}
                ${svgSelfLoop(400, 110, 'a,b', 'top')}
              `, 530, 200)}</div>
              <p><strong>Key NFA property:</strong> From q₀, on 'a', we <em>non-deterministically</em> either stay (continue reading) or move to q₁ (guess "ab" starts here). This makes the NFA compact — only 3 states vs the DFA which needs 4!</p>
            </div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-32">
      <button class="btn btn-primary" onclick="navigate('conversion')">Next: NFA → DFA Conversion →</button>
    </div>
  </div>`;
}

// ===== CONVERSION PAGE =====
const conversionSteps = [
  {
    title: 'Original NFA',
    desc: 'We start with the NFA to convert. This NFA accepts strings over {a, b} that end with "ab".',
    diagram: () => makeSVG(`
      ${svgStartArrow(80, 110)}
      ${svgState(80, 110, 'q₀', 'start')}
      ${svgState(240, 110, 'q₁', 'normal')}
      ${svgState(400, 110, 'q₂', 'accept')}
      ${svgSelfLoop(80, 110, 'a,b', 'top')}
      ${svgArrow(110, 110, 210, 110, 'a')}
      ${svgArrow(270, 110, 370, 110, 'b')}
      ${svgSelfLoop(400, 110, 'a,b', 'top')}
    `, 530, 200),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>State</th><th>a</th><th>b</th></tr></thead>
      <tbody>
        <tr><td class="current-state">→ q₀</td><td>{q₀, q₁}</td><td>{q₀}</td></tr>
        <tr><td>q₁</td><td>∅</td><td>{q₂}</td></tr>
        <tr><td>q₂ ✓</td><td>∅</td><td>∅</td></tr>
      </tbody>
    </table></div>`,
    note: 'NFA Transition Table — note how q₀ on input "a" leads to {q₀, q₁} (two states simultaneously).'
  },
  {
    title: 'Step 1: Start with ε-closure of q₀',
    desc: 'The DFA starts with the set of states reachable from q₀ via ε-transitions. Since there are none here, we start with {q₀}.',
    diagram: () => makeSVG(`
      ${svgStartArrow(130, 110)}
      ${svgState(130, 110, '{q₀}', 'start')}
    `, 280, 200),
    table: `<div class="def-box"><h4>ε-closure</h4><p>ε-closure({q₀}) = {q₀} (no ε-transitions)</p><br/><p>This becomes the start state of the DFA: <code class="inline">[q₀]</code></p></div>`,
    note: 'The DFA start state is {q₀}. We will expand this using subset construction.'
  },
  {
    title: 'Step 2: Expand {q₀} on input "a"',
    desc: 'Compute δ_NFA(q₀, a) = {q₀, q₁}. This becomes a new DFA state.',
    diagram: () => makeSVG(`
      ${svgStartArrow(90, 110)}
      ${svgState(90, 110, '{q₀}', 'start')}
      ${svgState(290, 110, '{q₀,q₁}', 'normal')}
      ${svgArrow(122, 110, 248, 110, 'a')}
    `, 430, 200),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>On "a"</th><th>On "b"</th></tr></thead>
      <tbody>
        <tr><td class="current-state">{q₀}</td><td class="accept">{q₀, q₁} ← NEW</td><td>?</td></tr>
      </tbody>
    </table></div>`,
    note: 'From q₀, reading "a" goes to {q₀, q₁} in the NFA. This is a new DFA state to be processed.'
  },
  {
    title: 'Step 3: Expand {q₀} on input "b" and {q₀,q₁} on "a" and "b"',
    desc: 'Continue expanding. δ(q₀, b) = {q₀}. δ({q₀,q₁}, a) = δ(q₀,a) ∪ δ(q₁,a) = {q₀,q₁} ∪ ∅ = {q₀,q₁}. δ({q₀,q₁}, b) = δ(q₀,b) ∪ δ(q₁,b) = {q₀} ∪ {q₂} = {q₀,q₂}.',
    diagram: () => makeSVG(`
      ${svgStartArrow(80, 110)}
      ${svgState(80, 110, '{q₀}', 'start')}
      ${svgState(280, 60, '{q₀,q₁}', 'normal')}
      ${svgState(280, 160, '{q₀,q₂}', 'accept')}
      ${svgArrow(110, 97, 248, 70, 'a')}
      ${svgArrow(100, 122, 248, 155, 'b')}
      ${svgSelfLoop(280, 60, 'a', 'top')}
      ${svgArrow(280, 90, 280, 130, 'b')}
    `, 480, 240),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>On "a"</th><th>On "b"</th></tr></thead>
      <tbody>
        <tr><td>{q₀}</td><td>{q₀,q₁}</td><td>{q₀}</td></tr>
        <tr><td class="current-state">{q₀,q₁}</td><td>{q₀,q₁}</td><td class="accept">{q₀,q₂} ← NEW</td></tr>
      </tbody>
    </table></div>`,
    note: '{q₀, q₂} is a new state — and since q₂ ∈ F (accept state in NFA), it becomes an accept state in DFA!'
  },
  {
    title: 'Step 4: Expand {q₀,q₂} — Complete DFA',
    desc: 'δ({q₀,q₂}, a) = δ(q₀,a) ∪ δ(q₂,a) = {q₀,q₁} ∪ ∅ = {q₀,q₁}. δ({q₀,q₂}, b) = δ(q₀,b) ∪ δ(q₂,b) = {q₀} ∪ ∅ = {q₀}. No new states — construction complete!',
    diagram: () => makeSVG(`
      ${svgStartArrow(70, 120)}
      ${svgState(70, 120, '{q₀}', 'start')}
      ${svgState(250, 60, '{q₀q₁}', 'normal')}
      ${svgState(250, 180, '{q₀q₂}', 'accept')}
      ${svgArrow(100, 107, 220, 73, 'a')}
      ${svgArrow(90, 133, 220, 167, 'b')}
      ${svgSelfLoop(250, 60, 'a', 'top')}
      ${svgArrow(250, 90, 250, 150, 'b')}
      ${svgArrow(220, 175, 90, 135, 'b')}
      ${svgArrow(220, 185, 85, 133, 'a')}
    `, 440, 270),
    table: `<div class="table-wrap"><table>
      <thead><tr><th>DFA State</th><th>On "a"</th><th>On "b"</th><th>Accept?</th></tr></thead>
      <tbody>
        <tr><td>→ {q₀}</td><td>{q₀,q₁}</td><td>{q₀}</td><td class="reject">No</td></tr>
        <tr><td>{q₀,q₁}</td><td>{q₀,q₁}</td><td>{q₀,q₂}</td><td class="reject">No</td></tr>
        <tr><td>{q₀,q₂} ✓</td><td>{q₀,q₁}</td><td>{q₀}</td><td class="accept">Yes ✓</td></tr>
      </tbody>
    </table></div>`,
    note: '🎉 Final DFA has 3 states and accepts exactly the same language as the original NFA!'
  }
];

function renderConversion() {
  conversionStep = 0;
  return `
  <div class="topic-hero">
    <div class="topic-hero-inner">
      <div class="topic-hero-text">
        <div class="topic-tag">Module 02</div>
        <h1>NFA → DFA<br/><span style="color:var(--accent)">Subset Construction</span></h1>
        <p>Convert any NFA to an equivalent DFA using the Subset Construction (Powerset) algorithm — step by step with visual guidance.</p>
      </div>
      <div class="topic-hero-meta">
        <span class="badge badge-accent">Step-by-Step</span>
        <span class="badge badge-primary">Algorithm</span>
        <span class="badge badge-success">Visual</span>
      </div>
    </div>
  </div>

  <div class="topic-content">

    <div class="card card-cyan" style="margin-bottom:32px">
      <h3 style="color:var(--accent);margin-bottom:12px;font-size:1.1rem">🔑 The Subset Construction Algorithm</h3>
      <p class="content-p">Every NFA state in the DFA corresponds to a <strong>set of NFA states</strong>. The DFA's states are subsets of the NFA's state set — hence "Subset Construction" (or Powerset Construction).</p>
      <div class="formula-block" style="margin-top:16px">
        <span class="formula-line formula-comment">// Algorithm outline:</span>
        <span class="formula-line">1. Start with DFA state = ε-closure({q₀})</span>
        <span class="formula-line">2. For each DFA state S and each symbol a ∈ Σ:</span>
        <span class="formula-line">   compute MOVE(S, a) = ∪ δ_NFA(q, a) for q ∈ S</span>
        <span class="formula-line">   then take ε-closure(MOVE(S, a))</span>
        <span class="formula-line">3. If result is a new set → add as new DFA state</span>
        <span class="formula-line">4. Repeat until no new states found</span>
        <span class="formula-line">5. DFA accept states = sets containing any NFA accept state</span>
      </div>
    </div>

    <div class="interactive-stepper" id="conv-stepper">
      <div class="stepper-header">
        <h3 style="font-size:1rem;font-weight:700;color:var(--text-primary)">Interactive Step-by-Step Walkthrough</h3>
        <div class="stepper-progress" id="conv-progress"></div>
      </div>
      <div class="stepper-content" id="conv-content"></div>
      <div class="stepper-nav">
        <button class="btn btn-secondary btn-sm" id="conv-prev" onclick="convPrev()">← Previous</button>
        <span class="stepper-counter" id="conv-counter"></span>
        <button class="btn btn-accent btn-sm" id="conv-next" onclick="convNext()">Next Step →</button>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-icon">📚</span> ε-Closure Deep Dive</h2>
    <p class="content-p">The ε-closure is critical when dealing with ε-NFAs. Here's how to compute it:</p>
    <div class="accordion">
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">How to compute ε-closure</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p><strong>ε-closure(T)</strong> = all states reachable from any state in T using only ε-transitions</p>
          <br/>
          <p><strong>Algorithm:</strong></p>
          <div class="formula-block">
            <span class="formula-line">ε-closure(T):</span>
            <span class="formula-line">  push all states of T onto stack</span>
            <span class="formula-line">  closure = T</span>
            <span class="formula-line">  while stack is not empty:</span>
            <span class="formula-line">    t = pop(stack)</span>
            <span class="formula-line">    for each state u in δ(t, ε):</span>
            <span class="formula-line">      if u ∉ closure:</span>
            <span class="formula-line">        closure = closure ∪ {u}</span>
            <span class="formula-line">        push u onto stack</span>
            <span class="formula-line">  return closure</span>
          </div>
        </div></div>
      </div>
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">What if the DFA state is ∅ (empty set)?</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p>The empty set ∅ becomes a <strong>dead state</strong> (trap state) in the DFA. Once entered, all transitions stay in ∅. It is a non-accepting state and is needed for the DFA to be complete (total transition function).</p>
          <br/>
          <p>Some textbooks omit the dead state if completeness is not required, but strictly speaking a DFA must have a transition for every (state, symbol) pair.</p>
        </div></div>
      </div>
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">Worst case: exponential blowup</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p>An NFA with <strong>n states</strong> can produce a DFA with up to <strong>2ⁿ states</strong> (one for each subset of the NFA's state set). However, in practice, only reachable subsets are created, often far fewer than 2ⁿ.</p>
          <br/>
          <p>Example: NFA with 3 states → DFA has at most 2³ = 8 states. Our example only needed 3.</p>
        </div></div>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-icon">📝</span> Another Example: ε-NFA Conversion</h2>
    <p class="content-p">Consider the ε-NFA accepting strings of the form <code class="inline">aⁿ</code> (0 or more a's) followed by <code class="inline">bⁿ</code>:</p>
    <div class="card card-cyan">
      <div class="stepper">
        <div class="step-item"><div class="step-num">1</div><div class="step-content"><h4>ε-closure({q₀}) = {q₀, q₁, q₃}</h4><p>q₀ has ε-transitions to q₁ and q₃. Include all ε-reachable states.</p></div></div>
        <div class="step-item"><div class="step-num">2</div><div class="step-content"><h4>Compute MOVE on each symbol</h4><p>MOVE({q₀,q₁,q₃}, a) → then take ε-closure. MOVE({q₀,q₁,q₃}, b) → then take ε-closure.</p></div></div>
        <div class="step-item"><div class="step-num">3</div><div class="step-content"><h4>Build DFA table until closure</h4><p>Repeat until no new subsets are generated. Mark any subset containing an NFA accept state as a DFA accept state.</p></div></div>
      </div>
    </div>

    <div class="text-center mt-32">
      <button class="btn btn-primary" onclick="navigate('pumping')">Next: Pumping Lemma →</button>
    </div>
  </div>`;
}

function renderConvStep() {
  const s = conversionSteps[conversionStep];
  const total = conversionSteps.length;

  // Update progress dots
  const prog = document.getElementById('conv-progress');
  if (prog) {
    prog.innerHTML = conversionSteps.map((_, i) =>
      `<div class="progress-dot ${i < conversionStep ? 'done' : i === conversionStep ? 'active' : ''}"></div>`
    ).join('');
  }

  const content = document.getElementById('conv-content');
  if (content) {
    content.innerHTML = `
      <div class="badge badge-accent mb-8">${s.title}</div>
      <p class="content-p">${s.desc}</p>
      <div class="diagram-container">${s.diagram()}</div>
      ${s.table}
      <div class="info-box mt-16"><h4>Note</h4><p>${s.note}</p></div>
    `;
    content.style.animation = 'none';
    requestAnimationFrame(() => { content.style.animation = 'tabFade 0.3s ease'; });
  }

  const counter = document.getElementById('conv-counter');
  if (counter) counter.textContent = `Step ${conversionStep + 1} of ${total}`;

  const prevBtn = document.getElementById('conv-prev');
  const nextBtn = document.getElementById('conv-next');
  if (prevBtn) prevBtn.disabled = conversionStep === 0;
  if (nextBtn) {
    if (conversionStep === total - 1) {
      nextBtn.textContent = '✓ Complete!';
      nextBtn.disabled = true;
    } else {
      nextBtn.textContent = 'Next Step →';
      nextBtn.disabled = false;
    }
  }
}

function convNext() { if (conversionStep < conversionSteps.length - 1) { conversionStep++; renderConvStep(); } }
function convPrev() { if (conversionStep > 0) { conversionStep--; renderConvStep(); } }
window.convNext = convNext;
window.convPrev = convPrev;

// ===== PUMPING LEMMA PAGE =====
function renderPumping() {
  return `
  <div class="topic-hero">
    <div class="topic-hero-inner">
      <div class="topic-hero-text">
        <div class="topic-tag">Module 03</div>
        <h1>The Pumping<br/><span style="color:var(--warning)">Lemma</span></h1>
        <p>A fundamental tool for proving that certain languages are NOT regular — using the pigeonhole principle and string decomposition.</p>
      </div>
      <div class="topic-hero-meta">
        <span class="badge badge-warning">Proof Technique</span>
        <span class="badge badge-primary">Theory</span>
        <span class="badge badge-accent">Interactive</span>
      </div>
    </div>
  </div>

  <div class="topic-content">

    <h2 class="content-h2"><span class="h2-icon">📌</span> The Pumping Lemma — Statement</h2>
    <p class="content-p">The Pumping Lemma gives us a <em>necessary condition</em> for a language to be regular. If a language violates this condition, it <strong>cannot be regular</strong>.</p>

    <div class="formula-block">
      <span class="formula-line"><span class="formula-highlight">Pumping Lemma for Regular Languages:</span></span>
      <span class="formula-line formula-comment"></span>
      <span class="formula-line">If L is a regular language, then ∃ a pumping length p ≥ 1 such that</span>
      <span class="formula-line">any string s ∈ L with |s| ≥ p can be written as s = xyz where:</span>
      <span class="formula-line formula-comment"></span>
      <span class="formula-line">  (1)  |y| ≥ 1          <span class="formula-comment">// y is non-empty</span></span>
      <span class="formula-line">  (2)  |xy| ≤ p         <span class="formula-comment">// xy is within first p characters</span></span>
      <span class="formula-line">  (3)  ∀i ≥ 0, xy<span class="formula-highlight">ⁱ</span>z ∈ L  <span class="formula-comment">// pumping y any number of times stays in L</span></span>
    </div>

    <div class="key-insight">
      <h4>Intuition — Pigeonhole Principle</h4>
      <p>If a DFA has p states and processes a string of length ≥ p, by the pigeonhole principle, it must visit some state <strong>twice</strong>. The substring processed between those two visits is the "pumpable" part y — we can repeat it any number of times and stay in the language.</p>
    </div>

    <div class="warn-box">
      <h4>⚠ Important Caveat</h4>
      <p>The Pumping Lemma tells us that regular languages satisfy this property. But it is a <strong>one-way implication</strong> — a language satisfying the pumping lemma is NOT necessarily regular! It is only a tool for proving non-regularity, not regularity.</p>
    </div>

    <h2 class="content-h2"><span class="h2-icon">🎮</span> Interactive String Decomposer</h2>
    <p class="content-p">See how the string <code class="inline">aⁿbⁿ</code> (e.g., <code class="inline">aaabbb</code>) fails the pumping lemma:</p>
    <div class="pump-demo" id="pump-demo">
      <div style="text-align:center;margin-bottom:16px">
        <span style="color:var(--text-muted);font-size:0.85rem">String w = a<sup>p</sup>b<sup>p</sup> decomposed as <strong>xyz</strong> with |xy| ≤ p:</span>
      </div>
      <div class="pump-string-display" id="pump-display"></div>
      <div class="pump-labels">
        <span style="color:var(--primary-light)">■ x (prefix)</span>
        <span style="color:var(--accent)">■ y (pumpable)</span>
        <span style="color:var(--success)">■ z (suffix)</span>
      </div>
      <div class="pump-slider-wrap">
        <label>Adjust y length: <span id="y-len-label">2</span> characters</label>
        <input type="range" min="1" max="4" value="2" id="pump-slider" oninput="updatePump(this.value)" />
      </div>
      <div id="pump-result" class="pump-result"></div>
      <div id="pump-explain" style="margin-top:12px;padding:12px;font-size:0.85rem;color:var(--text-muted);border-top:1px solid var(--border-glass)"></div>
    </div>

    <h2 class="content-h2"><span class="h2-icon">📚</span> Proof Structure</h2>
    <p class="content-p">To use the Pumping Lemma to prove L is non-regular, follow this structure:</p>
    <div class="stepper">
      <div class="step-item"><div class="step-num">1</div><div class="step-content">
        <h4>Assume L is regular</h4>
        <p>Proof by contradiction — suppose L is regular. Then it has a pumping length p.</p>
      </div></div>
      <div class="step-item"><div class="step-num">2</div><div class="step-content">
        <h4>Choose a string s ∈ L with |s| ≥ p</h4>
        <p>Select s carefully — usually s = aᵖbᵖ or similar. You choose s, your adversary chooses the decomposition xyz.</p>
      </div></div>
      <div class="step-item"><div class="step-num">3</div><div class="step-content">
        <h4>Consider all possible decompositions xyz</h4>
        <p>Since |xy| ≤ p and s = aᵖbᵖ, the xy part must lie entirely within the a's. So y = aᵏ for some k ≥ 1.</p>
      </div></div>
      <div class="step-item"><div class="step-num">4</div><div class="step-content">
        <h4>Show that pumping fails</h4>
        <p>For i = 2: xyyz = aᵖ⁺ᵏbᵖ. But this has more a's than b's, so it's NOT in L. Contradiction!</p>
      </div></div>
      <div class="step-item"><div class="step-num">5</div><div class="step-content">
        <h4>Conclude L is not regular</h4>
        <p>Since the Pumping Lemma fails, our assumption was wrong — L is NOT regular. ∎</p>
      </div></div>
    </div>

    <h2 class="content-h2"><span class="h2-icon">📋</span> Classic Examples</h2>
    <div class="accordion">
      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">Proof: L = {aⁿbⁿ | n ≥ 0} is NOT regular</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p><strong>Assume</strong> L is regular with pumping length p.</p>
          <p><strong>Choose</strong> s = aᵖbᵖ ∈ L, |s| = 2p ≥ p ✓</p>
          <p><strong>Consider</strong> any decomposition s = xyz with |xy| ≤ p, |y| ≥ 1:</p>
          <p>&nbsp;&nbsp;Since |xy| ≤ p, x and y consist entirely of a's. So: x = aʲ, y = aᵏ (k ≥ 1), z = aᵖ⁻ʲ⁻ᵏbᵖ</p>
          <p><strong>Pump i = 0:</strong> xy⁰z = xz = aᵖ⁻ᵏbᵖ. Since k ≥ 1, this has fewer a's than b's → ∉ L ✗</p>
          <p><strong>Contradiction!</strong> L is not regular. ∎</p>
        </div></div>
      </div>

      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">Proof: L = {aⁿ² | n ≥ 0} (strings whose length is a perfect square) is NOT regular</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p><strong>Choose</strong> s = aᵖ². Since |s| = p² ≥ p, it qualifies.</p>
          <p><strong>Any decomposition:</strong> y = aᵏ for 1 ≤ k ≤ p. Then xyⁱz = aᵖ²⁺⁽ⁱ⁻¹⁾ᵏ</p>
          <p><strong>For i = 2:</strong> |xy²z| = p² + k. Need p² + k to be a perfect square.</p>
          <p>But p² &lt; p² + k ≤ p² + p &lt; (p+1)² = p² + 2p + 1</p>
          <p>No perfect square exists strictly between p² and (p+1)². Contradiction! L is not regular. ∎</p>
        </div></div>
      </div>

      <div class="acc-item">
        <div class="acc-header" onclick="toggleAcc(this)">
          <span class="acc-title">Proof: L = {ww | w ∈ {a,b}*} is NOT regular</span>
          <span class="acc-icon">▼</span>
        </div>
        <div class="acc-body"><div class="acc-body-inner">
          <p><strong>Choose</strong> s = aᵖbaᵖb ∈ L (with w = aᵖb, so ww = aᵖbaᵖb)</p>
          <p><strong>Any decomposition</strong> with |xy| ≤ p: y = aᵏ (within first p a's), k ≥ 1</p>
          <p><strong>Pump i = 2:</strong> xyyz = aᵖ⁺ᵏbaᵖb. For this to be ww, we need both halves equal.</p>
          <p>The first half would be aᵖ⁺ᵏb (length p+k+1) and second half starts at position p+k+2. But the structure breaks — the two halves can't be equal. Contradiction! ∎</p>
        </div></div>
      </div>
    </div>

    <h2 class="content-h2"><span class="h2-icon">⚡</span> Regular vs Non-Regular Languages</h2>
    <div class="comparison-grid">
      <div class="compare-card" style="border-top:3px solid var(--success)">
        <h3 style="color:var(--success)">✅ Regular Languages</h3>
        <ul class="compare-list">
          <li>Recognized by DFA/NFA</li>
          <li>L = {strings containing "ab"}</li>
          <li>L = {strings over {0,1}}</li>
          <li>L = {strings ending in 11}</li>
          <li>L = {strings with even # of 0s}</li>
          <li>Finite languages (all finite sets)</li>
          <li>Union, concat, star of regular languages</li>
        </ul>
      </div>
      <div class="compare-card" style="border-top:3px solid var(--danger)">
        <h3 style="color:var(--danger)">❌ Non-Regular Languages</h3>
        <ul class="compare-list">
          <li>Cannot be recognized by any DFA/NFA</li>
          <li>L = {aⁿbⁿ | n ≥ 0}</li>
          <li>L = {aⁿ² | n ≥ 0}</li>
          <li>L = {ww | w ∈ {a,b}*}</li>
          <li>L = {balanced parentheses}</li>
          <li>L = {palindromes over {a,b}}</li>
          <li>Require pushdown automata (CFL) or higher</li>
        </ul>
      </div>
    </div>

    <div class="text-center mt-32">
      <button class="btn btn-primary" onclick="navigate('practice')">Next: Practice Questions →</button>
    </div>
  </div>`;
}

// ===== PUMPING LEMMA INTERACTIVE =====
function updatePump(yLen) {
  yLen = parseInt(yLen);
  document.getElementById('y-len-label').textContent = yLen;
  const p = 4; // pumping length for demo (aaaaabbbb)
  const s = 'a'.repeat(p) + 'b'.repeat(p);
  const xLen = 1;
  const x = s.slice(0, xLen);
  const y = s.slice(xLen, xLen + yLen);
  const z = s.slice(xLen + yLen);

  // Pumped string for i=2
  const pumped = x + y + y + z;
  const aCount = pumped.split('').filter(c => c === 'a').length;
  const bCount = pumped.split('').filter(c => c === 'b').length;

  const display = document.getElementById('pump-display');
  if (display) {
    display.innerHTML =
      `<span class="pump-part x-part">${x}</span>` +
      `<span class="pump-part y-part">${y}</span>` +
      `<span class="pump-part z-part">${z}</span>`;
  }

  const result = document.getElementById('pump-result');
  const explain = document.getElementById('pump-explain');
  const inLanguage = aCount === bCount;

  if (result) {
    result.className = 'pump-result ' + (inLanguage ? 'valid' : 'invalid');
    result.textContent = inLanguage
      ? `xy²z = "${pumped}" — ${aCount} a's, ${bCount} b's → Still in L ✓ (try another y length!)`
      : `xy²z = "${pumped}" — ${aCount} a's, ${bCount} b's → NOT in L ✗ (Pumping fails!)`;
  }

  if (explain) {
    explain.textContent = `x="${x}", y="${y}", z="${z}" | xy²z = "${pumped}" | |xy| = ${xLen + yLen} ≤ ${p} ✓ | |y| = ${yLen} ≥ 1 ✓`;
  }
}

// ===== PRACTICE QUESTIONS =====
const QUESTIONS = [
  {
    id: 1, category: 'DFA',
    q: 'A DFA M = (Q, Σ, δ, q₀, F). The transition function δ maps:',
    options: ['Q × Σ → Q', 'Q × Σ → 𝒫(Q)', 'Q × (Σ∪{ε}) → Q', 'Σ × Q → Q'],
    ans: 0,
    exp: 'In a DFA, δ is a total function from Q × Σ to Q — exactly one next state for each (state, symbol) pair. NFAs use 𝒫(Q) (power set).'
  },
  {
    id: 2, category: 'DFA',
    q: 'Which of the following strings is accepted by the DFA that accepts all strings over {0,1} ending in "11"?',
    options: ['0110', '10111', '101', '11010'],
    ans: 1,
    exp: '"10111" ends in "11" → accepted. "0110" ends in "10", "101" ends in "01", "11010" ends in "10" — all rejected.'
  },
  {
    id: 3, category: 'DFA',
    q: 'A DFA with n states accepts all strings of length ≥ 1 over {a}. What is the minimum number of states needed?',
    options: ['1', '2', '3', 'n states required'],
    ans: 1,
    exp: '2 states suffice: q₀ (start, non-accepting), q₁ (accept). δ(q₀,a)=q₁, δ(q₁,a)=q₁. Accepts a, aa, aaa, ...'
  },
  {
    id: 4, category: 'DFA',
    q: 'The language L = {w ∈ {a,b}* | w starts with "ab"} — how many states does the minimal DFA have?',
    options: ['2', '3', '4', '5'],
    ans: 2,
    exp: 'States: q₀ (start), q₁ (seen "a"), q₂ (seen "ab" — accept with self loops), qd (dead/trap state). Total = 4 states.'
  },
  {
    id: 5, category: 'NFA',
    q: 'The key difference between NFA and DFA transition functions is:',
    options: [
      'NFA returns a SET of states; DFA returns exactly ONE state',
      'NFA uses only ε-transitions',
      'DFA can return empty set; NFA cannot',
      'NFA and DFA have identical transition functions'
    ],
    ans: 0,
    exp: 'NFA transition δ: Q × (Σ∪{ε}) → 𝒫(Q) returns a subset of Q (could be ∅, {q}, or multiple states). DFA δ: Q × Σ → Q returns exactly one state.'
  },
  {
    id: 6, category: 'NFA',
    q: 'An NFA accepts a string w if:',
    options: [
      'ALL computation paths end in an accept state',
      'AT LEAST ONE computation path ends in an accept state',
      'The LAST state reached is in F',
      'The start state is in F'
    ],
    ans: 1,
    exp: 'NFA accepts if at least one possible computation path leads to an accept state. Even if other paths reject, acceptance holds. This is the "existential" nature of non-determinism.'
  },
  {
    id: 7, category: 'NFA',
    q: 'ε-closure({q}) is:',
    options: [
      'The set of states reachable from q on input ε only (not q itself)',
      'The set of states reachable from q using zero or more ε-transitions (including q)',
      'All states in the NFA',
      'Only the states with ε-transitions'
    ],
    ans: 1,
    exp: 'ε-closure(q) always includes q itself, plus all states reachable by following ε-arrows. This is because taking zero ε-transitions is valid (you can stay in q).'
  },
  {
    id: 8, category: 'NFA',
    q: 'An NFA has n states. The equivalent DFA may have at most how many states?',
    options: ['n states', 'n² states', '2ⁿ states', 'n! states'],
    ans: 2,
    exp: 'The Subset Construction can produce at most 2ⁿ states (one per subset of Q). In practice, only reachable subsets are created, usually far fewer. This is called "exponential blowup."'
  },
  {
    id: 9, category: 'Conversion',
    q: 'In the Subset Construction algorithm, which NFA states correspond to DFA accept states?',
    options: [
      'Only subsets where ALL NFA states are accept states',
      'Only the singleton subset {F} where F is the NFA accept state',
      'Any subset that contains at least one NFA accept state',
      'The empty set ∅'
    ],
    ans: 2,
    exp: 'A DFA state (subset S) is accepting if S ∩ F ≠ ∅ — i.e., at least one of the NFA states in that subset is an accept state. This reflects the NFA acceptance condition.'
  },
  {
    id: 10, category: 'Conversion',
    q: 'After Subset Construction, the empty set ∅ (dead state) in the DFA is:',
    options: [
      'An accept state',
      'A non-accepting trap state — all transitions loop back to ∅',
      'Merged with the start state',
      'Removed from the DFA'
    ],
    ans: 1,
    exp: '∅ represents "the NFA has no active states" — a dead state. Since ∅ ∩ F = ∅, it is non-accepting. For any symbol a, MOVE(∅, a) = ∅, so all transitions from ∅ return to ∅.'
  },
  {
    id: 11, category: 'Conversion',
    q: 'NFA M has states {q₀, q₁, q₂}, alphabet {a}, start state q₀, accept {q₂}. Transitions: δ(q₀,a)={q₁}, δ(q₁,a)={q₂}, δ(q₂,a)=∅. How many reachable DFA states are there?',
    options: ['3', '4', '5', '8'],
    ans: 1,
    exp: 'Reachable subsets: {q₀} (start), {q₁} (from q₀ on a), {q₂} (from q₁ on a, accept!), ∅ (from q₂ on a). Total = 4 reachable states.'
  },
  {
    id: 12, category: 'Conversion',
    q: 'Which theorem guarantees that for every NFA there exists an equivalent DFA?',
    options: ['Pumping Lemma', 'Rabin-Scott Theorem (Subset Construction)', 'Myhill-Nerode Theorem', 'Rice\'s Theorem'],
    ans: 1,
    exp: 'The Rabin-Scott Powerset/Subset Construction theorem (1959) proves that NFAs and DFAs are equivalent in expressive power by constructively converting any NFA to an equivalent DFA.'
  },
  {
    id: 13, category: 'Pumping',
    q: 'The Pumping Lemma for regular languages states that for any string s ∈ L with |s| ≥ p, s = xyz where:',
    options: [
      '|y| ≥ 1, |xy| ≤ p, and ∀i≥0: xyⁱz ∈ L',
      '|x| ≥ 1, |xy| ≤ p, and ∀i≥1: xyⁱz ∈ L',
      '|y| ≥ 1, |yz| ≤ p, and ∀i≥0: xyⁱz ∈ L',
      '|y| ≥ 0, |xy| ≤ p, and ∀i≥1: xyⁱz ∈ L'
    ],
    ans: 0,
    exp: 'The three conditions are: (1) |y| ≥ 1 (y is non-empty), (2) |xy| ≤ p (within first p chars), (3) ∀i≥0: xyⁱz ∈ L (pumping any non-negative number of times stays in L, including i=0).'
  },
  {
    id: 14, category: 'Pumping',
    q: 'To prove L = {aⁿbⁿ | n≥0} is not regular using the Pumping Lemma, we typically choose s =',
    options: ['aᵖ', 'aᵖbᵖ', 'aᵖ⁺¹bᵖ', 'aᵖ⁻¹bᵖ⁻¹'],
    ans: 1,
    exp: 'We choose s = aᵖbᵖ ∈ L with |s| = 2p ≥ p. This forces |xy| ≤ p, making y consist only of a\'s. Pumping then breaks the a/b balance, giving a contradiction.'
  },
  {
    id: 15, category: 'Pumping',
    q: 'The Pumping Lemma is used to:',
    options: [
      'Prove a language IS regular',
      'Prove a language is NOT regular',
      'Convert NFA to DFA',
      'Minimize a DFA'
    ],
    ans: 1,
    exp: 'The Pumping Lemma is used only to prove languages are NOT regular (proof by contradiction). It cannot be used to prove a language IS regular — that requires constructing a DFA/NFA or using closure properties.'
  },
  {
    id: 16, category: 'Pumping',
    q: 'For the string s = aᵖbᵖ in the proof that {aⁿbⁿ} is not regular, why must y consist only of a\'s?',
    options: [
      'Because b\'s are not in the alphabet',
      'Because |xy| ≤ p, so xy lies entirely within the first p characters (all a\'s)',
      'Because y must be a single character',
      'Because the pumping length equals the number of b\'s'
    ],
    ans: 1,
    exp: 'Since s = aᵖbᵖ, the first p characters are all a\'s. The condition |xy| ≤ p means both x and y must fit within those first p characters. Therefore y = aᵏ for some k ≥ 1.'
  },
  {
    id: 17, category: 'DFA',
    q: 'A minimal DFA for the language L = ∅ (empty language, accepts nothing) has:',
    options: ['0 states', '1 state (non-accepting)', '2 states', 'Infinitely many states'],
    ans: 1,
    exp: 'The minimal DFA for ∅ has exactly 1 state: the start state q₀, which is non-accepting. For each input symbol, δ(q₀, a) = q₀ (self-loop). No string is ever accepted.'
  },
  {
    id: 18, category: 'NFA',
    q: 'Which of the following languages can be accepted by an NFA but NOT a DFA?',
    options: [
      'Strings ending in "ab"',
      'Strings with equal number of a\'s and b\'s',
      'Strings containing "bab" as substring',
      'None — every NFA language can also be accepted by a DFA'
    ],
    ans: 3,
    exp: 'By the Rabin-Scott theorem, every NFA can be converted to an equivalent DFA. They recognize exactly the same class of languages — Regular Languages. Strings with equal a\'s and b\'s is actually non-regular (needs PDA)!'
  },
  {
    id: 19, category: 'Conversion',
    q: 'During Subset Construction, if the NFA has 4 states, what is the MAXIMUM number of states the DFA could need?',
    options: ['4', '8', '12', '16'],
    ans: 3,
    exp: '2⁴ = 16 states (one for each subset of {q₀,q₁,q₂,q₃} including ∅). This is the worst case. In practice, many subsets are often unreachable.'
  },
  {
    id: 20, category: 'Pumping',
    q: 'Consider L = {aⁿbⁿ | n ≥ 1} and pumping length p. If we pump s = aᵖbᵖ with y = aᵏ (k≥1), what is xyⁱz for i=0?',
    options: ['aᵖbᵖ', 'aᵖ⁺ᵏbᵖ', 'aᵖ⁻ᵏbᵖ', 'aᵖbᵖ⁺ᵏ'],
    ans: 2,
    exp: 'xy⁰z = xz. Since s = xyz = aʲaᵏaᵖ⁻ʲ⁻ᵏbᵖ, xz = aʲaᵖ⁻ʲ⁻ᵏbᵖ = aᵖ⁻ᵏbᵖ. This has p-k a\'s and p b\'s — since k≥1, there are fewer a\'s than b\'s, so it\'s NOT in L.'
  }
];

function renderPractice() {
  quizState = {
    questions: [...QUESTIONS].sort(() => Math.random() - 0.5),
    current: 0, score: 0, answers: [], category: 'all', completed: false
  };

  return `
  <div class="topic-hero">
    <div class="topic-hero-inner">
      <div class="topic-hero-text">
        <div class="topic-tag">Module 04</div>
        <h1>Practice<br/><span style="color:var(--success)">Questions</span></h1>
        <p>Test your understanding with ${QUESTIONS.length} scored MCQs covering DFA, NFA, Subset Construction, and Pumping Lemma. Get instant explanations for each answer.</p>
      </div>
      <div class="topic-hero-meta">
        <span class="badge badge-success">${QUESTIONS.length} Questions</span>
        <span class="badge badge-primary">Scored</span>
        <span class="badge badge-accent">With Explanations</span>
      </div>
    </div>
  </div>

  <div class="topic-content">
    <div class="quiz-wrap" id="quiz-wrap">
      <div id="quiz-start-screen">
        <div class="card text-center" style="padding:48px;margin-bottom:24px">
          <div style="font-size:3rem;margin-bottom:16px">📝</div>
          <h2 style="font-size:1.6rem;font-weight:800;margin-bottom:12px">Ready to Test Your Knowledge?</h2>
          <p style="color:var(--text-secondary);margin-bottom:28px;font-size:0.95rem">
            ${QUESTIONS.length} multiple choice questions · Instant feedback · Detailed explanations
          </p>
          <div class="category-filter" style="justify-content:center;margin-bottom:24px" id="cat-filter">
            <button class="filter-btn active" onclick="setCategory('all',this)">All Topics</button>
            <button class="filter-btn" onclick="setCategory('DFA',this)">DFA</button>
            <button class="filter-btn" onclick="setCategory('NFA',this)">NFA</button>
            <button class="filter-btn" onclick="setCategory('Conversion',this)">Conversion</button>
            <button class="filter-btn" onclick="setCategory('Pumping',this)">Pumping Lemma</button>
          </div>
          <button class="btn btn-primary btn-lg" onclick="startQuiz()" id="start-btn">Start Quiz →</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          ${['DFA','NFA','Conversion','Pumping'].map(cat => {
            const count = QUESTIONS.filter(q => q.category === cat).length;
            return `<div class="card" style="text-align:center;padding:20px">
              <div style="font-size:1.8rem;font-weight:800;color:var(--primary-light);font-family:var(--font-mono)">${count}</div>
              <div style="color:var(--text-muted);font-size:0.82rem;margin-top:4px">${cat} Questions</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div id="quiz-main" style="display:none"></div>
    </div>
  </div>`;
}

function setCategory(cat, btn) {
  quizState.category = cat;
  document.querySelectorAll('#cat-filter .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const startBtn = document.getElementById('start-btn');
  const count = cat === 'all' ? QUESTIONS.length : QUESTIONS.filter(q => q.category === cat).length;
  startBtn.textContent = `Start Quiz (${count} Questions) →`;
}

function startQuiz() {
  let pool = quizState.category === 'all' ? [...QUESTIONS] : QUESTIONS.filter(q => q.category === quizState.category);
  pool = pool.sort(() => Math.random() - 0.5);
  quizState.questions = pool;
  quizState.current = 0;
  quizState.score = 0;
  quizState.answers = [];
  quizState.completed = false;

  document.getElementById('quiz-start-screen').style.display = 'none';
  document.getElementById('quiz-main').style.display = 'block';
  renderQuestion();
}

function renderQuestion() {
  const { questions, current, score } = quizState;
  const total = questions.length;
  const q = questions[current];
  const progress = ((current) / total) * 100;

  document.getElementById('quiz-main').innerHTML = `
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
    <div class="quiz-meta">
      <span class="quiz-counter">Question ${current + 1} of ${total}</span>
      <span class="badge badge-${q.category === 'DFA' ? 'primary' : q.category === 'NFA' ? 'accent' : q.category === 'Conversion' ? 'warning' : 'success'}">${q.category}</span>
      <span class="quiz-score-live">Score: ${score}/${current}</span>
    </div>
    <div class="question-card">
      <p class="question-text">${q.q}</p>
      <div class="options-list" id="options-list">
        ${q.options.map((opt, i) => `
          <button class="option-btn" id="opt-${i}" onclick="selectAnswer(${i})">
            <span class="option-letter">${String.fromCharCode(65+i)}</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <div class="explanation-box" id="exp-box">
        <h5>💡 Explanation</h5>
        <p>${q.exp}</p>
      </div>
    </div>
    <div id="quiz-next-wrap" style="display:none;text-align:right;margin-top:16px">
      ${current < total - 1
        ? `<button class="btn btn-primary" onclick="nextQuestion()">Next Question →</button>`
        : `<button class="btn btn-accent" onclick="showResults()">See Results →</button>`
      }
    </div>
  `;
}

function selectAnswer(chosen) {
  const q = quizState.questions[quizState.current];
  const correct = q.ans;
  quizState.answers.push({ chosen, correct: chosen === correct });
  if (chosen === correct) quizState.score++;

  // Disable all options
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen && chosen !== correct) btn.classList.add('selected-wrong');
  });

  document.getElementById('exp-box').classList.add('show');
  document.getElementById('quiz-next-wrap').style.display = 'block';
}

function nextQuestion() {
  quizState.current++;
  renderQuestion();
}

function showResults() {
  const { score, questions, answers } = quizState;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? '🏆 Excellent!' : pct >= 70 ? '🎯 Good Job!' : pct >= 50 ? '📚 Keep Studying' : '💪 Need More Practice';
  const gradeColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  const conic = `conic-gradient(${gradeColor} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`;

  document.getElementById('quiz-main').innerHTML = `
    <div class="results-screen">
      <div class="results-circle" style="background:${conic}">
        <div class="results-score">${score}/${total}</div>
      </div>
      <div class="results-grade" style="color:${gradeColor}">${grade}</div>
      <div class="results-msg">${pct}% · You answered ${score} out of ${total} questions correctly.</div>

      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:32px">
        ${['DFA','NFA','Conversion','Pumping'].map(cat => {
          const catQs = questions.filter((q,i) => q.category === cat);
          const catRight = catQs.filter((q,i) => {
            const globalIdx = questions.indexOf(q);
            return answers[globalIdx] && answers[globalIdx].correct;
          }).length;
          if (catQs.length === 0) return '';
          return `<div class="card" style="padding:16px 24px;text-align:center;min-width:120px">
            <div style="font-size:1.2rem;font-weight:700;font-family:var(--font-mono)">${catRight}/${catQs.length}</div>
            <div style="color:var(--text-muted);font-size:0.75rem">${cat}</div>
          </div>`;
        }).join('')}
      </div>

      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-lg" onclick="retryQuiz()">Try Again</button>
        <button class="btn btn-secondary btn-lg" onclick="navigate('home')">Back to Home</button>
        <button class="btn btn-accent btn-lg" onclick="reviewAnswers()">Review Answers</button>
      </div>
    </div>
  `;

  // Update nav score badge
  const navScore = document.getElementById('nav-score');
  const scoreBadge = document.getElementById('score-badge');
  if (navScore && scoreBadge) {
    navScore.style.display = 'block';
    scoreBadge.textContent = `${score}/${total}`;
  }
}

function retryQuiz() {
  document.getElementById('quiz-main').style.display = 'none';
  document.getElementById('quiz-start-screen').style.display = 'block';
  quizState.category = 'all';
  document.querySelectorAll('#cat-filter .filter-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  document.getElementById('start-btn').textContent = 'Start Quiz →';
}

function reviewAnswers() {
  const { questions, answers } = quizState;
  document.getElementById('quiz-main').innerHTML = `
    <div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <h3 style="font-size:1.2rem;font-weight:700">Answer Review</h3>
      <button class="btn btn-secondary btn-sm" onclick="showResults()">← Back to Results</button>
    </div>
    ${questions.map((q, i) => {
      const a = answers[i];
      const correct = a && a.correct;
      return `<div class="card" style="margin-bottom:16px;border-left:3px solid ${correct ? 'var(--success)' : 'var(--danger)'}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <span class="badge badge-${q.category === 'DFA' ? 'primary' : q.category === 'NFA' ? 'accent' : 'success'}">${q.category}</span>
          <span style="color:${correct ? 'var(--success)' : 'var(--danger)'};">${correct ? '✓ Correct' : '✗ Incorrect'}</span>
        </div>
        <p style="margin:12px 0 8px;font-size:0.9rem;font-weight:600;color:var(--text-primary)">${q.q}</p>
        <p style="font-size:0.85rem;color:var(--text-muted)">Your answer: <strong style="color:${correct ? 'var(--success)' : 'var(--danger)'}">${a !== undefined ? q.options[a.chosen] : 'No answer'}</strong></p>
        ${!correct ? `<p style="font-size:0.85rem;color:var(--text-muted)">Correct: <strong style="color:var(--success)">${q.options[q.ans]}</strong></p>` : ''}
        <div class="explanation-box show" style="margin-top:12px">
          <h5>💡 Explanation</h5>
          <p>${q.exp}</p>
        </div>
      </div>`;
    }).join('')}
    <div style="text-align:center;margin-top:24px">
      <button class="btn btn-primary" onclick="retryQuiz()">Try Again</button>
    </div>
  `;
}

// ===== EVENT BINDERS =====
function bindPageEvents(page) {
  if (page === 'conversion') {
    setTimeout(() => renderConvStep(), 50);
  }
  if (page === 'pumping') {
    setTimeout(() => updatePump(2), 50);
  }
}

// ===== SHARED UI FUNCTIONS =====
function switchTab(btn, tabId) {
  const container = btn.closest('.tab-container');
  container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function toggleAcc(header) {
  const item = header.parentElement;
  const body = item.querySelector('.acc-body');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.acc-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.acc-body').style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

window.switchTab = switchTab;
window.toggleAcc = toggleAcc;
window.selectAnswer = selectAnswer;
window.nextQuestion = nextQuestion;
window.showResults = showResults;
window.retryQuiz = retryQuiz;
window.reviewAnswers = reviewAnswers;
window.startQuiz = startQuiz;
window.setCategory = setCategory;
window.updatePump = updatePump;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();

  // Hash-based routing
  const hash = window.location.hash.slice(1) || 'home';
  const validPages = ['home', 'dfa-nfa', 'conversion', 'pumping', 'practice'];
  navigate(validPages.includes(hash) ? hash : 'home', false);

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').style.boxShadow =
      window.scrollY > 20 ? '0 4px 32px rgba(0,0,0,0.4)' : 'none';
  });
});
