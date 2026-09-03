/* ============================================================
   AutomataLearn — Automata Challenge Arena Engine
   Interactive machine construction challenges with live canvas,
   automatic testing engine (visible + hidden tests), scoring,
   results evaluation, and step-by-step solution explanations.
   ============================================================ */

(function() {
  // ===== ARENA SCORE STORE =====
  class ScoreStore {
    constructor() {
      this._key = 'arena_scores_v1';
      this._data = JSON.parse(localStorage.getItem(this._key) || '{}');
    }
    get(id) { return this._data[String(id)] || null; }
    save(id, scorePct) {
      const d = this._data[String(id)] || { best: 0, attempts: 0, firstPerfect: null };
      d.attempts++;
      if (scorePct > d.best) d.best = scorePct;
      if (scorePct === 100 && !d.firstPerfect) d.firstPerfect = Date.now();
      d.lastAttempt = Date.now();
      this._data[String(id)] = d;
      localStorage.setItem(this._key, JSON.stringify(this._data));
      return d;
    }
    getSolvedCount() {
      return Object.values(this._data).filter(d => d.best === 100).length;
    }
    getTotalAttempts() {
      return Object.values(this._data).reduce((s, d) => s + (d.attempts || 0), 0);
    }
    getBestAvg() {
      const bests = Object.values(this._data).filter(d => d.attempts > 0).map(d => d.best);
      return bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : 0;
    }
  }
  const scoreStore = new ScoreStore();

  const ARENA_CHALLENGES = [
    // ================================================================
    // --- EASY (1 - 5) ---
    // ================================================================
    {
      id: 1,
      title: 'DFA: Strings Ending with "01"',
      difficulty: 'easy',
      difficultyBadge: '🟢 Easy',
      topic: 'DFA Construction',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a Deterministic Finite Automaton (DFA) over the alphabet Σ = {0, 1} that accepts all strings that end with the suffix "01".',
      requirements: [
        'Define states to track suffix match.',
        'Set q₀ as the start state.',
        'Mark q₂ as the accepting state.',
        'Ensure total transition function δ: Q × Σ → Q for every state.'
      ],
      visibleTestCases: [
        { input: '01', expected: true,  label: '"01"' },
        { input: '101', expected: true,  label: '"101"' },
        { input: '00', expected: false, label: '"00"' },
        { input: '11', expected: false, label: '"11"' }
      ],
      hiddenTestCases: [
        { input: '', expected: false, label: 'ε (empty string)' },
        { input: '0', expected: false, label: '"0"' },
        { input: '1', expected: false, label: '"1"' },
        { input: '0101', expected: true,  label: '"0101"' },
        { input: '111001', expected: true,  label: '"111001"' },
        { input: '11010', expected: false, label: '"11010"' }
      ],
      template: {
        states: [
          { id: 0, x: 140, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 300, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 460, y: 180, isAccept: true,  label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'To recognize strings ending in "01", the DFA must track the longest matching suffix of "01" seen so far.',
        stateMeanings: [
          'q₀ (Start): Initial state — no trailing "0" or "01" has been read.',
          'q₁: Intermediate state — the most recent input character was "0".',
          'q₂ (Accept): Success state — the most recent input characters were "01".'
        ],
        transitionReasoning: 'From q₀, reading "0" transitions to q₁; reading "1" stays in q₀. From q₁, reading "1" reaches accept state q₂; reading "0" remains in q₁ (since "00" still ends in "0"). From q₂, reading "0" moves to q₁ (ending in "0"); reading "1" resets to q₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (start)</td><td>q₁</td><td>q₀</td><td>No</td></tr>
            <tr><td>q₁</td><td>q₁</td><td>q₂</td><td>No</td></tr>
            <tr><td>q₂ ✓</td><td>q₁</td><td>q₀</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 2,
      title: 'DFA: Strings Starting with "a"',
      difficulty: 'easy',
      difficultyBadge: '🟢 Easy',
      topic: 'DFA Construction',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: 'Construct a DFA over the alphabet Σ = {a, b} that accepts all strings that start with the letter "a".',
      requirements: [
        'Define a start state q₀.',
        'Define accept state q₁ for strings starting with "a".',
        'Define dead/trap state q₂ for strings starting with "b".'
      ],
      visibleTestCases: [
        { input: 'a',  expected: true,  label: '"a"' },
        { input: 'ab', expected: true,  label: '"ab"' },
        { input: 'b',  expected: false, label: '"b"' },
        { input: 'ba', expected: false, label: '"ba"' }
      ],
      hiddenTestCases: [
        { input: '',    expected: false, label: 'ε (empty string)' },
        { input: 'aab', expected: true,  label: '"aab"' },
        { input: 'abbb',expected: true,  label: '"abbb"' },
        { input: 'bba', expected: false, label: '"bba"' },
        { input: 'bb',  expected: false, label: '"bb"' }
      ],
      template: {
        states: [
          { id: 0, x: 140, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 320, y: 120, isAccept: true,  label: 'q₁' },
          { id: 2, x: 320, y: 240, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'The automaton checks the very first character of the input. If it is "a", it enters an accepting loop. If "b", it falls into a trap state.',
        stateMeanings: [
          'q₀ (Start): Initial state before reading any character.',
          'q₁ (Accept): First symbol was "a". Remains in q₁ for all subsequent characters.',
          'q₂ (Dead): First symbol was "b". Remains in q₂ forever.'
        ],
        transitionReasoning: 'From q₀, reading "a" goes to q₁; reading "b" goes to q₂. Both q₁ and q₂ self-loop on "a" and "b".',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (start)</td><td>q₁</td><td>q₂</td><td>No</td></tr>
            <tr><td>q₁ ✓</td><td>q₁</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₂ (dead)</td><td>q₂</td><td>q₂</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 3,
      title: 'DFA: Even Number of 0s',
      difficulty: 'easy',
      difficultyBadge: '🟢 Easy',
      topic: 'DFA Parity',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} that accepts strings containing an EVEN number of 0s (including the empty string ε).',
      requirements: [
        'Start state q₀ must be an accept state (0 is even).',
        'State q₁ tracks an odd count of 0s.',
        '1s should not change parity states.'
      ],
      visibleTestCases: [
        { input: '',   expected: true,  label: 'ε (empty string)' },
        { input: '11', expected: true,  label: '"11"' },
        { input: '0',  expected: false, label: '"0"' },
        { input: '00', expected: true,  label: '"00"' }
      ],
      hiddenTestCases: [
        { input: '010',   expected: true,  label: '"010"' },
        { input: '000',   expected: false, label: '"000"' },
        { input: '10101', expected: true,  label: '"10101"' },
        { input: '10100', expected: false, label: '"10100"' }
      ],
      template: {
        states: [
          { id: 0, x: 180, y: 180, isAccept: true,  label: 'q₀' },
          { id: 1, x: 380, y: 180, isAccept: false, label: 'q₁' }
        ],
        transitions: [],
        start: 0,
        stateId: 2
      },
      explanation: {
        summary: 'A 2-state parity machine toggles between q₀ (even 0s) and q₁ (odd 0s) whenever a "0" is encountered.',
        stateMeanings: [
          'q₀ (Start & Accept): Even count of 0s.',
          'q₁: Odd count of 0s.'
        ],
        transitionReasoning: 'δ(q₀, 0) = q₁, δ(q₁, 0) = q₀. Input "1" self-loops on both states without altering count parity.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (start) ✓</td><td>q₁</td><td>q₀</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₀</td><td>q₁</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 4,
      title: 'NFA: Substring "00" or "11"',
      difficulty: 'easy',
      difficultyBadge: '🟢 Easy',
      topic: 'NFA Construction',
      topicIcon: '🔀',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a Non-deterministic Finite Automaton (NFA) over Σ = {0, 1} that accepts any string containing "00" or "11".',
      requirements: [
        'Create start state q₀.',
        'Use non-deterministic branches or state transitions for "00" and "11".',
        'Mark accept state once double symbol is detected.'
      ],
      visibleTestCases: [
        { input: '00',  expected: true,  label: '"00"' },
        { input: '11',  expected: true,  label: '"11"' },
        { input: '010', expected: false, label: '"010"' },
        { input: '101', expected: false, label: '"101"' }
      ],
      hiddenTestCases: [
        { input: '',     expected: false, label: 'ε' },
        { input: '000',  expected: true,  label: '"000"' },
        { input: '110',  expected: true,  label: '"110"' },
        { input: '0110', expected: true,  label: '"0110"' },
        { input: '01',   expected: false, label: '"01"' }
      ],
      template: {
        states: [
          { id: 0, x: 120, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 260, y: 120, isAccept: false, label: 'q₁' },
          { id: 2, x: 260, y: 240, isAccept: false, label: 'q₂' },
          { id: 3, x: 420, y: 180, isAccept: true,  label: 'q₃' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: 'NFA non-deterministically guesses when "00" or "11" begins while looping on q₀.',
        stateMeanings: [
          'q₀ (Start): Reading initial symbols (loops on 0,1).',
          'q₁: Saw first "0".',
          'q₂: Saw first "1".',
          'q₃ (Accept): Saw second matching symbol ("00" or "11").'
        ],
        transitionReasoning: 'q₀ loops on 0,1. Transition (q₀, 0, q₁), (q₁, 0, q₃) matches "00". Transition (q₀, 1, q₂), (q₂, 1, q₃) matches "11". q₃ loops on 0,1.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (start)</td><td>{q₀, q₁}</td><td>{q₀, q₂}</td><td>No</td></tr>
            <tr><td>q₁</td><td>{q₃}</td><td>∅</td><td>No</td></tr>
            <tr><td>q₂</td><td>∅</td><td>{q₃}</td><td>No</td></tr>
            <tr><td>q₃ ✓</td><td>{q₃}</td><td>{q₃}</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 5,
      title: 'DFA: Strings Over {a,b} Ending with "b"',
      difficulty: 'easy',
      difficultyBadge: '🟢 Easy',
      topic: 'DFA Construction',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: 'Construct a DFA over Σ = {a, b} that accepts all strings ending with the symbol "b". The empty string should be rejected.',
      requirements: [
        'q₀ is the start state (rejects — no input read yet).',
        'q₁ is the accept state — last symbol was "b".',
        'q₀ is also the state after reading "a".',
        'Transitions must be total (one per symbol per state).'
      ],
      visibleTestCases: [
        { input: 'b',   expected: true,  label: '"b"' },
        { input: 'ab',  expected: true,  label: '"ab"' },
        { input: 'a',   expected: false, label: '"a"' },
        { input: 'ba',  expected: false, label: '"ba"' }
      ],
      hiddenTestCases: [
        { input: '',     expected: false, label: 'ε (empty string)' },
        { input: 'aab',  expected: true,  label: '"aab"' },
        { input: 'abab', expected: false, label: '"abab"' },
        { input: 'bb',   expected: true,  label: '"bb"' },
        { input: 'bba',  expected: false, label: '"bba"' }
      ],
      template: {
        states: [
          { id: 0, x: 200, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 420, y: 180, isAccept: true,  label: 'q₁' }
        ],
        transitions: [],
        start: 0,
        stateId: 2
      },
      explanation: {
        summary: 'A 2-state DFA tracks only the last input symbol. Accepting state q₁ is entered when "b" is read, and q₀ is re-entered when "a" is read.',
        stateMeanings: [
          'q₀ (Start): Last symbol was "a" or no input read (not accepting).',
          'q₁ (Accept): Last symbol was "b".'
        ],
        transitionReasoning: 'δ(q₀, a)=q₀, δ(q₀, b)=q₁, δ(q₁, a)=q₀, δ(q₁, b)=q₁. Reading "b" always goes to q₁; reading "a" always goes to q₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (start)</td><td>q₀</td><td>q₁</td><td>No</td></tr>
            <tr><td>q₁ ✓</td><td>q₀</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },

    // ================================================================
    // --- MEDIUM (6 - 10) ---
    // ================================================================
    {
      id: 6,
      title: 'DFA: Substring "101"',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'Substring Detection',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} accepting all strings containing the exact substring "101".',
      requirements: [
        'Build a 4-state DFA.',
        'Track partial prefix matches: ε, "1", "10", "101".',
        'State q₃ is an absorbing accept state.'
      ],
      visibleTestCases: [
        { input: '101',   expected: true,  label: '"101"' },
        { input: '01010', expected: true,  label: '"01010"' },
        { input: '1001',  expected: false, label: '"1001"' },
        { input: '110',   expected: false, label: '"110"' }
      ],
      hiddenTestCases: [
        { input: '',      expected: false, label: 'ε' },
        { input: '1101',  expected: true,  label: '"1101"' },
        { input: '10101', expected: true,  label: '"10101"' },
        { input: '000',   expected: false, label: '"000"' },
        { input: '111',   expected: false, label: '"111"' }
      ],
      template: {
        states: [
          { id: 0, x: 120, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 240, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 360, y: 180, isAccept: false, label: 'q₂' },
          { id: 3, x: 480, y: 180, isAccept: true,  label: 'q₃' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: 'Tracks standard pattern matching for string "101".',
        stateMeanings: [
          'q₀ (Start): No match prefix.',
          'q₁: Last symbol was "1".',
          'q₂: Last two symbols were "10".',
          'q₃ (Accept): Substring "101" found. Remains in q₃.'
        ],
        transitionReasoning: 'δ(q₀,1)=q₁, δ(q₁,0)=q₂, δ(q₂,1)=q₃. Fallbacks: δ(q₁,1)=q₁ ("11" still ends in "1"), δ(q₂,0)=q₀ ("100" resets to q₀).',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀</td><td>q₀</td><td>q₁</td><td>No</td></tr>
            <tr><td>q₁</td><td>q₂</td><td>q₁</td><td>No</td></tr>
            <tr><td>q₂</td><td>q₀</td><td>q₃</td><td>No</td></tr>
            <tr><td>q₃ ✓</td><td>q₃</td><td>q₃</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 7,
      title: 'DFA: String Length Multiple of 3',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'Modulo Length',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: 'Construct a DFA over Σ = {a, b} accepting strings whose length |w| is a multiple of 3 (|w| mod 3 = 0).',
      requirements: [
        'q₀ is start & accept state (|w| ≡ 0 mod 3).',
        'q₁ represents |w| ≡ 1 mod 3.',
        'q₂ represents |w| ≡ 2 mod 3.'
      ],
      visibleTestCases: [
        { input: '',     expected: true,  label: 'ε (len 0)' },
        { input: 'abc',  expected: true,  label: '"abc" (len 3)' },
        { input: 'ab',   expected: false, label: '"ab" (len 2)' },
        { input: 'a',    expected: false, label: '"a" (len 1)' }
      ],
      hiddenTestCases: [
        { input: 'aabbcc', expected: true,  label: '"aabbcc" (len 6)' },
        { input: 'abaa',   expected: false, label: '"abaa" (len 4)' },
        { input: 'bbaabb', expected: true,  label: '"bbaabb" (len 6)' }
      ],
      template: {
        states: [
          { id: 0, x: 160, y: 180, isAccept: true,  label: 'q₀' },
          { id: 1, x: 300, y: 120, isAccept: false, label: 'q₁' },
          { id: 2, x: 440, y: 180, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'Modular arithmetic machine cycling through states mod 3.',
        stateMeanings: ['q₀: len ≡ 0 mod 3', 'q₁: len ≡ 1 mod 3', 'q₂: len ≡ 2 mod 3'],
        transitionReasoning: 'On any input (a or b), transitions move in cycle: q₀ → q₁ → q₂ → q₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₁</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₂</td><td>q₂</td><td>No</td></tr>
            <tr><td>q₂</td><td>q₀</td><td>q₀</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 8,
      title: 'NFA: 3rd Symbol from Right is "1"',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'NFA Branching',
      topicIcon: '🔀',
      alphabet: '{0, 1}',
      problemStatement: 'Construct an NFA over Σ = {0, 1} accepting all strings where the 3rd symbol from the right end is "1".',
      requirements: [
        'q₀ loops on 0 and 1.',
        'On symbol "1", non-deterministically branch to state q₁.',
        'Advance through q₂ and q₃ on any symbol to reach accept state.'
      ],
      visibleTestCases: [
        { input: '100', expected: true,  label: '"100"' },
        { input: '111', expected: true,  label: '"111"' },
        { input: '000', expected: false, label: '"000"' },
        { input: '01',  expected: false, label: '"01"' }
      ],
      hiddenTestCases: [
        { input: '1010', expected: true,  label: '"1010"' },
        { input: '0101', expected: true,  label: '"0101"' },
        { input: '0010', expected: false, label: '"0010"' },
        { input: '11',   expected: false, label: '"11"' },
        { input: '',     expected: false, label: 'ε' }
      ],
      template: {
        states: [
          { id: 0, x: 120, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 250, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 380, y: 180, isAccept: false, label: 'q₂' },
          { id: 3, x: 510, y: 180, isAccept: true,  label: 'q₃' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: 'Demonstrates NFA capability to non-deterministically select the 3rd character from the right.',
        stateMeanings: [
          'q₀ (Start): Reading arbitrary leading characters.',
          'q₁: Saw "1" 3rd from end.',
          'q₂: Saw 2nd symbol from end.',
          'q₃ (Accept): Saw 1st symbol from end (end of string).'
        ],
        transitionReasoning: 'δ(q₀, 0)={q₀}, δ(q₀, 1)={q₀, q₁}, δ(q₁, 0,1)={q₂}, δ(q₂, 0,1)={q₃}.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀</td><td>{q₀}</td><td>{q₀, q₁}</td><td>No</td></tr>
            <tr><td>q₁</td><td>{q₂}</td><td>{q₂}</td><td>No</td></tr>
            <tr><td>q₂</td><td>{q₃}</td><td>{q₃}</td><td>No</td></tr>
            <tr><td>q₃ ✓</td><td>∅</td><td>∅</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 9,
      title: 'ε-NFA: Language a*b*c*',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'ε-Transitions',
      topicIcon: 'ε',
      alphabet: '{a, b, c}',
      problemStatement: 'Construct an ε-NFA over Σ = {a, b, c} with ε-transitions accepting the language L = a*b*c*.',
      requirements: [
        'Define 3 states q₀, q₁, q₂ for a*s, b*s, and c*s.',
        'Use ε-transitions between states (q₀ → ε → q₁ → ε → q₂).',
        'Mark all states as accepting.'
      ],
      visibleTestCases: [
        { input: '',       expected: true,  label: 'ε' },
        { input: 'abc',    expected: true,  label: '"abc"' },
        { input: 'aaabbc', expected: true,  label: '"aaabbc"' },
        { input: 'ba',     expected: false, label: '"ba"' }
      ],
      hiddenTestCases: [
        { input: 'a',    expected: true,  label: '"a"' },
        { input: 'b',    expected: true,  label: '"b"' },
        { input: 'c',    expected: true,  label: '"c"' },
        { input: 'cb',   expected: false, label: '"cb"' },
        { input: 'bca',  expected: false, label: '"bca"' },
        { input: 'aabb', expected: true,  label: '"aabb"' }
      ],
      template: {
        states: [
          { id: 0, x: 140, y: 180, isAccept: true, label: 'q₀' },
          { id: 1, x: 300, y: 180, isAccept: true, label: 'q₁' },
          { id: 2, x: 460, y: 180, isAccept: true, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'ε-transitions allow moving silently from a-state to b-state to c-state without consuming input.',
        stateMeanings: ['q₀: Reading a\'s', 'q₁: Reading b\'s', 'q₂: Reading c\'s'],
        transitionReasoning: 'q₀ loops on "a", has ε-transition to q₁. q₁ loops on "b", has ε-transition to q₂. q₂ loops on "c".',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Input c</th><th>Input ε</th><th>Accept?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>{q₀}</td><td>∅</td><td>∅</td><td>{q₁}</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁ ✓</td><td>∅</td><td>{q₁}</td><td>∅</td><td>{q₂}</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₂ ✓</td><td>∅</td><td>∅</td><td>{q₂}</td><td>∅</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 10,
      title: 'DFA: Strings with Even Length',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'Modulo Length',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: 'Construct a DFA over Σ = {a, b} that accepts strings whose length is even (including ε, which has length 0).',
      requirements: [
        'q₀ is the start and accept state (even length).',
        'q₁ is the reject state (odd length).',
        'Every symbol toggles between the two states.'
      ],
      visibleTestCases: [
        { input: '',   expected: true,  label: 'ε (len 0)' },
        { input: 'aa', expected: true,  label: '"aa" (len 2)' },
        { input: 'a',  expected: false, label: '"a" (len 1)' },
        { input: 'ab', expected: true,  label: '"ab" (len 2)' }
      ],
      hiddenTestCases: [
        { input: 'aaa',    expected: false, label: '"aaa" (len 3)' },
        { input: 'abba',   expected: true,  label: '"abba" (len 4)' },
        { input: 'b',      expected: false, label: '"b" (len 1)' },
        { input: 'aabbaa', expected: true,  label: '"aabbaa" (len 6)' }
      ],
      template: {
        states: [
          { id: 0, x: 200, y: 180, isAccept: true,  label: 'q₀' },
          { id: 1, x: 400, y: 180, isAccept: false, label: 'q₁' }
        ],
        transitions: [],
        start: 0,
        stateId: 2
      },
      explanation: {
        summary: 'A 2-state parity machine counts characters modulo 2. Even length → q₀ (accept), Odd length → q₁.',
        stateMeanings: [
          'q₀ (Start & Accept): String length seen so far is even.',
          'q₁: String length seen so far is odd.'
        ],
        transitionReasoning: 'Every character (a or b) toggles state. δ(q₀, a)=q₁, δ(q₀, b)=q₁, δ(q₁, a)=q₀, δ(q₁, b)=q₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₁</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₀</td><td>q₀</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },

    // ================================================================
    // --- HARD (11 - 15) ---
    // ================================================================
    {
      id: 11,
      title: 'DFA: Binary Numbers Divisible by 3',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Divisibility Automata',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} accepting binary strings that represent numbers divisible by 3.',
      requirements: [
        'State q₀ represents value ≡ 0 mod 3 (Start & Accept).',
        'State q₁ represents value ≡ 1 mod 3.',
        'State q₂ represents value ≡ 2 mod 3.',
        'Use binary shift formula: next_val = (2 * cur_val + bit) mod 3.'
      ],
      visibleTestCases: [
        { input: '0',   expected: true,  label: '"0" (val 0)' },
        { input: '11',  expected: true,  label: '"11" (val 3)' },
        { input: '110', expected: true,  label: '"110" (val 6)' },
        { input: '10',  expected: false, label: '"10" (val 2)' }
      ],
      hiddenTestCases: [
        { input: '1001', expected: true,  label: '"1001" (val 9)' },
        { input: '1100', expected: true,  label: '"1100" (val 12)' },
        { input: '101',  expected: false, label: '"101" (val 5)' },
        { input: '111',  expected: false, label: '"111" (val 7)' },
        { input: '1111', expected: true,  label: '"1111" (val 15)' }
      ],
      template: {
        states: [
          { id: 0, x: 160, y: 140, isAccept: true,  label: 'q₀' },
          { id: 1, x: 340, y: 140, isAccept: false, label: 'q₁' },
          { id: 2, x: 250, y: 260, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'When appending bit b to binary value V, new value is 2V + b. Taking modulo 3 yields state transition rules.',
        stateMeanings: ['q₀: V ≡ 0 mod 3', 'q₁: V ≡ 1 mod 3', 'q₂: V ≡ 2 mod 3'],
        transitionReasoning: 'From q₀: +0 → 0 (q₀), +1 → 1 (q₁). From q₁: +0 → 2 (q₂), +1 → 3≡0 (q₀). From q₂: +0 → 4≡1 (q₁), +1 → 5≡2 (q₂).',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ (val≡0) ✓</td><td>q₀</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁ (val≡1)</td><td>q₂</td><td>q₀</td><td>No</td></tr>
            <tr><td>q₂ (val≡2)</td><td>q₁</td><td>q₂</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 12,
      title: 'DFA: No Consecutive "11"',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Constraint DFA',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a minimal DFA over Σ = {0, 1} accepting all strings that do NOT contain two consecutive 1s ("11").',
      requirements: [
        'q₀: Last saw "0" or initial state (Accept).',
        'q₁: Last saw single "1" (Accept).',
        'q₂: Dead state after seeing "11" (Reject).'
      ],
      visibleTestCases: [
        { input: '',      expected: true,  label: 'ε' },
        { input: '01010', expected: true,  label: '"01010"' },
        { input: '11',    expected: false, label: '"11"' },
        { input: '0110',  expected: false, label: '"0110"' }
      ],
      hiddenTestCases: [
        { input: '0',     expected: true,  label: '"0"' },
        { input: '1',     expected: true,  label: '"1"' },
        { input: '10',    expected: true,  label: '"10"' },
        { input: '101',   expected: true,  label: '"101"' },
        { input: '110',   expected: false, label: '"110"' },
        { input: '10110', expected: false, label: '"10110"' }
      ],
      template: {
        states: [
          { id: 0, x: 140, y: 180, isAccept: true,  label: 'q₀' },
          { id: 1, x: 300, y: 140, isAccept: true,  label: 'q₁' },
          { id: 2, x: 460, y: 220, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'Accepts all binary strings avoiding the forbidden sequence "11".',
        stateMeanings: [
          'q₀ (Start & Accept): Safe state, last symbol read was 0 or start.',
          'q₁ (Accept): Caution state, last symbol read was 1.',
          'q₂ (Dead): Trapped state, consecutive "11" occurred.'
        ],
        transitionReasoning: 'δ(q₀, 0)=q₀, δ(q₀, 1)=q₁. δ(q₁, 0)=q₀, δ(q₁, 1)=q₂ (trap). q₂ self-loops on 0 and 1.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₀</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁ ✓</td><td>q₀</td><td>q₂</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₂ (dead)</td><td>q₂</td><td>q₂</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 13,
      title: 'DFA: Number of 1s ≡ 0 (mod 3)',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Modulo Counting',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} that accepts strings where the total count of "1"s is divisible by 3. Zeros are ignored (they do not affect count).',
      requirements: [
        'q₀: count of 1s ≡ 0 mod 3 (Start & Accept).',
        'q₁: count of 1s ≡ 1 mod 3.',
        'q₂: count of 1s ≡ 2 mod 3.',
        'Symbol "0" must self-loop (no state change).'
      ],
      visibleTestCases: [
        { input: '',    expected: true,  label: 'ε (0 ones)' },
        { input: '111', expected: true,  label: '"111" (3 ones)' },
        { input: '1',   expected: false, label: '"1" (1 one)' },
        { input: '11',  expected: false, label: '"11" (2 ones)' }
      ],
      hiddenTestCases: [
        { input: '0000',   expected: true,  label: '"0000" (0 ones)' },
        { input: '101010', expected: true,  label: '"101010" (3 ones)' },
        { input: '1001',   expected: false, label: '"1001" (2 ones)' },
        { input: '111111', expected: true,  label: '"111111" (6 ones)' },
        { input: '10',     expected: false, label: '"10" (1 one)' }
      ],
      template: {
        states: [
          { id: 0, x: 200, y: 160, isAccept: true,  label: 'q₀' },
          { id: 1, x: 400, y: 160, isAccept: false, label: 'q₁' },
          { id: 2, x: 300, y: 290, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'Counts 1s modulo 3. Zeros are irrelevant and cause self-loops on every state.',
        stateMeanings: [
          'q₀ (Start & Accept): Seen 0, 3, 6, ... ones (≡0 mod 3).',
          'q₁: Seen 1, 4, 7, ... ones (≡1 mod 3).',
          'q₂: Seen 2, 5, 8, ... ones (≡2 mod 3).'
        ],
        transitionReasoning: 'On "0": all states self-loop. On "1": q₀→q₁→q₂→q₀ (cyclic increment mod 3).',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₀</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₁</td><td>q₂</td><td>No</td></tr>
            <tr><td>q₂</td><td>q₂</td><td>q₀</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 14,
      title: 'NFA → DFA: Subset Construction',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'NFA → DFA Conversion',
      topicIcon: '🔄',
      alphabet: '{a, b}',
      problemStatement: 'An NFA accepts strings ending with "ab". Convert this NFA to an equivalent DFA using subset construction. Build the resulting DFA directly on the canvas.',
      requirements: [
        'The NFA has states: q₀ (start, loops on a,b), q₁ (after "a"), q₂ accept (after "ab").',
        'NFA: δ(q₀,a)={q₀,q₁}, δ(q₀,b)={q₀}, δ(q₁,b)={q₂}, δ(q₂,—)=∅.',
        'Compute all subset states: {q₀}, {q₀,q₁}, {q₀,q₂}, {q₀,q₁,q₂}.',
        'Build the DFA with at most 4 states corresponding to NFA subsets.'
      ],
      visibleTestCases: [
        { input: 'ab',   expected: true,  label: '"ab"' },
        { input: 'aab',  expected: true,  label: '"aab"' },
        { input: 'bab',  expected: true,  label: '"bab"' },
        { input: 'ba',   expected: false, label: '"ba"' }
      ],
      hiddenTestCases: [
        { input: '',      expected: false, label: 'ε' },
        { input: 'a',     expected: false, label: '"a"' },
        { input: 'b',     expected: false, label: '"b"' },
        { input: 'aaab',  expected: true,  label: '"aaab"' },
        { input: 'abab',  expected: true,  label: '"abab"' },
        { input: 'abba',  expected: false, label: '"abba"' }
      ],
      template: {
        states: [
          { id: 0, x: 120, y: 180, isAccept: false, label: 'D₀' },
          { id: 1, x: 280, y: 120, isAccept: false, label: 'D₁' },
          { id: 2, x: 440, y: 180, isAccept: true,  label: 'D₂' },
          { id: 3, x: 280, y: 260, isAccept: false, label: 'D₃' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: 'Subset construction maps NFA state-sets to DFA states. D₀={q₀}, D₁={q₀,q₁}, D₂={q₀,q₁,q₂} (accept), D₃={q₀} (same as D₀ for dead paths).',
        stateMeanings: [
          'D₀ = {q₀}: Start — no match progress.',
          'D₁ = {q₀,q₁}: Last symbol was "a" — potentially starting "ab".',
          'D₂ = {q₀,q₁,q₂}: Last two symbols were "ab" — accept! (also loops for next "a").',
          'D₃ = same as D₀ for b-only loops.'
        ],
        transitionReasoning: 'D₀ -a→ D₁, D₀ -b→ D₀. D₁ -a→ D₁, D₁ -b→ D₂. D₂ -a→ D₁, D₂ -b→ D₀.',
        tableHtml: `
        <table>
          <thead><tr><th>DFA State</th><th>NFA Subset</th><th>Input a</th><th>Input b</th><th>Accept?</th></tr></thead>
          <tbody>
            <tr><td>→ D₀</td><td>{q₀}</td><td>D₁</td><td>D₀</td><td>No</td></tr>
            <tr><td>D₁</td><td>{q₀,q₁}</td><td>D₁</td><td>D₂</td><td>No</td></tr>
            <tr><td>D₂ ✓</td><td>{q₀,q₁,q₂}</td><td>D₁</td><td>D₀</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    {
      id: 15,
      title: 'DFA: Strings Where |0s| − |1s| ≡ 0 (mod 3)',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Complex Constraint DFA',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} that accepts strings where the difference (count of 0s) − (count of 1s) is divisible by 3.',
      requirements: [
        'Track (count_0 − count_1) mod 3.',
        'q₀: difference ≡ 0 mod 3 (Start & Accept).',
        'q₁: difference ≡ 1 mod 3.',
        'q₂: difference ≡ 2 mod 3 (equivalently −1 mod 3).',
        'Reading "0" increments the difference; reading "1" decrements it (mod 3).'
      ],
      visibleTestCases: [
        { input: '',    expected: true,  label: 'ε (diff=0)' },
        { input: '000', expected: true,  label: '"000" (diff=3≡0)' },
        { input: '0',   expected: false, label: '"0" (diff=1)' },
        { input: '01',  expected: false, label: '"01" (diff=0, wait—0−1=−1≡2)' }
      ],
      hiddenTestCases: [
        { input: '111',    expected: true,  label: '"111" (diff=−3≡0)' },
        { input: '001',    expected: false, label: '"001" (diff=1)' },
        { input: '0011',   expected: false, label: '"0011" (diff=−2≡1) ... actually diff=0' },
        { input: '0110',   expected: true,  label: '"0110" (0−1−1+0=−1? check actual)' },
        { input: '000111', expected: true,  label: '"000111" (diff=3−3=0)' }
      ],
      template: {
        states: [
          { id: 0, x: 200, y: 160, isAccept: true,  label: 'q₀' },
          { id: 1, x: 400, y: 160, isAccept: false, label: 'q₁' },
          { id: 2, x: 300, y: 290, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'Track (count_0 − count_1) mod 3. Reading "0" adds 1 to the difference, reading "1" subtracts 1 (adds 2 mod 3).',
        stateMeanings: [
          'q₀ (Start & Accept): (count_0 − count_1) ≡ 0 mod 3.',
          'q₁: difference ≡ 1 mod 3.',
          'q₂: difference ≡ 2 mod 3 (same as −1 mod 3).'
        ],
        transitionReasoning: 'On "0" (increment by 1 mod 3): q₀→q₁, q₁→q₂, q₂→q₀. On "1" (decrement, i.e., +2 mod 3): q₀→q₂, q₁→q₀, q₂→q₁.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0 (+1 mod 3)</th><th>Input 1 (−1 mod 3)</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₁</td><td>q₂</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₂</td><td>q₀</td><td>No</td></tr>
            <tr><td>q₂</td><td>q₀</td><td>q₁</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    }
  ];

  // Fix hidden test cases for challenge 15 to be accurate
  ARENA_CHALLENGES[14].hiddenTestCases = [
    { input: '111',    expected: true,  label: '"111" (0−3=−3≡0)' },
    { input: '001',    expected: false, label: '"001" (2−1=1≡1)' },
    { input: '0011',   expected: true,  label: '"0011" (2−2=0≡0)' },
    { input: '0110',   expected: false, label: '"0110" (1−2=−1≡2)' },
    { input: '000111', expected: true,  label: '"000111" (3−3=0≡0)' }
  ];

  // Fix visible test case 4 for challenge 15 (01: 1 zero, 1 one → diff=0... actually 1−1=0 mod 3 = 0 → accept)
  ARENA_CHALLENGES[14].visibleTestCases = [
    { input: '',     expected: true,  label: 'ε (diff=0≡0)' },
    { input: '000',  expected: true,  label: '"000" (3 zeros, diff=3≡0)' },
    { input: '0',    expected: false, label: '"0" (diff=1≡1)' },
    { input: '11',   expected: false, label: '"11" (diff=−2≡1)' }
  ];

  // ================================================================
  // NEW CHALLENGES 16 – 20
  // ================================================================
  ARENA_CHALLENGES.push(
    // ----- CHALLENGE 16 -----
    {
      id: 16,
      title: 'DFA: Every "a" Immediately Followed by "b"',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'Constraint DFA',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: 'Construct a DFA over Σ = {a, b} that accepts all strings where every occurrence of "a" is immediately followed by "b". Strings that end with an unpaired "a" must be rejected.',
      requirements: [
        'q₀ is the start state and an accept state (safe — no pending "a").',
        'q₁ is non-accepting: just read "a" and now waiting for "b" to follow.',
        'q₂ is a dead/trap state: constraint violated (e.g. "aa" or string ended in q₁).',
        'Every state must have transitions defined for both "a" and "b".'
      ],
      visibleTestCases: [
        { input: '',    expected: true,  label: 'ε (empty string)' },
        { input: 'ab',  expected: true,  label: '"ab"' },
        { input: 'a',   expected: false, label: '"a" (ends with a)' },
        { input: 'ba',  expected: false, label: '"ba" (ends with a)' }
      ],
      hiddenTestCases: [
        { input: 'b',     expected: true,  label: '"b"' },
        { input: 'bab',   expected: true,  label: '"bab"' },
        { input: 'abab',  expected: true,  label: '"abab"' },
        { input: 'abb',   expected: true,  label: '"abb"' },
        { input: 'aa',    expected: false, label: '"aa"' },
        { input: 'bba',   expected: false, label: '"bba"' }
      ],
      template: {
        states: [
          { id: 0, x: 160, y: 180, isAccept: true,  label: 'q₀' },
          { id: 1, x: 350, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 540, y: 180, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'This DFA enforces the constraint that every "a" must be immediately followed by "b". State q₁ is a "danger" state entered after reading "a". If the string ends in q₁, or another "a" follows, it falls into dead state q₂.',
        stateMeanings: [
          'q₀ (Start & Accept): Safe — last symbol was "b" or start of string. No pending constraint.',
          'q₁ (Non-Accept): Just read "a" — must see "b" next to satisfy constraint.',
          'q₂ (Dead): Constraint violated (e.g. consecutive a\'s). Absorbing trap state.'
        ],
        transitionReasoning: 'δ(q₀, a)=q₁ (danger), δ(q₀, b)=q₀ (safe). δ(q₁, b)=q₀ (satisfied), δ(q₁, a)=q₂ (violation). q₂ self-loops on both a and b forever.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀ ✓</td><td>q₁</td><td>q₀</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁</td><td>q₂</td><td>q₀</td><td>No</td></tr>
            <tr><td>q₂ (dead)</td><td>q₂</td><td>q₂</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    // ----- CHALLENGE 17 -----
    {
      id: 17,
      title: 'NFA: Strings Ending with "10"',
      difficulty: 'medium',
      difficultyBadge: '🟡 Medium',
      topic: 'NFA Construction',
      topicIcon: '🔀',
      alphabet: '{0, 1}',
      problemStatement: 'Construct an NFA over Σ = {0, 1} that accepts all strings that end with the suffix "10". The NFA non-deterministically guesses when the last two symbols begin.',
      requirements: [
        'q₀ is the start state and loops on both 0 and 1 (reads any prefix).',
        'On reading "1", non-deterministically branch to q₁ (guess it is 2nd-to-last).',
        'q₂ is the accept state — reached from q₁ on reading "0".',
        'q₂ has no outgoing transitions (it must be the final state).'
      ],
      visibleTestCases: [
        { input: '10',   expected: true,  label: '"10"' },
        { input: '110',  expected: true,  label: '"110"' },
        { input: '0',    expected: false, label: '"0"' },
        { input: '01',   expected: false, label: '"01"' }
      ],
      hiddenTestCases: [
        { input: '',      expected: false, label: 'ε' },
        { input: '1',     expected: false, label: '"1"' },
        { input: '010',   expected: true,  label: '"010"' },
        { input: '1010',  expected: true,  label: '"1010"' },
        { input: '100',   expected: false, label: '"100"' },
        { input: '0110',  expected: true,  label: '"0110"' }
      ],
      template: {
        states: [
          { id: 0, x: 130, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 310, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 490, y: 180, isAccept: true,  label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'The NFA non-deterministically guesses when the suffix "10" begins. q₀ loops reading any prefix characters. On any "1", it may branch to q₁. Reading "0" from q₁ leads to accept state q₂.',
        stateMeanings: [
          'q₀ (Start): Reads any prefix — self-loops on 0 and 1.',
          'q₁: Guessed that the current "1" is the second-to-last character.',
          'q₂ (Accept): Confirmed "10" at the end of string. No outgoing transitions.'
        ],
        transitionReasoning: 'δ(q₀, 0)={q₀}, δ(q₀, 1)={q₀, q₁}. δ(q₁, 0)={q₂}, δ(q₁, 1)=∅. δ(q₂, —)=∅.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀</td><td>{q₀}</td><td>{q₀, q₁}</td><td>No</td></tr>
            <tr><td>q₁</td><td>{q₂}</td><td>∅</td><td>No</td></tr>
            <tr><td>q₂ ✓</td><td>∅</td><td>∅</td><td class="state-accept">Yes ✓</td></tr>
          </tbody>
        </table>`
      }
    },
    // ----- CHALLENGE 18 -----
    {
      id: 18,
      title: 'DFA: Strings with Exactly Two 1s',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Counting DFA',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} that accepts strings containing exactly 2 occurrences of the symbol "1". Strings with fewer or more than 2 ones must be rejected.',
      requirements: [
        'q₀: 0 ones seen — start state, reject.',
        'q₁: exactly 1 one seen — reject.',
        'q₂: exactly 2 ones seen — the sole accept state.',
        'q₃: 3 or more ones seen — dead/trap state, reject.',
        '"0" must self-loop on every state (zeros do not affect the count of ones).'
      ],
      visibleTestCases: [
        { input: '11',   expected: true,  label: '"11" (two 1s)' },
        { input: '101',  expected: true,  label: '"101" (two 1s)' },
        { input: '1',    expected: false, label: '"1" (one 1)' },
        { input: '111',  expected: false, label: '"111" (three 1s)' }
      ],
      hiddenTestCases: [
        { input: '',      expected: false, label: 'ε (zero 1s)' },
        { input: '0',     expected: false, label: '"0" (zero 1s)' },
        { input: '011',   expected: true,  label: '"011" (two 1s)' },
        { input: '1100',  expected: true,  label: '"1100" (two 1s)' },
        { input: '1001',  expected: true,  label: '"1001" (two 1s)' },
        { input: '1111',  expected: false, label: '"1111" (four 1s)' },
        { input: '100',   expected: false, label: '"100" (one 1)' }
      ],
      template: {
        states: [
          { id: 0, x:  90, y: 180, isAccept: false, label: 'q₀' },
          { id: 1, x: 250, y: 180, isAccept: false, label: 'q₁' },
          { id: 2, x: 410, y: 180, isAccept: true,  label: 'q₂' },
          { id: 3, x: 570, y: 180, isAccept: false, label: 'q₃' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: 'A 4-state counting DFA. Each state encodes how many "1"s have been seen, capped at 3+. Zeros cause self-loops; ones advance the state counter. Only q₂ is accepting.',
        stateMeanings: [
          'q₀ (Start): Zero 1s seen. Not accepting.',
          'q₁: Exactly one "1" seen. Not accepting.',
          'q₂ (Accept): Exactly two "1"s seen. Accepting.',
          'q₃ (Dead): Three or more "1"s — trapped forever. Not accepting.'
        ],
        transitionReasoning: 'On "0": every state self-loops (zeros are transparent). On "1": q₀→q₁→q₂→q₃, and q₃ self-loops (permanent trap).',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀</td><td>q₀</td><td>q₁</td><td>No</td></tr>
            <tr><td>q₁</td><td>q₁</td><td>q₂</td><td>No</td></tr>
            <tr><td>q₂ ✓</td><td>q₂</td><td>q₃</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₃ (dead)</td><td>q₃</td><td>q₃</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    // ----- CHALLENGE 19 -----
    {
      id: 19,
      title: 'DFA: Count of 0s ≡ 1 (mod 3)',
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Modulo Counting',
      topicIcon: '🤖',
      alphabet: '{0, 1}',
      problemStatement: 'Construct a DFA over Σ = {0, 1} accepting strings where the total count of "0"s, divided by 3, leaves a remainder of exactly 1. Symbol "1" does not change the zero-count (it causes a self-loop on every state).',
      requirements: [
        'q₀: count(0) ≡ 0 mod 3 — start state, reject (0, 3, 6 ... zeros).',
        'q₁: count(0) ≡ 1 mod 3 — the sole accept state (1, 4, 7 ... zeros).',
        'q₂: count(0) ≡ 2 mod 3 — reject (2, 5, 8 ... zeros).',
        '"1" self-loops on all states (ones are transparent).',
        '"0" must cycle states: q₀ → q₁ → q₂ → q₀.'
      ],
      visibleTestCases: [
        { input: '',    expected: false, label: 'ε (0 zeros)' },
        { input: '0',   expected: true,  label: '"0" (1 zero)' },
        { input: '00',  expected: false, label: '"00" (2 zeros)' },
        { input: '01',  expected: true,  label: '"01" (1 zero + a 1)' }
      ],
      hiddenTestCases: [
        { input: '1',      expected: false, label: '"1" (0 zeros)' },
        { input: '10',     expected: true,  label: '"10" (1 zero)' },
        { input: '000',    expected: false, label: '"000" (3 zeros)' },
        { input: '0000',   expected: true,  label: '"0000" (4 zeros)' },
        { input: '100',    expected: false, label: '"100" (2 zeros)' },
        { input: '100100', expected: true,  label: '"100100" (4 zeros)' }
      ],
      template: {
        states: [
          { id: 0, x: 200, y: 200, isAccept: false, label: 'q₀' },
          { id: 1, x: 430, y: 100, isAccept: true,  label: 'q₁' },
          { id: 2, x: 430, y: 280, isAccept: false, label: 'q₂' }
        ],
        transitions: [],
        start: 0,
        stateId: 3
      },
      explanation: {
        summary: 'Analogous to counting 1s mod 3 (Challenge #13), but here we track count of 0s modulo 3. Symbol "1" is completely invisible — it causes self-loops. Only "0" advances through the 3-state cycle.',
        stateMeanings: [
          'q₀ (Start): count(0) ≡ 0 mod 3. Reject.',
          'q₁ (Accept): count(0) ≡ 1 mod 3. Accept.',
          'q₂: count(0) ≡ 2 mod 3. Reject.'
        ],
        transitionReasoning: 'On "1": all states self-loop (transparent). On "0": cyclic — q₀→q₁→q₂→q₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀</td><td>q₁</td><td>q₀</td><td>No</td></tr>
            <tr><td>q₁ ✓</td><td>q₂</td><td>q₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₂</td><td>q₀</td><td>q₂</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    },
    // ----- CHALLENGE 20 -----
    {
      id: 20,
      title: "DFA: Even Count of Both a's and b's",
      difficulty: 'hard',
      difficultyBadge: '🔴 Hard',
      topic: 'Cross-Product DFA',
      topicIcon: '🤖',
      alphabet: '{a, b}',
      problemStatement: "Construct a DFA over Σ = {a, b} accepting strings where BOTH the count of 'a's AND the count of 'b's are even (0 is even). This is a classic cross-product (product) construction combining two independent 2-state parity DFAs.",
      requirements: [
        'Use 4 states representing (a-parity, b-parity) combinations.',
        'q₀₀ (even a, even b) — start state and the only accept state.',
        'q₁₀ (odd a, even b) — reject.',
        'q₀₁ (even a, odd b) — reject.',
        'q₁₁ (odd a, odd b) — reject.',
        '"a" toggles the a-parity bit; "b" toggles the b-parity bit.'
      ],
      visibleTestCases: [
        { input: '',      expected: true,  label: 'ε (0a, 0b — both even)' },
        { input: 'aabb',  expected: true,  label: '"aabb" (2a, 2b)' },
        { input: 'ab',    expected: false, label: '"ab" (1a, 1b)' },
        { input: 'a',     expected: false, label: '"a" (1a, 0b)' }
      ],
      hiddenTestCases: [
        { input: 'b',     expected: false, label: '"b" (0a, 1b)' },
        { input: 'aa',    expected: true,  label: '"aa" (2a, 0b)' },
        { input: 'bb',    expected: true,  label: '"bb" (0a, 2b)' },
        { input: 'abba',  expected: true,  label: '"abba" (2a, 2b)' },
        { input: 'abab',  expected: true,  label: '"abab" (2a, 2b)' },
        { input: 'aba',   expected: false, label: '"aba" (2a, 1b)' },
        { input: 'aab',   expected: false, label: '"aab" (2a, 1b)' }
      ],
      template: {
        states: [
          { id: 0, x: 155, y: 130, isAccept: true,  label: 'q₀₀' },
          { id: 1, x: 490, y: 130, isAccept: false, label: 'q₁₀' },
          { id: 2, x: 155, y: 260, isAccept: false, label: 'q₀₁' },
          { id: 3, x: 490, y: 260, isAccept: false, label: 'q₁₁' }
        ],
        transitions: [],
        start: 0,
        stateId: 4
      },
      explanation: {
        summary: "Product construction: state (p, q) encodes (a-parity, b-parity). Reading 'a' flips the first component; reading 'b' flips the second. Only state (even, even) = q₀₀ accepts.",
        stateMeanings: [
          "q₀₀ (Start & Accept): even a's AND even b's.",
          "q₁₀: odd a's, even b's.",
          "q₀₁: even a's, odd b's.",
          "q₁₁: odd a's, odd b's."
        ],
        transitionReasoning: 'δ(q₀₀,a)=q₁₀, δ(q₀₀,b)=q₀₁. δ(q₁₀,a)=q₀₀, δ(q₁₀,b)=q₁₁. δ(q₀₁,a)=q₁₁, δ(q₀₁,b)=q₀₀. δ(q₁₁,a)=q₀₁, δ(q₁₁,b)=q₁₀.',
        tableHtml: `
        <table>
          <thead><tr><th>State</th><th>Meaning</th><th>Input a</th><th>Input b</th><th>Accept?</th></tr></thead>
          <tbody>
            <tr><td>→ q₀₀ ✓</td><td>even a, even b</td><td>q₁₀</td><td>q₀₁</td><td class="state-accept">Yes ✓</td></tr>
            <tr><td>q₁₀</td><td>odd a, even b</td><td>q₀₀</td><td>q₁₁</td><td>No</td></tr>
            <tr><td>q₀₁</td><td>even a, odd b</td><td>q₁₁</td><td>q₀₀</td><td>No</td></tr>
            <tr><td>q₁₁</td><td>odd a, odd b</td><td>q₀₁</td><td>q₁₀</td><td>No</td></tr>
          </tbody>
        </table>`
      }
    }
  );

  class ArenaEngine {
    constructor() {
      this.challenges = ARENA_CHALLENGES;
      this.activeChallengeId = null;
      this.currentFilter = 'all';
      this.testResults = null;
      this.scoreStore = scoreStore;
    }

    getChallenge(id) {
      return this.challenges.find(c => c.id === parseInt(id));
    }

    openChallenge(id) {
      const c = this.getChallenge(id);
      if (!c) return;

      this.activeChallengeId = c.id;
      this.testResults = null;

      // Initialize canvas states with challenge template
      if (c.template) {
        window.cvStates      = JSON.parse(JSON.stringify(c.template.states      || []));
        window.cvTransitions = JSON.parse(JSON.stringify(c.template.transitions || []));
        window.cvStart       = c.template.start ?? null;
        window.cvStateId     = c.template.stateId || 3;
      } else {
        window.resetCanvas && window.resetCanvas();
      }

      this.updateUI();
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }

    closeChallenge() {
      this.activeChallengeId = null;
      this.testResults = null;
      this.updateUI();
    }

    filterChallenges(filter, btn) {
      this.currentFilter = filter;
      document.querySelectorAll('.arena-filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      this.updateUI();
    }

    submitSolution() {
      if (!this.activeChallengeId) return;
      const c = this.getChallenge(this.activeChallengeId);
      if (!c) return;

      if (!window.cvStates || window.cvStates.length === 0) {
        alert('Please add at least one state to your automaton canvas before submitting.');
        return;
      }

      if (window.cvStart === null || window.cvStart === undefined) {
        alert('Please set a Start State (using ▶ Set Start tool) before submitting.');
        return;
      }

      // Combine visible and hidden test cases
      const allTests = [
        ...c.visibleTestCases.map(tc => ({ ...tc, category: 'Visible' })),
        ...c.hiddenTestCases.map(tc  => ({ ...tc, category: 'Hidden'  }))
      ];

      let passedCount = 0;
      const caseResults = [];
      let firstFailedCase = null;

      allTests.forEach(tc => {
        const res        = window.simulateNFA(tc.input);
        const userAccept = res.accepted;
        const pass       = (userAccept === tc.expected);

        if (pass) passedCount++;
        else if (!firstFailedCase) firstFailedCase = { input: tc.input, expected: tc.expected, user: userAccept };

        caseResults.push({
          input:    tc.input === '' ? 'ε (empty string)' : `"${tc.input}"`,
          rawInput: tc.input,
          expected: tc.expected ? 'ACCEPT' : 'REJECT',
          user:     userAccept  ? 'ACCEPT' : 'REJECT',
          pass,
          category: tc.category
        });
      });

      const total    = allTests.length;
      const scorePct = Math.round((passedCount / total) * 100);
      const isPassed = (passedCount === total);

      this.testResults = { passedCount, total, scorePct, isPassed, caseResults, firstFailedCase };

      // Persist best score to localStorage
      this.scoreStore.save(this.activeChallengeId, scorePct);

      // Record progress in journey engine
      if (isPassed || scorePct >= 80) {
        if (window.journeyEngine) {
          window.journeyEngine.recordChallengeCompletion(c.topic || 'dfa', c.id);
          window.journeyEngine.recordActivity('mastery', 'challenge');
        }
      }

      this.renderResults();
      this._updateVisibleTestRows();
    }

    renderResults() {
      const resContainer = document.getElementById('arena-results-container');
      if (!resContainer || !this.testResults) return;

      const r = this.testResults;
      const c = this.getChallenge(this.activeChallengeId);

      resContainer.style.display = 'block';
      resContainer.innerHTML = `
      <div class="arena-results-card ${r.isPassed ? 'passed' : 'failed'}">
        <!-- RESULTS HEADER -->
        <div class="results-header">
          <div class="results-title-group">
            <h3>🏆 Challenge Result</h3>
            <span class="results-score-badge ${r.isPassed ? 'score-pass' : 'score-fail'}">
              Score: ${r.passedCount} / ${r.total} &nbsp;·&nbsp; ${r.scorePct}%
            </span>
          </div>
          <span class="results-status-pill ${r.isPassed ? 'pill-pass' : 'pill-fail'}">
            ${r.isPassed ? '✅ ALL TESTS PASSED!' : '⚠️ NEEDS REVISION'}
          </span>
        </div>
        <div class="arena-score-bar-wrap">
          <div class="arena-score-bar-track">
            <div class="arena-score-bar-fill ${r.isPassed ? 'fill-pass' : r.scorePct >= 60 ? 'fill-mid' : 'fill-fail'}" style="width:0%" data-target="${r.scorePct}"></div>
          </div>
          <span class="arena-score-pct-label">${r.scorePct}%</span>
        </div>

        <!-- STATUS CALLOUT -->
        ${r.firstFailedCase ? `
          <div class="callout callout-warning mt-12 mb-16">
            <span class="callout-icon">⚠️</span>
            <div class="callout-body">
              <h4>First Failed Test</h4>
              <p>
                Input: <code class="ic">${r.firstFailedCase.input === '' ? 'ε' : r.firstFailedCase.input}</code>
                &nbsp;·&nbsp;
                Expected: <strong>${r.firstFailedCase.expected ? 'ACCEPT' : 'REJECT'}</strong>
                &nbsp;·&nbsp;
                Your machine: <strong style="color:var(--danger)">${r.firstFailedCase.user ? 'ACCEPT' : 'REJECT'}</strong>
              </p>
            </div>
          </div>
        ` : `
          <div class="callout callout-green mt-12 mb-16">
            <span class="callout-icon">🎉</span>
            <div class="callout-body">
              <h4>Excellent Machine Construction!</h4>
              <p>Your automaton correctly satisfied all visible and hidden verification test cases.</p>
            </div>
          </div>
        `}

        <!-- TEST EXECUTION TABLE -->
        <h4 class="test-table-title">Automated Test Execution Breakdown</h4>
        <div class="table-wrap">
          <table class="arena-test-table">
            <thead>
              <tr>
                <th>Input</th>
                <th>Type</th>
                <th>Expected</th>
                <th>Your Machine</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              ${r.caseResults.map(cr => `
                <tr class="${cr.pass ? 'row-pass' : 'row-fail'}">
                  <td><code class="ic">${cr.input}</code></td>
                  <td><span class="badge ${cr.category === 'Visible' ? 'badge-primary' : 'badge-accent'}">${cr.category}</span></td>
                  <td><span class="badge ${cr.expected === 'ACCEPT' ? 'badge-success' : 'badge-subtle'}">${cr.expected}</span></td>
                  <td><span class="badge ${cr.user === 'ACCEPT' ? 'badge-success' : 'badge-danger'}">${cr.user}</span></td>
                  <td class="${cr.pass ? 'verdict-pass' : 'verdict-fail'}">${cr.pass ? '✓ Pass' : '✗ Fail'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="arena-action-btns mt-20">
          <button class="btn btn-outline btn-sm" id="arena-exp-toggle-btn" onclick="window.arenaEngine.toggleExplanation()">
            📖 View Explanation
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.arenaEngine.submitSolution()">
            🔄 Re-test Solution
          </button>
          ${c.id < this.challenges.length ? `
            <button class="btn btn-success btn-sm" onclick="window.arenaEngine.openChallenge(${c.id + 1})">
              Next Challenge →
            </button>
          ` : `
            <button class="btn btn-success btn-sm" onclick="window.arenaEngine.closeChallenge()">
              🏁 Back to Arena
            </button>
          `}
        </div>

        <!-- EXPLANATION SECTION (hidden until toggled) -->
        <div class="arena-explanation-box ${r.isPassed ? '' : 'hidden'}" id="arena-explanation-box">
          <div class="exp-header">📖 STEP-BY-STEP CONSTRUCTIVE EXPLANATION</div>
          <div class="exp-body">
            <p class="exp-summary">${c.explanation.summary}</p>

            <h4 class="exp-subtitle">State Design &amp; Meaning</h4>
            <ul class="exp-list">
              ${c.explanation.stateMeanings.map(s => `<li>${s}</li>`).join('')}
            </ul>

            <h4 class="exp-subtitle">Transition Reasoning</h4>
            <p class="exp-text">${c.explanation.transitionReasoning}</p>

            <h4 class="exp-subtitle">Correct Transition Table</h4>
            <div class="table-wrap mt-8">
              ${c.explanation.tableHtml}
            </div>
          </div>
        </div>
      </div>
      `;

      resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Animate score bar fill
      setTimeout(() => {
        const bar = resContainer.querySelector('.arena-score-bar-fill');
        if (bar) bar.style.width = bar.dataset.target + '%';
      }, 120);
    }

    _updateVisibleTestRows() {
      if (!this.testResults) return;
      const { caseResults } = this.testResults;
      const c = this.getChallenge(this.activeChallengeId);
      if (!c) return;
      c.visibleTestCases.forEach((tc, i) => {
        const row = document.getElementById(`arena-vt-row-${i}`);
        if (!row) return;
        const statusCell = row.querySelector('.vt-status-cell');
        if (!statusCell) return;
        const cr = caseResults[i]; // visible tests are first in caseResults array
        if (!cr) return;
        statusCell.innerHTML = cr.pass
          ? '<span class="vt-pass">✓ Pass</span>'
          : `<span class="vt-fail">✗ Fail &middot; got ${cr.user}</span>`;
      });
    }

    toggleExplanation() {
      const box = document.getElementById('arena-explanation-box');
      const btn = document.getElementById('arena-exp-toggle-btn');
      if (box) {
        const isHidden = box.classList.toggle('hidden');
        if (btn) btn.textContent = isHidden ? '📖 View Explanation' : '🙈 Hide Explanation';
      }
    }

    updateUI() {
      if (window.currentPage === 'arena') {
        const el = document.getElementById('app');
        if (el) el.innerHTML = this.renderPage();
        if (this.activeChallengeId) {
          setTimeout(() => { if (window.initCanvas) window.initCanvas(); }, 50);
        }
      }
    }

    // ----------------------------------------------------------------
    // Count helpers
    // ----------------------------------------------------------------
    _countByDifficulty(diff) {
      return this.challenges.filter(c => c.difficulty === diff).length;
    }

    // ----------------------------------------------------------------
    // Page renderer
    // ----------------------------------------------------------------
    renderPage() {
      const filtered = this.challenges.filter(c =>
        this.currentFilter === 'all' || c.difficulty === this.currentFilter
      );
      const activeC = this.activeChallengeId ? this.getChallenge(this.activeChallengeId) : null;

      const total  = this.challenges.length;
      const easy   = this._countByDifficulty('easy');
      const medium = this._countByDifficulty('medium');
      const hard   = this._countByDifficulty('hard');

      return `
      <div class="arena-page">
        <!-- ARENA HEADER -->
        <div class="arena-header">
          <div class="arena-header-inner">
            <div class="arena-title-area">
              <div class="arena-eyebrow">
                <span class="pulse-dot"></span> Interactive Machine Builder Arena
              </div>
              <h1>⚔️ Automata <span>Challenge Arena</span></h1>
              <p class="arena-subtitle">Construct real DFAs, NFAs, and ε-NFAs interactively. Test your machines against visible &amp; hidden automated test cases with step-by-step reasoning.</p>
            </div>

            <!-- FILTER BAR -->
            <div class="arena-filter-bar mt-20">
              <span class="filter-label">Difficulty Filter:</span>
              <div class="arena-filter-btns">
                <button class="arena-filter-btn ${this.currentFilter === 'all'    ? 'active' : ''}" onclick="window.arenaEngine.filterChallenges('all',    this)">All (${total})</button>
                <button class="arena-filter-btn ${this.currentFilter === 'easy'   ? 'active' : ''}" onclick="window.arenaEngine.filterChallenges('easy',   this)">🟢 Easy (${easy})</button>
                <button class="arena-filter-btn ${this.currentFilter === 'medium' ? 'active' : ''}" onclick="window.arenaEngine.filterChallenges('medium', this)">🟡 Medium (${medium})</button>
                <button class="arena-filter-btn ${this.currentFilter === 'hard'   ? 'active' : ''}" onclick="window.arenaEngine.filterChallenges('hard',   this)">🔴 Hard (${hard})</button>
              </div>
            </div>
          </div>
        </div>

        <div class="arena-stats-strip">
          <div class="arena-stat-chip">
            <span class="stat-val">${this.scoreStore.getSolvedCount()}</span>
            <span class="stat-lbl">/ ${this.challenges.length} Solved</span>
          </div>
          <div class="arena-stat-chip">
            <span class="stat-val">${this.scoreStore.getTotalAttempts()}</span>
            <span class="stat-lbl">Total Attempts</span>
          </div>
          <div class="arena-stat-chip">
            <span class="stat-val">${this.scoreStore.getBestAvg() > 0 ? this.scoreStore.getBestAvg() + '%' : '—'}</span>
            <span class="stat-lbl">Avg Best Score</span>
          </div>
          <div class="arena-stat-chip">
            <span class="stat-val">${easy}</span>
            <span class="stat-lbl">🟢 Easy</span>
          </div>
          <div class="arena-stat-chip">
            <span class="stat-val">${medium}</span>
            <span class="stat-lbl">🟡 Medium</span>
          </div>
          <div class="arena-stat-chip">
            <span class="stat-val">${hard}</span>
            <span class="stat-lbl">🔴 Hard</span>
          </div>
        </div>

        <div class="arena-body">
          ${activeC ? this.renderActiveChallengeWorkspace(activeC) : this.renderChallengeList(filtered)}
        </div>
      </div>
      `;
    }

    // ----------------------------------------------------------------
    // Challenge list grid
    // ----------------------------------------------------------------
    renderChallengeList(challenges) {
      return `
      <div class="arena-grid-section">
        <div class="section-heading">
          <h2><span class="h2-num">🎯</span> Select an Automata Challenge</h2>
          <p>Click "Open Challenge Builder" to construct your automaton on the interactive studio canvas. Solve the language by building a working DFA/NFA.</p>
        </div>

        <div class="arena-cards-grid">
          ${challenges.map(c => {
            const diffClass = c.difficulty === 'easy' ? 'badge-success' : c.difficulty === 'medium' ? 'badge-warning' : 'badge-danger';
            const isSolved  = window.journeyEngine && window.journeyEngine.data.solvedChallengeIds.includes(c.id);
            const scoreData = this.scoreStore.get(c.id);

            return `
            <div class="arena-challenge-card">
              <div>
                <div class="arena-card-top">
                  <span class="badge badge-accent">Challenge #${c.id < 10 ? '0' + c.id : c.id}</span>
                  <span class="badge badge-primary">${c.topicIcon} ${c.topic}</span>
                  <span class="badge ${diffClass}">${c.difficultyBadge}</span>
                  ${isSolved ? '<span class="badge badge-success" style="margin-left:auto">✓ Solved</span>' : ''}
                  ${scoreData && scoreData.attempts > 0 && !isSolved ? `<span class="arena-best-badge ${scoreData.best === 100 ? 'best-perfect' : scoreData.best >= 70 ? 'best-good' : 'best-low'}">Best: ${scoreData.best}%</span>` : ''}
                </div>

                <h3 class="arena-card-title">${c.title}</h3>
                <p class="arena-card-problem"><strong>Problem:</strong> ${c.problemStatement}</p>

                <div class="arena-card-alphabet">
                  <span>Alphabet: <code class="ic">${c.alphabet}</code></span>
                  <span>Visible: <strong>${c.visibleTestCases.length}</strong> &nbsp;·&nbsp; Hidden: <strong>${c.hiddenTestCases.length}</strong></span>
                </div>
              </div>

              <div class="arena-card-action mt-16">
                <button class="btn btn-primary btn-md w-full" onclick="window.arenaEngine.openChallenge(${c.id})">
                  ⚔️ Open Challenge Builder →
                </button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
      `;
    }

    // ----------------------------------------------------------------
    // Active challenge workspace
    // ----------------------------------------------------------------
    renderActiveChallengeWorkspace(c) {
      const diffClass = c.difficulty === 'easy' ? 'badge-success' : c.difficulty === 'medium' ? 'badge-warning' : 'badge-danger';

      return `
      <div class="arena-workspace">
        <!-- TOP NAV BAR -->
        <div class="workspace-nav-bar">
          <button class="btn btn-outline btn-sm" onclick="window.arenaEngine.closeChallenge()">
            ← Back to Challenge Arena
          </button>
          <div class="workspace-challenge-title">
            <span class="badge badge-accent">Challenge #${c.id < 10 ? '0' + c.id : c.id}</span>
            <h2>${c.title}</h2>
            <span class="badge ${diffClass}">${c.difficultyBadge}</span>
          </div>
        </div>

        <!-- PROBLEM SPECIFICATION -->
        <div class="arena-problem-card">
          <div class="problem-card-body">
            <h3>📌 Problem Statement</h3>
            <p class="problem-text">${c.problemStatement}</p>

            <div class="problem-reqs-grid mt-12">
              <div class="reqs-col">
                <strong>REQUIREMENTS CHECKLIST:</strong>
                <ul>
                  ${c.requirements.map(r => `<li><span class="check-bullet">○</span> ${r}</li>`).join('')}
                </ul>
              </div>
              <div class="reqs-col">
                <strong>ALPHABET &amp; TEST SUITE:</strong>
                <p style="margin-top:6px">Alphabet: <code class="ic">${c.alphabet}</code></p>
                <p style="margin-top:4px">Visible Tests: <strong>${c.visibleTestCases.length}</strong></p>
                <p style="margin-top:4px">Hidden Tests: <strong>${c.hiddenTestCases.length}</strong></p>
              </div>
            </div>
          </div>
        </div>

        <!-- VISIBLE TEST CASES PREVIEW -->
        <div class="arena-visible-tests">
          <div class="arena-visible-tests-header">
            <span class="arena-vt-icon">🧪</span>
            <span>Visible Test Cases — <em>Build your automaton to pass these</em></span>
          </div>
          <div class="arena-vt-body">
            <table class="arena-vt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Input</th>
                  <th>Expected Result</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${c.visibleTestCases.map((tc, i) => `
                  <tr id="arena-vt-row-${i}">
                    <td class="vt-num">${i + 1}</td>
                    <td><code class="ic">${tc.input === '' ? 'ε (empty)' : tc.input}</code></td>
                    <td>
                      <span class="badge ${tc.expected ? 'badge-success' : 'badge-subtle'}">
                        ${tc.expected ? '✓ ACCEPT' : '✗ REJECT'}
                      </span>
                    </td>
                    <td class="vt-status-cell">
                      <span class="vt-pending">⏳ Not tested</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="arena-vt-hidden-hint">
              <span>🔒</span>
              <span><strong>${c.hiddenTestCases.length} hidden test cases</strong> will also be evaluated on submission — build a general solution, not just for the visible inputs.</span>
            </div>
          </div>
        </div>

        <!-- CANVAS BUILDER -->
        <div class="arena-canvas-workspace mt-20">
          <div class="arena-canvas-header">
            <div class="canvas-header-title">
              🎨 Interactive Automata Studio Builder
            </div>
            <div class="canvas-header-actions">
              <button class="btn btn-ghost btn-sm" onclick="resetCanvas()">🗑 Clear Canvas</button>
            </div>
          </div>

          <!-- TOOLBAR -->
          <div class="canvas-toolbar" id="arena-toolbar">
            <button class="tool-btn active" onclick="setMode('move',this)">↖ Move</button>
            <button class="tool-btn" onclick="setMode('addState',this)">+ State</button>
            <button class="tool-btn" onclick="setMode('setStart',this)">▶ Set Start</button>
            <button class="tool-btn" onclick="setMode('toggleAccept',this)">◉ Accept</button>
            <button class="tool-btn" onclick="setMode('addTrans',this)">→ Transition</button>
            <button class="tool-btn" onclick="setMode('delete',this)">🗑 Delete</button>
          </div>

          <div class="mode-hint" id="mode-hint">↖ Move mode — drag states to reposition</div>

          <!-- SVG CANVAS -->
          <div class="canvas-body">
            <svg id="automata-canvas" viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg"
                 onclick="canvasClick(event)"
                 onmousedown="canvasMouseDown(event)"
                 onmousemove="canvasMouseMove(event)"
                 onmouseup="canvasMouseUp()">
              <defs>
                <marker id="cv-arr-n" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#64748b"/></marker>
                <marker id="cv-arr-s" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#4f46e5"/></marker>
                <marker id="cv-arr-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#059669"/></marker>
              </defs>
            </svg>
          </div>

          <div class="canvas-footer-bar">
            <div class="canvas-tip">
              💡 <strong>Tip:</strong> Use "+ State" to add states, "▶ Set Start" for start state, "◉ Accept" for accepting states, and "→ Transition" to add transitions with symbols (e.g. <code>0</code>, <code>1</code>, <code>a</code>, <code>b</code>, <code>ε</code>).
            </div>
            <button class="btn btn-success btn-lg submit-sol-btn" onclick="window.arenaEngine.submitSolution()">
              🚀 Submit &amp; Test Machine
            </button>
          </div>
        </div>

        <!-- RESULTS CONTAINER -->
        <div id="arena-results-container" style="display:none" class="mt-24"></div>
      </div>
      `;
    }
  }

  // Global Singleton
  window.arenaEngine = new ArenaEngine();
})();
