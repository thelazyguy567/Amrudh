/* ============================================================
   AutomataLearn — Interactive Machine Challenges Data & Engine
   15 High-Quality Non-MCQ Theory of Computation Challenges
   ============================================================ */

const CHALLENGES_DATA = [
  // --- EASY QUESTIONS (1 - 5) ---
  {
    id: 1,
    title: "Strings Starting with 'a' and Ending with 'b'",
    topic: "regex",
    topicLabel: "Regular Expressions",
    topicIcon: "⚡",
    difficulty: "easy",
    difficultyLabel: "Easy",
    difficultyBadge: "🟢 Easy",
    alphabet: "{a, b}",
    problemStatement: "Write a regular expression over the alphabet Σ = {a, b} for the language of all strings that start with the letter 'a' and end with the letter 'b'.",
    task: "Formulate the regular expression and explain the purpose of each component.",
    hint: "Consider what symbol must appear first, what symbol must appear last, and what string of symbols can appear in between.",
    explanation: "The language requires any string of length at least 2 over {a,b} where the first character is fixed as 'a' and the final character is fixed as 'b'. Any arbitrary combination of 'a's and 'b's can appear in between.",
    solution: `
<div class="solution-step">
  <strong>Final Regular Expression:</strong>
  <div class="formula-block" data-label="RE Solution">a(a|b)*b   or   a(a+b)*b</div>
</div>
<div class="solution-step">
  <strong>Step-by-Step Breakdown:</strong>
  <ul>
    <li><code>a</code> — Enforces that the string must begin with the terminal symbol 'a'.</li>
    <li><code>(a|b)*</code> — Kleene star allows any sequence of zero or more 'a's and 'b's in the middle.</li>
    <li><code>b</code> — Enforces that the string must terminate with the symbol 'b'.</li>
  </ul>
</div>
<div class="solution-step">
  <strong>Example Matching Strings:</strong>
  <p><code class="ic">"ab"</code> (empty middle), <code class="ic">"aab"</code>, <code class="ic">"abb"</code>, <code class="ic">"aabab"</code>, <code class="ic">"abbbb"</code></p>
</div>`,
    verifyType: "regex",
    testCases: [
      { input: "ab", expected: true },
      { input: "aab", expected: true },
      { input: "abb", expected: true },
      { input: "aabab", expected: true },
      { input: "a", expected: false },
      { input: "b", expected: false },
      { input: "ba", expected: false },
      { input: "aba", expected: false }
    ]
  },

  {
    id: 2,
    title: "DFA String Trace & Acceptance Verification",
    topic: "dfa",
    topicLabel: "DFA",
    topicIcon: "🤖",
    difficulty: "easy",
    difficultyLabel: "Easy",
    difficultyBadge: "🟢 Easy",
    alphabet: "{0, 1}",
    problemStatement: `Given a DFA M = (Q, Σ, δ, q₀, F) over Σ = {0, 1} with states Q = {q₀, q₁, q₂}, start state q₀, accept state F = {q₂}, and transition function δ:
- δ(q₀, 0) = q₀,  δ(q₀, 1) = q₁
- δ(q₁, 0) = q₂,  δ(q₁, 1) = q₁
- δ(q₂, 0) = q₀,  δ(q₂, 1) = q₁

Determine whether the input string w = 101001 is ACCEPTED or REJECTED.`,
    task: "Trace the state sequence step-by-step for input w = 101001 and state the final result.",
    hint: "Start at q₀. For each symbol in 101001 from left to right, follow the transition function δ. Check if the last state belongs to F = {q₂}.",
    explanation: "A DFA evaluates input deterministically symbol by symbol. String w is accepted if and only if processing all characters leaves the automaton in an accept state in F.",
    solution: `
<div class="solution-step">
  <strong>Step-by-Step State Trace for w = "101001":</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>Step</th><th>Current State</th><th>Input Symbol</th><th>Next State δ(q, char)</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>q₀ (start)</td><td>1</td><td>q₁</td></tr>
      <tr><td>2</td><td>q₁</td><td>0</td><td>q₂</td></tr>
      <tr><td>3</td><td>q₂</td><td>1</td><td>q₁</td></tr>
      <tr><td>4</td><td>q₁</td><td>0</td><td>q₂</td></tr>
      <tr><td>5</td><td>q₂</td><td>0</td><td>q₀</td></tr>
      <tr><td>6</td><td>q₀</td><td>1</td><td>q₁</td></tr>
    </tbody>
  </table></div>
</div>
<div class="solution-step">
  <strong>Final Verdict:</strong>
  <p>Final state after processing <code>"101001"</code> is <strong>q₁</strong>.</p>
  <p>Since q₁ ∉ F (where F = {q₂}), the string <code>"101001"</code> is <strong>REJECTED ✗</strong>.</p>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "reject"
  },

  {
    id: 3,
    title: "DFA Transition Table Completion (Even Count of 0s)",
    topic: "dfa",
    topicLabel: "DFA",
    topicIcon: "🤖",
    difficulty: "easy",
    difficultyLabel: "Easy",
    difficultyBadge: "🟢 Easy",
    alphabet: "{0, 1}",
    problemStatement: "A DFA tracks whether a binary string contains an EVEN number of '0's. State q₀ (start, accept) represents an even count of 0s, and state q₁ represents an odd count of 0s. Complete the transition table.",
    task: "Determine δ(q₀, 0), δ(q₀, 1), δ(q₁, 0), and δ(q₁, 1).",
    hint: "Reading a '0' toggles the parity (even ↔ odd). Reading a '1' leaves the parity of 0s unchanged.",
    explanation: "An even count of 0s stays even when reading 1s, but becomes odd when reading a 0. An odd count becomes even on 0, and stays odd on 1.",
    solution: `
<div class="solution-step">
  <strong>Complete Transition Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Accepting State?</th></tr></thead>
    <tbody>
      <tr><td>→ q₀</td><td>q₁</td><td>q₀</td><td>✓ Yes (Even 0s)</td></tr>
      <tr><td>  q₁</td><td>q₀</td><td>q₁</td><td>No (Odd 0s)</td></tr>
    </tbody>
  </table></div>
</div>
<div class="solution-step">
  <strong>Logic Breakdown:</strong>
  <ul>
    <li><code>δ(q₀, 0) = q₁</code> — Reading '0' changes even count to odd count.</li>
    <li><code>δ(q₀, 1) = q₀</code> — Reading '1' does not affect the count of 0s.</li>
    <li><code>δ(q₁, 0) = q₀</code> — Reading '0' changes odd count back to even.</li>
    <li><code>δ(q₁, 1) = q₁</code> — Reading '1' keeps the count odd.</li>
  </ul>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "q1,q0,q0,q1"
  },

  {
    id: 4,
    title: "NFA Parallel State Computation Path",
    topic: "nfa",
    topicLabel: "NFA",
    topicIcon: "🔀",
    difficulty: "easy",
    difficultyLabel: "Easy",
    difficultyBadge: "🟢 Easy",
    alphabet: "{a, b}",
    problemStatement: `Consider an NFA over Σ = {a, b} with states {q₀, q₁, q₂}, start state q₀, accept state F = {q₂}, and transition function:
- δ(q₀, a) = {q₀, q₁},  δ(q₀, b) = {q₀}
- δ(q₁, b) = {q₂}
- δ(q₂, a) = ∅,         δ(q₂, b) = ∅

Find all active states after processing string w = "ab".`,
    task: "Calculate the set of active states after reading 'a', then after reading 'b', and state if 'ab' is accepted.",
    hint: "NFAs evaluate all valid branch transitions in parallel. S_next = ∪ δ(q, char) for all q ∈ S_current.",
    explanation: "In an NFA, state transitions yield a set of possible next states. The automaton accepts if at least one active state in the final set is an accept state.",
    solution: `
<div class="solution-step">
  <strong>Parallel State Computation Trace:</strong>
  <ul>
    <li><strong>Initial State Set:</strong> S₀ = {q₀}</li>
    <li><strong>After Reading 'a':</strong> S₁ = δ(q₀, a) = {q₀, q₁}</li>
    <li><strong>After Reading 'b':</strong> S₂ = δ(q₀, b) ∪ δ(q₁, b) = {q₀} ∪ {q₂} = <strong>{q₀, q₂}</strong></li>
  </ul>
</div>
<div class="solution-step">
  <strong>Result:</strong>
  <p>Final active state set = <code>{q₀, q₂}</code>.</p>
  <p>Since q₂ ∈ F (where F = {q₂}), the string <code>"ab"</code> is <strong>ACCEPTED ✓</strong>.</p>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "q0,q2"
  },

  {
    id: 5,
    title: "ε-NFA Epsilon Closure Computation",
    topic: "enfa",
    topicLabel: "ε-NFA",
    topicIcon: "ε",
    difficulty: "easy",
    difficultyLabel: "Easy",
    difficultyBadge: "🟢 Easy",
    alphabet: "{a, b}",
    problemStatement: `Given an ε-NFA with states {q₀, q₁, q₂, q₃} and transitions:
- q₀ --ε--> q₁
- q₁ --ε--> q₂
- q₂ --a--> q₃

Find ε-closure(q₀) and ε-closure(q₁).`,
    task: "List all states in the epsilon closures ε-closure(q₀) and ε-closure(q₁).",
    hint: "The ε-closure of a state includes the state itself plus any state reachable by following 1 or more ε-transitions.",
    explanation: "By definition, q ∈ ε-closure(q). If p ∈ ε-closure(q) and p --ε--> r, then r ∈ ε-closure(q).",
    solution: `
<div class="solution-step">
  <strong>Epsilon Closure Calculation:</strong>
  <ul>
    <li><strong>ε-closure(q₀):</strong>
      <ul>
        <li>Include q₀ (0 ε-transitions).</li>
        <li>Follow q₀ --ε--> q₁ → add q₁.</li>
        <li>Follow q₁ --ε--> q₂ → add q₂.</li>
        <li><strong>Result: ε-closure(q₀) = {q₀, q₁, q₂}</strong></li>
      </ul>
    </li>
    <li class="mt-8"><strong>ε-closure(q₁):</strong>
      <ul>
        <li>Include q₁ (0 ε-transitions).</li>
        <li>Follow q₁ --ε--> q₂ → add q₂.</li>
        <li><strong>Result: ε-closure(q₁) = {q₁, q₂}</strong></li>
      </ul>
    </li>
  </ul>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "q0,q1,q2"
  },

  // --- MEDIUM QUESTIONS (6 - 11) ---
  {
    id: 6,
    title: "Construct a DFA for Binary Strings Ending in '01'",
    topic: "dfa",
    topicLabel: "DFA",
    topicIcon: "🤖",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{0, 1}",
    problemStatement: "Construct a minimal Deterministic Finite Automaton (DFA) over Σ = {0, 1} that accepts all binary strings that end with the substring '01'.",
    task: "Define the set of states, start state, accept state, and full transition table.",
    hint: "Design states to remember the longest matching suffix of '01': (q₀ = no suffix, q₁ = last seen '0', q₂ = last seen '01').",
    explanation: "A DFA for substring suffixes requires tracking state memory: q₀ = no useful suffix, q₁ = seen '0', q₂ = seen '01' (accept). Transitions update state based on the newest input character.",
    solution: `
<div class="solution-step">
  <strong>DFA Formal Definition:</strong>
  <ul>
    <li><strong>States:</strong> Q = {q₀, q₁, q₂}</li>
    <li><strong>Start State:</strong> q₀</li>
    <li><strong>Accept State:</strong> F = {q₂}</li>
  </ul>
</div>
<div class="solution-step">
  <strong>Transition Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Suffix Meaning</th></tr></thead>
    <tbody>
      <tr><td>→ q₀</td><td>q₁</td><td>q₀</td><td>No matching suffix</td></tr>
      <tr><td>  q₁</td><td>q₁</td><td>q₂</td><td>Last symbol was '0'</td></tr>
      <tr><td>* q₂</td><td>q₁</td><td>q₀</td><td>Ends in "01" (ACCEPT ✓)</td></tr>
    </tbody>
  </table></div>
</div>
<div class="solution-step">
  <strong>Verification Examples:</strong>
  <ul>
    <li><code>"01"</code>: q₀ --0--> q₁ --1--> q₂ (ACCEPT ✓)</li>
    <li><code>"1101"</code>: q₀ --1--> q₀ --1--> q₀ --0--> q₁ --1--> q₂ (ACCEPT ✓)</li>
    <li><code>"010"</code>: q₀ --0--> q₁ --1--> q₂ --0--> q₁ (REJECT ✗)</li>
  </ul>
</div>`,
    verifyType: "regex",
    testCases: [
      { input: "01", expected: true },
      { input: "101", expected: true },
      { input: "001", expected: true },
      { input: "1101", expected: true },
      { input: "100", expected: false },
      { input: "010", expected: false },
      { input: "1", expected: false }
    ]
  },

  {
    id: 7,
    title: "Construct an NFA for Strings Containing '101'",
    topic: "nfa",
    topicLabel: "NFA",
    topicIcon: "🔀",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{0, 1}",
    problemStatement: "Construct a Non-deterministic Finite Automaton (NFA) over Σ = {0, 1} that accepts all binary strings containing '101' as a substring.",
    task: "Specify the states, start state, accept state, and NFA transition function.",
    hint: "Use a self-loop on the start state for any input, and non-deterministically branch into a 3-step path matching 1 → 0 → 1.",
    explanation: "An NFA can stay in state q₀ while simultaneously branching to q₁ when it sees a '1', attempting to match the target substring '101'.",
    solution: `
<div class="solution-step">
  <strong>NFA Structure:</strong>
  <ul>
    <li><strong>States:</strong> Q = {q₀, q₁, q₂, q₃}</li>
    <li><strong>Start State:</strong> q₀</li>
    <li><strong>Accept State:</strong> F = {q₃}</li>
  </ul>
</div>
<div class="solution-step">
  <strong>NFA Transition Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>State Role</th></tr></thead>
    <tbody>
      <tr><td>→ q₀</td><td>{q₀}</td><td>{q₀, q₁}</td><td>Start / Prefix loop</td></tr>
      <tr><td>  q₁</td><td>{q₂}</td><td>∅</td><td>Seen '1'</td></tr>
      <tr><td>  q₂</td><td>∅</td><td>{q₃}</td><td>Seen '10'</td></tr>
      <tr><td>* q₃</td><td>{q₃}</td><td>{q₃}</td><td>Seen '101' (ACCEPT ✓)</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "regex",
    testCases: [
      { input: "101", expected: true },
      { input: "01010", expected: true },
      { input: "11011", expected: true },
      { input: "100", expected: false },
      { input: "110", expected: false }
    ]
  },

  {
    id: 8,
    title: "Regular Expression to Automaton State Reasoning",
    topic: "regex",
    topicLabel: "Regular Expressions",
    topicIcon: "⚡",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{a, b}",
    problemStatement: "Given the regular expression r = (a|b)*aba, convert it into an equivalent DFA transition table and explain the role of each state.",
    task: "Design the minimal DFA state set and transition table for language L((a|b)*aba).",
    hint: "(a|b)* allows any arbitrary prefix over {a,b}, terminating strictly with the suffix 'aba'.",
    explanation: "The language contains all strings ending in 'aba'. Tracking the longest suffix of 'aba' matched so far requires 4 states.",
    solution: `
<div class="solution-step">
  <strong>DFA State Definitions:</strong>
  <ul>
    <li><strong>q₀:</strong> Empty suffix or last seen 'b'.</li>
    <li><strong>q₁:</strong> Last seen suffix 'a'.</li>
    <li><strong>q₂:</strong> Last seen suffix 'ab'.</li>
    <li><strong>q₃:</strong> Last seen suffix 'aba' (ACCEPT).</li>
  </ul>
</div>
<div class="solution-step">
  <strong>DFA Transition Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State</th><th>Input a</th><th>Input b</th><th>Suffix Status</th></tr></thead>
    <tbody>
      <tr><td>→ q₀</td><td>q₁</td><td>q₀</td><td>ε / ends in b</td></tr>
      <tr><td>  q₁</td><td>q₁</td><td>q₂</td><td>ends in 'a'</td></tr>
      <tr><td>  q₂</td><td>q₃</td><td>q₀</td><td>ends in 'ab'</td></tr>
      <tr><td>* q₃</td><td>q₁</td><td>q₂</td><td>ends in 'aba' (ACCEPT ✓)</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "regex",
    testCases: [
      { input: "aba", expected: true },
      { input: "aaba", expected: true },
      { input: "baba", expected: true },
      { input: "ab", expected: false },
      { input: "abab", expected: false }
    ]
  },

  {
    id: 9,
    title: "NFA to DFA Subset Construction (Powerset Algorithm)",
    topic: "conversion",
    topicLabel: "NFA to DFA Conversion",
    topicIcon: "🔄",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{a, b}",
    problemStatement: `Convert the NFA M = ({q₀, q₁, q₂}, {a, b}, δ, q₀, {q₂}) to an equivalent DFA using Subset Construction:
- δ(q₀, a) = {q₀, q₁},  δ(q₀, b) = {q₀}
- δ(q₁, b) = {q₂}
- δ(q₂, a) = ∅,         δ(q₂, b) = ∅`,
    task: "Perform subset construction step-by-step and write the final DFA transition table.",
    hint: "Start with DFA state [q₀]. For each subset and symbol, calculate the union of NFA transitions.",
    explanation: "In Powerset Construction, each DFA state represents a subset of NFA states. A DFA subset is an accept state if it contains q₂.",
    solution: `
<div class="solution-step">
  <strong>Step-by-Step Subset Construction:</strong>
  <ul>
    <li><strong>DFA Start State:</strong> D₀ = [q₀]</li>
    <li><strong>Expand [q₀]:</strong>
      <ul>
        <li>δ([q₀], a) = δ(q₀, a) = <strong>[q₀, q₁]</strong> (New DFA State D₁)</li>
        <li>δ([q₀], b) = δ(q₀, b) = <strong>[q₀]</strong></li>
      </ul>
    </li>
    <li><strong>Expand D₁ = [q₀, q₁]:</strong>
      <ul>
        <li>δ([q₀, q₁], a) = δ(q₀,a) ∪ δ(q₁,a) = {q₀, q₁} ∪ ∅ = <strong>[q₀, q₁]</strong></li>
        <li>δ([q₀, q₁], b) = δ(q₀,b) ∪ δ(q₁,b) = {q₀} ∪ {q₂} = <strong>[q₀, q₂]</strong> (New DFA State D₂)</li>
      </ul>
    </li>
    <li><strong>Expand D₂ = [q₀, q₂] (Accept State since q₂ ∈ F):</strong>
      <ul>
        <li>δ([q₀, q₂], a) = δ(q₀,a) ∪ δ(q₂,a) = {q₀, q₁} ∪ ∅ = <strong>[q₀, q₁]</strong></li>
        <li>δ([q₀, q₂], b) = δ(q₀,b) ∪ δ(q₂,b) = {q₀} ∪ ∅ = <strong>[q₀]</strong></li>
      </ul>
    </li>
  </ul>
</div>
<div class="solution-step">
  <strong>Final Generated DFA Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>DFA State</th><th>Input a</th><th>Input b</th><th>Accepting State?</th></tr></thead>
    <tbody>
      <tr><td>→ D₀ = [q₀]</td><td>D₁ = [q₀, q₁]</td><td>D₀ = [q₀]</td><td>No</td></tr>
      <tr><td>  D₁ = [q₀, q₁]</td><td>D₁ = [q₀, q₁]</td><td>D₂ = [q₀, q₂]</td><td>No</td></tr>
      <tr><td>* D₂ = [q₀, q₂]</td><td>D₁ = [q₀, q₁]</td><td>D₀ = [q₀]</td><td>✓ Yes (contains q₂)</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "D0,D1,D2"
  },

  {
    id: 10,
    title: "DFA Minimization (Hopcroft Partition Refinement)",
    topic: "minimization",
    topicLabel: "DFA Minimization",
    topicIcon: "📉",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{0, 1}",
    problemStatement: `Minimize the 5-state DFA with states {q₀, q₁, q₂, q₃, q₄}, start state q₀, accept states F = {q₃, q₄}, and transitions:
- δ(q₀, 0)=q₁, δ(q₀, 1)=q₂
- δ(q₁, 0)=q₁, δ(q₁, 1)=q₃
- δ(q₂, 0)=q₁, δ(q₂, 1)=q₄
- δ(q₃, 0)=q₁, δ(q₃, 1)=q₃
- δ(q₄, 0)=q₁, δ(q₄, 1)=q₄`,
    task: "Use Hopcroft's partition refinement algorithm to identify equivalent states and present the minimized DFA.",
    hint: "Notice that q₁ and q₂ behave identically on all inputs, as do q₃ and q₄.",
    explanation: "Two states p and q are equivalent if for every string w, processing w from p or q yields the same acceptance result.",
    solution: `
<div class="solution-step">
  <strong>Partition Refinement Walkthrough:</strong>
  <ul>
    <li><strong>Initial Partition P₀:</strong> Group 1 = {q₀, q₁, q₂} (Non-accept), Group 2 = {q₃, q₄} (Accept).</li>
    <li><strong>Check Group 1 {q₀, q₁, q₂}:</strong>
      <ul>
        <li>δ(q₀, 1) = q₂ ∈ Grp1; δ(q₁, 1) = q₃ ∈ Grp2; δ(q₂, 1) = q₄ ∈ Grp2.</li>
        <li>q₁ and q₂ move to Group 2 on input '1', while q₀ moves to Group 1.</li>
        <li>Split Group 1 into <strong>{q₀}</strong> and <strong>{q₁, q₂}</strong>.</li>
      </ul>
    </li>
    <li><strong>Check Group 2 {q₃, q₄}:</strong>
      <ul>
        <li>δ(q₃, 0) = q₁ ∈ Grp1, δ(q₃, 1) = q₃ ∈ Grp2.</li>
        <li>δ(q₄, 0) = q₁ ∈ Grp1, δ(q₄, 1) = q₄ ∈ Grp2.</li>
        <li>Both states transition to identical groups on all inputs → <strong>q₃ ≡ q₄</strong>.</li>
      </ul>
    </li>
  </ul>
</div>
<div class="solution-step">
  <strong>Final Minimized 3-State DFA Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State Group</th><th>Input 0</th><th>Input 1</th><th>Accepting State?</th></tr></thead>
    <tbody>
      <tr><td>→ A = {q₀}</td><td>B = {q₁, q₂}</td><td>B = {q₁, q₂}</td><td>No</td></tr>
      <tr><td>  B = {q₁, q₂}</td><td>B = {q₁, q₂}</td><td>C = {q₃, q₄}</td><td>No</td></tr>
      <tr><td>* C = {q₃, q₄}</td><td>B = {q₁, q₂}</td><td>C = {q₃, q₄}</td><td>✓ Yes</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "3"
  },

  {
    id: 11,
    title: "Step-by-Step ε-NFA String Simulation",
    topic: "enfa",
    topicLabel: "ε-NFA",
    topicIcon: "ε",
    difficulty: "medium",
    difficultyLabel: "Medium",
    difficultyBadge: "🟡 Medium",
    alphabet: "{0, 1}",
    problemStatement: `Simulate the input string w = "01" on an ε-NFA with states {q₀, q₁, q₂, q₃}, start state q₀, accept state q₃, and transitions:
- q₀ --ε--> q₁
- q₁ --0--> q₁,  q₁ --1--> q₂
- q₂ --ε--> q₃`,
    task: "Show the active state set before reading any symbol, after symbol '0', and after symbol '1'.",
    hint: "Compute ε-closure at the beginning and after taking moves on each input character.",
    explanation: "In an ε-NFA, processing a character involves: (1) finding transitions on the character from the current closure, and (2) taking the ε-closure of all resulting states.",
    solution: `
<div class="solution-step">
  <strong>Simulation Steps:</strong>
  <ul>
    <li><strong>Step 0 (Start):</strong> Active Set = ε-closure(q₀) = <strong>{q₀, q₁}</strong></li>
    <li><strong>Step 1 (Read '0'):</strong>
      <ul>
        <li>Move on '0': δ(q₀,0)=∅, δ(q₁,0)={q₁} → {q₁}</li>
        <li>Closure: ε-closure({q₁}) = <strong>{q₁}</strong></li>
      </ul>
    </li>
    <li><strong>Step 2 (Read '1'):</strong>
      <ul>
        <li>Move on '1': δ(q₁,1)={q₂} → {q₂}</li>
        <li>Closure: ε-closure({q₂}) = <strong>{q₂, q₃}</strong> (since q₂ --ε--> q₃)</li>
      </ul>
    </li>
  </ul>
</div>
<div class="solution-step">
  <strong>Result:</strong>
  <p>Final active set = <code>{q₂, q₃}</code>.</p>
  <p>Since q₃ ∈ F, the string <code>"01"</code> is <strong>ACCEPTED ✓</strong>.</p>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "q2,q3"
  },

  // --- HARD QUESTIONS (12 - 15) ---
  {
    id: 12,
    title: "DFA for Binary Numbers Divisible by 3",
    topic: "dfa",
    topicLabel: "DFA",
    topicIcon: "🤖",
    difficulty: "hard",
    difficultyLabel: "Hard",
    difficultyBadge: "🔴 Hard",
    alphabet: "{0, 1}",
    problemStatement: "Construct a DFA over Σ = {0, 1} that accepts binary strings representing numbers divisible by 3 in big-endian notation. Assume empty string ε represents 0 (divisible by 3).",
    task: "Define 3 remainder states, start state, accept state, transition function, and modular arithmetic recurrence.",
    hint: "Reading a new bit b ∈ {0, 1} transforms existing number N into 2N + b. Take modulo 3!",
    explanation: "If current value mod 3 = r, appending bit b produces new value (2r + b) mod 3. This yields 3 remainder states q₀ (rem 0), q₁ (rem 1), and q₂ (rem 2).",
    solution: `
<div class="solution-step">
  <strong>Modular Arithmetic Recurrence:</strong>
  <p>N_new = (2 × N_old + b) mod 3</p>
  <ul>
    <li>From q₀ (rem 0): bit 0 → (2×0+0) mod 3 = 0 (q₀); bit 1 → (2×0+1) mod 3 = 1 (q₁)</li>
    <li>From q₁ (rem 1): bit 0 → (2×1+0) mod 3 = 2 (q₂); bit 1 → (2×1+1) mod 3 = 0 (q₀)</li>
    <li>From q₂ (rem 2): bit 0 → (2×2+0) mod 3 = 1 (q₁); bit 1 → (2×2+1) mod 3 = 2 (q₂)</li>
  </ul>
</div>
<div class="solution-step">
  <strong>DFA Transition Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State</th><th>Input 0</th><th>Input 1</th><th>Remainder Value</th></tr></thead>
    <tbody>
      <tr><td>* → q₀</td><td>q₀</td><td>q₁</td><td>0 mod 3 (ACCEPT ✓)</td></tr>
      <tr><td>    q₁</td><td>q₂</td><td>q₀</td><td>1 mod 3</td></tr>
      <tr><td>    q₂</td><td>q₁</td><td>q₂</td><td>2 mod 3</td></tr>
    </tbody>
  </table></div>
</div>
<div class="solution-step">
  <strong>Verification Examples:</strong>
  <ul>
    <li><code>"11"</code> (3₁₀): q₀ --1--> q₁ --1--> q₀ (ACCEPT ✓)</li>
    <li><code>"110"</code> (6₁₀): q₀ --1--> q₁ --1--> q₀ --0--> q₀ (ACCEPT ✓)</li>
    <li><code>"100"</code> (4₁₀): q₀ --1--> q₁ --0--> q₂ --0--> q₁ (REJECT ✗)</li>
  </ul>
</div>`,
    verifyType: "regex",
    testCases: [
      { input: "0", expected: true },
      { input: "11", expected: true },
      { input: "110", expected: true },
      { input: "1001", expected: true },
      { input: "1", expected: false },
      { input: "10", expected: false },
      { input: "100", expected: false }
    ]
  },

  {
    id: 13,
    title: "Complex ε-NFA to DFA Conversion",
    topic: "conversion",
    topicLabel: "NFA to DFA Conversion",
    topicIcon: "🔄",
    difficulty: "hard",
    difficultyLabel: "Hard",
    difficultyBadge: "🔴 Hard",
    alphabet: "{a, b}",
    problemStatement: `Convert an ε-NFA over Σ = {a, b} with states {q₀, q₁, q₂}, start state q₀, accept state {q₂}, and transitions:
- q₀ --ε--> q₁,  q₀ --a--> q₀
- q₁ --b--> q₂
- q₂ --ε--> q₀

into an equivalent DFA using Powerset Construction.`,
    task: "Compute initial ε-closure, transitions for reachable subsets, and present the final DFA table.",
    hint: "Compute ε-closure before processing any symbol, and after every move.",
    explanation: "Epsilon transitions allow immediate state movement. The initial DFA state is D₀ = ε-closure(q₀) = {q₀, q₁}.",
    solution: `
<div class="solution-step">
  <strong>Powerset Construction Walkthrough:</strong>
  <ul>
    <li><strong>Start State:</strong> D₀ = ε-closure(q₀) = <strong>{q₀, q₁}</strong></li>
    <li><strong>Expand D₀ = {q₀, q₁}:</strong>
      <ul>
        <li>On 'a': δ(q₀,a) ∪ δ(q₁,a) = {q₀} ∪ ∅ = {q₀}. ε-closure({q₀}) = <strong>{q₀, q₁} = D₀</strong></li>
        <li>On 'b': δ(q₀,b) ∪ δ(q₁,b) = ∅ ∪ {q₂} = {q₂}. ε-closure({q₂}) = <strong>{q₀, q₁, q₂} = D₁</strong> (NEW State)</li>
      </ul>
    </li>
    <li><strong>Expand D₁ = {q₀, q₁, q₂} (Accept State since q₂ ∈ F):</strong>
      <ul>
        <li>On 'a': δ(q₀,a) ∪ δ(q₁,a) ∪ δ(q₂,a) = {q₀}. ε-closure({q₀}) = <strong>{q₀, q₁} = D₀</strong></li>
        <li>On 'b': δ(q₀,b) ∪ δ(q₁,b) ∪ δ(q₂,b) = {q₂}. ε-closure({q₂}) = <strong>{q₀, q₁, q₂} = D₁</strong></li>
      </ul>
    </li>
  </ul>
</div>
<div class="solution-step">
  <strong>Final 2-State DFA Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>DFA State</th><th>Input a</th><th>Input b</th><th>Accepting State?</th></tr></thead>
    <tbody>
      <tr><td>→ D₀ = {q₀, q₁}</td><td>D₀</td><td>D₁</td><td>No</td></tr>
      <tr><td>* D₁ = {q₀, q₁, q₂}</td><td>D₀</td><td>D₁</td><td>✓ Yes (contains q₂)</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "D0,D1"
  },

  {
    id: 14,
    title: "Minimizing a 6-State DFA with Multiple Equivalence Classes",
    topic: "minimization",
    topicLabel: "DFA Minimization",
    topicIcon: "📉",
    difficulty: "hard",
    difficultyLabel: "Hard",
    difficultyBadge: "🔴 Hard",
    alphabet: "{0, 1}",
    problemStatement: `Minimize a 6-state DFA over {0, 1} with states {A, B, C, D, E, F}, start state A, accept states {C, D, E}, and transitions:
- A --0--> B,  A --1--> C
- B --0--> A,  B --1--> D
- C --0--> E,  C --1--> F
- D --0--> E,  D --1--> F
- E --0--> E,  E --1--> F
- F --0--> F,  F --1--> F (Dead state)`,
    task: "Show step-by-step partition refinement and state equivalence merging.",
    hint: "Partition into non-accepting {A, B, F} and accepting {C, D, E}, then check transitions on 0 and 1.",
    explanation: "Hopcroft's algorithm splits partitions whenever states within a group transition to different existing partitions.",
    solution: `
<div class="solution-step">
  <strong>Step-by-Step Refinement:</strong>
  <ul>
    <li><strong>Initial Partition P₀:</strong>
      <ul>
        <li>Group 1 (Non-accept): {A, B, F}</li>
        <li>Group 2 (Accept): {C, D, E}</li>
      </ul>
    </li>
    <li><strong>Refine Group 2 {C, D, E}:</strong>
      <ul>
        <li>On 0: C → E, D → E, E → E (all stay in Group 2)</li>
        <li>On 1: C → F, D → F, E → F (all go to Group 1)</li>
        <li>Since all 3 states move to identical groups on all inputs → <strong>C ≡ D ≡ E</strong>!</li>
      </ul>
    </li>
    <li><strong>Refine Group 1 {A, B, F}:</strong>
      <ul>
        <li>F --0--> F ∈ Grp1, F --1--> F ∈ Grp1</li>
        <li>A --0--> B ∈ Grp1, A --1--> C ∈ Grp2</li>
        <li>B --0--> A ∈ Grp1, B --1--> D ∈ Grp2</li>
        <li>A and B move to Group 2 on '1', while F stays in Group 1 → Split into <strong>{A, B}</strong> and <strong>{F}</strong>.</li>
      </ul>
    </li>
  </ul>
</div>
<div class="solution-step">
  <strong>Final Minimized 3-State DFA Table:</strong>
  <div class="table-wrap"><table>
    <thead><tr><th>State Group</th><th>Input 0</th><th>Input 1</th><th>Accepting State?</th></tr></thead>
    <tbody>
      <tr><td>→ P₀ = {A, B}</td><td>P₀</td><td>P₁</td><td>No</td></tr>
      <tr><td>* P₁ = {C, D, E}</td><td>P₁</td><td>P₂</td><td>✓ Yes</td></tr>
      <tr><td>  P₂ = {F}</td><td>P₂</td><td>P₂</td><td>No (Trap State)</td></tr>
    </tbody>
  </table></div>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "3"
  },

  {
    id: 15,
    title: "Pumping Lemma Proof for Non-Regularity of L = {aⁿbⁿ | n ≥ 0}",
    topic: "pumping",
    topicLabel: "Pumping Lemma",
    topicIcon: "🧪",
    difficulty: "hard",
    difficultyLabel: "Hard",
    difficultyBadge: "🔴 Hard",
    alphabet: "{a, b}",
    problemStatement: "Prove that the language L = {aⁿbⁿ | n ≥ 0} over Σ = {a, b} is NOT regular using the Pumping Lemma.",
    task: "Provide the complete 11-step formal proof by contradiction.",
    hint: "Assume L is regular with pumping length p. Choose string s = aᵖbᵖ. Decompose s = xyz with |xy| ≤ p and |y| ≥ 1.",
    explanation: "The Pumping Lemma states that if L is regular, there exists a pumping length p such that any string s ∈ L with |s| ≥ p can be decomposed into s = xyz where |y| ≥ 1, |xy| ≤ p, and xyⁱz ∈ L for all i ≥ 0.",
    solution: `
<div class="solution-step">
  <strong>11-Step Proof by Contradiction:</strong>
  <ol>
    <li>Assume for contradiction that L = {aⁿbⁿ | n ≥ 0} is regular.</li>
    <li>By the Pumping Lemma, there exists a pumping length p ≥ 1.</li>
    <li>Choose string s = aᵖbᵖ. Clearly s ∈ L and |s| = 2p ≥ p.</li>
    <li>By Pumping Lemma, s can be decomposed as s = xyz satisfying:
      <ul>
        <li>(1) |y| ≥ 1</li>
        <li>(2) |xy| ≤ p</li>
        <li>(3) xyⁱz ∈ L for all i ≥ 0</li>
      </ul>
    </li>
    <li>Apply condition (2) |xy| ≤ p: Since s = aᵖbᵖ, the first p characters consist entirely of 'a's. Therefore, x and y consist solely of 'a's.</li>
    <li>Let x = aʲ and y = aᵏ where j ≥ 0, k ≥ 1, and j + k ≤ p. Then z = aᵖ⁻ʲ⁻ᵏ bᵖ.</li>
    <li>Pump with i = 0 (pumping down):
      <br><code>xy⁰z = xz = aʲ aᵖ⁻ʲ⁻ᵏ bᵖ = aᵖ⁻ᵏ bᵖ</code>
    </li>
    <li>Since k ≥ 1, we have p - k < p. The string xz = aᵖ⁻ᵏ bᵖ has fewer 'a's than 'b's.</li>
    <li>Therefore, xz = xy⁰z ∉ L.</li>
    <li>This contradicts condition (3) of the Pumping Lemma!</li>
    <li>Consequently, our initial assumption that L is regular must be false. <strong>Therefore, L = {aⁿbⁿ | n ≥ 0} is NOT a regular language. ■</strong></li>
  </ol>
</div>`,
    verifyType: "textChoice",
    correctAnswer: "contradiction"
  }
];

window.CHALLENGES_DATA = CHALLENGES_DATA;
