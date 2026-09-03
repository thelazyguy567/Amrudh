/* ============================================================
   AutomataLearn — Studio Panels
   Per-mode panel HTML and logic for each studio mode
   ============================================================ */

// ===== DFA BUILDER PANEL =====
window.renderDFAPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">🤖</div>
      <div class="panel-info-text">
        <strong>DFA Builder</strong> — Every state must have <em>exactly one</em> transition for each alphabet symbol. Build your DFA on the canvas above, then validate and test strings.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runDFAValidation()">✓ Validate DFA</button>
      <button class="btn btn-outline btn-sm" onclick="undoCanvas()">↶ Undo</button>
      <button class="btn btn-outline btn-sm" onclick="redoCanvas()">↷ Redo</button>
      <button class="btn btn-ghost btn-sm" onclick="exportAutomaton()">📤 Export</button>
      <button class="btn btn-ghost btn-sm" onclick="importAutomaton()">📥 Import</button>
      <button class="btn btn-ghost btn-sm" onclick="saveToLocal()">💾 Save</button>
      <button class="btn btn-ghost btn-sm" onclick="loadFromLocal()">📂 Load</button>
    </div>

    <div id="dfa-validation-output" class="validation-output"></div>

    <div class="panel-section">
      <h4 class="panel-section-title">🧪 Test String</h4>
      <div class="test-string-row">
        <input type="text" class="sim-input" id="dfa-test-input" placeholder="Enter string to test (e.g. 1011)" maxlength="50"/>
        <button class="btn btn-accent btn-sm" onclick="runDFATest()">▶ Run</button>
        <button class="btn btn-ghost btn-sm" onclick="stepDFATest(-1)">⟲ Reset</button>
        <button class="btn btn-ghost btn-sm" onclick="stepDFATest(1)">Next →</button>
      </div>
      <div id="dfa-test-result" class="sim-result idle">Enter a string and click Run to test</div>
      <div id="dfa-test-trace" class="sim-trace"></div>
    </div>

    <details class="how-it-works">
      <summary>📖 How DFA Works</summary>
      <div class="how-content">
        <p>A <strong>Deterministic Finite Automaton (DFA)</strong> is a 5-tuple M = (Q, Σ, δ, q₀, F) where:</p>
        <ul>
          <li><strong>Q</strong> — finite set of states</li>
          <li><strong>Σ</strong> — input alphabet</li>
          <li><strong>δ: Q × Σ → Q</strong> — transition function (exactly one next state)</li>
          <li><strong>q₀ ∈ Q</strong> — start state</li>
          <li><strong>F ⊆ Q</strong> — set of accept states</li>
        </ul>
        <p>A string w is <strong>accepted</strong> if processing each character from q₀ ends in a state in F.</p>
      </div>
    </details>
  </div>`;
};

window.runDFAValidation = function() {
  const errors = validateDFA();
  const out = document.getElementById('dfa-validation-output');
  if (!out) return;
  out.innerHTML = errors.map(e => `
    <div class="validation-item validation-${e.type}">
      <span class="validation-icon">${e.type === 'error' ? '✗' : e.type === 'warning' ? '⚠' : '✓'}</span>
      <span>${e.msg}</span>
    </div>
  `).join('');
};

window.runDFATest = function() {
  const input = document.getElementById('dfa-test-input');
  if (!input) return;
  const str = input.value;

  // Use the existing simulation engine
  cvSimTrace = buildSimTrace(str);
  cvSimStep = -1;

  const result = document.getElementById('dfa-test-result');
  const trace = document.getElementById('dfa-test-trace');

  if (!cvSimTrace.length) {
    if (result) { result.className = 'sim-result idle'; result.textContent = 'No simulation (check start state)'; }
    return;
  }

  const last = cvSimTrace[cvSimTrace.length - 1];
  const accepted = !last.dead && cvStates.find(s => s.id === last.id)?.isAccept;

  if (result) {
    result.className = `sim-result ${accepted ? 'accept' : 'reject'}`;
    result.textContent = accepted ? `"${str}" → ACCEPT ✓` : `"${str}" → REJECT ✗`;
  }
  if (trace) {
    trace.innerHTML = `<strong>Trace:</strong> ` + cvSimTrace.map((t, i) =>
      `<span class="trace-state">${t.label}</span>`
    ).join(' → ');
  }
  renderCanvas();
};

window.stepDFATest = function(dir) {
  stepSim(dir);
  // Also update our panel's trace display
  const trace = document.getElementById('dfa-test-trace');
  if (trace && cvSimTrace.length) {
    trace.innerHTML = `<strong>Trace:</strong> ` + cvSimTrace.map((t, i) =>
      i === cvSimStep ? `<strong style="color:var(--warning)">[${t.label}]</strong>` : `<span class="trace-state">${t.label}</span>`
    ).join(' → ');
  }
};

// ===== NFA BUILDER PANEL =====
window.renderNFAPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">🔀</div>
      <div class="panel-info-text">
        <strong>NFA Builder</strong> — States may have <em>multiple transitions</em> for the same symbol, or none at all. A string is accepted if <em>at least one</em> computation path reaches an accept state.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runNFAValidation()">✓ Validate NFA</button>
      <button class="btn btn-outline btn-sm" onclick="undoCanvas()">↶ Undo</button>
      <button class="btn btn-outline btn-sm" onclick="redoCanvas()">↷ Redo</button>
      <button class="btn btn-ghost btn-sm" onclick="exportAutomaton()">📤 Export</button>
      <button class="btn btn-ghost btn-sm" onclick="importAutomaton()">📥 Import</button>
    </div>

    <div id="nfa-validation-output" class="validation-output"></div>

    <div class="panel-section">
      <h4 class="panel-section-title">🧪 Test String (NFA Simulation)</h4>
      <div class="test-string-row">
        <input type="text" class="sim-input" id="nfa-test-input" placeholder="Enter string to test" maxlength="50"/>
        <button class="btn btn-accent btn-sm" onclick="runNFATest()">▶ Run</button>
      </div>
      <div id="nfa-test-result" class="sim-result idle">Enter a string and click Run to test</div>
      <div id="nfa-test-trace" class="sim-trace"></div>
    </div>

    <details class="how-it-works">
      <summary>📖 How NFA Works</summary>
      <div class="how-content">
        <p>A <strong>Non-deterministic Finite Automaton (NFA)</strong> differs from a DFA:</p>
        <ul>
          <li><strong>δ: Q × Σ → 𝒫(Q)</strong> — returns a <em>set</em> of possible next states</li>
          <li>A state may have <strong>0, 1, or many</strong> transitions for a symbol</li>
          <li>The NFA runs <strong>all possible paths in parallel</strong></li>
          <li>A string is <strong>accepted</strong> if at least one path ends in an accept state</li>
        </ul>
      </div>
    </details>
  </div>`;
};

window.runNFAValidation = function() {
  const errors = validateNFA();
  const out = document.getElementById('nfa-validation-output');
  if (!out) return;
  out.innerHTML = errors.map(e => `
    <div class="validation-item validation-${e.type}">
      <span class="validation-icon">${e.type === 'error' ? '✗' : e.type === 'warning' ? '⚠' : '✓'}</span>
      <span>${e.msg}</span>
    </div>
  `).join('');
};

window.runNFATest = function() {
  const input = document.getElementById('nfa-test-input');
  if (!input) return;
  const str = input.value;
  const sim = simulateNFA(str);

  const result = document.getElementById('nfa-test-result');
  const trace = document.getElementById('nfa-test-trace');

  if (result) {
    result.className = `sim-result ${sim.accepted ? 'accept' : 'reject'}`;
    result.textContent = sim.accepted ? `"${str}" → ACCEPT ✓` : `"${str}" → REJECT ✗`;
  }

  if (trace && sim.steps.length) {
    trace.innerHTML = `<strong>NFA Trace (parallel states):</strong><br>` +
      sim.steps.map((step, i) => {
        const labels = step.states.map(sid => {
          const s = cvStates.find(st => st.id === sid);
          return s ? s.label : `q${sid}`;
        });
        const prefix = step.symbol ? `<span class="trace-symbol">─${step.symbol}→</span> ` : '<span class="trace-symbol">Start:</span> ';
        return `${prefix}{${labels.join(', ') || '∅'}}`;
      }).join('<br>');
  }
};

// ===== ε-NFA BUILDER PANEL =====
window.renderENFAPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon" style="font-size:1.5rem;font-style:italic;font-family:var(--font-mono)">ε</div>
      <div class="panel-info-text">
        <strong>ε-NFA Builder</strong> — Includes all NFA features plus <em>epsilon (ε) transitions</em> that change state without consuming input. Use the symbol <code>ε</code> when adding transitions.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runNFAValidation()">✓ Validate ε-NFA</button>
      <button class="btn btn-accent btn-sm" onclick="showEpsilonClosures()">ε-closure</button>
      <button class="btn btn-outline btn-sm" onclick="undoCanvas()">↶ Undo</button>
      <button class="btn btn-outline btn-sm" onclick="redoCanvas()">↷ Redo</button>
      <button class="btn btn-ghost btn-sm" onclick="exportAutomaton()">📤 Export</button>
      <button class="btn btn-ghost btn-sm" onclick="importAutomaton()">📥 Import</button>
    </div>

    <div id="nfa-validation-output" class="validation-output"></div>
    <div id="enfa-closures" class="closures-display"></div>

    <div class="panel-section">
      <h4 class="panel-section-title">🧪 Test String (ε-NFA Simulation)</h4>
      <div class="test-string-row">
        <input type="text" class="sim-input" id="nfa-test-input" placeholder="Enter string to test" maxlength="50"/>
        <button class="btn btn-accent btn-sm" onclick="runNFATest()">▶ Run</button>
      </div>
      <div id="nfa-test-result" class="sim-result idle">Enter a string and click Run to test</div>
      <div id="nfa-test-trace" class="sim-trace"></div>
    </div>

    <div class="callout callout-blue">
      <span class="callout-icon">💡</span>
      <div class="callout-body">
        <h4>Adding ε-Transitions</h4>
        <p>Select the <strong>→ Transition</strong> tool, click two states, and enter <code>ε</code> (or type the letter <code>e</code>) as the symbol. The ε-closure will be computed automatically during simulation.</p>
      </div>
    </div>

    <details class="how-it-works">
      <summary>📖 How ε-NFA Works</summary>
      <div class="how-content">
        <p>An <strong>ε-NFA</strong> extends the NFA with epsilon transitions:</p>
        <ul>
          <li><strong>ε-transition</strong>: moves to another state <em>without</em> consuming an input symbol</li>
          <li><strong>ε-closure(q)</strong>: set of all states reachable from q via ε-transitions (including q itself)</li>
          <li>Simulation: Start with ε-closure({q₀}). For each input symbol, find transitions then take ε-closure again.</li>
        </ul>
      </div>
    </details>
  </div>`;
};

window.showEpsilonClosures = function() {
  const closures = computeEpsilonClosures();
  const out = document.getElementById('enfa-closures');
  if (!out) return;

  const hasEps = cvTransitions.some(t => t.symbol === 'ε' || t.symbol === 'ϵ');
  if (!hasEps) {
    out.innerHTML = '<div class="validation-item validation-warning"><span class="validation-icon">⚠</span><span>No ε-transitions found. Add transitions with symbol "ε".</span></div>';
    return;
  }

  out.innerHTML = `
    <div class="closures-card">
      <h4 class="panel-section-title">ε-Closures</h4>
      <div class="closures-grid">
        ${cvStates.map(s => {
          const cl = closures[s.id] || [s.id];
          const labels = cl.map(id => { const st = cvStates.find(x => x.id === id); return st ? st.label : `q${id}`; });
          const expanded = cl.length > 1;
          return `<div class="closure-item ${expanded ? 'expanded' : ''}">
            <span class="closure-state">${s.label}</span>
            <span class="closure-arrow">→</span>
            <span class="closure-set">{${labels.join(', ')}}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
};

// ===== DFA MINIMIZATION PANEL =====
window.renderMinimizePanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">📉</div>
      <div class="panel-info-text">
        <strong>DFA Minimization</strong> — Use the Regex generator above to create a DFA, or build one manually, then minimize it using Hopcroft's partition refinement algorithm.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runRealMinimize()">📉 Minimize DFA</button>
      <button class="btn btn-outline btn-sm" onclick="runDFAValidation()">✓ Validate First</button>
    </div>

    <div id="minimize-output" class="validation-output"></div>

    <details class="how-it-works">
      <summary>📖 How Minimization Works</summary>
      <div class="how-content">
        <p><strong>Hopcroft's Algorithm</strong> partitions states into equivalence classes:</p>
        <ol>
          <li>Initial partition: {accepting states} and {non-accepting states}</li>
          <li>For each partition group and each symbol, check if all states in the group transition to the same partition</li>
          <li>If not, split the group</li>
          <li>Repeat until no more splits occur</li>
          <li>Each final partition group becomes one state in the minimized DFA</li>
        </ol>
      </div>
    </details>
  </div>`;
};

window.runRealMinimize = function() {
  const out = document.getElementById('minimize-output');
  if (!out) return;

  const errors = validateDFA();
  const hasError = errors.some(e => e.type === 'error');
  if (hasError) {
    out.innerHTML = '<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>DFA must be valid before minimization. Fix errors first.</span></div>';
    return;
  }

  const alphabet = detectAlphabet();
  const acceptStates = cvStates.filter(s => s.isAccept);
  const nonAcceptStates = cvStates.filter(s => !s.isAccept);

  // Hopcroft partition refinement
  let partitions = [];
  if (acceptStates.length > 0) partitions.push(acceptStates.map(s => s.id));
  if (nonAcceptStates.length > 0) partitions.push(nonAcceptStates.map(s => s.id));

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 100) {
    changed = false;
    iterations++;
    const newPartitions = [];

    partitions.forEach(group => {
      if (group.length <= 1) { newPartitions.push(group); return; }

      const subgroups = {};
      group.forEach(sid => {
        const sig = alphabet.map(sym => {
          const t = cvTransitions.find(tr => tr.from === sid && tr.symbol === sym);
          if (!t) return -1;
          return partitions.findIndex(p => p.includes(t.to));
        }).join(',');

        if (!subgroups[sig]) subgroups[sig] = [];
        subgroups[sig].push(sid);
      });

      const parts = Object.values(subgroups);
      if (parts.length > 1) changed = true;
      parts.forEach(p => newPartitions.push(p));
    });

    partitions = newPartitions;
  }

  const originalCount = cvStates.length;
  const minimizedCount = partitions.length;
  const removed = originalCount - minimizedCount;

  let html = `<div class="validation-item validation-success">
    <span class="validation-icon">✓</span>
    <span>Minimization complete! ${originalCount} states → ${minimizedCount} states (${removed} removed)</span>
  </div>`;

  html += `<div class="minimize-partitions"><h4 class="panel-section-title">Equivalence Classes</h4>`;
  partitions.forEach((group, i) => {
    const labels = group.map(id => { const s = cvStates.find(st => st.id === id); return s ? s.label : `q${id}`; });
    const isAccept = group.some(id => cvStates.find(s => s.id === id)?.isAccept);
    html += `<div class="partition-item">
      <span class="partition-label">P${i}</span>
      <span class="partition-set">{${labels.join(', ')}}</span>
      ${isAccept ? '<span class="badge badge-success" style="font-size:.65rem">Accept</span>' : ''}
    </div>`;
  });
  html += `</div>`;

  if (removed > 0) {
    html += `<button class="btn btn-accent btn-sm mt-16" onclick="applyMinimization()">Apply Minimized DFA to Canvas</button>`;

    // Store partition data for apply
    window._minPartitions = partitions;
  }

  out.innerHTML = html;

  if (window.journeyEngine) {
    window.journeyEngine.recordActivity('minimization', 'builder');
    window.journeyEngine.recordActivity('minimization', 'test');
    window.journeyEngine.unlockAchievement('minimization_master');
  }
};

window.applyMinimization = function() {
  if (!window._minPartitions) return;
  const partitions = window._minPartitions;
  const alphabet = detectAlphabet();

  saveSnapshot();

  const newStates = [];
  const newTransitions = [];
  const partMap = {};

  partitions.forEach((group, i) => {
    group.forEach(sid => { partMap[sid] = i; });
    const rep = cvStates.find(s => s.id === group[0]);
    const isAccept = group.some(id => cvStates.find(s => s.id === id)?.isAccept);
    newStates.push({
      id: i,
      x: 120 + i * 160,
      y: 180,
      isAccept,
      label: group.length === 1 ? (rep?.label || `q${i}`) : `P${i}`
    });
  });

  alphabet.forEach(sym => {
    const seen = new Set();
    partitions.forEach((group, i) => {
      const rep = group[0];
      const t = cvTransitions.find(tr => tr.from === rep && tr.symbol === sym);
      if (t) {
        const targetPartition = partMap[t.to];
        const key = `${i}-${targetPartition}-${sym}`;
        if (!seen.has(key)) {
          seen.add(key);
          newTransitions.push({ from: i, to: targetPartition, symbol: sym });
        }
      }
    });
  });

  const startPartition = partMap[cvStart];
  cvStates = newStates;
  cvTransitions = newTransitions;
  cvStart = startPartition ?? 0;
  cvStateId = newStates.length;
  cvSimStep = -1; cvSimTrace = [];
  renderCanvas();

  const hint = document.getElementById('mode-hint');
  if (hint) hint.textContent = '✓ Minimized DFA applied to canvas!';
};

// ===== DFA → NFA PANEL =====
window.renderDFA2NFAPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">➡️</div>
      <div class="panel-info-text">
        <strong>DFA → NFA Conversion</strong> — Every DFA is already a special case of an NFA. This demonstrates how DFA transitions map directly to NFA transitions.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runDFA2NFA()">🔄 Convert to NFA</button>
    </div>

    <div id="dfa2nfa-output" class="conversion-output"></div>

    <details class="how-it-works">
      <summary>📖 Why Every DFA is an NFA</summary>
      <div class="how-content">
        <p>A DFA is a <strong>special case</strong> of an NFA where:</p>
        <ul>
          <li>DFA: δ(q, a) → exactly <strong>one</strong> state</li>
          <li>NFA: δ(q, a) → <strong>set</strong> of states (can be a singleton set)</li>
        </ul>
        <p>Every DFA transition δ(q, a) = p can be written as the NFA transition δ(q, a) = {p}. The languages recognized are identical.</p>
      </div>
    </details>
  </div>`;
};

window.runDFA2NFA = function() {
  const out = document.getElementById('dfa2nfa-output');
  if (!out) return;

  if (!cvStates.length) {
    out.innerHTML = '<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>Build a DFA on the canvas first.</span></div>';
    return;
  }

  const alphabet = detectAlphabet();

  // Build comparison table
  let html = `
  <div class="conversion-comparison">
    <div class="comparison-side">
      <h4>🤖 Original DFA</h4>
      <div class="table-wrap"><table>
        <thead><tr><th>State</th>${alphabet.map(a => `<th>${a}</th>`).join('')}<th>Accept?</th></tr></thead>
        <tbody>
          ${cvStates.map(s => {
            const isStart = s.id === cvStart;
            return `<tr>
              <td>${isStart ? '→ ' : ''}${s.label}</td>
              ${alphabet.map(sym => {
                const t = cvTransitions.find(tr => tr.from === s.id && tr.symbol === sym);
                const target = t ? cvStates.find(st => st.id === t.to) : null;
                return `<td>${target ? target.label : '—'}</td>`;
              }).join('')}
              <td>${s.isAccept ? '✓ Yes' : 'No'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
    <div class="comparison-arrow">≡</div>
    <div class="comparison-side">
      <h4>🔀 Equivalent NFA</h4>
      <div class="table-wrap"><table>
        <thead><tr><th>State</th>${alphabet.map(a => `<th>${a}</th>`).join('')}<th>Accept?</th></tr></thead>
        <tbody>
          ${cvStates.map(s => {
            const isStart = s.id === cvStart;
            return `<tr>
              <td>${isStart ? '→ ' : ''}${s.label}</td>
              ${alphabet.map(sym => {
                const t = cvTransitions.find(tr => tr.from === s.id && tr.symbol === sym);
                const target = t ? cvStates.find(st => st.id === t.to) : null;
                return `<td>${target ? `{${target.label}}` : '{}'}</td>`;
              }).join('')}
              <td>${s.isAccept ? '✓ Yes' : 'No'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>
    </div>
  </div>

  <div class="callout callout-green mt-16">
    <span class="callout-icon">💡</span>
    <div class="callout-body">
      <p>The NFA is structurally identical to the DFA. Each DFA transition <code>δ(q, a) = p</code> becomes the NFA transition <code>δ(q, a) = {p}</code>. The behavior and accepted language are exactly the same.</p>
    </div>
  </div>`;

  out.innerHTML = html;
};

// ===== NFA → DFA PANEL =====
window.renderNFA2DFAPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">🔄</div>
      <div class="panel-info-text">
        <strong>NFA → DFA Conversion</strong> — Subset Construction algorithm. Build an NFA on the canvas, then convert it to an equivalent DFA step by step.
      </div>
    </div>

    <div class="panel-actions-row">
      <button class="btn btn-primary btn-sm" onclick="runNFA2DFA()">🔄 Convert NFA → DFA</button>
      <button class="btn btn-accent btn-sm" onclick="applyConvertedDFA()">Apply DFA to Canvas</button>
    </div>

    <div id="nfa2dfa-output" class="conversion-output"></div>

    <details class="how-it-works">
      <summary>📖 Subset Construction Algorithm</summary>
      <div class="how-content">
        <ol>
          <li>DFA start state = ε-closure({q₀})</li>
          <li>For each DFA state S and each symbol a ∈ Σ: next = ε-closure(MOVE(S, a))</li>
          <li>If next is a new subset → add as new DFA state</li>
          <li>Repeat until no new subsets</li>
          <li>Accept states = subsets S where S ∩ F_NFA ≠ ∅</li>
        </ol>
        <p>An NFA with n states can produce at most 2ⁿ DFA states (worst case).</p>
      </div>
    </details>
  </div>`;
};

window._convertedDFA = null;

window.runNFA2DFA = function() {
  const out = document.getElementById('nfa2dfa-output');
  if (!out) return;

  if (!cvStates.length) {
    out.innerHTML = '<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>Build an NFA on the canvas first.</span></div>';
    return;
  }

  const result = subsetConstruction();
  if (result.error) {
    out.innerHTML = `<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>${result.error}</span></div>`;
    return;
  }

  window._convertedDFA = result;

  // Step-by-step display
  let html = `<div class="conversion-steps">
    <h4 class="panel-section-title">Step-by-Step Subset Construction</h4>
    ${result.steps.map((step, i) => `
      <div class="conv-step">
        <div class="conv-step-num">${i + 1}</div>
        <div class="conv-step-body">
          <strong>${step.title}</strong>
          <div class="conv-step-note">${step.note}</div>
        </div>
      </div>
    `).join('')}
  </div>`;

  // Transition table
  html += `<div class="panel-section mt-16">
    <h4 class="panel-section-title">Generated DFA Transition Table</h4>
    <div class="table-wrap"><table>
      <thead><tr><th>DFA State</th>${result.alphabet.map(a => `<th>${a}</th>`).join('')}<th>Accept?</th></tr></thead>
      <tbody>
        ${result.dfaStates.map(ds => {
          const isStart = ds.id === result.dfaStart;
          return `<tr>
            <td class="${isStart ? 'state-current' : ''}">${isStart ? '→ ' : ''}${ds.label}</td>
            ${result.alphabet.map(sym => {
              const t = result.dfaTransitions.find(tr => tr.from === ds.id && tr.symbol === sym);
              const target = t ? result.dfaStates.find(s => s.id === t.to) : null;
              return `<td>${target ? target.label : '—'}</td>`;
            }).join('')}
            <td class="${ds.isAccept ? 'state-accept' : 'state-reject'}">${ds.isAccept ? '✓ Yes' : 'No'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>`;

  html += `<div class="validation-item validation-success mt-16">
    <span class="validation-icon">✓</span>
    <span>Conversion complete! NFA (${cvStates.length} states) → DFA (${result.dfaStates.length} states). Alphabet: {${result.alphabet.join(', ')}}.</span>
  </div>`;

  out.innerHTML = html;
};

window.applyConvertedDFA = function() {
  if (!window._convertedDFA) {
    alert('Run the conversion first!');
    return;
  }

  const result = window._convertedDFA;
  saveSnapshot();

  cvStates = result.dfaStates.map((ds, i) => ({
    id: ds.id,
    x: 120 + (i % 5) * 160,
    y: 120 + Math.floor(i / 5) * 140,
    isAccept: ds.isAccept,
    label: ds.label
  }));

  cvTransitions = result.dfaTransitions.map(t => ({ from: t.from, to: t.to, symbol: t.symbol }));
  cvStart = result.dfaStart;
  cvStateId = result.dfaStates.length;
  cvSimStep = -1; cvSimTrace = [];
  renderCanvas();

  const hint = document.getElementById('mode-hint');
  if (hint) hint.textContent = '✓ Converted DFA applied to canvas!';

  // Switch to DFA mode
  switchStudioMode('dfa');
};

// ===== PUMPING LEMMA PANEL =====
window.renderPumpingPanel = function() {
  return `
  <div class="mode-panel-content">
    <div class="panel-info-bar">
      <div class="panel-info-icon">🧪</div>
      <div class="panel-info-text">
        <strong>Pumping Lemma Builder & Practice</strong> — Prove languages are NOT regular using the Pumping Lemma. Choose a language, decompose strings, and verify the pumping conditions.
      </div>
    </div>

    <div class="tab-bar" id="pumping-tabs">
      <button class="tab-btn active" onclick="switchTab('pumping-tabs','pump-builder-pane',this)">🔬 Builder</button>
      <button class="tab-btn" onclick="switchTab('pumping-tabs','pump-practice-pane',this)">📝 Practice</button>
    </div>

    <!-- BUILDER TAB -->
    <div class="tab-pane active" id="pump-builder-pane">
      <div class="pump-builder-section">
        <h4 class="panel-section-title">1. Select Language</h4>
        <div class="pump-lang-grid">
          ${Object.entries(PUMPING_LANGUAGES).map(([key, lang]) => `
            <button class="pump-lang-btn" data-lang="${key}" onclick="selectPumpingLang('${key}')">
              <strong>${lang.name}</strong>
              <span>${lang.description}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div id="pump-builder-workspace" class="pump-workspace" style="display:none">
        <h4 class="panel-section-title">2. Set Pumping Length & String</h4>
        <div class="pump-controls">
          <label>Pumping length p = <input type="number" id="pump-p" class="sim-input" value="3" min="1" max="20" style="width:70px" onchange="updatePumpBuilder()"/></label>
          <label>String w = <input type="text" id="pump-w" class="sim-input" style="width:200px" readonly/></label>
          <span id="pump-w-len" class="text-muted" style="font-size:.8rem"></span>
        </div>

        <h4 class="panel-section-title mt-16">3. Decompose w = xyz</h4>
        <div class="pump-decompose">
          <div class="pump-slider-section">
            <label>|x| = <input type="number" id="pump-x-len" class="sim-input" value="0" min="0" style="width:60px" onchange="updateDecomposition()"/></label>
            <label>|y| = <input type="number" id="pump-y-len" class="sim-input" value="1" min="1" style="width:60px" onchange="updateDecomposition()"/></label>
          </div>
          <div id="pump-decompose-visual" class="pump-string"></div>
          <div id="pump-conditions" class="pump-conditions"></div>
        </div>

        <h4 class="panel-section-title mt-16">4. Pump with i = </h4>
        <div class="pump-i-selector">
          ${[0,1,2,3,4].map(i => `<button class="pump-i-btn ${i === 0 ? 'active' : ''}" onclick="setPumpI(${i})">${i}</button>`).join('')}
          <input type="number" id="pump-custom-i" class="sim-input" value="0" min="0" max="20" style="width:60px" onchange="setPumpI(parseInt(this.value))"/>
        </div>

        <div id="pump-result" class="pump-result mt-16"></div>
      </div>
    </div>

    <!-- PRACTICE TAB -->
    <div class="tab-pane" id="pump-practice-pane">
      <div class="pump-practice-section">
        <h4 class="panel-section-title">Pumping Lemma Practice Problems</h4>
        <p class="content-p">For each language, determine if it is regular or non-regular. If non-regular, find a decomposition that leads to a contradiction.</p>

        <div class="practice-problems">
          ${buildPracticeProblem(1, 'L = { aⁿbⁿ | n ≥ 0 }', 'not-regular', 'The number of a\'s must equal the number of b\'s, requiring unbounded counting → NOT regular.')}
          ${buildPracticeProblem(2, 'L = { aⁿbᵐ | n, m ≥ 0 }', 'regular', 'This is simply a*b* which is a regular expression → REGULAR.')}
          ${buildPracticeProblem(3, 'L = { ww | w ∈ {0,1}* }', 'not-regular', 'Matching the first and second halves requires unbounded memory → NOT regular.')}
          ${buildPracticeProblem(4, 'L = { aⁿ | n is prime }', 'not-regular', 'Prime number testing cannot be done by a finite automaton → NOT regular.')}
          ${buildPracticeProblem(5, 'L = { w ∈ {a,b}* | |w| is even }', 'regular', 'Can be recognized by a 2-state DFA (toggle between even/odd length) → REGULAR.')}
        </div>
      </div>

      <div class="callout callout-blue mt-24">
        <span class="callout-icon">📚</span>
        <div class="callout-body">
          <h4>Proof Strategy Reminder</h4>
          <p>To prove a language is <strong>NOT regular</strong> using the Pumping Lemma:<br>
          1. <strong>Assume</strong> L is regular (for contradiction)<br>
          2. Then ∃ pumping length p<br>
          3. <strong>Choose</strong> a string w ∈ L with |w| ≥ p<br>
          4. For <strong>every</strong> decomposition w = xyz (with |xy| ≤ p, |y| ≥ 1)<br>
          5. <strong>Find</strong> an i ≥ 0 such that xyⁱz ∉ L<br>
          6. <strong>Contradiction</strong> → L is not regular ∎</p>
        </div>
      </div>
    </div>
  </div>`;
};

function buildPracticeProblem(num, langStr, answer, explanation) {
  return `
    <div class="practice-problem">
      <div class="practice-header">
        <span class="badge badge-accent">Problem ${num}</span>
        <strong>${langStr}</strong>
      </div>
      <div class="practice-choices">
        <button class="btn btn-outline btn-sm" onclick="checkPractice(${num}, 'regular', '${answer}', this)">Regular ✓</button>
        <button class="btn btn-outline btn-sm" onclick="checkPractice(${num}, 'not-regular', '${answer}', this)">Not Regular ✗</button>
      </div>
      <div id="practice-result-${num}" class="practice-result"></div>
    </div>`;
}

window.checkPractice = function(num, choice, answer, btn) {
  const out = document.getElementById(`practice-result-${num}`);
  if (!out) return;
  const correct = choice === answer;

  // Disable buttons
  const parent = btn.parentElement;
  parent.querySelectorAll('button').forEach(b => {
    b.disabled = true;
    if ((b.textContent.includes('Regular ✓') && answer === 'regular') ||
        (b.textContent.includes('Not Regular ✗') && answer === 'not-regular')) {
      b.classList.add('correct-answer');
    }
  });

  if (correct) {
    out.innerHTML = `<div class="validation-item validation-success"><span class="validation-icon">✓</span><span>Correct!</span></div>`;
  } else {
    // Find the explanation from the function call context
    const problems = {
      1: 'The number of a\'s must equal the number of b\'s, requiring unbounded counting → NOT regular.',
      2: 'This is simply a*b* which is a regular expression → REGULAR.',
      3: 'Matching the first and second halves requires unbounded memory → NOT regular.',
      4: 'Prime number testing cannot be done by a finite automaton → NOT regular.',
      5: 'Can be recognized by a 2-state DFA (toggle between even/odd length) → REGULAR.'
    };
    out.innerHTML = `<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>Incorrect. ${problems[num] || ''}</span></div>`;
  }
};

// Pumping Lemma Builder Logic
let pumpState = { lang: null, p: 3, xLen: 0, yLen: 1, pumpI: 0 };

window.selectPumpingLang = function(langKey) {
  pumpState.lang = langKey;
  const lang = PUMPING_LANGUAGES[langKey];
  if (!lang) return;

  // Highlight selected button
  document.querySelectorAll('.pump-lang-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.pump-lang-btn[data-lang="${langKey}"]`)?.classList.add('active');

  // Show workspace
  const ws = document.getElementById('pump-builder-workspace');
  if (ws) ws.style.display = 'block';

  pumpState.p = 3;
  document.getElementById('pump-p').value = 3;
  updatePumpBuilder();
};

window.updatePumpBuilder = function() {
  const lang = PUMPING_LANGUAGES[pumpState.lang];
  if (!lang) return;

  pumpState.p = parseInt(document.getElementById('pump-p')?.value || 3);
  const w = lang.generateString(pumpState.p);

  document.getElementById('pump-w').value = w;
  document.getElementById('pump-w-len').textContent = `|w| = ${w.length} ≥ p = ${pumpState.p} ✓`;

  // Reset decomposition
  pumpState.xLen = 0;
  pumpState.yLen = 1;
  document.getElementById('pump-x-len').value = 0;
  document.getElementById('pump-y-len').value = 1;
  document.getElementById('pump-y-len').max = pumpState.p;

  updateDecomposition();
};

window.updateDecomposition = function() {
  const lang = PUMPING_LANGUAGES[pumpState.lang];
  if (!lang) return;

  const w = document.getElementById('pump-w')?.value || '';
  pumpState.xLen = parseInt(document.getElementById('pump-x-len')?.value || 0);
  pumpState.yLen = parseInt(document.getElementById('pump-y-len')?.value || 1);

  // Enforce constraints
  if (pumpState.yLen < 1) { pumpState.yLen = 1; document.getElementById('pump-y-len').value = 1; }
  if (pumpState.xLen + pumpState.yLen > pumpState.p) {
    pumpState.xLen = Math.max(0, pumpState.p - pumpState.yLen);
    document.getElementById('pump-x-len').value = pumpState.xLen;
  }
  if (pumpState.xLen + pumpState.yLen > w.length) {
    pumpState.yLen = Math.max(1, w.length - pumpState.xLen);
    document.getElementById('pump-y-len').value = pumpState.yLen;
  }

  const x = w.substring(0, pumpState.xLen);
  const y = w.substring(pumpState.xLen, pumpState.xLen + pumpState.yLen);
  const z = w.substring(pumpState.xLen + pumpState.yLen);

  // Visual
  const visual = document.getElementById('pump-decompose-visual');
  if (visual) {
    visual.innerHTML = `
      <span class="pump-x" title="x">${x || 'ε'}</span>
      <span class="pump-y" title="y">${y}</span>
      <span class="pump-z" title="z">${z || 'ε'}</span>`;
  }

  // Conditions check
  const conditions = validatePumpingConditions(x, y, z, pumpState.p);
  const condEl = document.getElementById('pump-conditions');
  if (condEl) {
    condEl.innerHTML = conditions.map(c =>
      `<div class="pump-cond ${c.satisfied ? 'valid' : 'invalid'}">
        ${c.satisfied ? '✓' : '✗'} ${c.condition} — ${c.detail}
      </div>`
    ).join('');
  }

  // Update pump result
  setPumpI(pumpState.pumpI);
};

window.setPumpI = function(i) {
  pumpState.pumpI = i;
  document.querySelectorAll('.pump-i-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.pump-i-btn:nth-child(${i + 1})`);
  if (activeBtn) activeBtn.classList.add('active');

  const lang = PUMPING_LANGUAGES[pumpState.lang];
  if (!lang) return;

  const w = document.getElementById('pump-w')?.value || '';
  const x = w.substring(0, pumpState.xLen);
  const y = w.substring(pumpState.xLen, pumpState.xLen + pumpState.yLen);
  const z = w.substring(pumpState.xLen + pumpState.yLen);

  const pumped = pumpString(x, y, z, i);
  const inLang = lang.checkMembership(pumped);

  const resultEl = document.getElementById('pump-result');
  if (resultEl) {
    resultEl.innerHTML = `
      <div class="pump-result-card ${inLang ? 'in-lang' : 'not-in-lang'}">
        <div class="pump-result-formula">xy<sup>${i}</sup>z = "${pumped}"</div>
        <div class="pump-result-len">|xy<sup>${i}</sup>z| = ${pumped.length}</div>
        <div class="pump-result-verdict">${inLang
          ? `✓ String IS in ${lang.name} — pumping does not break this decomposition for i=${i}`
          : `✗ String is NOT in ${lang.name} — Contradiction! This proves the language is not regular.`
        }</div>
      </div>`;
  }
};
