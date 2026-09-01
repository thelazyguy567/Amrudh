/* ============================================================
   AutomataLearn — Studio Modes
   Mode selector UI and switching logic for the Canvas Builder
   ============================================================ */

window.currentStudioMode = 'regex';

const STUDIO_MODES = [
  { id: 'regex',    icon: '⚡', label: 'Regex',         desc: 'Generate from Regular Expression' },
  { id: 'dfa',      icon: '🤖', label: 'DFA Builder',   desc: 'Build a Deterministic Finite Automaton' },
  { id: 'nfa',      icon: '🔀', label: 'NFA Builder',   desc: 'Build a Non-deterministic FA' },
  { id: 'enfa',     icon: 'ε',  label: 'ε-NFA Builder', desc: 'Build an NFA with epsilon transitions' },
  { id: 'minimize', icon: '📉', label: 'DFA Minimize',  desc: 'Minimize a DFA using Hopcroft\'s Algorithm' },
  { id: 'dfa2nfa',  icon: '➡️', label: 'DFA → NFA',     desc: 'Convert DFA to equivalent NFA' },
  { id: 'nfa2dfa',  icon: '🔄', label: 'NFA → DFA',     desc: 'Subset Construction conversion' },
  { id: 'pumping',  icon: '🧪', label: 'Pumping Lemma', desc: 'Interactive Pumping Lemma Builder & Practice' }
];

// Build the mode selector HTML
function buildModeSelector() {
  return `
  <div class="studio-mode-selector" id="studio-mode-selector">
    <div class="mode-tabs-scroll">
      ${STUDIO_MODES.map(m => `
        <button class="mode-tab ${m.id === 'regex' ? 'active' : ''}" 
                data-mode="${m.id}" 
                onclick="switchStudioMode('${m.id}')"
                title="${m.desc}">
          <span class="mode-tab-icon">${m.icon}</span>
          <span class="mode-tab-label">${m.label}</span>
        </button>
      `).join('')}
    </div>
  </div>`;
}

// Build the mode-specific panel area
function buildModePanels() {
  return `<div class="studio-mode-panel" id="studio-mode-panel"></div>`;
}

window.switchStudioMode = function(modeId) {
  const prev = window.currentStudioMode;
  window.currentStudioMode = modeId;

  // Update tab active state
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === modeId);
  });

  // Show/hide the regex bar
  const regexBar = document.getElementById('regex-bar');
  if (regexBar) regexBar.style.display = (modeId === 'regex' || modeId === 'minimize') ? 'block' : 'none';

  // Show/hide the main canvas (hide for pumping modes and conversion display)
  const canvasBuilder = document.getElementById('canvas-builder');
  if (canvasBuilder) {
    const hideCanvas = (modeId === 'pumping');
    canvasBuilder.style.display = hideCanvas ? 'none' : 'block';
  }

  // Render mode-specific panel
  renderModePanel(modeId);

  // Update mode hint
  const hint = document.getElementById('mode-hint');
  const modeInfo = STUDIO_MODES.find(m => m.id === modeId);
  if (hint && modeInfo) {
    hint.textContent = `${modeInfo.icon} ${modeInfo.desc}`;
  }
};

function renderModePanel(modeId) {
  const panel = document.getElementById('studio-mode-panel');
  if (!panel) return;

  switch (modeId) {
    case 'regex':
      panel.innerHTML = ''; // Regex bar is separate, already shown
      break;
    case 'dfa':
      panel.innerHTML = renderDFAPanel();
      break;
    case 'nfa':
      panel.innerHTML = renderNFAPanel();
      break;
    case 'enfa':
      panel.innerHTML = renderENFAPanel();
      break;
    case 'minimize':
      panel.innerHTML = renderMinimizePanel();
      break;
    case 'dfa2nfa':
      panel.innerHTML = renderDFA2NFAPanel();
      break;
    case 'nfa2dfa':
      panel.innerHTML = renderNFA2DFAPanel();
      break;
    case 'pumping':
      panel.innerHTML = renderPumpingPanel();
      break;
    default:
      panel.innerHTML = '';
  }
}

// These render functions are defined in studio-panels.js
// Stubs here to prevent errors if loaded before studio-panels.js
if (typeof renderDFAPanel === 'undefined') window.renderDFAPanel = () => '<p>Loading...</p>';
if (typeof renderNFAPanel === 'undefined') window.renderNFAPanel = () => '<p>Loading...</p>';
if (typeof renderENFAPanel === 'undefined') window.renderENFAPanel = () => '<p>Loading...</p>';
if (typeof renderMinimizePanel === 'undefined') window.renderMinimizePanel = () => '<p>Loading...</p>';
if (typeof renderDFA2NFAPanel === 'undefined') window.renderDFA2NFAPanel = () => '<p>Loading...</p>';
if (typeof renderNFA2DFAPanel === 'undefined') window.renderNFA2DFAPanel = () => '<p>Loading...</p>';
if (typeof renderPumpingPanel === 'undefined') window.renderPumpingPanel = () => '<p>Loading...</p>';

// Export for use in main.js studio page template
window.buildModeSelector = buildModeSelector;
window.buildModePanels = buildModePanels;
window.STUDIO_MODES = STUDIO_MODES;
