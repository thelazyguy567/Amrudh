/* ============================================================
   AutomataLearn — Interactive Machine Challenges Engine
   Renders 15+ non-MCQ cards, filtering by difficulty and topic,
   smooth expandable sections (Hint, Explanation, Solution),
   and instant interactive verification within each card.
   ============================================================ */

let currentDiffFilter = 'all';
let currentTopicFilter = 'all';

// Initialize Challenges View
window.initChallengesEngine = function() {
  const container = document.getElementById('challenge-pane');
  if (!container) return;

  container.innerHTML = `
    <div class="challenges-header-area">
      <div class="challenges-title-row">
        <h2><span class="h2-num">🎯</span>Interactive Machine Challenges</h2>
        <span class="challenges-count-badge" id="challenges-count-badge">15 Challenges</span>
      </div>
      <p class="content-p">Practical, descriptive, problem-solving challenges with step-by-step reasoning, transition tables, and complete solutions.</p>

      <!-- FILTER BAR -->
      <div class="challenges-filter-bar">
        <div class="filter-group">
          <span class="filter-label">Difficulty:</span>
          <div class="filter-btns">
            <button class="filter-btn active" data-diff="all" onclick="filterChallenges('diff', 'all', this)">All</button>
            <button class="filter-btn" data-diff="easy" onclick="filterChallenges('diff', 'easy', this)">🟢 Easy</button>
            <button class="filter-btn" data-diff="medium" onclick="filterChallenges('diff', 'medium', this)">🟡 Medium</button>
            <button class="filter-btn" data-diff="hard" onclick="filterChallenges('diff', 'hard', this)">🔴 Hard</button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">Topic:</span>
          <select class="filter-select" id="challenge-topic-select" onchange="filterChallenges('topic', this.value)">
            <option value="all">All Topics</option>
            <option value="regex">⚡ Regular Expressions</option>
            <option value="dfa">🤖 DFA</option>
            <option value="nfa">🔀 NFA</option>
            <option value="enfa">ε ε-NFA</option>
            <option value="minimization">📉 DFA Minimization</option>
            <option value="conversion">🔄 NFA to DFA Conversion</option>
            <option value="pumping">🧪 Pumping Lemma</option>
          </select>
        </div>
      </div>
    </div>

    <!-- CHALLENGES LIST CONTAINER -->
    <div class="challenges-list" id="challenges-list"></div>
  `;

  renderChallengesList();
};

window.filterChallenges = function(type, val, btn) {
  if (type === 'diff') {
    currentDiffFilter = val;
    document.querySelectorAll('.filter-btns .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  } else if (type === 'topic') {
    currentTopicFilter = val;
  }
  renderChallengesList();
};

function renderChallengesList() {
  const listEl = document.getElementById('challenges-list');
  const countEl = document.getElementById('challenges-count-badge');
  if (!listEl) return;

  const data = window.CHALLENGES_DATA || [];

  const filtered = data.filter(c => {
    const matchDiff = currentDiffFilter === 'all' || c.difficulty === currentDiffFilter;
    const matchTopic = currentTopicFilter === 'all' || c.topic === currentTopicFilter;
    return matchDiff && matchTopic;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${data.length} challenges`;
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="card card-pad-lg text-center" style="margin-top:20px">
        <p class="content-p" style="color:var(--text-muted)">No challenges match the selected filters.</p>
        <button class="btn btn-outline btn-sm mt-8" onclick="resetChallengeFilters()">Reset Filters</button>
      </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(c => renderChallengeCard(c)).join('');
}

window.resetChallengeFilters = function() {
  currentDiffFilter = 'all';
  currentTopicFilter = 'all';
  const sel = document.getElementById('challenge-topic-select');
  if (sel) sel.value = 'all';
  document.querySelectorAll('.filter-btns .filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.diff === 'all');
  });
  renderChallengesList();
};

function renderChallengeCard(c) {
  const diffClass = c.difficulty === 'easy' ? 'badge-success' : c.difficulty === 'medium' ? 'badge-warning' : 'badge-danger';

  return `
  <div class="challenge-card" id="challenge-card-${c.id}">
    <div class="challenge-card-header">
      <div class="challenge-badges">
        <span class="badge badge-accent">Challenge ${c.id < 10 ? '0' + c.id : c.id}</span>
        <span class="badge badge-primary"><span class="topic-icon">${c.topicIcon}</span> ${c.topicLabel}</span>
        <span class="badge ${diffClass}">${c.difficultyBadge}</span>
      </div>
    </div>

    <h3 class="challenge-card-title">${c.title}</h3>
    <div class="challenge-problem-statement">
      <p><strong>PROBLEM:</strong> ${c.problemStatement}</p>
    </div>

    <div class="challenge-task-box">
      <strong>YOUR TASK:</strong>
      <p>${c.task}</p>
    </div>

    <!-- INTERACTIVE VERIFICATION SECTION (IF APPLICABLE) -->
    ${c.verifyType === 'regex' ? `
      <div class="challenge-interactive-row">
        <input type="text" id="ch-input-${c.id}" class="sim-input" placeholder="Type your Regular Expression e.g. (a|b)*ab" style="flex:1"/>
        <button class="btn btn-success btn-sm" onclick="verifyInteractiveChallenge(${c.id})">Run Test Cases</button>
      </div>
      <div id="ch-result-${c.id}" class="sim-result idle mt-8" style="display:none"></div>
    ` : ''}

    <!-- ACTION BUTTONS ROW -->
    <div class="challenge-actions-bar">
      <button class="btn btn-outline btn-sm" onclick="toggleChallengeSection(${c.id}, 'hint')">
        💡 Show Hint
      </button>
      <button class="btn btn-outline btn-sm" onclick="toggleChallengeSection(${c.id}, 'explanation')">
        📖 Show Explanation
      </button>
      <button class="btn btn-primary btn-sm" onclick="toggleChallengeSection(${c.id}, 'solution')">
        📋 Show Complete Solution
      </button>
    </div>

    <!-- EXPANDABLE SECTIONS -->
    <div class="challenge-expandable-box hidden" id="ch-hint-${c.id}">
      <div class="expandable-header hint-header">💡 HINT</div>
      <div class="expandable-body"><p>${c.hint}</p></div>
    </div>

    <div class="challenge-expandable-box hidden" id="ch-exp-${c.id}">
      <div class="expandable-header exp-header">📖 CONCEPT EXPLANATION</div>
      <div class="expandable-body"><p>${c.explanation}</p></div>
    </div>

    <div class="challenge-expandable-box hidden" id="ch-sol-${c.id}">
      <div class="expandable-header sol-header">📋 COMPLETE STEP-BY-STEP SOLUTION</div>
      <div class="expandable-body">${c.solution}</div>
    </div>
  </div>`;
}

window.toggleChallengeSection = function(id, section) {
  const targetId = section === 'hint' ? `ch-hint-${id}` : section === 'explanation' ? `ch-exp-${id}` : `ch-sol-${id}`;
  const el = document.getElementById(targetId);
  if (!el) return;

  const isHidden = el.classList.contains('hidden');

  // Toggle visibility
  el.classList.toggle('hidden', !isHidden);

  if (isHidden) {
    el.style.animation = 'none';
    requestAnimationFrame(() => { el.style.animation = 'fadeIn .3s ease'; });
  }
};

window.verifyInteractiveChallenge = function(id) {
  const inputEl = document.getElementById(`ch-input-${id}`);
  const resultEl = document.getElementById(`ch-result-${id}`);
  if (!inputEl || !resultEl) return;

  const userRegex = inputEl.value.trim();
  const c = window.CHALLENGES_DATA.find(x => x.id === id);
  if (!c || !c.testCases) return;

  resultEl.style.display = 'block';

  if (!userRegex) {
    resultEl.className = 'sim-result reject mt-8';
    resultEl.textContent = 'Please enter a regular expression first.';
    return;
  }

  // Test cases evaluation using JS RegExp engine where suitable
  try {
    let jsRegexStr = userRegex
      .replace(/\+/g, '|')
      .replace(/\*/g, '*')
      .replace(/ε/g, '');

    const reg = new RegExp(`^(${jsRegexStr})$`);
    let passed = 0;
    const total = c.testCases.length;
    const logs = [];

    c.testCases.forEach(tc => {
      const match = reg.test(tc.input);
      if (match === tc.expected) {
        passed++;
        logs.push(`"${tc.input}": ✓`);
      } else {
        logs.push(`"${tc.input}": ✗`);
      }
    });

    if (passed === total) {
      resultEl.className = 'sim-result accept mt-8';
      resultEl.innerHTML = `✅ PASSED (${passed}/${total} Test Cases Passed!)<br><span style="font-size:.78rem;opacity:.9">${logs.join(' | ')}</span>`;
    } else {
      resultEl.className = 'sim-result reject mt-8';
      resultEl.innerHTML = `❌ FAILED (${passed}/${total} Test Cases Passed)<br><span style="font-size:.78rem;opacity:.9">${logs.join(' | ')}</span>`;
    }
  } catch (err) {
    resultEl.className = 'sim-result reject mt-8';
    resultEl.textContent = 'Invalid Regular Expression syntax: ' + err.message;
  }
};
