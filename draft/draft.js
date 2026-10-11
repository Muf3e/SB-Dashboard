/**
 * ==========================================================================
 * MUNDER-DIFFLIN × AGENT STANDUP (SB GROUP DRAFT PLATFORM)
 * Frontend Interactive Controller
 * ==========================================================================
 */

(function() {
  'use strict';

  // State
  const state = {
    activeTab: 'standup',
    theme: 'light',
    audioEnabled: false,
    agents: [],
    standupSessions: [],
    currentSessionIndex: 0,
    currentStepIndex: 0,
    isPlayingStandup: false,
    playbackTimer: null,
    searchQuery: '',
    selectedDivision: 'ALL',
    selectedStatus: 'ALL',
    modalAgent: null,
    tasks: [],
    watercoolerMessages: []
  };

  // DOM Elements Cache
  const el = {};

  function initElements() {
    el.tabs = document.querySelectorAll('.tab-btn');
    el.sections = document.querySelectorAll('.view-section');
    el.audioToggle = document.getElementById('btn-audio-toggle');
    el.themeToggle = document.getElementById('btn-theme-toggle');
    el.activeAgentsCount = document.getElementById('stat-active-agents');
    el.totalAgentsCount = document.getElementById('stat-total-agents');
    
    // Standup Elements
    el.standupStage = document.getElementById('standup-stage');
    el.standupPlayBtn = document.getElementById('btn-standup-play');
    el.standupNextBtn = document.getElementById('btn-standup-next');
    el.standupReplayBtn = document.getElementById('btn-standup-replay');
    el.standupSessionSelect = document.getElementById('select-standup-session');
    el.standupSpeakerLabel = document.getElementById('standup-speaker-label');
    el.standupSubtitleText = document.getElementById('standup-subtitle-text');
    el.sharedWindowBody = document.getElementById('shared-window-body');
    el.presenterName = document.getElementById('presenter-name');
    el.directiveInput = document.getElementById('directive-input');
    el.directiveSubmitBtn = document.getElementById('btn-directive-submit');

    // Agents Directory Elements
    el.agentSearchInput = document.getElementById('agent-search-input');
    el.divisionFilterPills = document.getElementById('division-filter-pills');
    el.agentsCardsGrid = document.getElementById('agents-cards-grid');

    // Modal
    el.agentModal = document.getElementById('agent-modal-backdrop');
    el.modalCloseBtn = document.getElementById('modal-close-btn');
    el.modalBody = document.getElementById('modal-body-content');
    el.modalTitle = document.getElementById('modal-agent-name');

    // Kanban
    el.kanbanCols = {
      BACKLOG: document.getElementById('kanban-col-backlog'),
      IN_PROGRESS: document.getElementById('kanban-col-inprogress'),
      REVIEW: document.getElementById('kanban-col-review'),
      COMPLETED: document.getElementById('kanban-col-completed')
    };
    el.newTaskBtn = document.getElementById('btn-new-task');

    // Watercooler
    el.watercoolerFeed = document.getElementById('watercooler-feed-messages');
    el.chatInput = document.getElementById('watercooler-input');
    el.chatSendBtn = document.getElementById('btn-watercooler-send');

    // Floor Canvas
    el.floorContainer = document.getElementById('floor-canvas-container');
  }

  // ========================================================================
  // INITIALIZATION & DATA LOADING
  // ========================================================================

  async function init() {
    initElements();
    attachEventListeners();
    await loadInitialData();
    renderAllViews();
    startFloorSpeechAnimation();
  }

  async function loadInitialData() {
    try {
      // 1. Fetch All 360+ Agents
      const agentsRes = await fetch('/api/draft/agents');
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        state.agents = data.agents || [];
      } else {
        // Fallback to legacy endpoint if draft is running independently
        const legacyRes = await fetch('/api/agents');
        if (legacyRes.ok) {
          const lData = await legacyRes.json();
          state.agents = lData.agents || [];
        }
      }

      // 2. Fetch Standup Sessions
      const standupRes = await fetch('/api/draft/standup');
      if (standupRes.ok) {
        const sData = await standupRes.json();
        state.standupSessions = sData.sessions || [];
      }

      // 3. Fetch Hive Tasks
      const tasksRes = await fetch('/api/hive/tasks');
      if (tasksRes.ok) {
        state.tasks = await tasksRes.json();
      }

      // 4. Fetch Watercooler Communications
      const commsRes = await fetch('/api/communications');
      if (commsRes.ok) {
        const commsData = await commsRes.json();
        state.watercoolerMessages = commsData.casual_watercooler || [];
      }
    } catch (err) {
      console.warn('Network sync notice:', err);
    }

    // Update Header Counts
    if (el.totalAgentsCount) el.totalAgentsCount.textContent = state.agents.length;
    const workingCount = state.agents.filter(a => a.status === 'WORKING' || a.status === 'ONLINE').length;
    if (el.activeAgentsCount) el.activeAgentsCount.textContent = workingCount;
  }

  function attachEventListeners() {
    // Navigation Tabs
    el.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-tab');
        switchTab(targetView);
      });
    });

    // Theme Toggle
    if (el.themeToggle) {
      el.themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('theme-dark', state.theme === 'dark');
        el.themeToggle.textContent = state.theme === 'dark' ? '☀️ CREAM FLOOR' : '🌙 MIDNIGHT';
      });
    }

    // Audio / Speech Toggle
    if (el.audioToggle) {
      el.audioToggle.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        el.audioToggle.textContent = state.audioEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF';
        el.audioToggle.classList.toggle('btn-primary', state.audioEnabled);
        if (state.audioEnabled && 'speechSynthesis' in window) {
          speakText("Audio voice synthesis active.");
        }
      });
    }

    // Standup Controls
    if (el.standupPlayBtn) {
      el.standupPlayBtn.addEventListener('click', toggleStandupPlay);
    }
    if (el.standupNextBtn) {
      el.standupNextBtn.addEventListener('click', advanceStandupStep);
    }
    if (el.standupReplayBtn) {
      el.standupReplayBtn.addEventListener('click', replayStandup);
    }
    if (el.standupSessionSelect) {
      el.standupSessionSelect.addEventListener('change', (e) => {
        state.currentSessionIndex = parseInt(e.target.value, 10) || 0;
        replayStandup();
      });
    }

    // Directive Submission
    if (el.directiveSubmitBtn) {
      el.directiveSubmitBtn.addEventListener('click', handleDirectiveSubmit);
    }
    if (el.directiveInput) {
      el.directiveInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleDirectiveSubmit();
      });
    }

    // Search & Filter
    if (el.agentSearchInput) {
      el.agentSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderAgentsDirectory();
      });
    }

    // Modal Close
    if (el.modalCloseBtn) {
      el.modalCloseBtn.addEventListener('click', closeModal);
    }
    if (el.agentModal) {
      el.agentModal.addEventListener('click', (e) => {
        if (e.target === el.agentModal) closeModal();
      });
    }

    // Watercooler Chat
    if (el.chatSendBtn) {
      el.chatSendBtn.addEventListener('click', handleWatercoolerSend);
    }
    if (el.chatInput) {
      el.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleWatercoolerSend();
      });
    }
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    el.tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabId));
    el.sections.forEach(s => {
      s.classList.toggle('active', s.id === `view-${tabId}`);
    });

    if (tabId === 'standup' && !state.isPlayingStandup && state.currentStepIndex === 0) {
      // Auto-preview first standup step
      renderStandupStep();
    }
  }

  // ========================================================================
  // RENDER VIEWS
  // ========================================================================

  function renderAllViews() {
    renderStandupStage();
    renderOfficeFloor();
    renderAgentsDirectory();
    renderKanbanBoard();
    renderWatercooler();
  }

  // ------------------------------------------------------------------------
  // STANDUP SYSTEM ENGINE
  // ------------------------------------------------------------------------

  function renderStandupStage() {
    if (!el.standupStage) return;
    el.standupStage.innerHTML = '';

    const session = state.standupSessions[state.currentSessionIndex];
    const participantIds = session ? session.participants : [];

    // Filter agents participating in current standup
    let callAgents = state.agents.filter(a => participantIds.includes(a.id));
    if (callAgents.length === 0) {
      callAgents = state.agents.slice(0, 8); // fallback
    }

    callAgents.forEach(agent => {
      const tile = document.createElement('div');
      tile.className = 'agent-video-tile';
      tile.id = `tile-${agent.id}`;
      tile.onclick = () => openAgentModal(agent);

      const avatarSrc = agent.avatar_img || '/assets/avatars/arthur.jpg';
      const isOnline = agent.status === 'ONLINE' || agent.status === 'WORKING';

      tile.innerHTML = `
        <div class="tile-top-bar">
          <span class="tile-agent-name">${agent.name}</span>
          <span class="tile-activity-tag" id="tag-${agent.id}">${agent.status}</span>
        </div>
        <div class="tile-avatar-stage">
          <img src="${avatarSrc}" class="tile-avatar-img" onerror="this.src='/assets/avatars/arthur.jpg'" alt="${agent.name}">
          <div class="tile-audio-wave">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="tile-bottom-ticker">
          <span class="ticker-tool" id="ticker-tool-${agent.id}">⚡ ${agent.active_tool || 'OmniRoute'}</span>
          <span class="ticker-tokens">⚡ ${(agent.tokens?.input || 12000).toLocaleString()}</span>
        </div>
      `;

      el.standupStage.appendChild(tile);
    });

    renderStandupStep();
  }

  function renderStandupStep() {
    const session = state.standupSessions[state.currentSessionIndex];
    if (!session || !session.timeline) return;

    const step = session.timeline[state.currentStepIndex];
    if (!step) return;

    // 1. Clear previous speaker highlights
    document.querySelectorAll('.agent-video-tile').forEach(t => t.classList.remove('speaking'));

    // 2. Identify speaker & highlight
    const speakerId = step.agent;
    const speakerAgent = state.agents.find(a => a.id === speakerId) || { name: 'Executive Leader', id: speakerId };
    const tile = document.getElementById(`tile-${speakerId}`);
    if (tile) {
      tile.classList.add('speaking');
    }

    // 3. Update Subtitles & Speaker Label
    if (el.standupSpeakerLabel) {
      el.standupSpeakerLabel.innerHTML = `🎙️ ${speakerAgent.name} <span class="pixel-badge badge-working">${step.kind.toUpperCase()}</span>`;
    }
    if (el.standupSubtitleText) {
      typewriterEffect(el.standupSubtitleText, step.text || `Executing tool: ${step.tool || ''}`);
    }

    // 4. Update Shared Screen Stage (Terminal / Diff / Report)
    updateSharedScreen(step, speakerAgent);

    // 5. Speech Synthesis
    if (state.audioEnabled && step.text) {
      speakText(`${speakerAgent.name} says: ${step.text}`);
    }

    // 6. Update Activity Tag on Tile
    const tag = document.getElementById(`tag-${speakerId}`);
    if (tag) {
      if (step.kind === 'tools') tag.textContent = `Using ${step.tool}`;
      else if (step.kind === 'say') tag.textContent = `Speaking`;
      else if (step.kind === 'report') tag.textContent = `✓ Reported`;
    }
  }

  function updateSharedScreen(step, speaker) {
    if (!el.sharedWindowBody) return;
    if (el.presenterName) {
      el.presenterName.textContent = speaker.name;
    }

    if (step.kind === 'tools' || step.tool) {
      el.sharedWindowBody.innerHTML = `
        <div class="terminal-window">
          <div class="window-titlebar">
            <div class="window-dots"><span></span><span></span><span></span></div>
            <span>terminal — ${speaker.id} — tool: ${step.tool}</span>
            <span class="dim">bash 5.2</span>
          </div>
          <div class="terminal-content">
            <div class="terminal-prompt-line">❯ ${step.command || step.tool}</div>
            <div style="color: #4ADE80;">${step.output || 'Executing in local sandbox... ✓ Success (duration 1.2s)'}</div>
          </div>
        </div>
      `;
    } else if (step.diff || step.file) {
      el.sharedWindowBody.innerHTML = `
        <div class="diff-window">
          <div class="window-titlebar">
            <div class="window-dots"><span></span><span></span><span></span></div>
            <span>diff — ${step.file || 'workspace/sync.json'}</span>
            <span style="color: #4ADE80;">git diff</span>
          </div>
          <div class="diff-content">
            <div class="diff-line-del">-  "cloud_inference_cost": "$450.00/mo"</div>
            <div class="diff-line-add">+  "cloud_inference_cost": "$0.00 (100% Local Sovereign Ollama)"</div>
            <div class="diff-line-add">+  "status": "UNANIMOUS_COUNCIL_RATIFICATION"</div>
          </div>
        </div>
      `;
    } else {
      el.sharedWindowBody.innerHTML = `
        <div class="pixel-panel-inset" style="padding: 14px; border-radius: 6px;">
          <div style="font-family: var(--cth-font-display); font-size: 9.5px; color: var(--standup-gold); margin-bottom: 6px;">
            📋 ACTIVE DIRECTIVE TRACKER
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #FFF; margin-bottom: 8px;">
            ${step.title || 'Conglomerate Milestone Sync'}
          </div>
          <div style="font-size: 11.5px; color: #CAD0E5; line-height: 1.5;">
            ${step.text || 'Coordinating cross-venture execution across all subsidiaries and specialists.'}
          </div>
        </div>
      `;
    }
  }

  function toggleStandupPlay() {
    state.isPlayingStandup = !state.isPlayingStandup;
    if (el.standupPlayBtn) {
      el.standupPlayBtn.textContent = state.isPlayingStandup ? '⏸️ PAUSE' : '▶️ PLAY STANDUP';
      el.standupPlayBtn.classList.toggle('btn-primary', state.isPlayingStandup);
    }

    if (state.isPlayingStandup) {
      runStandupLoop();
    } else {
      clearTimeout(state.playbackTimer);
    }
  }

  function runStandupLoop() {
    if (!state.isPlayingStandup) return;
    const session = state.standupSessions[state.currentSessionIndex];
    if (!session || !session.timeline) return;

    advanceStandupStep();

    if (state.currentStepIndex >= session.timeline.length - 1) {
      state.isPlayingStandup = false;
      if (el.standupPlayBtn) el.standupPlayBtn.textContent = '▶️ REPLAY STANDUP';
      return;
    }

    state.playbackTimer = setTimeout(runStandupLoop, 4200);
  }

  function advanceStandupStep() {
    const session = state.standupSessions[state.currentSessionIndex];
    if (!session || !session.timeline) return;

    state.currentStepIndex = (state.currentStepIndex + 1) % session.timeline.length;
    renderStandupStep();
  }

  function replayStandup() {
    state.currentStepIndex = 0;
    renderStandupStep();
    if (state.isPlayingStandup) {
      clearTimeout(state.playbackTimer);
      runStandupLoop();
    }
  }

  async function handleDirectiveSubmit() {
    const text = el.directiveInput?.value.trim();
    if (!text) return;
    el.directiveInput.value = '';

    const session = state.standupSessions[state.currentSessionIndex];
    if (!session) return;

    // Add Chairperson Directive to Current Timeline
    const newStep = {
      step: session.timeline.length + 1,
      agent: 'user',
      kind: 'user',
      text: text
    };

    const leadResponse = {
      step: session.timeline.length + 2,
      agent: 'agent-ceo',
      kind: 'say',
      text: `Acknowledged Chairperson. Delegating directive immediately across the engineering and subsidiary swarm.`
    };

    const toolExecution = {
      step: session.timeline.length + 3,
      agent: 'agent-cto',
      kind: 'tools',
      tool: 'ast-grep / OmniRoute',
      command: `dispatch_directive("${text}")`,
      output: `[200 OK] Dispatched across 70 ecosystem tools. Zero cloud leak. Verified execution.`
    };

    session.timeline.push(newStep, leadResponse, toolExecution);
    state.currentStepIndex = session.timeline.length - 3;
    renderStandupStep();

    // Send to backend
    try {
      await fetch('/api/draft/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directive: text })
      });
    } catch (e) {}
  }

  // ------------------------------------------------------------------------
  // OFFICE FLOOR ENGINE (2D PIXEL SCENE)
  // ------------------------------------------------------------------------

  function renderOfficeFloor() {
    if (!el.floorContainer) return;
    el.floorContainer.innerHTML = '';

    // Define 5 Zones
    const zones = [
      { name: 'EXECUTIVE BOARDROOM', x: 20, y: 20, w: 340, h: 220, color: '#D4AF37' },
      { name: 'TECH R&D & CODE PIT', x: 380, y: 20, w: 340, h: 220, color: '#38BDF8' },
      { name: 'MEDIA & MOTION STUDIO', x: 740, y: 20, w: 320, h: 220, color: '#C084FC' },
      { name: 'SUBSIDIARY COMMERCE FLOOR', x: 20, y: 260, w: 700, h: 240, color: '#34D399' },
      { name: 'EXECUTIVE LOUNGE & COFFEE', x: 740, y: 260, w: 320, h: 240, color: '#FB923C' }
    ];

    zones.forEach(z => {
      const zDiv = document.createElement('div');
      zDiv.className = 'office-zone-rect';
      zDiv.style.left = `${z.x}px`;
      zDiv.style.top = `${z.y}px`;
      zDiv.style.width = `${z.w}px`;
      zDiv.style.height = `${z.h}px`;
      zDiv.style.borderColor = z.color;
      zDiv.innerHTML = `<span class="zone-title" style="color: ${z.color}; border-color: ${z.color}">${z.name}</span>`;
      el.floorContainer.appendChild(zDiv);
    });

    // Place Desks for Key Agents
    const deskPositions = [
      { id: 'agent-ceo', x: 70, y: 70, bubble: 'Building sovereign conglomerate legacy.' },
      { id: 'agent-cfo', x: 210, y: 70, bubble: 'Unit economics confirmed. 0.00 cloud burn.' },
      { id: 'agent-coo', x: 140, y: 145, bubble: 'Military precision across all pipelines.' },
      { id: 'agent-cto', x: 430, y: 70, bubble: '100% sovereign inference on RTX GPU.' },
      { id: 'agent-specialist-qa', x: 570, y: 70, bubble: 'Regression suite passed: 106 clean.' },
      { id: 'agent-cmo', x: 800, y: 70, bubble: 'Emotion drives conversion.' },
      { id: 'agent-zuri-chen', x: 940, y: 70, bubble: 'Timing Remotion hooks to 60fps drops.' },
      { id: 'agent-sub-fragrance', x: 70, y: 320, bubble: 'Artisanal Cambodian oud distillation.' },
      { id: 'agent-sub-titan', x: 210, y: 320, bubble: 'Ingesting 1,240 retailer price rows.' },
      { id: 'agent-sub-alfann', x: 350, y: 320, bubble: 'WhatsApp Arabic calligraphy concierge.' },
      { id: 'agent-sub-adwell', x: 490, y: 320, bubble: 'Free spring water sponsor billboards.' }
    ];

    deskPositions.forEach(d => {
      const agent = state.agents.find(a => a.id === d.id) || { name: d.id, id: d.id };
      const desk = document.createElement('div');
      desk.className = 'floor-desk-item';
      desk.style.left = `${d.x}px`;
      desk.style.top = `${d.y}px`;
      desk.onclick = () => openAgentModal(agent);

      const avatarSrc = agent.avatar_img || '/assets/avatars/arthur.jpg';

      desk.innerHTML = `
        <div class="floor-speech-bubble" id="bubble-${agent.id}">${d.bubble}</div>
        <img src="${avatarSrc}" class="floor-desk-avatar" onerror="this.src='/assets/avatars/arthur.jpg'" alt="${agent.name}">
        <span class="floor-desk-name">${agent.name.split(' ')[0]}</span>
      `;

      el.floorContainer.appendChild(desk);
    });
  }

  function startFloorSpeechAnimation() {
    setInterval(() => {
      const bubbles = document.querySelectorAll('.floor-speech-bubble');
      if (bubbles.length === 0) return;
      const target = bubbles[Math.floor(Math.random() * bubbles.length)];
      target.style.display = 'block';
      setTimeout(() => {
        target.style.display = 'none';
      }, 5000);
    }, 4000);
  }

  // ------------------------------------------------------------------------
  // ALL ECOSYSTEM AGENTS DIRECTORY (360+ SWARM)
  // ------------------------------------------------------------------------

  function renderAgentsDirectory() {
    renderDivisionPills();
    renderAgentCards();
  }

  function renderDivisionPills() {
    if (!el.divisionFilterPills) return;
    el.divisionFilterPills.innerHTML = '';

    const divisions = [
      'ALL', 'Executive Leadership', 'Subsidiaries', 'Autonomous Engineering',
      'Autonomous Automation', 'Financial Intelligence', 'Specialist Engineering',
      'Engineering', 'Marketing', 'Design', 'Security', 'Testing', 'Sales', 'Product'
    ];

    divisions.forEach(div => {
      const pill = document.createElement('span');
      pill.className = `filter-pill ${state.selectedDivision === div ? 'active' : ''}`;
      pill.textContent = div;
      pill.onclick = () => {
        state.selectedDivision = div;
        renderAgentsDirectory();
      };
      el.divisionFilterPills.appendChild(pill);
    });
  }

  function renderAgentCards() {
    if (!el.agentsCardsGrid) return;
    el.agentsCardsGrid.innerHTML = '';

    let filtered = state.agents.filter(agent => {
      // Division Match
      if (state.selectedDivision !== 'ALL' && agent.division !== state.selectedDivision) {
        return false;
      }
      // Search Query Match
      if (state.searchQuery) {
        const text = `${agent.name} ${agent.title} ${agent.division} ${agent.focus} ${agent.current_task}`.toLowerCase();
        if (!text.includes(state.searchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      el.agentsCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--cth-ink-500);">
          <div style="font-size: 28px; margin-bottom: 10px;">🔍</div>
          <b>No agents matched your filter.</b> Try a different keyword or reset division.
        </div>
      `;
      return;
    }

    filtered.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'munder-agent-card';
      card.onclick = () => openAgentModal(agent);

      const statusBadge = getStatusBadgeHtml(agent.status);
      const avatarSrc = agent.avatar_img || '';

      card.innerHTML = `
        <div class="agent-card-header">
          ${avatarSrc ? 
            `<img src="${avatarSrc}" class="agent-card-avatar" onerror="this.outerHTML='<div class=\\'agent-card-avatar\\'>${agent.emoji || '🤖'}</div>'">` :
            `<div class="agent-card-avatar">${agent.emoji || '🤖'}</div>`
          }
          <div class="agent-card-info">
            <div class="agent-card-name">${agent.name}</div>
            <div class="agent-card-title">${agent.title}</div>
          </div>
          ${statusBadge}
        </div>
        <div class="agent-current-task-box">
          <span class="task-box-label">CURRENT TASK</span>
          <span class="task-box-text">${agent.current_task || agent.focus || 'Autonomous execution in progress.'}</span>
        </div>
        <div class="agent-card-progress">
          <div class="agent-card-progress-bar" style="width: ${agent.progress || 85}%;"></div>
        </div>
        <div class="agent-card-meta">
          <span>🛠️ ${agent.active_tool || 'OmniRoute'}</span>
          <span>⚡ ${(agent.tokens?.input || 14000).toLocaleString()} tok</span>
        </div>
      `;

      el.agentsCardsGrid.appendChild(card);
    });
  }

  function getStatusBadgeHtml(status) {
    if (status === 'WORKING') return `<span class="pixel-badge badge-working">WORKING</span>`;
    if (status === 'ONLINE') return `<span class="pixel-badge badge-online">ONLINE</span>`;
    if (status === 'BLOCKED') return `<span class="pixel-badge badge-blocked">BLOCKED</span>`;
    return `<span class="pixel-badge badge-standby">STANDBY</span>`;
  }

  // ------------------------------------------------------------------------
  // MODAL INSPECTION DRAWER
  // ------------------------------------------------------------------------

  function openAgentModal(agent) {
    state.modalAgent = agent;
    if (el.modalTitle) el.modalTitle.textContent = agent.name;
    if (el.modalBody) {
      el.modalBody.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: center; border-bottom: var(--border-thin); padding-bottom: 12px;">
          <div style="font-size: 36px;">${agent.emoji || '🤖'}</div>
          <div>
            <div style="font-size: 15px; font-weight: 800;">${agent.name}</div>
            <div style="font-size: 12px; color: var(--cth-ink-500);">${agent.title} · ${agent.division}</div>
          </div>
          <div style="margin-left: auto;">${getStatusBadgeHtml(agent.status)}</div>
        </div>

        <div>
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 4px; color: var(--cth-ink-700);">WHAT AGENT IS CURRENTLY DOING:</div>
          <div class="pixel-panel-inset" style="padding: 10px; font-weight: 600; font-size: 12.5px;">
            ${agent.current_task || agent.focus}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="pixel-panel-inset" style="padding: 8px;">
            <div style="font-size: 10px; color: var(--cth-ink-500); font-family: var(--cth-font-display);">PRIMARY TOOL</div>
            <div style="font-weight: 700; font-size: 12px; margin-top: 2px;">${agent.active_tool || 'OmniRoute'}</div>
          </div>
          <div class="pixel-panel-inset" style="padding: 8px;">
            <div style="font-size: 10px; color: var(--cth-ink-500); font-family: var(--cth-font-display);">INFERENCE ENGINE</div>
            <div style="font-weight: 700; font-size: 12px; margin-top: 2px;">${agent.model || 'qwen2.5-coder:7b-instruct'}</div>
          </div>
        </div>

        <div>
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 4px; color: var(--cth-ink-700);">RECENT EXECUTION METRICS:</div>
          <div style="font-family: var(--cth-font-mono); font-size: 11px; color: var(--cth-ink-700); background: var(--cth-cream-200); padding: 8px; border-radius: 4px;">
            • Input Tokens: ${(agent.tokens?.input || 12000).toLocaleString()}<br>
            • Output Tokens: ${(agent.tokens?.output || 3400).toLocaleString()}<br>
            • Cache Hits: ${(agent.tokens?.cache || 45000).toLocaleString()}<br>
            • Cloud Egress: $0.00 (Zero Recurring SaaS Burn)
          </div>
        </div>

        <div style="margin-top: 8px;">
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 6px;">DISPATCH DIRECT TASK TO ${agent.name.toUpperCase()}:</div>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="modal-task-input" class="agent-search-input" style="height: 34px; font-size: 12px;" placeholder="Assign task to this agent...">
            <button class="pixel-btn btn-primary" onclick="alert('Task dispatched to ${agent.name}!')">DISPATCH</button>
          </div>
        </div>
      `;
    }

    if (el.agentModal) el.agentModal.classList.add('open');
  }

  function closeModal() {
    if (el.agentModal) el.agentModal.classList.remove('open');
  }

  // ------------------------------------------------------------------------
  // KANBAN & TASK BOARD
  // ------------------------------------------------------------------------

  function renderKanbanBoard() {
    Object.values(el.kanbanCols).forEach(c => { if (c) c.innerHTML = ''; });

    state.tasks.forEach(t => {
      const colKey = t.status in el.kanbanCols ? t.status : 'BACKLOG';
      const container = el.kanbanCols[colKey];
      if (!container) return;

      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="pixel-badge ${t.priority === 'CRITICAL' ? 'badge-blocked' : 'badge-working'}">${t.priority}</span>
          <span style="font-size: 10px; font-family: var(--cth-font-mono); color: var(--cth-ink-500);">${t.business}</span>
        </div>
        <div style="font-size: 12px; font-weight: 700; color: var(--cth-ink-900);">${t.title}</div>
        <div style="font-size: 10.5px; color: var(--cth-ink-500);">Assignee: <b>${t.assignee_name}</b></div>
        <div class="agent-card-progress" style="margin-top: 4px;">
          <div class="agent-card-progress-bar" style="width: ${t.progress || 50}%;"></div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ------------------------------------------------------------------------
  // WATERCOOLER CHAT FEED
  // ------------------------------------------------------------------------

  function renderWatercooler() {
    if (!el.watercoolerFeed) return;
    el.watercoolerFeed.innerHTML = '';

    state.watercoolerMessages.forEach(msg => {
      const row = document.createElement('div');
      row.className = 'chat-bubble-row';
      const avatarSrc = msg.avatar || '/assets/avatars/arthur.jpg';

      row.innerHTML = `
        <img src="${avatarSrc}" class="chat-avatar" onerror="this.src='/assets/avatars/arthur.jpg'" alt="${msg.sender_name}">
        <div class="chat-bubble">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <span class="chat-sender-name">${msg.sender_name}</span>
            <span style="font-size: 9.5px; color: var(--cth-ink-300); font-family: var(--cth-font-mono);">${msg.time}</span>
          </div>
          <div class="chat-text">${msg.text}</div>
        </div>
      `;
      el.watercoolerFeed.appendChild(row);
    });

    el.watercoolerFeed.scrollTop = el.watercoolerFeed.scrollHeight;
  }

  function handleWatercoolerSend() {
    const text = el.chatInput?.value.trim();
    if (!text) return;
    el.chatInput.value = '';

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender_name: 'Chairperson of the Board',
      avatar: '/assets/avatars/arthur.jpg',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    state.watercoolerMessages.push(newMsg);
    renderWatercooler();
  }

  // ------------------------------------------------------------------------
  // UTILITIES & TTS
  // ------------------------------------------------------------------------

  function typewriterEffect(element, text) {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 14);
  }

  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
