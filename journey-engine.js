/* ============================================================
   AutomataLearn — Learning Journey & Progress Map Engine
   Manages interactive roadmap, 8 sequential nodes, module completion,
   localStorage progress persistence, achievements, and dashboard.
   ============================================================ */

(function() {
  const STORAGE_KEY = 'automata_journey_v1';

  // 8 Core Journey Modules
  const JOURNEY_MODULES = [
    {
      id: 'grammar',
      name: 'Regex & Grammar',
      icon: '📜',
      page: 'grammar',
      desc: 'Formal grammars, right-linear rules, regular expression equivalence, and string derivation.',
      tasks: {
        concept: 'Read Regular Grammar formal definitions & rules',
        builder: 'Generate sample strings from grammar rules',
        test: 'Load grammar presets or test regular expressions',
        challenge: 'Complete a Regular Expression challenge'
      }
    },
    {
      id: 'dfa',
      name: 'DFA Fundamentals',
      icon: '🤖',
      page: 'dfa-nfa:dfa',
      desc: 'Deterministic Finite Automata 5-tuple, state diagrams, transition tables, and total functions.',
      tasks: {
        concept: 'Read DFA formal 5-tuple definition & properties',
        builder: 'Build or load a DFA in Automata Studio',
        test: 'Run string trace simulation on a DFA',
        challenge: 'Complete a DFA Construction Challenge'
      }
    },
    {
      id: 'nfa',
      name: 'NFA',
      icon: '🔀',
      page: 'dfa-nfa:nfa',
      desc: 'Non-deterministic Finite Automata, power set state transitions, parallel computation paths.',
      tasks: {
        concept: 'Explore NFA non-determinism & power set transitions',
        builder: 'Build or load an NFA state diagram',
        test: 'Simulate input string on NFA computation tree',
        challenge: 'Complete an NFA Construction Challenge'
      }
    },
    {
      id: 'enfa',
      name: 'ε-NFA',
      icon: 'ε',
      page: 'dfa-nfa:enfa',
      desc: 'NFA with Epsilon transitions (ε), empty string moves, and ε-closure computations.',
      tasks: {
        concept: 'Study ε-transitions and ε-closure algorithm',
        builder: 'Build or load an ε-NFA in Studio',
        test: 'Trace string processing through ε-transitions',
        challenge: 'Complete an ε-NFA Challenge'
      }
    },
    {
      id: 'conversion',
      name: 'NFA → DFA Conversion',
      icon: '🔄',
      page: 'conversion',
      desc: 'Subset Construction algorithm, step-by-step state set mapping, and equivalent DFA generation.',
      tasks: {
        concept: 'Read Subset Construction algorithm theory',
        builder: 'Step through interactive NFA → DFA converter',
        test: 'Complete conversion to final deterministic machine',
        challenge: 'Complete an NFA to DFA Conversion Challenge'
      }
    },
    {
      id: 'minimization',
      name: 'DFA Minimization',
      icon: '📉',
      page: 'studio:minimize',
      desc: 'Hopcroft\'s Partitioning algorithm, state equivalence, unreachable state removal, minimal DFA.',
      tasks: {
        concept: 'Understand state equivalence & Hopcroft partitioning',
        builder: 'Load or create a DFA for minimization',
        test: 'Run DFA Minimization Engine to minimize states',
        challenge: 'Complete a DFA Minimization Challenge'
      }
    },
    {
      id: 'pumping',
      name: 'Pumping Lemma',
      icon: '🧪',
      page: 'pumping',
      desc: 'Pumping Lemma for Regular Languages, string decomposition, adversary game, proving non-regularity.',
      tasks: {
        concept: 'Study Pumping Lemma theorem & 3 conditions',
        builder: 'Decompose string into u, v, w segments',
        test: 'Test pumping exponent k to demonstrate non-regularity',
        challenge: 'Complete a Pumping Lemma Challenge'
      }
    },
    {
      id: 'mastery',
      name: 'Mastery Challenge',
      icon: '🏆',
      page: 'practice',
      desc: 'Comprehensive exam prep with scored MCQs and interactive machine construction challenges.',
      tasks: {
        concept: 'Review comprehensive Theory of Computation topics',
        builder: 'Attempt practice MCQs and construction challenges',
        test: 'Score 80%+ on MCQ practice quiz',
        challenge: 'Complete 5 total interactive challenges across all topics'
      }
    }
  ];

  // Achievements Definition
  const ACHIEVEMENTS_LIST = [
    { id: 'first_dfa',          icon: '🏆', title: 'First DFA Built',           desc: 'Created or loaded a DFA in Automata Studio' },
    { id: 'first_conversion',   icon: '⚡', title: 'First Conversion Completed', desc: 'Stepped through NFA → DFA subset construction to completion' },
    { id: 'nfa_master',         icon: '🧠', title: 'NFA Master',                desc: 'Completed all activities for the NFA learning module' },
    { id: 'challenges_5',       icon: '🔥', title: '5 Challenges Solved',       desc: 'Successfully verified 5 interactive practice challenges' },
    { id: 'pumping_explorer',   icon: '🎓', title: 'Pumping Lemma Explorer',    desc: 'Tested string decomposition with pumping exponent k' },
    { id: 'grammar_guru',       icon: '📜', title: 'Regular Grammar Guru',      desc: 'Generated string derivations from formal grammar rules' },
    { id: 'minimization_master',icon: '📉', title: 'Minimization Master',       desc: 'Ran Hopcroft\'s minimization algorithm on a DFA' },
    { id: 'automata_master',    icon: '🌟', title: 'Automata Master',           desc: 'Reached 100% completion across all 8 learning modules' }
  ];

  // Default Progress Data Structure
  function getDefaultData() {
    const modules = {};
    JOURNEY_MODULES.forEach(m => {
      modules[m.id] = {
        visited: false,
        concept: false,
        builder: false,
        test: false,
        challenge: false,
        progress: 0
      };
    });

    const achievements = {};
    ACHIEVEMENTS_LIST.forEach(a => {
      achievements[a.id] = { unlocked: false, unlockedAt: null };
    });

    return {
      modules,
      achievements,
      solvedChallengeIds: []
    };
  }

  // Journey Engine Class
  class JourneyEngine {
    constructor() {
      this.data = this.loadData();
      this.modules = JOURNEY_MODULES;
      this.achievementsList = ACHIEVEMENTS_LIST;
    }

    loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const def = getDefaultData();
          // Merge safely
          return {
            modules: { ...def.modules, ...(parsed.modules || {}) },
            achievements: { ...def.achievements, ...(parsed.achievements || {}) },
            solvedChallengeIds: Array.isArray(parsed.solvedChallengeIds) ? parsed.solvedChallengeIds : []
          };
        }
      } catch (e) {
        console.error('Error loading journey data:', e);
      }
      return getDefaultData();
    }

    saveData() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error('Error saving journey data:', e);
      }
    }

    resetProgress() {
      this.data = getDefaultData();
      this.saveData();
      this.updateUIIfOnPage();
    }

    calculateModuleProgress(modId) {
      const m = this.data.modules[modId];
      if (!m) return 0;

      let score = 0;
      if (m.visited) score += 10;
      if (m.concept) score += 30;
      if (m.builder) score += 30;
      if (m.test || m.challenge) score += 30;

      const pct = Math.min(100, score);
      m.progress = pct;
      return pct;
    }

    getNodeState(modId, index) {
      const pct = this.calculateModuleProgress(modId);
      if (pct >= 100) return 'completed'; // 🟢
      
      // Node 0 is unlocked by default
      // Node i unlocks if Node i-1 has progress >= 40% or current node has progress > 0
      if (index === 0) {
        return pct > 0 ? 'in_progress' : 'not_started';
      }

      const prevModId = this.modules[index - 1].id;
      const prevPct = this.calculateModuleProgress(prevModId);
      const isUnlocked = prevPct >= 40 || pct > 0 || this.data.modules[modId].visited;

      if (!isUnlocked) return 'locked'; // 🔒
      if (pct > 0) return 'in_progress'; // 🔵
      return 'not_started'; // ⚪
    }

    getNodeStateBadge(state) {
      switch (state) {
        case 'completed':   return '<span class="status-badge status-completed">🟢 Completed</span>';
        case 'in_progress': return '<span class="status-badge status-progress">🔵 In Progress</span>';
        case 'not_started': return '<span class="status-badge status-not-started">⚪ Not Started</span>';
        case 'locked':      return '<span class="status-badge status-locked">🔒 Locked</span>';
        default:            return '<span class="status-badge status-not-started">⚪ Not Started</span>';
      }
    }

    getOverallProgress() {
      let totalPct = 0;
      this.modules.forEach(m => {
        totalPct += this.calculateModuleProgress(m.id);
      });
      return Math.round(totalPct / this.modules.length);
    }

    getCompletedModulesCount() {
      let count = 0;
      this.modules.forEach(m => {
        if (this.calculateModuleProgress(m.id) >= 100) count++;
      });
      return count;
    }

    getCurrentActiveModule() {
      // First incomplete unlocked module or latest interacted
      for (let i = 0; i < this.modules.length; i++) {
        const m = this.modules[i];
        const state = this.getNodeState(m.id, i);
        if (state === 'in_progress' || state === 'not_started') {
          return m;
        }
      }
      return this.modules[this.modules.length - 1]; // All completed -> last module
    }

    getNextRecommendedActivity(currentMod) {
      const data = this.data.modules[currentMod.id];
      if (!data.concept) return `Read intro & concepts for ${currentMod.name}`;
      if (!data.builder) return `Build or explore ${currentMod.name} interactive tool`;
      if (!data.test && !data.challenge) return `Run test trace / complete challenge for ${currentMod.name}`;
      return `Complete remaining tasks in ${currentMod.name}`;
    }

    recordActivity(modId, activityType) {
      const m = this.data.modules[modId];
      if (!m) return;

      let changed = false;
      if (activityType === 'visited' && !m.visited) {
        m.visited = true; changed = true;
      } else if (activityType === 'concept' && !m.concept) {
        m.concept = true; m.visited = true; changed = true;
      } else if (activityType === 'builder' && !m.builder) {
        m.builder = true; m.visited = true; changed = true;
      } else if (activityType === 'test' && !m.test) {
        m.test = true; m.visited = true; changed = true;
      } else if (activityType === 'challenge' && !m.challenge) {
        m.challenge = true; m.visited = true; changed = true;
      }

      if (changed) {
        this.calculateModuleProgress(modId);
        this.checkAchievements();
        this.saveData();
        this.updateUIIfOnPage();
      }
    }

    recordChallengeCompletion(topic, challengeId) {
      if (challengeId && !this.data.solvedChallengeIds.includes(challengeId)) {
        this.data.solvedChallengeIds.push(challengeId);
      }

      // Map topic string to module id if possible
      let modId = topic;
      if (topic === 'regex') modId = 'grammar';
      if (topic === 'dfa2nfa' || topic === 'nfa2dfa') modId = 'conversion';

      if (this.data.modules[modId]) {
        this.data.modules[modId].challenge = true;
        this.data.modules[modId].visited = true;
        this.calculateModuleProgress(modId);
      }

      // Mastery module task update
      if (this.data.solvedChallengeIds.length >= 5) {
        if (this.data.modules.mastery) {
          this.data.modules.mastery.challenge = true;
          this.calculateModuleProgress('mastery');
        }
      }

      this.checkAchievements();
      this.saveData();
      this.updateUIIfOnPage();
    }

    unlockAchievement(achId) {
      const ach = this.data.achievements[achId];
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        const info = ACHIEVEMENTS_LIST.find(a => a.id === achId);
        if (info) {
          this.showAchievementToast(info);
        }
        this.saveData();
        this.updateUIIfOnPage();
      }
    }

    checkAchievements() {
      // 1. First DFA Built
      if (this.data.modules.dfa.builder) this.unlockAchievement('first_dfa');

      // 2. First Conversion Completed
      if (this.data.modules.conversion.test || this.data.modules.conversion.builder) this.unlockAchievement('first_conversion');

      // 3. NFA Master
      if (this.calculateModuleProgress('nfa') >= 100) this.unlockAchievement('nfa_master');

      // 4. 5 Challenges Solved
      if (this.data.solvedChallengeIds.length >= 5) this.unlockAchievement('challenges_5');

      // 5. Pumping Lemma Explorer
      if (this.data.modules.pumping.test || this.data.modules.pumping.builder) this.unlockAchievement('pumping_explorer');

      // 6. Regular Grammar Guru
      if (this.data.modules.grammar.builder) this.unlockAchievement('grammar_guru');

      // 7. Minimization Master
      if (this.data.modules.minimization.test || this.data.modules.minimization.builder) this.unlockAchievement('minimization_master');

      // 8. Automata Master
      if (this.getCompletedModulesCount() === this.modules.length) this.unlockAchievement('automata_master');
    }

    showAchievementToast(info) {
      let toastContainer = document.getElementById('achievement-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'achievement-toast-container';
        toastContainer.className = 'achievement-toast-container';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.className = 'achievement-toast';
      toast.innerHTML = `
        <div class="toast-icon">${info.icon}</div>
        <div class="toast-content">
          <div class="toast-tag">🏆 Achievement Unlocked!</div>
          <div class="toast-title">${info.title}</div>
          <div class="toast-desc">${info.desc}</div>
        </div>
      `;

      toastContainer.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 50);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 4500);
    }

    updateUIIfOnPage() {
      if (window.currentPage === 'journey') {
        const el = document.getElementById('app');
        if (el) {
          el.innerHTML = this.renderPage();
        }
      }
    }

    renderPage() {
      const overallPct = this.getOverallProgress();
      const completedCount = this.getCompletedModulesCount();
      const currentMod = this.getCurrentActiveModule();
      const nextTaskText = this.getNextRecommendedActivity(currentMod);

      let asciiBar = '';
      const totalBlocks = 12;
      const filledBlocks = Math.round((overallPct / 100) * totalBlocks);
      for (let i = 0; i < totalBlocks; i++) {
        asciiBar += i < filledBlocks ? '█' : '░';
      }

      return `
      <div class="journey-page">
        <!-- HEADER / DASHBOARD -->
        <div class="journey-header">
          <div class="journey-header-inner">
            <div class="journey-title-area">
              <div class="journey-eyebrow">
                <span class="pulse-dot"></span> Interactive Learning Path
              </div>
              <h1>Your Automata <span>Learning Journey</span></h1>
              <p class="journey-subtitle">Master Theory of Computation through a connected, step-by-step visual roadmap with instant practical activities and achievements.</p>
            </div>

            <!-- DASHBOARD SUMMARY CARD -->
            <div class="journey-dashboard-card">
              <div class="dash-card-header">
                <div class="dash-card-title">
                  <span class="dash-icon">📊</span> YOUR AUTOMATA JOURNEY
                </div>
                <button class="btn btn-ghost btn-sm reset-btn" onclick="window.journeyEngine.openResetModal()">
                  🔄 Reset Progress
                </button>
              </div>

              <div class="dash-progress-area">
                <div class="dash-progress-top">
                  <span class="dash-label">Overall Platform Progress</span>
                  <span class="dash-pct-val">${overallPct}%</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill" style="width:${overallPct}%"></div>
                </div>
                <div class="ascii-bar-visual" title="Progress Bar">${asciiBar} &nbsp; ${overallPct}%</div>
              </div>

              <div class="dash-stats-grid">
                <div class="dash-stat">
                  <div class="stat-num">${completedCount} / ${this.modules.length}</div>
                  <div class="stat-lbl">Completed Modules</div>
                </div>
                <div class="dash-stat">
                  <div class="stat-num">${currentMod.icon} ${currentMod.name}</div>
                  <div class="stat-lbl">Current Active Topic</div>
                </div>
                <div class="dash-stat">
                  <div class="stat-num">${this.data.solvedChallengeIds.length}</div>
                  <div class="stat-lbl">Verified Challenges</div>
                </div>
              </div>

              <div class="dash-recommendation-box">
                <div class="rec-label">NEXT RECOMMENDED ACTIVITY:</div>
                <div class="rec-title">→ ${nextTaskText}</div>
                <button class="btn btn-primary btn-md mt-12" onclick="navigate('${currentMod.page}')">
                  Continue Learning with ${currentMod.name} →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="journey-body">
          <!-- VISUAL ROADMAP CONTAINER -->
          <div class="roadmap-section">
            <div class="section-heading">
              <h2><span class="h2-num">🗺️</span> Visual Learning Path</h2>
              <p>Follow the recommended sequence of modules. Complete learning content, studio activities, and challenges to advance!</p>
            </div>

            <div class="roadmap-flow">
              ${this.modules.map((m, idx) => {
                const state = this.getNodeState(m.id, idx);
                const pct = this.calculateModuleProgress(m.id);
                const mData = this.data.modules[m.id];
                const badgeHtml = this.getNodeStateBadge(state);
                const isLocked = state === 'locked';

                let stateClass = `node-${state}`;
                const completedCount = (mData.concept?1:0) + (mData.builder?1:0) + (mData.test||mData.challenge?1:0) + (mData.visited?1:0);

                return `
                <div class="roadmap-node-wrap ${stateClass}">
                  ${idx > 0 ? `<div class="roadmap-connector"><div class="connector-arrow">↓</div></div>` : ''}
                  
                  <div class="roadmap-node-card">
                    <div class="node-card-left">
                      <div class="node-icon-circle">${m.icon}</div>
                      <div class="node-step-num">Step 0${idx + 1}</div>
                    </div>

                    <div class="node-card-content">
                      <div class="node-header-row">
                        <h3 class="node-title">${m.name}</h3>
                        ${badgeHtml}
                      </div>

                      <p class="node-desc">${m.desc}</p>

                      <div class="node-progress-row">
                        <div class="node-progress-bar-wrap">
                          <div class="node-progress-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="node-pct-text">${pct}% Progress (${completedCount}/4 Activities)</span>
                      </div>

                      <!-- CHECKLIST -->
                      <div class="node-checklist">
                        <div class="check-item ${mData.visited ? 'done' : ''}">
                          <span class="check-mark">${mData.visited ? '✓' : '○'}</span> Module Visited
                        </div>
                        <div class="check-item ${mData.concept ? 'done' : ''}">
                          <span class="check-mark">${mData.concept ? '✓' : '○'}</span> ${m.tasks.concept}
                        </div>
                        <div class="check-item ${mData.builder ? 'done' : ''}">
                          <span class="check-mark">${mData.builder ? '✓' : '○'}</span> ${m.tasks.builder}
                        </div>
                        <div class="check-item ${(mData.test || mData.challenge) ? 'done' : ''}">
                          <span class="check-mark">${(mData.test || mData.challenge) ? '✓' : '○'}</span> ${m.tasks.test}
                        </div>
                      </div>
                    </div>

                    <div class="node-card-action">
                      ${isLocked ? `
                        <button class="btn btn-outline btn-sm locked-btn" onclick="navigate('${m.page}')">
                          🔒 Jump to Topic
                        </button>
                      ` : `
                        <button class="btn ${pct === 100 ? 'btn-success' : pct > 0 ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="navigate('${m.page}')">
                          ${pct === 100 ? 'Review Module ↺' : pct > 0 ? 'Continue Topic →' : 'Start Module →'}
                        </button>
                      `}
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- GAMIFICATION ACHIEVEMENTS GRID -->
          <div class="achievements-section mt-32">
            <div class="section-heading">
              <h2><span class="h2-num">🏆</span> Lightweight Academic Achievements</h2>
              <p>Earn badges as you master finite automata, subset construction, and regular language proofs.</p>
            </div>

            <div class="achievements-grid">
              ${this.achievementsList.map(a => {
                const isUnlocked = this.data.achievements[a.id]?.unlocked;
                return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                  <div class="ach-card-top">
                    <span class="ach-icon">${a.icon}</span>
                    <span class="badge ${isUnlocked ? 'badge-success' : 'badge-subtle'}">
                      ${isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                    </span>
                  </div>
                  <h4 class="ach-title">${a.title}</h4>
                  <p class="ach-desc">${a.desc}</p>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- RESET MODAL -->
      <div class="modal-overlay hidden" id="reset-modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <h3>⚠️ Reset Learning Journey Progress?</h3>
            <button class="modal-close" onclick="window.journeyEngine.closeResetModal()">✕</button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to reset all your progress, completed activities, and achievements?</p>
            <p style="color:var(--danger);font-size:.85rem;margin-top:8px">This action cannot be undone and will reset your journey storage.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline btn-sm" onclick="window.journeyEngine.closeResetModal()">Cancel</button>
            <button class="btn btn-danger btn-sm" onclick="window.journeyEngine.confirmResetProgress()">Yes, Reset Everything</button>
          </div>
        </div>
      </div>
      `;
    }

    openResetModal() {
      const modal = document.getElementById('reset-modal-overlay');
      if (modal) modal.classList.remove('hidden');
    }

    closeResetModal() {
      const modal = document.getElementById('reset-modal-overlay');
      if (modal) modal.classList.add('hidden');
    }

    confirmResetProgress() {
      this.resetProgress();
      this.closeResetModal();
    }
  }

  // Global Singleton Instance
  window.journeyEngine = new JourneyEngine();
})();
