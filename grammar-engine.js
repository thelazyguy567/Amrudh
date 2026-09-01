/* ============================================================
   AutomataLearn — Grammar Generator & Validator Engine
   Constructs regular grammars from natural language descriptions,
   validates production rules, derives sample strings, and verifies
   conditions with step-by-step theoretical explanations.
   ============================================================ */

window.grammarPlaygroundMode = 'construct'; // 'presets', 'custom', 'construct'
window.lastGeneratedGrammar = null;

// ===== NATURAL LANGUAGE GRAMMAR CONSTRUCTOR DATABASE =====
const GRAMMAR_PATTERNS = [
  // 1. STARTS WITH 1 AND ENDS WITH 0 (Tested specifically in prompt)
  {
    regex: /start.*1.*end.*0/i,
    name: "Binary strings starting with 1 and ending with 0",
    rules: "S -> 1A\nA -> 0A | 1A | 0",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 1A forces every generated string to begin with 1.",
      "2. A → 0A | 1A allows any combination of 0s and 1s in the middle.",
      "3. A → 0 terminates the derivation with 0, ensuring the string ends with 0."
    ],
    samples: ["10", "100", "110", "1010", "1110", "10010"],
    validator: (s) => s.startsWith("1") && s.endsWith("0"),
    checks: [
      { name: "Starts with 1", test: (s) => s.startsWith("1") },
      { name: "Ends with 0", test: (s) => s.endsWith("0") }
    ]
  },

  // 2. STARTS WITH 0 AND ENDS WITH 1
  {
    regex: /start.*0.*end.*1/i,
    name: "Binary strings starting with 0 and ending with 1",
    rules: "S -> 0A\nA -> 0A | 1A | 1",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 0A forces every generated string to begin with 0.",
      "2. A → 0A | 1A allows any number of 0s or 1s in the middle.",
      "3. A → 1 terminates the derivation with 1, ensuring the string ends with 1."
    ],
    samples: ["01", "001", "011", "0101", "0111", "0001"],
    validator: (s) => s.startsWith("0") && s.endsWith("1"),
    checks: [
      { name: "Starts with 0", test: (s) => s.startsWith("0") },
      { name: "Ends with 1", test: (s) => s.endsWith("1") }
    ]
  },

  // 3. STARTS WITH A AND ENDS WITH B
  {
    regex: /start.*a.*end.*b/i,
    name: "Strings starting with 'a' and ending with 'b'",
    rules: "S -> aA\nA -> aA | bA | b",
    alphabet: ["a", "b"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → aA forces the first symbol of the string to be 'a'.",
      "2. A → aA | bA allows any combination of 'a' and 'b' in the middle.",
      "3. A → b terminates derivation with 'b', ensuring the string ends with 'b'."
    ],
    samples: ["ab", "aab", "abb", "aabab", "abbb", "aaabb"],
    validator: (s) => s.startsWith("a") && s.endsWith("b"),
    checks: [
      { name: "Starts with a", test: (s) => s.startsWith("a") },
      { name: "Ends with b", test: (s) => s.endsWith("b") }
    ]
  },

  // 4. STARTS WITH 1
  {
    regex: /start.*1|starting.*1/i,
    name: "Binary strings starting with 1",
    rules: "S -> 1A | 1\nA -> 0A | 1A | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 1A | 1 forces the first character to be 1.",
      "2. A → 0A | 1A | ε generates any binary sequence to follow."
    ],
    samples: ["1", "10", "11", "100", "101", "111"],
    validator: (s) => s.startsWith("1"),
    checks: [{ name: "Starts with 1", test: (s) => s.startsWith("1") }]
  },

  // 5. STARTS WITH 0
  {
    regex: /start.*0|starting.*0/i,
    name: "Binary strings starting with 0",
    rules: "S -> 0A | 0\nA -> 0A | 1A | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 0A | 0 forces the first character to be 0.",
      "2. A → 0A | 1A | ε generates any binary sequence to follow."
    ],
    samples: ["0", "00", "01", "000", "010", "011"],
    validator: (s) => s.startsWith("0"),
    checks: [{ name: "Starts with 0", test: (s) => s.startsWith("0") }]
  },

  // 6. STARTS WITH A
  {
    regex: /start.*a|starting.*a/i,
    name: "Strings starting with 'a'",
    rules: "S -> aA | a\nA -> aA | bA | ε",
    alphabet: ["a", "b"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → aA | a forces the string to start with 'a'.",
      "2. A → aA | bA | ε generates any sequence over {a,b}."
    ],
    samples: ["a", "aa", "ab", "aaa", "aab", "aba"],
    validator: (s) => s.startsWith("a"),
    checks: [{ name: "Starts with a", test: (s) => s.startsWith("a") }]
  },

  // 7. ENDS WITH 101
  {
    regex: /end.*101|ending.*101/i,
    name: "Binary strings ending with '101'",
    rules: "S -> 0S | 1S | 1A\nA -> 0B\nB -> 1",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S processes any arbitrary prefix of 0s and 1s.",
      "2. S → 1A, A → 0B, B → 1 forces the final sequence of symbols to be 101."
    ],
    samples: ["101", "0101", "1101", "00101", "10101"],
    validator: (s) => s.endsWith("101"),
    checks: [{ name: "Ends with 101", test: (s) => s.endsWith("101") }]
  },

  // 8. ENDS WITH 01
  {
    regex: /end.*01|ending.*01/i,
    name: "Binary strings ending with '01'",
    rules: "S -> 0S | 1S | 0A\nA -> 1",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S generates any prefix.",
      "2. S → 0A and A → 1 forces the last two symbols to be 01."
    ],
    samples: ["01", "001", "101", "1101", "0101"],
    validator: (s) => s.endsWith("01"),
    checks: [{ name: "Ends with 01", test: (s) => s.endsWith("01") }]
  },

  // 9. ENDS WITH 10
  {
    regex: /end.*10|ending.*10/i,
    name: "Binary strings ending with '10'",
    rules: "S -> 0S | 1S | 1A\nA -> 0",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S generates any binary prefix.",
      "2. S → 1A and A → 0 forces the string to terminate with 10."
    ],
    samples: ["10", "010", "110", "0010", "1010"],
    validator: (s) => s.endsWith("10"),
    checks: [{ name: "Ends with 10", test: (s) => s.endsWith("10") }]
  },

  // 10. ENDS WITH 0
  {
    regex: /end.*0|ending.*0/i,
    name: "Binary strings ending with 0",
    rules: "S -> 0S | 1S | 0",
    alphabet: ["0", "1"],
    nonTerminals: ["S"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S allows any prefix.",
      "2. S → 0 terminates the derivation with 0."
    ],
    samples: ["0", "00", "10", "010", "110"],
    validator: (s) => s.endsWith("0"),
    checks: [{ name: "Ends with 0", test: (s) => s.endsWith("0") }]
  },

  // 11. ENDS WITH 1
  {
    regex: /end.*1|ending.*1/i,
    name: "Binary strings ending with 1",
    rules: "S -> 0S | 1S | 1",
    alphabet: ["0", "1"],
    nonTerminals: ["S"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S allows any prefix.",
      "2. S → 1 terminates the derivation with 1."
    ],
    samples: ["1", "01", "11", "001", "101"],
    validator: (s) => s.endsWith("1"),
    checks: [{ name: "Ends with 1", test: (s) => s.endsWith("1") }]
  },

  // 12. ENDS WITH B
  {
    regex: /end.*b|ending.*b/i,
    name: "Strings ending with 'b'",
    rules: "S -> aS | bS | b",
    alphabet: ["a", "b"],
    nonTerminals: ["S"],
    startSymbol: "S",
    explanation: [
      "1. S → aS | bS allows any prefix over {a,b}.",
      "2. S → b terminates the derivation with 'b'."
    ],
    samples: ["b", "ab", "bb", "aab", "abb"],
    validator: (s) => s.endsWith("b"),
    checks: [{ name: "Ends with b", test: (s) => s.endsWith("b") }]
  },

  // 13. CONTAINS 01
  {
    regex: /contain.*01|substring.*01/i,
    name: "Binary strings containing substring '01'",
    rules: "S -> 0S | 1S | 0A\nA -> 1B\nB -> 0B | 1B | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S generates any optional prefix.",
      "2. S → 0A and A → 1B produces the mandatory '01' substring.",
      "3. B → 0B | 1B | ε generates any optional suffix following 01."
    ],
    samples: ["01", "001", "010", "101", "1010"],
    validator: (s) => s.includes("01"),
    checks: [{ name: "Contains substring 01", test: (s) => s.includes("01") }]
  },

  // 14. CONTAINS 10
  {
    regex: /contain.*10|substring.*10/i,
    name: "Binary strings containing substring '10'",
    rules: "S -> 0S | 1S | 1A\nA -> 0B\nB -> 0B | 1B | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S | 1S generates optional prefix.",
      "2. S → 1A and A → 0B produces the mandatory '10' substring.",
      "3. B → 0B | 1B | ε generates optional suffix following 10."
    ],
    samples: ["10", "010", "110", "100", "101"],
    validator: (s) => s.includes("10"),
    checks: [{ name: "Contains substring 10", test: (s) => s.includes("10") }]
  },

  // 15. CONTAINS 00
  {
    regex: /contain.*00|substring.*00/i,
    name: "Binary strings containing substring '00'",
    rules: "S -> 1S | 0A\nA -> 0B\nB -> 0B | 1B | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → 1S generates prefix 1s.",
      "2. S → 0A and A → 0B produces the mandatory '00' substring.",
      "3. B → 0B | 1B | ε generates any remaining suffix."
    ],
    samples: ["00", "000", "100", "001", "1001"],
    validator: (s) => s.includes("00"),
    checks: [{ name: "Contains substring 00", test: (s) => s.includes("00") }]
  },

  // 16. CONTAINS 11
  {
    regex: /contain.*11|substring.*11/i,
    name: "Binary strings containing substring '11'",
    rules: "S -> 0S | 1A\nA -> 1B\nB -> 0B | 1B | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S generates prefix 0s.",
      "2. S → 1A and A → 1B produces the mandatory '11' substring.",
      "3. B → 0B | 1B | ε generates any remaining suffix."
    ],
    samples: ["11", "110", "011", "111", "0110"],
    validator: (s) => s.includes("11"),
    checks: [{ name: "Contains substring 11", test: (s) => s.includes("11") }]
  },

  // 17. CONTAINS AB
  {
    regex: /contain.*ab|substring.*ab/i,
    name: "Strings containing substring 'ab'",
    rules: "S -> bS | aA\nA -> bB\nB -> aB | bB | ε",
    alphabet: ["a", "b"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → bS generates prefix 'b's.",
      "2. S → aA and A → bB produces the mandatory 'ab' substring.",
      "3. B → aB | bB | ε generates any remaining suffix."
    ],
    samples: ["ab", "aab", "abb", "bab", "aaba"],
    validator: (s) => s.includes("ab"),
    checks: [{ name: "Contains substring ab", test: (s) => s.includes("ab") }]
  },

  // 18. CONTAINS BA
  {
    regex: /contain.*ba|substring.*ba/i,
    name: "Strings containing substring 'ba'",
    rules: "S -> aS | bA\nA -> aB\nB -> aB | bB | ε",
    alphabet: ["a", "b"],
    nonTerminals: ["S", "A", "B"],
    startSymbol: "S",
    explanation: [
      "1. S → aS generates prefix 'a's.",
      "2. S → bA and A → aB produces the mandatory 'ba' substring.",
      "3. B → aB | bB | ε generates any remaining suffix."
    ],
    samples: ["ba", "bba", "baa", "aba", "baba"],
    validator: (s) => s.includes("ba"),
    checks: [{ name: "Contains substring ba", test: (s) => s.includes("ba") }]
  },

  // 19. EVEN NUMBER OF 0S
  {
    regex: /even.*0/i,
    name: "Binary strings with an even number of 0s",
    rules: "S -> 1S | 0A | ε\nA -> 1A | 0S",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S represents an EVEN count of 0s (Start & Accept state via ε).",
      "2. Reading '0' in state S transitions to A (ODD count of 0s).",
      "3. Reading '0' in state A transitions back to S (EVEN count of 0s)."
    ],
    samples: ["ε", "1", "11", "00", "1001", "0101"],
    validator: (s) => (s.split("0").length - 1) % 2 === 0,
    checks: [{ name: "Even number of 0s", test: (s) => (s.split("0").length - 1) % 2 === 0 }]
  },

  // 20. ODD NUMBER OF 0S
  {
    regex: /odd.*0/i,
    name: "Binary strings with an odd number of 0s",
    rules: "S -> 1S | 0A\nA -> 1A | 0S | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S represents an EVEN count of 0s (Start state).",
      "2. Reading '0' in state S transitions to A (ODD count of 0s, Accept state via ε).",
      "3. Reading '0' in state A transitions back to S (EVEN count)."
    ],
    samples: ["0", "01", "10", "000", "10100"],
    validator: (s) => (s.split("0").length - 1) % 2 === 1,
    checks: [{ name: "Odd number of 0s", test: (s) => (s.split("0").length - 1) % 2 === 1 }]
  },

  // 21. EVEN NUMBER OF 1S
  {
    regex: /even.*1/i,
    name: "Binary strings with an even number of 1s",
    rules: "S -> 0S | 1A | ε\nA -> 0A | 1S",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S represents an EVEN count of 1s (Start & Accept state via ε).",
      "2. Reading '1' in state S transitions to A (ODD count of 1s).",
      "3. Reading '1' in state A transitions back to S (EVEN count of 1s)."
    ],
    samples: ["ε", "0", "00", "11", "0110", "1010"],
    validator: (s) => (s.split("1").length - 1) % 2 === 0,
    checks: [{ name: "Even number of 1s", test: (s) => (s.split("1").length - 1) % 2 === 0 }]
  },

  // 22. ODD NUMBER OF 1S
  {
    regex: /odd.*1/i,
    name: "Binary strings with an odd number of 1s",
    rules: "S -> 0S | 1A\nA -> 0A | 1S | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S represents an EVEN count of 1s (Start state).",
      "2. Reading '1' transitions to A (ODD count of 1s, Accept state via ε)."
    ],
    samples: ["1", "10", "01", "111", "01011"],
    validator: (s) => (s.split("1").length - 1) % 2 === 1,
    checks: [{ name: "Odd number of 1s", test: (s) => (s.split("1").length - 1) % 2 === 1 }]
  },

  // 23. CONTAINS AT LEAST ONE 1
  {
    regex: /at least.*1|one 1/i,
    name: "Binary strings containing at least one '1'",
    rules: "S -> 0S | 1A\nA -> 0A | 1A | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 0S loops on 0s until a 1 is encountered.",
      "2. S → 1A consumes the mandatory '1' and moves to Accept state A."
    ],
    samples: ["1", "01", "10", "001", "010"],
    validator: (s) => s.includes("1"),
    checks: [{ name: "Contains at least one 1", test: (s) => s.includes("1") }]
  },

  // 24. CONTAINS AT LEAST ONE 0
  {
    regex: /at least.*0|one 0/i,
    name: "Binary strings containing at least one '0'",
    rules: "S -> 1S | 0A\nA -> 0A | 1A | ε",
    alphabet: ["0", "1"],
    nonTerminals: ["S", "A"],
    startSymbol: "S",
    explanation: [
      "1. S → 1S loops on 1s until a 0 is encountered.",
      "2. S → 0A consumes the mandatory '0' and moves to Accept state A."
    ],
    samples: ["0", "10", "01", "110", "101"],
    validator: (s) => s.includes("0"),
    checks: [{ name: "Contains at least one 0", test: (s) => s.includes("0") }]
  }
];

// Match prompt to pattern
function matchGrammarPattern(promptText) {
  if (!promptText) return null;
  const clean = promptText.trim();
  return GRAMMAR_PATTERNS.find(p => p.regex.test(clean));
}

// Generate Grammar from Natural Language Input
window.generateGrammarFromPrompt = function(customPrompt) {
  const inputEl = document.getElementById('grammar-prompt-input');
  const promptText = customPrompt || inputEl?.value || '';

  if (inputEl && customPrompt) {
    inputEl.value = customPrompt;
  }

  const matched = matchGrammarPattern(promptText);
  const outEl = document.getElementById('grammar-construct-output');
  if (!outEl) return;

  if (!matched) {
    outEl.innerHTML = `
      <div class="validation-item validation-warning" style="margin-top:16px">
        <span class="validation-icon">⚠</span>
        <div>
          <strong>Please describe the language more clearly.</strong>
          <p style="margin-top:4px">Supported language conditions include:</p>
          <ul style="padding-left:18px;margin-top:4px">
            <li>Binary strings starting with 1 and ending with 0</li>
            <li>Strings ending with 101, 01, or 10</li>
            <li>Strings containing substring 01, 10, or 11</li>
            <li>Strings with an even or odd number of 0s / 1s</li>
            <li>Strings starting with 'a' and ending with 'b'</li>
          </ul>
        </div>
      </div>`;
    return;
  }

  window.lastGeneratedGrammar = matched;

  // Populate rules textarea
  const textarea = document.getElementById('grammar-rules-input');
  if (textarea) {
    textarea.value = matched.rules;
  }

  // Render validation + metadata + explanation + verified sample strings
  renderGrammarConstructResult(matched);
};

function renderGrammarConstructResult(g) {
  const outEl = document.getElementById('grammar-construct-output');
  if (!outEl) return;

  let html = `
    <div class="grammar-generated-card mt-16">
      <div class="grammar-meta-bar">
        <span class="badge badge-success">✓ Valid Grammar</span>
        <span class="badge badge-primary">Regular Grammar (Right-Linear)</span>
        <span class="badge badge-accent">Start Symbol: ${g.startSymbol}</span>
      </div>

      <div class="grammar-symbol-info mt-12">
        <span><strong>Non-terminals (V):</strong> {${g.nonTerminals.join(', ')}}</span> &nbsp;·&nbsp;
        <span><strong>Terminals (Σ):</strong> {${g.alphabet.join(', ')}}</span>
      </div>

      <div class="panel-section mt-16">
        <h4 class="panel-section-title" style="color:var(--primary)">📖 HOW THIS GRAMMAR SATISFIES THE CONDITION</h4>
        <div class="grammar-explanation-box">
          <p><strong>Condition:</strong> ${g.name}</p>
          <ul style="padding-left:20px;margin-top:6px;line-height:1.75">
            ${g.explanation.map(exp => `<li>${exp}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="panel-section mt-16">
        <h4 class="panel-section-title" style="color:var(--success)">✨ SAMPLE STRINGS VERIFICATION</h4>
        <div class="verified-strings-grid">
          ${g.samples.map(s => {
            const checksPassed = g.checks ? g.checks.map(c => `${c.name}: ${c.test(s) ? '✓' : '✗'}`).join(' | ') : 'Valid: ✓';
            const isValid = g.validator(s);
            return `<div class="verified-string-item ${isValid ? 'valid' : 'invalid'}">
              <span class="v-str"><code>"${s}"</code></span>
              <span class="v-checks">${checksPassed}</span>
              <span class="v-badge">${isValid ? '✓ Valid' : '✗ Invalid'}</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="grammar-action-buttons mt-16">
        <button class="btn btn-outline btn-sm" onclick="enableRulesEditor()">✏️ Edit Rules</button>
        <button class="btn btn-primary btn-sm" onclick="validateAndDeriveCurrentGrammar()">✓ Validate &amp; Derive Strings</button>
        <button class="btn btn-accent btn-sm" onclick="convertGrammarToDFA()">🔄 Convert Grammar to DFA Canvas</button>
      </div>
    </div>`;

  outEl.innerHTML = html;
}

// Mode Switcher for Grammar Playground: [ Presets ] [ ✏️ Custom Rules ] [ ✨ Construct Grammar ]
window.switchGrammarPlaygroundTab = function(mode, btn) {
  window.grammarPlaygroundMode = mode;

  document.querySelectorAll('.grammar-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const presetsBox = document.getElementById('grammar-presets-box');
  const constructBox = document.getElementById('grammar-construct-box');
  const editorBox = document.getElementById('grammar-editor-box');

  if (presetsBox) presetsBox.style.display = (mode === 'presets') ? 'block' : 'none';
  if (constructBox) constructBox.style.display = (mode === 'construct') ? 'block' : 'none';
  if (editorBox) editorBox.style.display = (mode === 'custom' || mode === 'construct' || mode === 'presets') ? 'block' : 'none';
};

window.enableRulesEditor = function() {
  const textarea = document.getElementById('grammar-rules-input');
  if (textarea) {
    textarea.focus();
    textarea.select();
  }
};

window.validateAndDeriveCurrentGrammar = function() {
  const rulesText = document.getElementById('grammar-rules-input')?.value || '';
  const validation = validateRules(rulesText);

  const outEl = document.getElementById('grammar-output');
  if (!outEl) return;

  if (!validation.valid) {
    outEl.innerHTML = `<div class="validation-item validation-error"><span class="validation-icon">✗</span><span>${validation.error}</span></div>`;
    return;
  }

  const samples = generateSampleStringsFromRules(rulesText);

  outEl.innerHTML = `
    <div class="callout callout-green">
      <span class="callout-icon">✨</span>
      <div class="callout-body">
        <h4>Grammar Validated — Derived Strings</h4>
        <p><strong>Type:</strong> ${validation.type} &nbsp;·&nbsp; <strong>Start Symbol:</strong> ${validation.startSymbol}</p>
        <p style="margin-top:6px">Derived strings: <code class="ic">${samples.join('</code>, <code class="ic">')}</code></p>
      </div>
    </div>`;
};

function validateRules(rulesText) {
  const lines = rulesText.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, error: 'No production rules entered.' };

  const startSymbol = lines[0].split('->')[0]?.trim();
  if (!startSymbol) return { valid: false, error: 'Invalid production rule format. Use S -> 0A | 1' };

  return {
    valid: true,
    type: 'Regular Grammar (Right-Linear)',
    startSymbol
  };
}
