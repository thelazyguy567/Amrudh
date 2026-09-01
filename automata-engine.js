/* ============================================================
   AutomataLearn — Automata Engine
   Core algorithms: validation, simulation, ε-closure,
   subset construction, undo/redo, import/export
   ============================================================ */

// ===== UNDO / REDO HISTORY =====
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

function saveSnapshot() {
  undoStack.push({
    states: JSON.parse(JSON.stringify(cvStates)),
    transitions: JSON.parse(JSON.stringify(cvTransitions)),
    start: cvStart,
    stateId: cvStateId
  });
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
}

window.undoCanvas = function() {
  if (!undoStack.length) return;
  redoStack.push({
    states: JSON.parse(JSON.stringify(cvStates)),
    transitions: JSON.parse(JSON.stringify(cvTransitions)),
    start: cvStart,
    stateId: cvStateId
  });
  const snap = undoStack.pop();
  cvStates = snap.states;
  cvTransitions = snap.transitions;
  cvStart = snap.start;
  cvStateId = snap.stateId;
  cvSimStep = -1; cvSimTrace = [];
  renderCanvas();
};

window.undoCanvas = function() {
  if (!undoStack.length) return;
  redoStack.push({
    states: JSON.parse(JSON.stringify(cvStates)),
    transitions: JSON.parse(JSON.stringify(cvTransitions)),
    start: cvStart,
    stateId: cvStateId
  });
  const snap = undoStack.pop();
  cvStates = snap.states;
  cvTransitions = snap.transitions;
  cvStart = snap.start;
  cvStateId = snap.stateId;
  cvSimStep = -1; cvSimTrace = [];
  renderCanvas();
};

window.redoCanvas = function() {
  if (!redoStack.length) return;
  undoStack.push({
    states: JSON.parse(JSON.stringify(cvStates)),
    transitions: JSON.parse(JSON.stringify(cvTransitions)),
    start: cvStart,
    stateId: cvStateId
  });
  const snap = redoStack.pop();
  cvStates = snap.states;
  cvTransitions = snap.transitions;
  cvStart = snap.start;
  cvStateId = snap.stateId;
  cvSimStep = -1; cvSimTrace = [];
  renderCanvas();
};

// ===== ALPHABET DETECTION =====
function detectAlphabet() {
  const syms = new Set();
  cvTransitions.forEach(t => {
    if (t.symbol && t.symbol !== 'ε' && t.symbol !== 'ϵ') syms.add(t.symbol);
  });
  return [...syms].sort();
}

// ===== DFA VALIDATION =====
window.validateDFA = function() {
  const errors = [];
  const alphabet = detectAlphabet();

  if (!cvStates.length) {
    errors.push({ type: 'error', msg: 'No states defined.' });
    return errors;
  }
  if (cvStart === null) {
    errors.push({ type: 'error', msg: 'No start state defined.' });
  }
  if (!cvStates.some(s => s.isAccept)) {
    errors.push({ type: 'warning', msg: 'No accept states defined (DFA accepts empty language).' });
  }
  if (alphabet.length === 0) {
    errors.push({ type: 'error', msg: 'No alphabet detected. Add transitions with symbols.' });
    return errors;
  }

  // Check epsilon transitions (not allowed in DFA)
  const epsTrans = cvTransitions.filter(t => t.symbol === 'ε' || t.symbol === 'ϵ');
  if (epsTrans.length > 0) {
    errors.push({ type: 'error', msg: 'DFA cannot have ε-transitions. Found ' + epsTrans.length + '.' });
  }

  // For each state, check exactly one transition per symbol
  cvStates.forEach(s => {
    alphabet.forEach(sym => {
      const trans = cvTransitions.filter(t => t.from === s.id && t.symbol === sym);
      if (trans.length === 0) {
        errors.push({ type: 'error', msg: `Missing transition: δ(${s.label}, ${sym}) is undefined.`, stateId: s.id });
      } else if (trans.length > 1) {
        errors.push({ type: 'error', msg: `Multiple transitions: δ(${s.label}, ${sym}) has ${trans.length} targets (DFA requires exactly 1).`, stateId: s.id });
      }
    });
  });

  if (errors.length === 0) {
    errors.push({ type: 'success', msg: `✓ Valid DFA! ${cvStates.length} states, alphabet Σ = {${alphabet.join(', ')}}.` });
  }
  return errors;
};

// ===== NFA VALIDATION =====
window.validateNFA = function() {
  const errors = [];
  if (!cvStates.length) {
    errors.push({ type: 'error', msg: 'No states defined.' });
    return errors;
  }
  if (cvStart === null) {
    errors.push({ type: 'error', msg: 'No start state defined.' });
  }
  if (!cvStates.some(s => s.isAccept)) {
    errors.push({ type: 'warning', msg: 'No accept states. NFA accepts empty language.' });
  }
  const alphabet = detectAlphabet();
  if (alphabet.length === 0 && cvTransitions.filter(t => t.symbol === 'ε' || t.symbol === 'ϵ').length === 0) {
    errors.push({ type: 'error', msg: 'No transitions defined.' });
  }

  if (errors.filter(e => e.type === 'error').length === 0) {
    const hasEps = cvTransitions.some(t => t.symbol === 'ε' || t.symbol === 'ϵ');
    errors.push({ type: 'success', msg: `✓ Valid NFA${hasEps ? ' (with ε-transitions)' : ''}! ${cvStates.length} states, alphabet Σ = {${alphabet.join(', ')}}${hasEps ? ' ∪ {ε}' : ''}.` });
  }
  return errors;
};

// ===== ε-CLOSURE =====
function epsilonClosure(stateIds) {
  const closure = new Set(stateIds);
  const stack = [...stateIds];
  while (stack.length > 0) {
    const cur = stack.pop();
    cvTransitions.forEach(t => {
      if (t.from === cur && (t.symbol === 'ε' || t.symbol === 'ϵ') && !closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    });
  }
  return [...closure].sort((a, b) => a - b);
}

window.computeEpsilonClosures = function() {
  const closures = {};
  cvStates.forEach(s => {
    closures[s.id] = epsilonClosure([s.id]);
  });
  return closures;
};

// ===== NFA SIMULATION (multi-path) =====
window.simulateNFA = function(inputStr) {
  if (!cvStates.length || cvStart === null) return { accepted: false, steps: [], paths: [] };

  const hasEpsilon = cvTransitions.some(t => t.symbol === 'ε' || t.symbol === 'ϵ');
  let currentStates = hasEpsilon ? epsilonClosure([cvStart]) : [cvStart];
  const steps = [{ symbol: null, states: [...currentStates] }];

  for (let i = 0; i < inputStr.length; i++) {
    const ch = inputStr[i];
    let nextStates = new Set();

    currentStates.forEach(sid => {
      cvTransitions.forEach(t => {
        if (t.from === sid && t.symbol === ch) {
          nextStates.add(t.to);
        }
      });
    });

    let nextArr = [...nextStates];
    if (hasEpsilon && nextArr.length > 0) {
      nextArr = epsilonClosure(nextArr);
    }

    steps.push({ symbol: ch, states: nextArr });
    currentStates = nextArr;

    if (currentStates.length === 0) break;
  }

  const finalStates = currentStates;
  const accepted = finalStates.some(sid => {
    const s = cvStates.find(st => st.id === sid);
    return s && s.isAccept;
  });

  return { accepted, steps, finalStates };
};

// ===== SUBSET CONSTRUCTION (NFA → DFA) =====
window.subsetConstruction = function() {
  const alphabet = detectAlphabet();
  const hasEpsilon = cvTransitions.some(t => t.symbol === 'ε' || t.symbol === 'ϵ');

  if (!cvStates.length || cvStart === null || alphabet.length === 0) {
    return { dfaStates: [], dfaTransitions: [], dfaStart: null, dfaAccept: [], steps: [], error: 'Need states, start state, and alphabet.' };
  }

  const startSet = hasEpsilon ? epsilonClosure([cvStart]) : [cvStart];
  const startKey = setKey(startSet);

  const dfaStateMap = new Map(); // key -> { id, set, isAccept }
  const dfaTransitions = [];
  const steps = [];
  let dfaId = 0;

  const isAcceptSet = (stateSet) => stateSet.some(sid => {
    const s = cvStates.find(st => st.id === sid);
    return s && s.isAccept;
  });

  dfaStateMap.set(startKey, { id: dfaId++, set: startSet, isAccept: isAcceptSet(startSet) });
  const worklist = [startKey];

  steps.push({
    title: `Start: ε-closure({${getLabel(cvStart)}}) = {${startSet.map(id => getLabel(id)).join(', ')}}`,
    note: isAcceptSet(startSet) ? 'Contains accept state → DFA accept state' : 'No accept state in set',
    newState: startKey,
    table: null
  });

  while (worklist.length > 0) {
    const currentKey = worklist.shift();
    const currentEntry = dfaStateMap.get(currentKey);

    alphabet.forEach(sym => {
      let nextSet = new Set();
      currentEntry.set.forEach(sid => {
        cvTransitions.forEach(t => {
          if (t.from === sid && t.symbol === sym) {
            nextSet.add(t.to);
          }
        });
      });

      let nextArr = [...nextSet];
      if (hasEpsilon && nextArr.length > 0) {
        nextArr = epsilonClosure(nextArr);
      }
      nextArr.sort((a, b) => a - b);

      const nextKey = setKey(nextArr);

      if (nextArr.length > 0 && !dfaStateMap.has(nextKey)) {
        dfaStateMap.set(nextKey, { id: dfaId++, set: nextArr, isAccept: isAcceptSet(nextArr) });
        worklist.push(nextKey);

        steps.push({
          title: `δ({${currentEntry.set.map(id => getLabel(id)).join(',')}}, ${sym}) = {${nextArr.map(id => getLabel(id)).join(', ')}}`,
          note: `New DFA state! ${isAcceptSet(nextArr) ? '✓ Accept state' : 'Non-accepting'}`,
          newState: nextKey
        });
      }

      // Handle empty set as dead state
      if (nextArr.length === 0) {
        const deadKey = '∅';
        if (!dfaStateMap.has(deadKey)) {
          dfaStateMap.set(deadKey, { id: dfaId++, set: [], isAccept: false });
          worklist.push(deadKey);
          steps.push({ title: `δ({${currentEntry.set.map(id => getLabel(id)).join(',')}}, ${sym}) = ∅`, note: 'Dead state (trap)', newState: deadKey });
        }
        dfaTransitions.push({ from: currentEntry.id, to: dfaStateMap.get(deadKey).id, symbol: sym });
      } else {
        dfaTransitions.push({ from: currentEntry.id, to: dfaStateMap.get(nextKey).id, symbol: sym });
      }
    });
  }

  const dfaStates = [];
  const dfaAccept = [];
  dfaStateMap.forEach((entry, key) => {
    const label = key === '∅' ? '∅' : `{${entry.set.map(id => getLabel(id)).join(',')}}`;
    dfaStates.push({ id: entry.id, label, isAccept: entry.isAccept, sourceSet: entry.set });
    if (entry.isAccept) dfaAccept.push(entry.id);
  });

  return {
    dfaStates,
    dfaTransitions,
    dfaStart: 0,
    dfaAccept,
    steps,
    alphabet
  };
};

function setKey(arr) {
  return arr.length === 0 ? '∅' : arr.join(',');
}

function getLabel(id) {
  const s = cvStates.find(st => st.id === id);
  return s ? s.label : `q${id}`;
}

// ===== IMPORT / EXPORT =====
window.exportAutomaton = function() {
  const data = {
    type: window.currentStudioMode || 'dfa',
    states: cvStates.map(s => ({ id: s.id, x: s.x, y: s.y, isAccept: s.isAccept, label: s.label })),
    transitions: cvTransitions.map(t => ({ from: t.from, to: t.to, symbol: t.symbol })),
    start: cvStart,
    alphabet: detectAlphabet(),
    meta: { exported: new Date().toISOString(), app: 'AutomataLearn' }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `automaton-${data.type}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importAutomaton = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.states || !data.transitions) {
          alert('Invalid automaton file: missing states or transitions.');
          return;
        }
        saveSnapshot();
        cvStates = data.states;
        cvTransitions = data.transitions;
        cvStart = data.start ?? null;
        cvStateId = Math.max(0, ...data.states.map(s => s.id)) + 1;
        cvSimStep = -1; cvSimTrace = [];
        renderCanvas();

        if (data.type && window.switchStudioMode) {
          window.switchStudioMode(data.type);
        }

        const hint = document.getElementById('mode-hint');
        if (hint) hint.textContent = `Imported ${data.type?.toUpperCase() || 'automaton'} with ${data.states.length} states.`;
      } catch (err) {
        alert('Error parsing file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

window.saveToLocal = function() {
  const data = {
    type: window.currentStudioMode || 'dfa',
    states: cvStates,
    transitions: cvTransitions,
    start: cvStart,
    stateId: cvStateId
  };
  localStorage.setItem('al_saved_automaton', JSON.stringify(data));
  const hint = document.getElementById('mode-hint');
  if (hint) hint.textContent = '💾 Automaton saved to browser storage!';
};

window.loadFromLocal = function() {
  const raw = localStorage.getItem('al_saved_automaton');
  if (!raw) {
    alert('No saved automaton found in browser storage.');
    return;
  }
  try {
    const data = JSON.parse(raw);
    saveSnapshot();
    cvStates = data.states || [];
    cvTransitions = data.transitions || [];
    cvStart = data.start ?? null;
    cvStateId = data.stateId || (Math.max(0, ...cvStates.map(s => s.id)) + 1);
    cvSimStep = -1; cvSimTrace = [];
    renderCanvas();
    const hint = document.getElementById('mode-hint');
    if (hint) hint.textContent = '📂 Automaton loaded from browser storage!';
  } catch (err) {
    alert('Error loading saved automaton: ' + err.message);
  }
};

// ===== DARK MODE =====
window.toggleDarkMode = function() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('al_theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';
};

// Initialize theme on load
(function initTheme() {
  const saved = localStorage.getItem('al_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

// ===== PUMPING LEMMA ENGINE =====
const PUMPING_LANGUAGES = {
  anbn: {
    name: 'L = { aⁿbⁿ | n ≥ 0 }',
    description: 'Equal numbers of a\'s followed by equal numbers of b\'s',
    generateString: (p) => 'a'.repeat(p) + 'b'.repeat(p),
    checkMembership: (s) => {
      const m = s.match(/^(a*)(b*)$/);
      if (!m) return false;
      return m[1].length === m[2].length;
    },
    alphabet: ['a', 'b']
  },
  ww: {
    name: 'L = { ww | w ∈ {0,1}* }',
    description: 'String repeated twice',
    generateString: (p) => '0'.repeat(p) + '1' + '0'.repeat(p) + '1',
    checkMembership: (s) => {
      if (s.length % 2 !== 0) return false;
      const half = s.length / 2;
      return s.substring(0, half) === s.substring(half);
    },
    alphabet: ['0', '1']
  },
  anbncn: {
    name: 'L = { aⁿbⁿcⁿ | n ≥ 0 }',
    description: 'Equal numbers of a\'s, b\'s, and c\'s',
    generateString: (p) => 'a'.repeat(p) + 'b'.repeat(p) + 'c'.repeat(p),
    checkMembership: (s) => {
      const m = s.match(/^(a*)(b*)(c*)$/);
      if (!m) return false;
      return m[1].length === m[2].length && m[2].length === m[3].length;
    },
    alphabet: ['a', 'b', 'c']
  },
  palindromes: {
    name: 'L = { palindromes over {a,b} }',
    description: 'Strings that read the same forwards and backwards',
    generateString: (p) => 'a'.repeat(p) + 'b' + 'a'.repeat(p),
    checkMembership: (s) => s === s.split('').reverse().join(''),
    alphabet: ['a', 'b']
  },
  primes: {
    name: 'L = { aᵖ | p is prime }',
    description: 'Strings of a\'s with prime length',
    generateString: (p) => {
      // Find first prime >= p
      let n = p;
      while (!isPrime(n)) n++;
      return 'a'.repeat(n);
    },
    checkMembership: (s) => /^a+$/.test(s) && isPrime(s.length),
    alphabet: ['a']
  }
};

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

window.PUMPING_LANGUAGES = PUMPING_LANGUAGES;

// Pump a string decomposition
window.pumpString = function(x, y, z, i) {
  return x + y.repeat(i) + z;
};

// Validate pumping conditions
window.validatePumpingConditions = function(x, y, z, p) {
  const results = [];
  results.push({
    condition: '|y| ≥ 1',
    satisfied: y.length >= 1,
    detail: `|y| = ${y.length}`
  });
  results.push({
    condition: '|xy| ≤ p',
    satisfied: (x.length + y.length) <= p,
    detail: `|xy| = ${x.length + y.length}, p = ${p}`
  });
  results.push({
    condition: 'w = xyz',
    satisfied: true,
    detail: `x="${x}", y="${y}", z="${z}"`
  });
  return results;
};
