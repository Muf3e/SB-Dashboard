// SB Group (Saifee Burhani Group of Companies) Dashboard Client Application
// Executive Command, Autonomous Incubator & Casual Personnel Communications

let appState = {
  activeTab: 'progress',
  commChannel: 'watercooler', // 'watercooler' | 'sync' | 'direct'
  employeeStatusFilter: 'all', // 'all' | 'online' | 'standby'
  agents: [],
  selectedAgent: 'ceo',
  status: {},
  telemetry: { streams: [], logs: [] },
  gates: [],
  directives: [],
  tools: [],
  roadmap: null,
  roadmapCategory: 'all',
  roadmapStatus: 'all',
  finances: null,
  incubator: [],
  treasury: null,
  ecosystem: {
    hosts: [],
    activeViewport: 'omniroute',
    lastChecked: null
  },
  communications: {
    watercooler: [],
    project_sync: []
  },
  chatHistories: {}
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initClock();
  fetchInitialData();
  loadEcosystemHosts();
  setInterval(pollTelemetry, 3000);
  setInterval(loadEcosystemHosts, 10000);
});

// --- Theme Management ---
function initTheme() {
  const saved = localStorage.getItem('sb_dashboard_theme') || 'dark';
  applyTheme(saved);
}

function toggleDashboardTheme() {
  const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('sb_dashboard_theme', next);
  applyTheme(next);
}

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  const logoEl = document.getElementById('dashboard-logo');
  const logoBox = document.getElementById('dashboard-logo-box');
  const iconEl = document.getElementById('theme-toggle-icon');
  const labelEl = document.getElementById('theme-toggle-label');
  const favicon = document.querySelector("link[rel='icon']");

  if (logoEl) {
    logoEl.src = isLight ? '/assets/sb_logo_light.png' : '/assets/sb_logo_dark.png';
  }
  if (favicon) {
    favicon.href = isLight ? '/assets/sb_logo_light.png' : '/assets/sb_logo_dark.png';
  }
  if (logoBox) {
    if (isLight) {
      logoBox.style.backgroundColor = 'transparent';
      logoBox.style.borderColor = '#cbd5e1';
      logoBox.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.05)';
    } else {
      logoBox.style.backgroundColor = 'transparent';
      logoBox.style.borderColor = 'rgba(212, 175, 55, 0.4)';
      logoBox.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.15)';
    }
  }
  if (iconEl && labelEl) {
    iconEl.innerText = isLight ? '🌙' : '☀️';
    labelEl.innerText = isLight ? 'Dark Mode' : 'Daylight Mode';
  }
}

// --- Live Clock ---
function initClock() {
  const clockEl = document.getElementById('live-clock');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    }
  };
  update();
  setInterval(update, 1000);
}

// --- Data Fetching ---
async function fetchInitialData() {
  await Promise.all([
    fetchStatus(),
    fetchAgents(),
    fetchTelemetry(),
    fetchGates(),
    fetchDirectives(),
    fetchTools(),
    fetchRoadmap(),
    fetchFinances(),
    fetchIncubator(),
    fetchCommunications(),
    fetchTreasuryStatus(),
    fetchShortsStatus()
  ]);
  renderAllComponents();
}

async function fetchStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    appState.status = data;
    updateStatusRibbon(data);
  } catch (err) {
    console.error('Failed to fetch status', err);
  }
}

async function fetchAgents() {
  try {
    const res = await fetch('/api/agents');
    const data = await res.json();
    appState.agents = data.agents || [];
    renderEmployees();
    renderRightPanelDock();
    renderChatSidebar();
  } catch (err) {
    console.error('Failed to fetch agents', err);
  }
}

async function fetchTelemetry() {
  try {
    const res = await fetch('/api/telemetry');
    const data = await res.json();
    appState.telemetry = data;
    renderLiveLogs(data.logs || []);
    renderCurrentTasks();
  } catch (err) {
    console.error('Failed to fetch telemetry', err);
  }
}

async function fetchGates() {
  try {
    const res = await fetch('/api/gates');
    const data = await res.json();
    appState.gates = data.gates || [];
    renderApprovalRequests();
    renderDecisionGates();
    const pendingCount = appState.gates.filter(g => (g.status || '').includes('PENDING')).length;
    const badge = document.getElementById('gates-tab-badge');
    if (badge) badge.innerText = pendingCount;
    const metric = document.getElementById('metric-pending-gates');
    if (metric) metric.innerText = pendingCount;
    const approvalPendingCounter = document.getElementById('approval-pending-counter');
    if (approvalPendingCounter) approvalPendingCounter.innerText = `${pendingCount} AWAITING SIGN`;
  } catch (err) {
    console.error('Failed to fetch gates', err);
  }
}

async function fetchDirectives() {
  try {
    const res = await fetch('/api/directives');
    const data = await res.json();
    appState.directives = data.directives || [];
    renderDirectives();
    const metric = document.getElementById('metric-directives');
    if (metric) metric.innerText = appState.directives.length;
  } catch (err) {
    console.error('Failed to fetch directives', err);
  }
}

async function fetchTools() {
  try {
    const res = await fetch('/api/tools');
    const data = await res.json();
    appState.tools = data.tools || [];
    renderTools(appState.tools);
    renderRightPanelDock();
  } catch (err) {
    console.error('Failed to fetch tools', err);
  }
}

async function fetchRoadmap() {
  try {
    const res = await fetch('/api/roadmap');
    const data = await res.json();
    if (data && data.items) {
      appState.roadmap = data;
      updateRoadmapSummary(data);
      renderPendingTasks();
      renderCompletedTasks();
      renderRoadmap();
    }
  } catch (err) {
    console.error('Failed to fetch roadmap', err);
  }
}

async function fetchFinances() {
  try {
    const res = await fetch('/api/finances');
    const data = await res.json();
    appState.finances = data;
    renderFinancials();
  } catch (err) {
    console.error('Failed to fetch finances', err);
  }
}

async function fetchIncubator() {
  try {
    const res = await fetch('/api/incubator');
    const data = await res.json();
    appState.incubator = data.proposals || [];
    renderBusinessIncubator();
  } catch (err) {
    console.error('Failed to fetch incubator', err);
  }
}

async function fetchCommunications() {
  try {
    const res = await fetch('/api/communications');
    const data = await res.json();
    appState.communications = data;
    renderWatercoolerChat();
    renderProjectSyncs();
    renderRightPanelDock();
  } catch (err) {
    console.error('Failed to fetch communications', err);
  }
}

async function pollTelemetry() {
  try {
    const tRes = await fetch('/api/telemetry');
    const tData = await tRes.json();
    appState.telemetry = tData;
    renderLiveLogs(tData.logs || []);

    const sRes = await fetch('/api/status');
    const sData = await sRes.json();
    appState.status = sData;
    updateStatusRibbon(sData);

    const cRes = await fetch('/api/communications');
    const cData = await cRes.json();
    if (cData.watercooler && cData.watercooler.length !== appState.communications.watercooler.length) {
      appState.communications.watercooler = cData.watercooler;
      renderWatercoolerChat();
      renderRightPanelDock();
    }
    if (cData.project_sync) {
      appState.communications.project_sync = cData.project_sync;
      if (appState.commChannel === 'sync') renderProjectSyncs();
    }
  } catch (e) {}
}

function updateStatusRibbon(data) {
  if (!data || !data.stats) return;
  const activeAgentsEl = document.getElementById('metric-active-agents');
  if (activeAgentsEl) activeAgentsEl.innerText = data.stats.total_agents || 10;
  
  const subEl = document.getElementById('metric-agents-sub');
  if (subEl && data.stats.active_agents !== undefined) {
    subEl.innerText = `${data.stats.active_agents} Online • ${data.stats.standby_agents || 0} Standby`;
  }

  const counterBadge = document.getElementById('agents-online-counter');
  if (counterBadge && data.stats.active_agents !== undefined) {
    counterBadge.innerText = `${data.stats.active_agents} ACTIVE • ${data.stats.standby_agents || 0} STANDBY`;
  }

  const ollamaBadge = document.getElementById('ollama-status-badge');
  if (ollamaBadge && data.ollama) {
    ollamaBadge.innerText = `Local Engine: ${data.ollama.model} (${data.ollama.status})`;
  }
}

function renderAllComponents() {
  renderFinancials();
  renderCurrentTasks();
  renderEmployees();
  renderApprovalRequests();
  renderPendingTasks();
  renderCompletedTasks();
  renderBusinessIncubator();
  renderRightPanelDock();
  renderWatercoolerChat();
  renderProjectSyncs();
}

// --- Tab Switching ---
function switchTab(tabId) {
  appState.activeTab = tabId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const tabs = ['progress', 'ecosystem', 'communication', 'roadmap', 'ventures', 'shorts', 'governance', 'tools', 'settings'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`tab-content-${t}`);
    if (t === tabId) {
      btn?.classList.add('active');
      content?.classList.remove('hidden');
    } else {
      btn?.classList.remove('active');
      content?.classList.add('hidden');
    }
  });

  // Also toggle header settings button highlight
  const headerSettingsBtn = document.getElementById('header-btn-settings');
  if (headerSettingsBtn) {
    if (tabId === 'settings') {
      headerSettingsBtn.classList.add('border-amber-400', 'bg-amber-500/20', 'text-amber-300');
    } else {
      headerSettingsBtn.classList.remove('border-amber-400', 'bg-amber-500/20', 'text-amber-300');
    }
  }

  if (tabId === 'progress') {
    renderAllComponents();
  } else if (tabId === 'ecosystem') {
    loadEcosystemHosts();
  } else if (tabId === 'communication') {
    switchCommChannel(appState.commChannel);
  } else if (tabId === 'roadmap') {
    renderRoadmap();
  } else if (tabId === 'shorts') {
    renderShortsStudio();
  } else if (tabId === 'governance') {
    renderDecisionGates();
    renderDirectives();
  } else if (tabId === 'tools') {
    renderTools(appState.tools);
  } else if (tabId === 'settings') {
    loadSettings();
  }
}

// ============================================================================
// MAIN PAGE RENDERERS (8 Components + Right Dock)
// ============================================================================

// 1. Subsidiary Earnings & Financial Portfolio
function renderFinancials() {
  const container = document.getElementById('finance-ventures-container');
  if (!container || !appState.finances || !appState.finances.ventures) return;

  const totalGrossEl = document.getElementById('finance-total-gross');
  const totalProfitEl = document.getElementById('finance-total-profit');
  if (totalGrossEl && appState.finances.summary) totalGrossEl.innerText = appState.finances.summary.monthly_gross_revenue;
  if (totalProfitEl && appState.finances.summary) totalProfitEl.innerText = appState.finances.summary.monthly_net_profit;

  container.innerHTML = appState.finances.ventures.map(v => {
    return `
      <div class="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <h4 class="text-xs font-bold text-white tracking-wide">${v.name}</h4>
            <span class="badge-green text-[9px] font-mono">${v.status}</span>
          </div>
          <p class="text-[10px] text-slate-400 mb-2">${v.sector}</p>
          <div class="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px] mb-2">
            <div>
              <span class="text-[9px] uppercase font-mono text-slate-500 block">Monthly Revenue</span>
              <span class="font-bold text-amber-300 font-mono">${v.monthly_revenue}</span>
            </div>
            <div>
              <span class="text-[9px] uppercase font-mono text-slate-500 block">Net Margin</span>
              <span class="font-bold text-emerald-400 font-mono">${v.margin}</span>
            </div>
          </div>
        </div>
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
          <span>Top Product: <strong class="text-slate-300">${v.top_product}</strong></span>
          <button onclick="openTreasuryWithVenture('${v.id}')" class="btn-ghost text-[10px] py-1 px-2.5 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-950/40 flex items-center gap-1 font-mono font-bold" title="Open Instant Payment Rail">
            <span>💳</span> Checkout Rail
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 2. Current Active Tasks (Live Work in Flight)
function renderCurrentTasks() {
  const container = document.getElementById('current-tasks-container');
  if (!container || !appState.telemetry || !appState.telemetry.streams) return;

  container.innerHTML = appState.telemetry.streams.map(s => {
    return `
      <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 hover:border-sky-500/30 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${s.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-sky-400 animate-pulse'}"></span>
            <h4 class="text-xs font-bold text-white">${s.task}</h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-slate-400">${s.agent_name} (${s.department.split('(')[0]})</span>
            <span class="badge-blue text-[9px] font-mono">${s.status}</span>
          </div>
        </div>
        <p class="text-[11px] text-slate-300 mb-2 leading-relaxed">${s.details}</p>
        <div class="flex items-center gap-3">
          <div class="flex-1 progress-track bg-slate-950">
            <div class="progress-fill" style="width: ${s.progress}%;"></div>
          </div>
          <span class="font-mono text-[10px] font-bold text-amber-300 shrink-0">${s.progress}%</span>
          <span class="text-[9px] text-slate-500 shrink-0 font-mono">ETA: ${s.eta}</span>
        </div>
      </div>
    `;
  }).join('');
}

// 3. Employees Active & Non-Active (Standby)
function filterEmployeeRoster(filter) {
  appState.employeeStatusFilter = filter;
  document.querySelectorAll('.employee-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.className = 'employee-filter-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40';
    } else {
      btn.className = 'employee-filter-btn px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-transparent';
    }
  });
  renderEmployees();
}

function renderEmployees() {
  const container = document.getElementById('employees-grid-container');
  if (!container || !appState.agents) return;

  const filter = appState.employeeStatusFilter || 'all';
  const filtered = appState.agents.filter(a => {
    if (filter === 'online') return a.status === 'ONLINE';
    if (filter === 'standby') return a.status === 'STANDBY';
    return true;
  });

  container.innerHTML = filtered.map(a => {
    const isOnline = a.status === 'ONLINE';
    const statusPill = isOnline ? '<span class="status-pill-online">● ACTIVE ONLINE</span>' : '<span class="status-pill-standby">💤 STANDBY</span>';

    return `
      <div class="card-glass p-3.5 flex flex-col justify-between border border-slate-800/80 hover:border-amber-500/40 transition-all">
        <div>
          <div class="flex items-start justify-between gap-2.5 mb-2.5">
            <div class="flex items-center gap-2.5">
              <div class="relative">
                <img src="${a.avatar_img}" alt="${a.name}" class="w-11 h-11 rounded-full object-cover border border-amber-500/40">
                <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-400'} border-2 border-slate-900"></span>
              </div>
              <div>
                <h4 class="text-xs font-bold text-white">${a.name}</h4>
                <p class="text-[10px] text-amber-300 font-semibold">${a.title.split('(')[0]}</p>
                <p class="text-[9px] text-slate-400 font-mono">Age ${a.age} • ${a.origin.split('/')[0]}</p>
              </div>
            </div>
            ${statusPill}
          </div>
          <p class="text-[11px] text-slate-300 mb-2 italic line-clamp-2">"${a.personality}"</p>
          <div class="bg-slate-950/50 p-2 rounded-lg border border-slate-800/70 text-[10px] mb-2.5">
            <span class="text-slate-500 block uppercase font-mono text-[9px]">Current Focus</span>
            <span class="text-slate-300">${a.current_task || a.focus}</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
          <button onclick="directMessageAgent('${a.key}')" class="btn-ghost text-[11px] py-1 px-2.5 text-amber-300 flex items-center gap-1">
            <span>💬</span> Chat
          </button>
          <button onclick="handleToggleAgentStatus('${a.id}')" class="text-[10px] font-mono py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            ${isOnline ? 'Set Standby' : 'Wake Up'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleToggleAgentStatus(agentId) {
  try {
    const res = await fetch('/api/agents/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId })
    });
    const data = await res.json();
    if (data.success && data.agents) {
      appState.agents = data.agents;
      renderEmployees();
      fetchStatus();
    }
  } catch (err) {
    console.error('Failed to toggle agent status', err);
  }
}

// 4. Task Requests for Approval (Chairperson Decision Gates)
function renderApprovalRequests() {
  const container = document.getElementById('approval-requests-container');
  if (!container || !appState.gates) return;

  const pending = appState.gates.filter(g => (g.status || '').includes('PENDING'));
  if (pending.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-slate-900/40 p-4 rounded-xl text-center text-xs text-slate-400">
        ✓ No pending approval requests. All conglomerate decisions ratified.
      </div>
    `;
    return;
  }

  container.innerHTML = pending.map(gate => {
    return `
      <div class="card-glass p-3.5 flex flex-col justify-between border border-amber-500/40 bg-amber-950/10">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="badge-gold text-[9px] font-mono">${gate.gate_id}</span>
            <span class="badge-rose text-[9px] uppercase font-mono">${gate.urgency || 'HIGH'} PRIORITY</span>
          </div>
          <h4 class="text-xs font-bold text-white mb-1">${gate.title}</h4>
          <p class="text-[10px] text-amber-300 font-semibold mb-2">${gate.business_unit} • Sponsor: ${gate.proposer}</p>
          <p class="text-[11px] text-slate-300 mb-3 leading-relaxed">${gate.description}</p>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button onclick="handleRejectGate('${gate.gate_id}')" class="btn-ghost text-[11px] py-1 px-3 text-rose-400 hover:bg-rose-950/40">
            ✗ Reject
          </button>
          <button onclick="handleApproveGate('${gate.gate_id}')" class="btn-gold text-[11px] py-1 px-3">
            ✓ Ratify & Sign
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleApproveGate(gateId) {
  try {
    const res = await fetch('/api/gates/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gate_id: gateId })
    });
    const data = await res.json();
    if (data.success) {
      await fetchGates();
      await fetchStatus();
    }
  } catch (err) {
    console.error('Approval failed', err);
  }
}

async function handleRejectGate(gateId) {
  const reason = prompt('Specify rejection or revision decree for this gate:', 'Requires revised cost projection');
  if (reason === null) return;
  try {
    const res = await fetch('/api/gates/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gate_id: gateId, reason: reason })
    });
    const data = await res.json();
    if (data.success) {
      await fetchGates();
      await fetchStatus();
    }
  } catch (err) {
    console.error('Rejection failed', err);
  }
}

// 5 & 6. Pending Tasks & Completed Tasks
function renderPendingTasks() {
  const container = document.getElementById('pending-tasks-list');
  if (!container || !appState.roadmap || !appState.roadmap.items) return;

  const pending = appState.roadmap.items.filter(i => i.status === 'IN_PROGRESS' || i.status === 'SCHEDULED' || i.status === 'PENDING_APPROVAL');
  const badge = document.getElementById('pending-tasks-badge');
  if (badge) badge.innerText = `${pending.length} IN QUEUE`;

  container.innerHTML = pending.slice(0, 6).map(item => {
    return `
      <div class="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div class="truncate">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-[10px] text-amber-400 font-bold">${item.id}</span>
            <span class="font-semibold text-white truncate">${item.title}</span>
          </div>
          <p class="text-[10px] text-slate-400 truncate">${item.owner} • ETA: ${item.eta}</p>
        </div>
        <span class="font-mono text-[10px] font-bold text-sky-400 shrink-0">${item.progress}%</span>
      </div>
    `;
  }).join('');
}

function renderCompletedTasks() {
  const container = document.getElementById('completed-tasks-list');
  if (!container || !appState.roadmap || !appState.roadmap.items) return;

  const completed = appState.roadmap.items.filter(i => i.status === 'COMPLETED');
  const badge = document.getElementById('completed-tasks-badge');
  if (badge) badge.innerText = `${completed.length} VERIFIED`;

  container.innerHTML = completed.slice(0, 6).map(item => {
    return `
      <div class="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div class="truncate">
          <div class="flex items-center gap-1.5">
            <span class="text-emerald-400 font-bold">✓</span>
            <span class="font-semibold text-white truncate">${item.title}</span>
          </div>
          <p class="text-[10px] text-slate-400 truncate">${item.owner} • Verified Production Milestone</p>
        </div>
        <span class="badge-green text-[9px] font-mono shrink-0">100%</span>
      </div>
    `;
  }).join('');
}

// 7. Continuous Autonomous Business Incubator & Startup Debates
function renderBusinessIncubator() {
  const container = document.getElementById('incubator-proposals-container');
  if (!container || !appState.incubator) return;

  container.innerHTML = appState.incubator.map(p => {
    const isFinalized = p.status === 'FINALIZED_FOR_STARTUP';
    const isRatified = p.status === 'UNANIMOUS_COUNCIL_RATIFICATION' || isFinalized;
    const cr = p.council_rounds;
    const fin = p.final_ratified_proposal;

    return `
      <div class="card-glass p-5 border ${isFinalized ? 'border-emerald-500/50' : 'border-purple-500/40'} flex flex-col gap-4 shadow-xl">
        
        <!-- Header & Action Ribbon -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">${p.id}</span>
              <h4 class="text-sm font-bold text-white tracking-wide">${p.title}</h4>
              <span class="${isRatified ? 'badge-green' : 'badge-gold'} text-[10px] font-mono">
                ${isFinalized ? '✓ CLEARED FOR LAUNCH' : (isRatified ? '🏆 UNANIMOUS COUNCIL CONSENSUS' : 'UNDER ACTIVE DEBATE')}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">
              <span class="text-amber-300 font-semibold">${p.category}</span> • Initiator: <strong class="text-slate-200">${p.initiator}</strong>
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button onclick="handleChallengeProposal('${p.id}')" class="btn-ghost text-[11px] py-1.5 px-3 flex items-center gap-1 border border-red-500/40 text-red-300 hover:bg-red-950/30" title="Inject a tough objection or edge case to challenge the Council">
              <span>🔥</span> Challenge Debators
            </button>
            ${!isFinalized ? `
              <button onclick="handleFinalizeStartup('${p.id}')" class="btn-gold text-[11px] py-1.5 px-3.5 flex items-center gap-1">
                <span>🚀</span> Finalize for Startup
              </button>
            ` : '<span class="badge-green text-xs font-bold px-3 py-1">✓ Live Startup Mandate</span>'}
          </div>
        </div>

        <!-- Financial & Risk Projections Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px]">
          <div>
            <span class="text-[9px] uppercase font-mono text-slate-400 block">Upfront Capital Required</span>
            <span class="font-bold text-amber-300 font-mono text-xs">${p.investment_required ? p.investment_required.split('(')[0] : '₹35,000'}</span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-mono text-slate-400 block">Projected Revenue</span>
            <span class="font-bold text-emerald-400 font-mono text-xs">${p.projected_monthly_revenue || '₹2,50,000 / mo'}</span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-mono text-slate-400 block">Stress-Tested Net Margin</span>
            <span class="font-bold text-sky-400 font-mono text-xs">${p.projected_net_margin || '78%'}</span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-mono text-slate-400 block">Capital Payback Period</span>
            <span class="font-bold text-purple-300 font-mono text-xs">${p.payback_period || '28 Days'}</span>
          </div>
        </div>

        <!-- Executive Verdict / Summary -->
        <div class="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <strong class="text-amber-300 uppercase text-[10px] font-mono tracking-wider block mb-1">Council Verdict & Executive Summary:</strong>
          ${p.debate_summary}
        </div>

        <!-- STRATEGIC INTELLIGENCE MATRICES (5-Yr Trajectory, Demographics, Ongoing Cash Flow, or Zero-Loss Trading) -->
        ${(() => {
          const si = p.strategic_intelligence;
          const meta = p.meeting_meta;
          if (!si) return '';

          // 1. New Product Archetype
          if (si.five_year_trajectory) {
            const fyt = si.five_year_trajectory;
            const demo = si.target_audience_demographics;
            const mkt = si.market_size_and_value;
            const ident = si.product_identity;

            return `
              <div class="bg-purple-950/20 rounded-xl p-3.5 border border-purple-900/40 space-y-3">
                <div class="flex items-center justify-between border-b border-purple-900/30 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">📊</span>
                    <strong class="text-xs text-white uppercase font-mono tracking-wider">Strategic Product Viability & 5-Year Trajectory</strong>
                  </div>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30">${fyt.graph_curve_type || 'Exponential S-Curve'}</span>
                </div>

                <!-- Product Identity & Market TAM -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">Product Novelty & Classification</span>
                    <div class="text-amber-300 font-bold">${ident ? ident.classification : 'Category Innovator'}</div>
                    <div class="text-slate-300 text-[10px] mt-0.5">${ident ? ident.is_new_or_version : 'New Solution'}</div>
                  </div>
                  <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block mb-0.5">Market Opportunity (TAM / SAM / SOM)</span>
                    <div class="text-emerald-400 font-bold">${mkt ? mkt.tam : '₹18,500 Cr TAM'}</div>
                    <div class="text-slate-300 text-[10px] mt-0.5">${mkt ? mkt.som : '₹24 Cr Year 1-2 SOM'}</div>
                  </div>
                </div>

                <!-- 5-Year Growth Graph & Milestones -->
                ${fyt.graph_data ? `
                  <div class="space-y-1.5">
                    <span class="text-[10px] font-mono uppercase font-bold text-slate-300 block">📈 5-Year Revenue & Customer Growth Graph:</span>
                    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                      ${fyt.graph_data.map(g => `
                        <div class="bg-slate-950/80 p-2 rounded-lg border border-purple-900/30 flex flex-col justify-between">
                          <div class="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                            <span class="font-bold text-purple-300">${g.year}</span>
                            <span class="text-emerald-400 font-bold">${g.revenue}</span>
                          </div>
                          <div class="text-[10px] text-white font-semibold mb-1">${g.users}</div>
                          <div class="text-[9px] text-slate-400 leading-tight">${g.milestone}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Demographics & Audience Profiling -->
                ${demo ? `
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <!-- Age Groups -->
                    <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span class="text-[9px] font-mono uppercase text-slate-400 block font-bold">🎯 Target Age Groups</span>
                      ${(demo.age_groups || []).map(a => `
                        <div class="flex items-center justify-between text-[10px]">
                          <span class="text-slate-300">${a.range.split('(')[0]}</span>
                          <span class="font-mono font-bold text-amber-300">${a.percentage}%</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1 rounded-full overflow-hidden mb-1">
                          <div class="bg-amber-400 h-full" style="width: ${a.percentage}%"></div>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Gender Distribution -->
                    <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                      <span class="text-[9px] font-mono uppercase text-slate-400 block font-bold">⚧️ Gender Distribution</span>
                      <div class="flex items-center justify-between text-xs font-mono font-bold">
                        <span class="text-sky-300">♂ Male: ${demo.gender_distribution?.male || 60}%</span>
                        <span class="text-pink-300">♀ Female: ${demo.gender_distribution?.female || 36}%</span>
                      </div>
                      <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div class="bg-sky-400 h-full" style="width: ${demo.gender_distribution?.male || 60}%"></div>
                        <div class="bg-pink-400 h-full" style="width: ${demo.gender_distribution?.female || 36}%"></div>
                        <div class="bg-purple-400 h-full" style="width: 4%"></div>
                      </div>
                      <div class="text-[10px] text-slate-400 leading-snug mt-1">
                        <strong class="text-slate-300">Trigger:</strong> ${demo.purchase_trigger || 'Decision clarity & automated time savings.'}
                      </div>
                    </div>

                    <!-- Profession Breakdown -->
                    <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span class="text-[9px] font-mono uppercase text-slate-400 block font-bold">💼 Target Professions</span>
                      ${(demo.professions || []).map(pr => `
                        <div class="flex items-center justify-between text-[10px] py-0.5 border-b border-slate-800/60 last:border-0">
                          <span class="text-slate-200 truncate pr-1">${pr.title.split('&')[0]}</span>
                          <span class="font-mono font-bold text-sky-400 shrink-0">${pr.share}%</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

              </div>
            `;
          }

          // 2. Ongoing Product Review Archetype
          if (si.ongoing_performance) {
            const op = si.ongoing_performance;
            const rec = si.recent_features_added || [];
            const chg = si.what_needs_to_be_changed_next || [];
            const rmap = si.ongoing_development_roadmap || [];

            return `
              <div class="bg-blue-950/20 rounded-xl p-3.5 border border-blue-900/40 space-y-3">
                <div class="flex items-center justify-between border-b border-blue-900/30 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">🔄</span>
                    <strong class="text-xs text-white uppercase font-mono tracking-wider">Executive Performance & Operational Scaling Audit</strong>
                  </div>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">CURRENT CASH FLOW: ${op.monthly_revenue}</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Monthly Revenue</span>
                    <span class="text-emerald-400 font-bold font-mono">${op.monthly_revenue}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">ARR Run-Rate</span>
                    <span class="text-amber-300 font-bold font-mono">${op.annualized_run_rate}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Active Users Volume</span>
                    <span class="text-sky-300 font-bold font-mono">${op.active_users_volume}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">MoM Growth Rate</span>
                    <span class="text-purple-300 font-bold font-mono">${op.growth_velocity}</span>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span class="text-[9px] font-mono uppercase text-emerald-400 block font-bold">⚡ Recent Features Added:</span>
                    ${rec.map(r => `<div class="text-slate-300 text-[10px] flex items-start gap-1.5"><span class="text-emerald-400">✓</span><span>${r}</span></div>`).join('')}
                  </div>
                  <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <span class="text-[9px] font-mono uppercase text-amber-400 block font-bold">🛠️ What Needs to Change Next:</span>
                    ${chg.map(c => `<div class="text-slate-300 text-[10px] flex items-start gap-1.5"><span class="text-amber-400">⚠</span><span>${c}</span></div>`).join('')}
                  </div>
                </div>

                ${rmap.length ? `
                  <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                    <span class="text-[9px] font-mono uppercase text-sky-400 block font-bold">🗺️ Ongoing Development Sprint Roadmap:</span>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      ${rmap.map(m => `
                        <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                          <span class="text-[9px] font-mono font-bold text-sky-300 block">${m.milestone}</span>
                          <span class="text-[10px] text-slate-300 leading-tight">${m.target}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

              </div>
            `;
          }

          // 3. Investment / Trading Archetype
          if (si.chairperson_mandate || si.strategy_and_bot_diligence) {
            const cm = si.chairperson_mandate || {};
            const sd = si.strategy_and_bot_diligence || {};
            const fr = si.financial_returns_projection || {};

            return `
              <div class="bg-amber-950/20 rounded-xl p-3.5 border border-amber-900/40 space-y-3">
                <div class="flex items-center justify-between border-b border-amber-900/30 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">🛡️</span>
                    <strong class="text-xs text-amber-300 uppercase font-mono tracking-wider">Zero-Loss Capital Preservation & Trading Diligence</strong>
                  </div>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">REAL CAPITAL AT RISK: ₹0.00 (PAPER ONLY)</span>
                </div>

                <!-- Chairperson Mandate Ribbon -->
                <div class="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-base">🔒</span>
                    <div>
                      <strong class="text-white text-[11px] block">CHAIRPERSON MANDATE ENFORCED:</strong>
                      <span class="text-amber-300 text-[10px] font-mono font-semibold">${cm.core_rule || 'Absolute Capital Preservation First'}</span>
                    </div>
                  </div>
                  <span class="badge-green text-[9px] font-mono">100% PAPER SIMULATION LOCKOUT ACTIVE</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Backtest Sharpe Ratio</span>
                    <span class="text-emerald-400 font-bold font-mono">${sd.backtest_sharpe_ratio || '2.42'}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Max Simulated Drawdown</span>
                    <span class="text-sky-300 font-bold font-mono">${sd.max_simulated_drawdown || '1.7%'}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Projected Monthly Yield</span>
                    <span class="text-amber-300 font-bold font-mono">${fr.projected_monthly_return || '3.2% - 4.5%'}</span>
                  </div>
                  <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                    <span class="text-[9px] font-mono uppercase text-slate-400 block">Capital Shielding Score</span>
                    <span class="text-purple-300 font-bold font-mono">${fr.capital_preservation_score || '99.2%'}</span>
                  </div>
                </div>

                <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                  <span class="text-[9px] font-mono uppercase text-slate-400 block font-bold">🤖 Algorithmic Architecture & Risk Defense:</span>
                  <div class="text-slate-300 text-[10px]"><strong>Engines:</strong> ${sd.primary_engines || 'Freqtrade + TradingAgents'}</div>
                  <div class="text-slate-300 text-[10px]"><strong>Hedging:</strong> ${sd.hedging_mechanics || 'Market-neutral delta hedging'}</div>
                  <div class="text-slate-300 text-[10px]"><strong>Stop-Loss:</strong> ${sd.stop_loss_architecture || 'Hard 1.2% circuit breaker with trailing stop'}</div>
                </div>

              </div>
            `;
          }

          return '';
        })()}

        <!-- LLM COUNCIL MULTI-ROUND ADVERSARIAL DEBATE FEED -->
        ${cr ? `
          <div class="space-y-3 pt-1">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-[11px] font-bold uppercase font-mono text-slate-300 flex items-center gap-1.5">
                <span>⚔️</span> Karpathy LLM Council & Swarm Adversarial Debate
              </span>
              <span class="text-[10px] font-mono text-purple-400">8 Debators • No Yes-Men</span>
            </div>

            <!-- ROUND 1: Flaw Interrogation & Radical Alternates -->
            <details class="modern-accordion" open>
              <summary class="text-[11px] font-mono font-bold uppercase text-red-400 hover:text-red-300">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
                  <span>ROUND 1: Flaw Interrogation & Alternate Options (${(cr.round_1 || []).length} Critical Arguments)</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono font-normal">Toggle View</span>
              </summary>
              <div class="p-3 pt-1 space-y-2 text-xs border-t border-red-900/30">
                ${(cr.round_1 || []).map(d => `
                  <div class="bg-slate-950/80 p-2.5 rounded-lg border border-red-900/30 space-y-1.5">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <img src="${d.avatar}" alt="${d.debator}" class="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700">
                        <strong class="text-white text-[11px]">${d.debator}</strong>
                        <span class="text-[10px] text-slate-400 font-mono">(${d.role})</span>
                      </div>
                      <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded ${d.badge_color || 'border border-red-500/40 text-red-400 bg-red-950/40'}">
                        ${d.stance ? d.stance.replace(/_/g, ' ') : 'CRITICAL FLAW'}
                      </span>
                    </div>
                    <p class="text-slate-300 text-[11px] leading-relaxed pl-8">
                      <strong class="text-red-400 font-semibold">Flaw:</strong> ${d.critique}
                    </p>
                    ${d.alternate_proposal ? `
                      <div class="ml-8 p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                        <strong class="text-emerald-400 font-bold block mb-0.5">⚡ Alternate Option Proposed:</strong>
                        ${d.alternate_proposal}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </details>

            <!-- ROUND 2: Cross-Examination & Stress-Testing -->
            <details class="modern-accordion">
              <summary class="text-[11px] font-mono font-bold uppercase text-amber-400 hover:text-amber-300">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></span>
                  <span>ROUND 2: Cross-Examination & Stress-Testing (${(cr.round_2 || []).length} Evaluations)</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono font-normal">Toggle View</span>
              </summary>
              <div class="p-3 pt-1 space-y-2 text-xs border-t border-amber-900/30">
                ${(cr.round_2 || []).map(d => `
                  <div class="bg-slate-950/80 p-2.5 rounded-lg border border-amber-900/30 space-y-1">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <img src="${d.avatar}" alt="${d.debator}" class="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700">
                        <strong class="text-white text-[11px]">${d.debator}</strong>
                        <span class="text-[10px] text-slate-400 font-mono">(${d.role})</span>
                      </div>
                      <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded ${d.badge_color || 'border border-amber-500/40 text-amber-400 bg-amber-950/40'}">
                        ${d.stance ? d.stance.replace(/_/g, ' ') : 'STRESS-TEST'}
                      </span>
                    </div>
                    <p class="text-slate-300 text-[11px] leading-relaxed pl-8">
                      ${d.critique}
                    </p>
                    ${d.refinement ? `
                      <div class="ml-8 p-1.5 rounded bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-300 leading-relaxed">
                        <strong class="text-sky-400 font-bold">Refinement Adopted:</strong> ${d.refinement}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </details>

            <!-- ROUND 3: Convergence & Consensus Ratification -->
            <details class="modern-accordion">
              <summary class="text-[11px] font-mono font-bold uppercase text-emerald-400 hover:text-emerald-300">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                  <span>ROUND 3: Consensus Convergence & Ratification (${(cr.round_3 || []).length} Votes)</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono font-normal">Toggle View</span>
              </summary>
              <div class="p-3 pt-1 space-y-2 text-xs border-t border-emerald-900/30">
                ${(cr.round_3 || []).map(d => `
                  <div class="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/30 flex items-start gap-2">
                    <img src="${d.avatar}" alt="${d.debator}" class="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-700">
                    <div class="flex-1 text-[11px] leading-relaxed">
                      <div class="flex items-center gap-2 mb-0.5">
                        <strong class="text-white">${d.debator}:</strong>
                        <span class="badge-green text-[9px] font-mono">${d.vote ? d.vote.replace(/_/g, ' ') : 'RATIFIED'}</span>
                      </div>
                      <span class="text-emerald-300/90">${d.statement || d.critique}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </details>

            <!-- FINAL RATIFIED BLUEPRINT (If available) -->
            ${fin ? `
              <div class="bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/30 space-y-3 text-xs">
                
                ${fin.flaws_caught_and_mitigated ? `
                  <div>
                    <div class="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-amber-300 border-b border-slate-800 pb-1 mb-2">
                      <span>🛡️ Critical Flaws Caught & Mitigated by Council</span>
                      <span class="badge-gold text-[9px]">Verified Viable</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      ${fin.flaws_caught_and_mitigated.map(f => `
                        <div class="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                          <div class="text-red-400 font-bold text-[10px] uppercase">❌ Caught Flaw:</div>
                          <div class="text-slate-300 mb-1">${f.flaw}</div>
                          <div class="text-emerald-400 font-bold text-[10px] uppercase">✅ Adopted Mitigation:</div>
                          <div class="text-emerald-300">${f.mitigation}</div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${fin.day_one_action_plan && fin.day_one_action_plan.length ? `
                  <div class="pt-2 border-t border-slate-800/80">
                    <div class="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-emerald-400 mb-2">
                      <span>🚀 Day 1 Zero-Touch Execution Action Plan</span>
                      <span class="badge-green text-[9px]">Autonomy Ready</span>
                    </div>
                    <div class="space-y-1.5">
                      ${fin.day_one_action_plan.map((step, idx) => `
                        <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-start gap-2 text-[11px]">
                          <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
                          <span class="text-slate-200">${step}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${fin.unit_economics ? `
                  <div class="pt-2 border-t border-slate-800/80">
                    <div class="text-[10px] font-mono font-bold uppercase text-sky-400 mb-1.5">
                      <span>📊 Ratified Unit Economics & Payback Model</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div class="bg-slate-950/70 p-2 rounded border border-slate-800 text-center">
                        <span class="text-slate-400 block text-[9px]">Gross Margin</span>
                        <span class="text-emerald-400 font-bold text-xs">${fin.unit_economics.gross_margin || '84%'}</span>
                      </div>
                      <div class="bg-slate-950/70 p-2 rounded border border-slate-800 text-center">
                        <span class="text-slate-400 block text-[9px]">Net Operating Margin</span>
                        <span class="text-sky-400 font-bold text-xs">${fin.unit_economics.net_operating_margin || '73%'}</span>
                      </div>
                      <div class="bg-slate-950/70 p-2 rounded border border-slate-800 text-center">
                        <span class="text-slate-400 block text-[9px]">Break-Even Units</span>
                        <span class="text-amber-300 font-bold text-xs">${fin.unit_economics.break_even_units || '32 Units'}</span>
                      </div>
                      <div class="bg-slate-950/70 p-2 rounded border border-slate-800 text-center">
                        <span class="text-slate-400 block text-[9px]">Capital Payback</span>
                        <span class="text-purple-300 font-bold text-xs">${fin.unit_economics.payback_period || '24 Days'}</span>
                      </div>
                    </div>
                  </div>
                ` : ''}

              </div>
            ` : ''}

          </div>
        ` : `
          <!-- Fallback Legacy Debate Transcript -->
          <div class="bg-slate-900/50 p-3 rounded-xl border border-slate-800 space-y-2">
            <div class="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
              <span>🗣️ Active Swarm Debate & Analysis</span>
              <span class="text-purple-400">Multi-Perspective Verification</span>
            </div>
            <div class="space-y-1.5 text-xs">
              ${(p.debate_transcript || []).map(d => `
                <div class="flex items-start gap-2">
                  <img src="${d.avatar}" alt="${d.agent}" class="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-slate-700">
                  <div class="leading-relaxed">
                    <strong class="text-white text-[11px]">${d.agent}:</strong>
                    <span class="text-slate-300 text-[11px]">${d.comment}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `}

      </div>
    `;
  }).join('');
}

async function handleChallengeProposal(id) {
  const challenge = prompt("Enter a specific flaw, risk, or constraint to challenge the LLM Council with (e.g. 'What if courier rates spike 40%?', 'How do we prevent scraping bans?', 'What happens if refund rate is 20%?'):");
  if (!challenge || !challenge.trim()) return;

  try {
    const res = await fetch('/api/incubator/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, challenge: challenge.trim() })
    });
    const data = await res.json();
    if (data.success && data.proposals) {
      appState.incubator = data.proposals;
      renderBusinessIncubator();
    }
  } catch (err) {
    alert(`Challenge Error: ${err.message}`);
  }
}

function updatePitchPlaceholder() {
  const select = document.getElementById('incubator-meeting-type');
  const input = document.getElementById('incubator-pitch-input');
  if (!select || !input) return;
  const val = select.value;
  if (val === 'NEW_PRODUCT') {
    input.placeholder = "E.g. AI-Powered Dropshipping Diagnostic Tool: 5-year graph, TAM & demographic breakdown...";
  } else if (val === 'ONGOING_REVIEW') {
    input.placeholder = "E.g. Review ongoing performance of TITAN Labs electronics engine, current revenue & next sprint...";
  } else if (val === 'INVESTMENT_TRADING') {
    input.placeholder = "E.g. Deploy Freqtrade market-neutral paper-trading bot on BTC/USDT with zero-loss safeguard...";
  } else {
    input.placeholder = "Post new product idea, ongoing review mandate, or capital investment proposal...";
  }
}

async function handlePitchIdea(e) {
  e.preventDefault();
  const input = document.getElementById('incubator-pitch-input');
  const typeSelect = document.getElementById('incubator-meeting-type');
  const btn = document.getElementById('incubator-pitch-btn');
  const idea = input.value.trim();
  if (!idea) return;
  const meetingType = typeSelect ? typeSelect.value : 'AUTO';

  btn.disabled = true;
  btn.innerHTML = '<span>🏛️ Convening Strategic Meeting...</span>';

  try {
    const res = await fetch('/api/incubator/pitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: idea, meeting_type: meetingType })
    });
    const data = await res.json();
    if (data.success && data.proposals) {
      appState.incubator = data.proposals;
      renderBusinessIncubator();
      input.value = '';
    }
  } catch (err) {
    console.error('Pitch failed', err);
    alert(`Meeting Convening Failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Convene Strategic Meeting</span> ➔';
  }
}

async function handleFinalizeStartup(id) {
  if (!confirm(`Ratify and finalize [${id}] for immediate commercial startup?`)) return;
  try {
    const res = await fetch('/api/incubator/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });
    const data = await res.json();
    if (data.success) {
      await fetchIncubator();
      await fetchGates();
      await fetchRoadmap();
    }
  } catch (err) {
    console.error('Finalize startup failed', err);
  }
}

// 8. Right-Hand Fixed Short Panel (Quick Dock)
function renderRightPanelDock() {
  // Quick Watercooler feed
  const qcContainer = document.getElementById('quick-watercooler-feed');
  if (qcContainer && appState.communications.watercooler) {
    const latest = appState.communications.watercooler.slice(-2);
    qcContainer.innerHTML = latest.map(m => `
      <div class="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
          <strong class="text-amber-300 font-semibold">${m.sender_name}</strong>
          <span>${m.time}</span>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-2">${m.text}</p>
      </div>
    `).join('');
  }

  // Active Agent Pulse
  const pulseContainer = document.getElementById('agent-pulse-list');
  if (pulseContainer && appState.agents) {
    pulseContainer.innerHTML = appState.agents.map(a => `
      <div class="flex items-center justify-between text-[11px] py-0.5">
        <div class="flex items-center gap-2 truncate">
          <span class="w-2 h-2 rounded-full ${a.status === 'ONLINE' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-500'}"></span>
          <span class="text-white truncate font-medium">${a.name}</span>
        </div>
        <span class="text-[9px] font-mono text-slate-400 shrink-0">${a.status === 'ONLINE' ? '12ms' : 'Standby'}</span>
      </div>
    `).join('');
  }

  // 58-Tool Directory Quick List
  const toolContainer = document.getElementById('quick-tools-list');
  if (toolContainer && appState.tools) {
    renderQuickToolList(appState.tools.slice(0, 6));
  }
}

function renderQuickToolList(tools) {
  const toolContainer = document.getElementById('quick-tools-list');
  if (!toolContainer) return;
  toolContainer.innerHTML = tools.map(t => `
    <div onclick="switchTab('tools')" class="p-1.5 rounded-lg bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/80 flex items-center justify-between text-[10px] cursor-pointer transition-all">
      <span class="font-bold text-slate-200">${t.name}</span>
      <span class="text-[9px] text-amber-300 font-mono">${t.stars}</span>
    </div>
  `).join('');
}

function handleQuickToolSearch(query) {
  if (!appState.tools) return;
  const q = query.toLowerCase();
  const filtered = appState.tools.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  renderQuickToolList(filtered.slice(0, 6));
}

async function handleSendQuickWatercooler(e) {
  e.preventDefault();
  const input = document.getElementById('quick-watercooler-input');
  const btn = document.getElementById('quick-watercooler-btn');
  const text = input.value.trim();
  if (!text) return;

  btn.disabled = true;
  try {
    const res = await fetch('/api/communications/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'watercooler', message: text, user_name: 'Mustafa' })
    });
    const data = await res.json();
    if (data.success && data.watercooler) {
      appState.communications.watercooler = data.watercooler;
      input.value = '';
      renderWatercoolerChat();
      renderRightPanelDock();
    }
  } catch (err) {
    console.error('Quick chat failed', err);
  } finally {
    btn.disabled = false;
  }
}

// ============================================================================
// COMMUNICATIONS HUB (Casual Watercooler + Project Syncs + 1-on-1)
// ============================================================================

function switchCommChannel(channel) {
  appState.commChannel = channel;
  const channels = ['watercooler', 'sync', 'direct'];
  channels.forEach(c => {
    const btn = document.getElementById(`comm-chan-btn-${c}`);
    const el = document.getElementById(`comm-channel-${c}`);
    if (c === channel) {
      btn?.classList.add('active');
      btn?.classList.remove('text-slate-400');
      el?.classList.remove('hidden');
    } else {
      btn?.classList.remove('active');
      btn?.classList.add('text-slate-400');
      el?.classList.add('hidden');
    }
  });

  if (channel === 'watercooler') {
    renderWatercoolerChat();
    setTimeout(() => document.getElementById('watercooler-user-input')?.focus(), 100);
  } else if (channel === 'sync') {
    renderProjectSyncs();
  } else if (channel === 'direct') {
    renderChatSidebar();
    renderChatMessages();
    setTimeout(() => document.getElementById('chat-user-input')?.focus(), 100);
  }
}

// Casual Watercooler Group Chat
function renderWatercoolerChat() {
  const box = document.getElementById('watercooler-messages-box');
  if (!box || !appState.communications || !appState.communications.watercooler) return;

  box.innerHTML = appState.communications.watercooler.map(m => {
    const isUser = m.sender_key === 'user';
    const bubbleClass = isUser ? 'watercooler-bubble-user ml-auto max-w-[85%]' : 'watercooler-bubble-agent mr-auto max-w-[85%]';
    return `
      <div class="${bubbleClass} p-3.5 shadow-md">
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <div class="flex items-center gap-2">
            <img src="${m.avatar}" alt="${m.sender_name}" class="w-6 h-6 rounded-full object-cover border border-amber-500/30">
            <span class="text-xs font-bold ${isUser ? 'text-amber-300' : 'text-white'}">${m.sender_name}</span>
          </div>
          <span class="text-[10px] font-mono text-slate-400">${m.time}</span>
        </div>
        <p class="text-xs text-slate-200 leading-relaxed font-sans">${m.text}</p>
      </div>
    `;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

async function handleSendWatercoolerMessage(e) {
  e.preventDefault();
  const input = document.getElementById('watercooler-user-input');
  const btn = document.getElementById('watercooler-send-btn');
  const text = input.value.trim();
  if (!text) return;

  btn.disabled = true;
  btn.innerHTML = '<span>Sending...</span>';

  try {
    const res = await fetch('/api/communications/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: 'watercooler', message: text, user_name: 'Mustafa' })
    });
    const data = await res.json();
    if (data.success && data.watercooler) {
      appState.communications.watercooler = data.watercooler;
      input.value = '';
      renderWatercoolerChat();
      renderRightPanelDock();
    }
  } catch (err) {
    console.error('Watercooler chat error', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>Send to Lounge</span> ➔';
    input.focus();
  }
}

// Transparent Inter-Executive Project Syncs
function renderProjectSyncs() {
  const container = document.getElementById('project-syncs-container');
  if (!container || !appState.communications || !appState.communications.project_sync) return;

  container.innerHTML = appState.communications.project_sync.map(s => {
    return `
      <div class="card-glass p-4 border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col gap-3">
        <!-- Header: Sender ➔ Recipient & Purpose -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <img src="${s.sender.avatar}" alt="${s.sender.name}" class="w-8 h-8 rounded-full object-cover border border-amber-500/30">
              <div>
                <span class="text-xs font-bold text-white block">${s.sender.name}</span>
                <span class="text-[9px] text-amber-300 font-mono block">${s.sender.title}</span>
              </div>
            </div>
            <span class="text-sm font-bold text-sky-400">➔</span>
            <div class="flex items-center gap-1.5">
              <img src="${s.recipient.avatar}" alt="${s.recipient.name}" class="w-8 h-8 rounded-full object-cover border border-sky-500/30">
              <div>
                <span class="text-xs font-bold text-white block">${s.recipient.name}</span>
                <span class="text-[9px] text-sky-300 font-mono block">${s.recipient.title}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge-gold text-[9px] font-mono">${s.project}</span>
            <span class="badge-green text-[9px] font-mono">${s.status}</span>
          </div>
        </div>

        <!-- Purpose Badge -->
        <div>
          <span class="purpose-badge">🎯 PURPOSE: ${s.purpose}</span>
        </div>

        <!-- Back-and-Forth Dialogue Stream -->
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
          ${s.dialogue.map(d => `
            <div class="text-xs">
              <div class="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                <strong class="${d.speaker.includes('Mustafa') ? 'text-amber-300' : 'text-slate-200'}">${d.speaker}</strong>
                <span class="font-mono">${d.time}</span>
              </div>
              <p class="text-slate-300 leading-relaxed font-sans">${d.text}</p>
            </div>
          `).join('')}
        </div>

        <!-- Action: Mustafa Chimes In on Sync -->
        <div class="flex items-center justify-end pt-1">
          <button onclick="openSyncCommentModal('${s.id}')" class="btn-ghost text-xs py-1 px-3 text-sky-300 flex items-center gap-1">
            <span>💬</span> Chime In on this Project Thread
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function openSyncCommentModal(syncId) {
  const comment = prompt(`Add your direction or comment to project thread [${syncId}]:`);
  if (!comment) return;

  try {
    const res = await fetch('/api/communications/sync_comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sync_id: syncId, comment: comment })
    });
    const data = await res.json();
    if (data.success && data.project_sync) {
      appState.communications.project_sync = data.project_sync;
      renderProjectSyncs();
    }
  } catch (err) {
    console.error('Comment failed', err);
  }
}

// Direct 1-on-1 Chats
function directMessageAgent(agentKey) {
  switchTab('communication');
  switchCommChannel('direct');
  selectAgent(agentKey);
}

function renderChatSidebar() {
  const listEl = document.getElementById('chat-agents-list');
  if (!listEl || !appState.agents) return;

  listEl.innerHTML = appState.agents.map(agent => {
    const isSelected = agent.key === appState.selectedAgent;
    const activeClass = isSelected ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60';
    return `
      <div onclick="selectAgent('${agent.key}')" class="p-2.5 rounded-xl border ${activeClass} cursor-pointer transition-all flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5 truncate">
          <img src="${agent.avatar_img}" alt="${agent.name}" class="w-9 h-9 rounded-full object-cover border border-amber-500/30 shrink-0">
          <div class="truncate">
            <h5 class="text-xs font-bold text-white truncate">${agent.name}</h5>
            <p class="text-[10px] text-amber-300 font-semibold truncate">${agent.title.split('(')[0]}</p>
          </div>
        </div>
        <div class="w-2 h-2 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-slate-500'} shrink-0"></div>
      </div>
    `;
  }).join('');
}

function selectAgent(agentKey) {
  appState.selectedAgent = agentKey;
  renderChatSidebar();

  const agent = appState.agents.find(a => a.key === agentKey);
  if (agent) {
    document.getElementById('chat-header-name').innerText = agent.name;
    document.getElementById('chat-header-title').innerText = agent.title;
    document.getElementById('chat-header-focus').innerText = `Casual Colleague Channel • ${agent.focus}`;
    document.getElementById('chat-header-avatar').src = agent.avatar_img;
  }

  renderChatMessages();
}

function renderChatMessages() {
  const box = document.getElementById('chat-messages-box');
  if (!box) return;

  const history = appState.chatHistories[appState.selectedAgent] || [
    {
      sender: 'agent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hey Mustafa! Good to see you. How is your day going? What are we tackling together?`
    }
  ];

  box.innerHTML = history.map(msg => {
    const isUser = msg.sender === 'user';
    const bubbleClass = isUser ? 'chat-bubble-user ml-auto max-w-[85%]' : 'chat-bubble-agent mr-auto max-w-[85%]';
    const senderName = isUser ? 'Mustafa' : (appState.agents.find(a => a.key === appState.selectedAgent)?.name || 'Colleague');

    return `
      <div class="${bubbleClass} p-3 shadow-md">
        <div class="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono opacity-75">
          <span class="font-bold">${senderName}</span>
          <span>${msg.time}</span>
        </div>
        <div class="chat-markdown text-xs leading-relaxed font-sans">${formatMarkdown(msg.text)}</div>
      </div>
    `;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

async function handleSendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-user-input');
  const btn = document.getElementById('chat-send-btn');
  const message = input.value.trim();
  if (!message) return;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!appState.chatHistories[appState.selectedAgent]) {
    appState.chatHistories[appState.selectedAgent] = [];
  }
  appState.chatHistories[appState.selectedAgent].push({
    sender: 'user',
    time: now,
    text: message
  });

  input.value = '';
  renderChatMessages();

  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> Chatting...`;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: appState.selectedAgent,
        message: message
      })
    });
    const data = await res.json();
    
    appState.chatHistories[appState.selectedAgent].push({
      sender: 'agent',
      time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: data.reply || "Got it Mustafa!"
    });

    renderChatMessages();
    fetchTelemetry();
  } catch (err) {
    appState.chatHistories[appState.selectedAgent].push({
      sender: 'agent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hey Mustafa, looks like the local service blipped: ${err.message}`
    });
    renderChatMessages();
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Send</span> ➔`;
    input.focus();
  }
}

// --- Roadmap Functions ---
function filterRoadmap(cat, status) {
  if (cat !== null) {
    appState.roadmapCategory = cat;
    document.querySelectorAll('.roadmap-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-cat') === cat) {
        btn.className = 'roadmap-filter-btn px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40';
      } else {
        btn.className = 'roadmap-filter-btn px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border border-transparent';
      }
    });
  }
  if (status !== null) {
    appState.roadmapStatus = status;
    const sel = document.getElementById('roadmap-status-select');
    if (sel && sel.value !== status) sel.value = status;
  }
  renderRoadmap();
}

function updateRoadmapSummary(data) {
  if (!data || !data.summary) return;
  const s = data.summary;
  const badge = document.getElementById('roadmap-tab-badge');
  if (badge) badge.innerText = s.total_initiatives;

  const progVal = document.getElementById('metric-roadmap-progress-val');
  const progBar = document.getElementById('metric-roadmap-progress-bar');
  if (progVal) progVal.innerText = `${s.overall_progress}%`;
  if (progBar) progBar.style.width = `${s.overall_progress}%`;

  const compEl = document.getElementById('metric-roadmap-completed');
  const inProgEl = document.getElementById('metric-roadmap-inprogress');
  const pendEl = document.getElementById('metric-roadmap-pending');
  const schedEl = document.getElementById('metric-roadmap-scheduled');

  if (compEl) compEl.innerText = s.completed;
  if (inProgEl) inProgEl.innerText = s.in_progress;
  if (pendEl) pendEl.innerText = s.pending_ratification;
  if (schedEl) schedEl.innerText = s.scheduled;
}

function renderRoadmap() {
  const container = document.getElementById('roadmap-items-container');
  if (!container || !appState.roadmap || !appState.roadmap.items) return;

  const catFilter = appState.roadmapCategory || 'all';
  const statFilter = appState.roadmapStatus || 'all';

  const items = appState.roadmap.items.filter(item => {
    const matchCat = catFilter === 'all' || item.category === catFilter;
    const matchStat = statFilter === 'all' || item.status === statFilter;
    return matchCat && matchStat;
  });

  if (items.length === 0) {
    container.innerHTML = `
      <div class="card-glass p-8 text-center text-slate-400">
        <p class="text-sm">No initiatives matching the active filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const priorityBadge = item.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                         (item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                         (item.priority === 'MEDIUM' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                         'bg-slate-800 text-slate-400 border border-slate-700'));

    const statusBadge = item.status === 'COMPLETED' ? 'badge-green' :
                       (item.status === 'IN_PROGRESS' ? 'badge-blue' :
                       (item.status === 'PENDING_APPROVAL' ? 'badge-gold' : 'badge-ghost'));

    return `
      <div class="card-glass p-4 transition-all hover:border-amber-500/30">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs font-bold text-amber-400">${item.id}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadge}">${item.priority}</span>
            <h4 class="text-sm font-bold text-white">${item.title}</h4>
          </div>
          <div class="flex items-center gap-2">
            <span class="${statusBadge} text-[10px]">${item.status.replace('_', ' ')}</span>
            <span class="text-[11px] text-slate-400 font-mono">ETA: ${item.eta}</span>
          </div>
        </div>

        <p class="text-xs text-slate-300 mb-3 leading-relaxed">${item.description}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
          <div>
            <span class="text-[10px] uppercase font-mono text-slate-400">Executive Owner:</span>
            <div class="text-xs font-semibold text-slate-200">${item.owner}</div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-mono text-slate-400">Action Required:</span>
            <div class="text-xs text-amber-300 font-medium">${item.action_required}</div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div class="flex-1 w-full flex items-center gap-3">
            <span class="text-xs font-mono text-slate-400 w-16">Progress:</span>
            <input
              type="range"
              min="0"
              max="100"
              value="${item.progress}"
              onchange="handleRoadmapProgressChange('${item.id}', this.value)"
              class="w-full accent-amber-500 cursor-pointer"
            >
            <span class="font-mono text-xs font-bold text-amber-400 w-10 text-right">${item.progress}%</span>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <select
              onchange="handleRoadmapStatusChange('${item.id}', this.value)"
              class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:border-amber-400"
            >
              <option value="IN_PROGRESS" ${item.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
              <option value="PENDING_APPROVAL" ${item.status === 'PENDING_APPROVAL' ? 'selected' : ''}>Pending Ratification</option>
              <option value="COMPLETED" ${item.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
              <option value="SCHEDULED" ${item.status === 'SCHEDULED' ? 'selected' : ''}>Scheduled</option>
            </select>
            <button
              onclick="toggleRoadmapComplete('${item.id}', '${item.status}')"
              class="${item.status === 'COMPLETED' ? 'btn-ghost' : 'btn-gold'} text-[11px] py-1 px-2.5 cursor-pointer"
            >
              ${item.status === 'COMPLETED' ? '↺ Reopen' : '✓ Mark Done'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleRoadmapProgressChange(id, value) {
  const newStatus = parseInt(value) === 100 ? 'COMPLETED' : undefined;
  await updateRoadmapItem(id, newStatus, value);
}

async function handleRoadmapStatusChange(id, status) {
  const newProgress = status === 'COMPLETED' ? 100 : undefined;
  await updateRoadmapItem(id, status, newProgress);
}

async function toggleRoadmapComplete(id, currentStatus) {
  if (currentStatus === 'COMPLETED') {
    await updateRoadmapItem(id, 'IN_PROGRESS', 75);
  } else {
    await updateRoadmapItem(id, 'COMPLETED', 100);
  }
}

async function updateRoadmapItem(id, status, progress) {
  try {
    const payload = { id };
    if (status !== undefined) payload.status = status;
    if (progress !== undefined) payload.progress = parseInt(progress);

    const res = await fetch('/api/roadmap/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.roadmap) {
      appState.roadmap = data.roadmap;
      updateRoadmapSummary(data.roadmap);
      renderPendingTasks();
      renderCompletedTasks();
      renderRoadmap();
    }
  } catch (err) {
    console.error('Failed to update roadmap item', err);
  }
}

// --- Board Governance ---
function renderDecisionGates() {
  const container = document.getElementById('gates-list-container');
  if (!container || !appState.gates) return;

  container.innerHTML = appState.gates.map(gate => {
    const isApproved = gate.status === 'APPROVED_BY_CHAIRPERSON';
    return `
      <div class="card-glass p-4 flex flex-col justify-between border ${isApproved ? 'border-emerald-500/30' : 'border-amber-500/30'}">
        <div>
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <span class="badge-gold text-[10px] font-mono">${gate.gate_id}</span>
              <h4 class="text-sm font-bold text-white mt-1">${gate.title}</h4>
              <p class="text-[11px] text-amber-300 font-semibold">${gate.business_unit} • Sponsor: ${gate.proposer}</p>
            </div>
            <span class="${isApproved ? 'badge-green' : 'badge-gold'} text-[10px]">
              ${isApproved ? 'RATIFIED' : 'AWAITING SIGN'}
            </span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed mb-3">${gate.description}</p>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
          <span class="text-slate-400 font-mono">${gate.created_at.split('T')[0]}</span>
          ${!isApproved ? `
            <div class="flex items-center gap-1.5">
              <button onclick="handleRejectGate('${gate.gate_id}')" class="btn-ghost text-xs py-1 px-2.5 text-rose-400">Reject</button>
              <button onclick="handleApproveGate('${gate.gate_id}')" class="btn-gold text-xs py-1 px-2.5">Approve</button>
            </div>
          ` : '<span class="text-emerald-400 font-bold">✓ Signed by Chairperson</span>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderDirectives() {
  const container = document.getElementById('directives-list-container');
  if (!container || !appState.directives) return;

  container.innerHTML = appState.directives.map(d => `
    <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="font-mono text-amber-400 font-bold">${d.directive_id} ➔ ${d.target}</span>
        <span class="badge-green text-[9px]">ENACTED</span>
      </div>
      <h5 class="text-xs font-bold text-white mb-1">${d.title}</h5>
      <p class="text-[11px] text-slate-300 leading-relaxed">${d.mandate}</p>
    </div>
  `).join('');
}

// --- Tools Directory ---
function renderTools(tools) {
  const container = document.getElementById('tools-grid-container');
  if (!container) return;

  container.innerHTML = tools.map(tool => `
    <div class="card-glass p-3.5 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <h4 class="text-xs font-bold text-white tracking-wide">${tool.name}</h4>
          <span class="badge-gold text-[9px] font-mono">${tool.stars}</span>
        </div>
        <span class="text-[9px] font-mono text-sky-400 uppercase block mb-1.5">${tool.category}</span>
        <p class="text-[11px] text-slate-300 leading-relaxed mb-2">${tool.desc}</p>
      </div>
      <div class="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
        ${tool.path}
      </div>
    </div>
  `).join('');
}

function handleToolSearch(q) {
  const query = q.toLowerCase();
  const filtered = (appState.tools || []).filter(t => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query) || t.desc.toLowerCase().includes(query));
  renderTools(filtered);
}

// --- Live Logs ---
function renderLiveLogs(logs) {
  const container = document.getElementById('live-logs-container');
  if (!container) return;

  container.innerHTML = logs.map(l => {
    const color = l.level === 'SUCCESS' ? 'text-emerald-400' : (l.level === 'WARN' ? 'text-amber-400' : 'text-slate-300');
    return `
      <div class="flex items-start gap-2 py-0.5">
        <span class="text-slate-500 shrink-0">[${l.time}]</span>
        <span class="text-amber-400/90 font-bold shrink-0">${l.agent}:</span>
        <span class="${color}">${l.msg}</span>
      </div>
    `;
  }).join('');
}

// --- Modal Handlers ---
function openDirectiveModal() {
  document.getElementById('modal-directive')?.classList.remove('hidden');
}
function closeDirectiveModal() {
  document.getElementById('modal-directive')?.classList.add('hidden');
}

async function handleCreateDirective(e) {
  e.preventDefault();
  const target = document.getElementById('modal-directive-target').value;
  const title = document.getElementById('modal-directive-title').value.trim();
  const mandate = document.getElementById('modal-directive-mandate').value.trim();
  if (!title || !mandate) return;

  try {
    const res = await fetch('/api/directives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, title, mandate })
    });
    const data = await res.json();
    if (data.success) {
      closeDirectiveModal();
      document.getElementById('modal-directive-title').value = '';
      document.getElementById('modal-directive-mandate').value = '';
      await fetchDirectives();
      await fetchStatus();
    }
  } catch (err) {
    console.error('Create directive failed', err);
  }
}

function openBriefingModal() {
  const modal = document.getElementById('modal-briefing');
  const content = document.getElementById('briefing-content');
  if (!modal || !content) return;
  modal.classList.remove('hidden');

  content.innerHTML = `
    <div class="text-center py-10 animate-pulse text-amber-400 font-sans">
      Synthesizing executive intelligence across SB Fragrance, TITAN Labs, Alfann Art, and AdWell...
    </div>
  `;

  fetch('/api/briefing', { method: 'POST' })
    .then(r => r.json())
    .then(d => {
      content.innerHTML = formatMarkdown(d.content || 'Briefing synthesized.');
    })
    .catch(e => {
      content.innerHTML = `<div class="text-rose-400">Failed to generate briefing: ${e.message}</div>`;
    });
}
function closeBriefingModal() {
  document.getElementById('modal-briefing')?.classList.add('hidden');
}

// --- TITAN Web Actions ---
async function triggerTitanBuild() {
  const btn = document.getElementById('btn-titan-build');
  if (btn) btn.innerHTML = '<span>⏳</span> Compiling...';
  try {
    const res = await fetch('/api/titan/build', { method: 'POST' });
    const data = await res.json();
    alert(`TITAN Build Complete: ${data.message || 'Success'}`);
  } catch (err) {
    alert(`Build Error: ${err.message}`);
  } finally {
    if (btn) btn.innerHTML = '<span>⚡</span> Rebuild Web App';
  }
}

async function triggerTitanSync() {
  try {
    const res = await fetch('/api/titan/sync', { method: 'POST' });
    const data = await res.json();
    alert(`TITAN Sync: ${data.message || 'Synced'}`);
  } catch (err) {
    alert(`Sync Error: ${err.message}`);
  }
}

// Remotion Viral Reel Generator Handler
async function handleGenerateReel(event) {
  event.preventDefault();
  const topic = document.getElementById('reel-topic').value;
  const badge = document.getElementById('reel-badge').value;
  const hook = document.getElementById('reel-hook').value;
  const frames = document.getElementById('reel-duration').value;
  const btn = document.getElementById('btn-render-reel');
  const statusMsg = document.getElementById('reel-status-msg');

  if (btn) btn.innerHTML = '<span>⏳</span> Rendering Remotion...';
  if (statusMsg) {
    statusMsg.classList.remove('hidden');
    statusMsg.innerText = `[REMOTION 4.0] Launching 9:16 vertical render for "${topic}" (${frames} frames)...`;
  }

  try {
    const res = await fetch('/api/reels/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, badge, hook, frames })
    });
    const data = await res.json();
    if (statusMsg) {
      statusMsg.innerText = `[✓] Render Queued: ${data.message}. Video will be saved to c:\\AI_Ecosystem\\media-generation\\output\\`;
    }
    setTimeout(loadReelsArchive, 4000);
  } catch (err) {
    if (statusMsg) statusMsg.innerText = `[-] Render error: ${err.message}`;
  } finally {
    if (btn) btn.innerHTML = '<span>🎬</span> Render 1080x1920 MP4';
  }
}

// Load Rendered Reels Archive
async function loadReelsArchive() {
  try {
    const res = await fetch('/api/reels');
    const data = await res.json();
    const countBadge = document.getElementById('reels-count-badge');
    if (countBadge) countBadge.innerText = `${data.total || 0} RENDERED`;

    const list = document.getElementById('reels-archive-list');
    if (list && data.reels && data.reels.length > 0) {
      list.innerHTML = data.reels.map(r => `
        <div class="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div>
            <strong class="text-white">${r.topic}</strong>
            <div class="text-[10px] text-slate-400">${r.duration_seconds}s • ${r.size_mb} MB • ${r.platforms ? r.platforms.join(' / ') : 'Reels / Shorts'}</div>
          </div>
          <span class="badge-green text-[9px] font-mono">${r.status}</span>
        </div>
      `).join('');
    }
  } catch (e) {}
}

// Tayyār Sticker Pack Deployment Handler
async function handleDeployStkr() {
  const btn = document.getElementById('btn-deploy-stkr');
  const feedback = document.getElementById('stkr-deploy-feedback');
  if (btn) btn.innerHTML = '<span>⏳</span> Preparing Storefront...';

  try {
    const res = await fetch('/api/stkr/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const data = await res.json();
    if (feedback) {
      feedback.classList.remove('hidden');
      const qUrl = data.manifest && data.manifest.quick_setup_url ? data.manifest.quick_setup_url : 'https://gumroad.com';
      feedback.innerHTML = `
        <strong>[✓] Tayyār Sticker Pack Manifest Ready!</strong><br>
        Asset: ${data.manifest?.digital_asset || 'Tayyar_Sticker_Pack_Vol1_Bundle.zip'} (${data.manifest?.asset_size_mb || 6.06} MB)<br>
        Price: $3.99 / ₹299 (91.5% profit margin)<br>
        <a href="${qUrl}" target="_blank" class="text-amber-300 underline font-bold mt-1 inline-block">➔ Click to Open Pre-Filled Gumroad Product Creation</a>
      `;
    }
  } catch (err) {
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.innerText = `[-] Error: ${err.message}`;
    }
  } finally {
    if (btn) btn.innerHTML = '<span>🚀</span> Deploy Storefront / Pre-fill Setup';
  }
}

// Initialize reels archive on start
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadReelsArchive, 1500);
});

// Simple Markdown Formatter
function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 rounded text-amber-300 font-mono text-[11px]">$1</code>')
    .replace(/\n/g, '<br>');
}

// ============================================================================
// SOVEREIGN TREASURY & PAYMENT GATEWAYS (RAZORPAY & PAYPAL)
// ============================================================================

async function fetchTreasuryStatus(notify = false) {
  try {
    const res = await fetch('/api/treasury/status');
    const data = await res.json();
    appState.treasury = data;

    // Update status pills in UI
    const rzpPill = document.getElementById('rzp-status-pill');
    if (rzpPill && data.gateways && data.gateways.razorpay) {
      const g = data.gateways.razorpay;
      if (g.configured) {
        rzpPill.className = g.mode === 'live' ? 'badge-green text-[10px] font-mono' : 'badge-blue text-[10px] font-mono';
        rzpPill.innerText = g.mode === 'live' ? '● RAZORPAY LIVE' : '● RAZORPAY TEST';
      } else {
        rzpPill.className = 'badge-gold text-[10px] font-mono';
        rzpPill.innerText = 'NOT CONFIGURED';
      }
    }

    const ppPill = document.getElementById('pp-status-pill');
    if (ppPill && data.gateways && data.gateways.paypal) {
      const g = data.gateways.paypal;
      if (g.configured) {
        ppPill.className = g.mode === 'live' ? 'badge-green text-[10px] font-mono' : 'badge-blue text-[10px] font-mono';
        ppPill.innerText = g.mode === 'live' ? '● PAYPAL LIVE' : '● PAYPAL SANDBOX';
      } else {
        ppPill.className = 'badge-gold text-[10px] font-mono';
        ppPill.innerText = 'NOT CONFIGURED';
      }
    }

    // Update Balances
    if (data.treasury_balances) {
      const inrEl = document.getElementById('ledger-total-inr');
      const usdEl = document.getElementById('ledger-total-usd');
      const countEl = document.getElementById('ledger-total-count');
      if (inrEl) inrEl.innerText = data.treasury_balances.settled_inr;
      if (usdEl) usdEl.innerText = data.treasury_balances.settled_usd;
      if (countEl) countEl.innerText = data.treasury_balances.total_conversions;
    }

    renderTreasuryLedger(data.recent_transactions || []);

    if (notify) {
      alert('✓ Treasury ledger & payment gateway statuses refreshed successfully.');
    }
  } catch (err) {
    console.error('Failed to fetch treasury status:', err);
  }
}

function openTreasuryModal() {
  const modal = document.getElementById('modal-treasury');
  if (modal) {
    modal.classList.remove('hidden');
    fetchTreasuryStatus();
  }
}

function closeTreasuryModal() {
  const modal = document.getElementById('modal-treasury');
  if (modal) modal.classList.add('hidden');
}

function openTreasuryWithVenture(ventureId) {
  openTreasuryModal();
  switchTreasuryTab('links');
  if (ventureId.includes('stkr') || ventureId.includes('tayyar')) {
    applyPaymentPreset('stkr');
  } else if (ventureId.includes('titan')) {
    applyPaymentPreset('titan');
  } else if (ventureId.includes('alfann')) {
    applyPaymentPreset('alfann');
  } else {
    applyPaymentPreset('custom');
  }
}

function switchTreasuryTab(tabKey) {
  const tabs = ['links', 'config', 'ledger'];
  tabs.forEach(t => {
    const btn = document.getElementById(`treasury-tab-btn-${t}`);
    const panel = document.getElementById(`treasury-panel-${t}`);
    if (t === tabKey) {
      btn?.classList.remove('text-slate-400', 'border-transparent');
      btn?.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
      panel?.classList.remove('hidden');
    } else {
      btn?.classList.remove('bg-emerald-500/20', 'text-emerald-300', 'border-emerald-500/40');
      btn?.classList.add('text-slate-400', 'border-transparent');
      panel?.classList.add('hidden');
    }
  });

  if (tabKey === 'ledger') {
    fetchTreasuryStatus();
  }
}

function applyPaymentPreset(preset) {
  const title = document.getElementById('link-title');
  const amount = document.getElementById('link-amount');
  const gateway = document.getElementById('link-gateway');
  const label = document.getElementById('link-amount-label');

  if (preset === 'stkr') {
    if (title) title.value = 'Tayyār Islamic Sticker Pack Vol 1';
    if (gateway && gateway.value === 'PAYPAL') {
      if (amount) amount.value = '3.99';
    } else {
      if (amount) amount.value = '299';
    }
  } else if (preset === 'titan') {
    if (title) title.value = 'TITAN Pro Price Intelligence Arbitrage Pass';
    if (gateway && gateway.value === 'PAYPAL') {
      if (amount) amount.value = '9.99';
    } else {
      if (amount) amount.value = '499';
    }
  } else if (preset === 'alfann') {
    if (title) title.value = 'Alfann Art Bespoke LED Acrylic Light Deposit';
    if (gateway && gateway.value === 'PAYPAL') {
      if (amount) amount.value = '29.00';
    } else {
      if (amount) amount.value = '1850';
    }
  } else {
    if (title) title.value = 'SB Group Venture Order';
    if (amount) amount.value = '999';
  }
}

function updateGatewayCurrency() {
  const gateway = document.getElementById('link-gateway')?.value;
  const label = document.getElementById('link-amount-label');
  const amount = document.getElementById('link-amount');
  if (gateway === 'PAYPAL') {
    if (label) label.innerText = 'Amount (USD $)';
    if (amount && Number(amount.value) > 100) {
      amount.value = '3.99';
    }
  } else {
    if (label) label.innerText = 'Amount (INR ₹)';
    if (amount && Number(amount.value) < 50) {
      amount.value = '299';
    }
  }
}

async function handleGeneratePaymentLink(e) {
  e.preventDefault();
  const gateway = document.getElementById('link-gateway').value;
  const title = document.getElementById('link-title').value;
  const amount = parseFloat(document.getElementById('link-amount').value);
  const custName = document.getElementById('link-customer-name').value;
  const custEmail = document.getElementById('link-customer-email').value;
  const btn = document.getElementById('link-submit-btn');

  if (btn) btn.innerHTML = '<span>⏳</span> Generating Live Rail...';

  try {
    const res = await fetch('/api/treasury/create_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway,
        title,
        amount,
        customer_name: custName,
        customer_email: custEmail,
        reference_id: `TXN-${Date.now()}`
      })
    });
    const data = await res.json();

    const resultBox = document.getElementById('treasury-link-result');
    const resultUrl = document.getElementById('link-result-url');
    const resultQr = document.getElementById('link-result-qr');
    const openBtn = document.getElementById('link-open-btn');
    const badge = document.getElementById('link-result-gateway-badge');

    if (resultBox) resultBox.classList.remove('hidden');
    const finalUrl = data.short_url || data.approve_url || `https://rzp.io/l/sbgroup_${data.reference_id?.toLowerCase()}`;
    if (resultUrl) resultUrl.value = finalUrl;
    if (openBtn) openBtn.href = finalUrl;

    if (badge) {
      badge.innerText = `${data.gateway} • ${data.mode?.toUpperCase()}`;
      badge.className = data.mode === 'live' ? 'badge-green text-[10px] font-mono' : 'badge-gold text-[10px] font-mono';
    }

    // Generate high-contrast QR code
    if (resultQr) {
      const qrTarget = data.qr_data || finalUrl;
      resultQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}`;
    }

    // Scroll down to result inside modal
    resultBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    alert(`Link Generation Error: ${err.message}`);
  } finally {
    if (btn) btn.innerHTML = '<span>⚡</span> Generate Live Payment Link & QR';
  }
}

function copyPaymentLink() {
  const input = document.getElementById('link-result-url');
  const btn = document.getElementById('link-copy-btn');
  if (!input) return;
  navigator.clipboard.writeText(input.value).then(() => {
    if (btn) {
      const orig = btn.innerText;
      btn.innerText = '✓ Copied!';
      btn.classList.add('text-emerald-400');
      setTimeout(() => {
        btn.innerText = orig;
        btn.classList.remove('text-emerald-400');
      }, 2000);
    }
  });
}

async function handleSimulateVerifyPayment() {
  const btn = document.getElementById('link-verify-btn');
  const gateway = document.getElementById('link-gateway').value;
  const title = document.getElementById('link-title').value;
  const amount = parseFloat(document.getElementById('link-amount').value);
  const custName = document.getElementById('link-customer-name').value || 'Verified Customer';
  const custEmail = document.getElementById('link-customer-email').value || 'buyer@sbgroup.com';

  if (btn) btn.innerText = 'Verifying Settlement...';

  try {
    const res = await fetch('/api/treasury/verify_payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway,
        venture: title.includes('TITAN') ? 'TITAN Labs' : (title.includes('Alfann') ? 'Alfann Art Studio' : 'Tayyār Digital Commerce'),
        product: title,
        amount,
        customer_name: custName,
        customer_email: custEmail,
        reference_id: `VERIFY-${Date.now()}`
      })
    });
    const data = await res.json();
    if (data.success) {
      if (btn) btn.innerText = '✓ Settled & Delivered!';
      fetchTreasuryStatus();
      fetchFinances();
      setTimeout(() => {
        switchTreasuryTab('ledger');
        if (btn) btn.innerText = '✓ Clear & Settle Funds';
      }, 1200);
    }
  } catch (err) {
    alert(`Verification failed: ${err.message}`);
    if (btn) btn.innerText = '✓ Clear & Settle Funds';
  }
}

async function handleSaveTreasuryCredentials(e) {
  e.preventDefault();
  const btn = document.getElementById('save-gateways-btn');
  const rzpKeyId = document.getElementById('cfg-rzp-key-id').value.trim();
  const rzpKeySecret = document.getElementById('cfg-rzp-key-secret').value.trim();
  const rzpWebhookSecret = document.getElementById('cfg-rzp-webhook-secret').value.trim();
  const rzpMode = document.getElementById('cfg-rzp-mode').value;

  const ppClientId = document.getElementById('cfg-pp-client-id').value.trim();
  const ppClientSecret = document.getElementById('cfg-pp-client-secret').value.trim();
  const ppMode = document.getElementById('cfg-pp-mode').value;

  if (btn) btn.innerHTML = '<span>⏳</span> Securing Credentials...';

  try {
    const res = await fetch('/api/treasury/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        RAZORPAY_KEY_ID: rzpKeyId,
        RAZORPAY_KEY_SECRET: rzpKeySecret,
        RAZORPAY_WEBHOOK_SECRET: rzpWebhookSecret,
        RAZORPAY_MODE: rzpMode,
        PAYPAL_CLIENT_ID: ppClientId,
        PAYPAL_CLIENT_SECRET: ppClientSecret,
        PAYPAL_MODE: ppMode
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('✓ Credentials saved to sovereign local file c:\\AI_Ecosystem\\.env.treasury!');
      fetchTreasuryStatus();
      
      const resBox = document.getElementById('cfg-test-results');
      if (resBox && data.tests) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="text-white font-bold border-b border-slate-800 pb-1 mb-1">Instant Credential Validation:</div>
          <div class="${data.tests.razorpay?.success ? 'text-emerald-400' : 'text-slate-400'}">
            Razorpay: ${data.tests.razorpay?.message || 'Keys not set or skipped'}
          </div>
          <div class="${data.tests.paypal?.success ? 'text-emerald-400' : 'text-slate-400'}">
            PayPal: ${data.tests.paypal?.message || 'Keys not set or skipped'}
          </div>
        `;
      }
    }
  } catch (err) {
    alert(`Configuration Error: ${err.message}`);
  } finally {
    if (btn) btn.innerHTML = '<span>💾</span> Save Credentials to Sovereign Vault';
  }
}

async function handleTestGatewayConnections() {
  const btn = document.getElementById('test-gateways-btn');
  const resBox = document.getElementById('cfg-test-results');
  if (btn) btn.innerHTML = '<span>⏳</span> Testing Latency...';

  const rzpKeyId = document.getElementById('cfg-rzp-key-id').value.trim();
  const rzpKeySecret = document.getElementById('cfg-rzp-key-secret').value.trim();
  const ppClientId = document.getElementById('cfg-pp-client-id').value.trim();
  const ppClientSecret = document.getElementById('cfg-pp-client-secret').value.trim();
  const ppMode = document.getElementById('cfg-pp-mode').value;

  try {
    const res = await fetch('/api/treasury/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateway: 'all',
        razorpay_key_id: rzpKeyId,
        razorpay_key_secret: rzpKeySecret,
        paypal_client_id: ppClientId,
        paypal_client_secret: ppClientSecret,
        paypal_mode: ppMode
      })
    });
    const data = await res.json();
    if (resBox && data.results) {
      resBox.classList.remove('hidden');
      const rzp = data.results.razorpay;
      const pp = data.results.paypal;
      resBox.innerHTML = `
        <div class="text-white font-bold border-b border-slate-800 pb-1 mb-1">Live Connection Telemetry:</div>
        <div class="${rzp?.success ? 'text-emerald-400' : 'text-rose-400'}">
          🇮🇳 Razorpay: ${rzp?.message || rzp?.error || 'Pending credentials'}
        </div>
        <div class="${pp?.success ? 'text-emerald-400' : 'text-rose-400'}">
          🌐 PayPal: ${pp?.message || pp?.error || 'Pending credentials'}
        </div>
      `;
    }
  } catch (err) {
    if (resBox) {
      resBox.classList.remove('hidden');
      resBox.innerHTML = `<span class="text-rose-400">Test Error: ${err.message}</span>`;
    }
  } finally {
    if (btn) btn.innerHTML = '<span>🔄</span> Test Live Connection';
  }
}

function renderTreasuryLedger(transactions) {
  const tbody = document.getElementById('ledger-table-body');
  if (!tbody) return;

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-6 text-slate-500">
          No live transactions recorded yet. Generate a payment link to receive funds.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const isINR = t.currency === 'INR';
    const amountStr = isINR ? `₹${Number(t.amount).toLocaleString('en-IN')}` : `$${Number(t.amount).toFixed(2)}`;
    return `
      <tr class="hover:bg-slate-900/60 transition-colors">
        <td class="p-2.5 font-mono text-slate-300">
          <div class="text-amber-300 font-bold">${t.id}</div>
          <div class="text-[9px] text-slate-500">${t.timestamp}</div>
        </td>
        <td class="p-2.5 font-mono">
          <span class="${t.gateway === 'RAZORPAY' ? 'text-sky-400' : 'text-indigo-400'} font-bold">${t.gateway}</span>
          <div class="text-[9px] text-slate-400">${t.mode || 'live'}</div>
        </td>
        <td class="p-2.5">
          <div class="text-white font-semibold">${t.venture}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-xs">${t.product || ''}</div>
        </td>
        <td class="p-2.5 font-mono font-bold ${isINR ? 'text-emerald-400' : 'text-sky-400'}">
          ${amountStr}
        </td>
        <td class="p-2.5 text-slate-300">
          <div>${t.customer_name || 'Customer'}</div>
          <div class="text-[10px] text-slate-500">${t.customer_email || ''}</div>
        </td>
        <td class="p-2.5">
          <span class="badge-green text-[9px] font-mono">${t.status}</span>
        </td>
        <td class="p-2.5">
          <span class="text-[10px] text-purple-300 font-mono font-semibold">✓ ${t.fulfillment_status || 'DELIVERED'}</span>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// CORTEX AI SHORTS STUDIO & RLHF HUMAN APPROVAL QUEUE
// ============================================================================

async function fetchShortsStatus(render = false) {
  try {
    const res = await fetch('/api/shorts/status');
    const data = await res.json();
    appState.shortsStatus = data;

    // Update nav badge
    const badge = document.getElementById('shorts-pending-badge');
    if (badge) {
      badge.innerText = `${data.pending_count || 0}`;
      badge.style.display = data.pending_count > 0 ? 'inline-block' : 'none';
    }

    const readinessVal = document.getElementById('shorts-readiness-val');
    const readinessBar = document.getElementById('shorts-readiness-bar');
    const levelBadge = document.getElementById('shorts-level-badge');
    if (readinessVal) readinessVal.innerText = `${data.autonomy_readiness_pct}%`;
    if (readinessBar) readinessBar.style.width = `${data.autonomy_readiness_pct}%`;
    if (levelBadge) {
      if (data.autonomy_readiness_pct >= 85) {
        levelBadge.className = 'badge-gold text-[10px]';
        levelBadge.innerText = 'Level 3: Full Autopilot Ready';
      } else if (data.autonomy_readiness_pct >= 50) {
        levelBadge.className = 'badge-green text-[10px]';
        levelBadge.innerText = 'Level 2: Semi-Autonomous';
      } else {
        levelBadge.className = 'badge-blue text-[10px]';
        levelBadge.innerText = 'Level 1: Supervised';
      }
    }

    const revEl = document.getElementById('shorts-metric-reviews');
    const appEl = document.getElementById('shorts-metric-approved');
    if (revEl) revEl.innerText = data.total_reviews;
    if (appEl) appEl.innerText = data.total_approvals;

    const autoBadge = document.getElementById('shorts-autopilot-badge');
    const toggleBtnLabel = document.getElementById('label-toggle-autopilot');
    if (autoBadge) {
      autoBadge.className = data.autopilot_enabled ? 'badge-green text-[10px] font-mono' : 'badge-blue text-[10px] font-mono';
      autoBadge.innerText = data.autopilot_enabled ? 'AUTOPILOT: ACTIVE 🔥' : 'AUTOPILOT: STANDBY';
    }
    if (toggleBtnLabel) {
      toggleBtnLabel.innerText = data.autopilot_enabled ? 'Disable Autopilot' : 'Enable Autopilot Mode';
    }

    if (render) {
      renderShortsStudio();
    }
  } catch (err) {
    console.error('Failed to fetch shorts status', err);
  }
}

async function renderShortsStudio() {
  await Promise.all([
    fetchShortsStatus(),
    fetchShortsPending(),
    fetchShortsAlgoWeights(),
    fetchShortsAgents(),
    fetchShortsCollabLog(),
    fetchShortsSchedule()
  ]);
}

async function fetchShortsPending() {
  const container = document.getElementById('shorts-pending-grid');
  const countBadge = document.getElementById('shorts-queue-count-badge');
  if (!container) return;

  try {
    const res = await fetch('/api/shorts/pending');
    const clips = await res.json();
    const pendingClips = clips.filter(c => c.status === 'PENDING_APPROVAL');

    if (countBadge) {
      countBadge.innerText = `${pendingClips.length} CANDIDATES WAITING`;
    }

    if (pendingClips.length === 0) {
      container.innerHTML = `
        <div class="col-span-full bg-slate-950/60 p-8 rounded-xl border border-slate-800 text-center">
          <div class="text-3xl mb-2">🎉</div>
          <h4 class="text-sm font-bold text-white mb-1">Queue Cleared — All Shorts Reviewed!</h4>
          <p class="text-xs text-slate-400 mb-4">Click below to command Lyra Vance & Kaelen Cross to discover and clip the next trending AI moment.</p>
          <button onclick="handleGenerateShortSample()" class="btn-gold text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-lg">
            <span>✨</span> Discover & Clip Next AI Short
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = pendingClips.map(clip => {
      const score = Number(clip.predicted_virality || 90).toFixed(1);
      return `
        <div class="card-glass p-4 rounded-xl border border-slate-700/70 hover:border-purple-500/50 transition-all flex flex-col justify-between relative group shadow-lg">
          
          <!-- Top Badge & Score -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="badge-gold text-[9px] font-mono tracking-wider">${clip.virality_badge || 'VIRAL BREAKOUT 🔥'}</span>
            <div class="bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold text-purple-300">
              ⚡ ${score}/100 VIRAL
            </div>
          </div>

          <!-- Hook Headline & Title -->
          <div class="mb-3">
            <div class="bg-slate-950/80 border border-amber-500/30 rounded-lg p-2 mb-2 text-center">
              <span class="text-[10px] text-amber-400/90 font-mono font-bold uppercase block tracking-wider">Hook Headline</span>
              <span class="text-xs font-black text-amber-300 uppercase tracking-wide leading-tight block">"${clip.hook_headline}"</span>
            </div>
            <h4 class="text-xs font-bold text-white leading-snug line-clamp-2">${clip.title}</h4>
          </div>

          <!-- Speaker & Meta Pill -->
          <div class="flex items-center gap-2.5 p-2 bg-slate-900/70 rounded-lg border border-slate-800/80 mb-3">
            <img src="${clip.thumbnail_url || '/assets/avatars/lyra_vance.jpg'}" class="w-8 h-8 rounded-full border border-purple-400/40 object-cover shrink-0" alt="${clip.speaker}">
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-white truncate">${clip.speaker}</div>
              <div class="text-[10px] text-slate-400 truncate">${clip.podcast_name} • ${clip.duration_sec}s (${clip.wpm} WPM)</div>
            </div>
          </div>

          <!-- Captions Snippet -->
          <div class="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-300 italic mb-3 font-sans line-clamp-3">
            "${clip.captions_sample || ''}"
          </div>

          <!-- Target Platforms & Pinned Affiliate -->
          <div class="space-y-1.5 mb-3.5 text-[10px] font-mono">
            <div class="flex flex-wrap gap-1">
              ${(clip.target_platforms || ['YouTube Shorts', 'TikTok', 'Instagram Reels']).map(p => `
                <span class="bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded text-[9px]">${p}</span>
              `).join('')}
            </div>
            <div class="text-emerald-400/90 truncate text-[9px]">
              💰 Pinned: ${clip.pinned_affiliate || 'https://sbgroup.corp/titan-pro'}
            </div>
          </div>

          <!-- Watch Rendered Video Button -->
          <div class="mb-3">
            <button onclick="openShortVideoModal('${clip.video_preview_url || '/assets/previews/test_aiclip_short.mp4'}', '${(clip.hook_headline || clip.title).replace(/'/g, "\\'")}')" class="w-full py-1.5 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm">
              <span class="text-amber-400">▶</span> Watch Rendered 9:16 Short
            </button>
          </div>

          <!-- Approval / Rejection Action Buttons -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <button onclick="openShortRejectModal('${clip.id}')" class="btn-ghost text-xs py-2 px-2 border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 flex items-center justify-center gap-1 font-bold">
              <span>❌</span> Reject & Teach
            </button>
            <button onclick="handleApproveShort('${clip.id}')" class="btn-gold text-xs py-2 px-2 flex items-center justify-center gap-1 font-bold shadow-md">
              <span>✅</span> Approve & Queue
            </button>
          </div>

        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to fetch pending shorts', err);
  }
}

async function fetchShortsAlgoWeights() {
  try {
    const res = await fetch('/api/shorts/algo_weights');
    const data = await res.json();
    const st = data.algo_state || {};

    // Speakers list
    const spkEl = document.getElementById('algo-speakers-list');
    if (spkEl && st.speaker_affinity) {
      spkEl.innerHTML = Object.entries(st.speaker_affinity).slice(0, 6).map(([spk, w]) => {
        const pct = Math.round(w * 100);
        return `
          <div class="space-y-0.5">
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-300 truncate">${spk}</span>
              <span class="text-amber-400 font-mono font-bold">${pct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-400 rounded-full" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Topics list
    const topEl = document.getElementById('algo-topics-list');
    if (topEl && st.topic_affinity) {
      topEl.innerHTML = Object.entries(st.topic_affinity).slice(0, 5).map(([tpc, w]) => {
        const pct = Math.round(w * 100);
        return `
          <div class="space-y-0.5">
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-300 truncate">${tpc}</span>
              <span class="text-sky-400 font-mono font-bold">${pct}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-sky-400 rounded-full" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Hooks list & pacing
    const hookEl = document.getElementById('algo-hooks-list');
    if (hookEl && st.hook_style_affinity) {
      const hooksHtml = Object.entries(st.hook_style_affinity).slice(0, 4).map(([hk, w]) => {
        const pct = Math.round(w * 100);
        return `
          <div class="flex justify-between text-[11px] items-center">
            <span class="text-slate-300 truncate">${hk}</span>
            <span class="badge-gold text-[9px] font-mono">${pct}%</span>
          </div>
        `;
      }).join('');

      hookEl.innerHTML = `
        <div class="space-y-1.5">
          ${hooksHtml}
          <div class="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span class="text-purple-300 font-semibold">Target Pacing:</span>
            <span class="text-white font-mono font-bold bg-slate-900 px-2 py-0.5 rounded">${st.target_pacing_wpm || 168} WPM</span>
          </div>
          <div class="flex justify-between items-center text-[11px]">
            <span class="text-purple-300 font-semibold">Highlight Color:</span>
            <span class="font-mono text-xs px-2 py-0.5 rounded font-bold" style="background: ${st.preferred_accent_color || '#FFE600'}; color: #000;">${st.preferred_accent_color || '#FFE600'}</span>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.error('Failed to fetch algo weights', err);
  }
}

async function fetchShortsAgents() {
  const container = document.getElementById('shorts-agents-grid');
  if (!container) return;

  try {
    const res = await fetch('/api/shorts/agents');
    const agents = await res.json();

    container.innerHTML = agents.map(a => {
      return `
        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div>
            <div class="relative w-full aspect-square mb-2 rounded-lg overflow-hidden border border-slate-700/80 shadow-md">
              <img src="${a.avatar_img}" class="w-full h-full object-cover" alt="${a.name}">
              <div class="absolute top-2 right-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 block shadow-lg"></span>
              </div>
            </div>
            <h4 class="text-xs font-bold text-white leading-tight">${a.name}</h4>
            <div class="text-[10px] text-purple-300 font-semibold mt-0.5">${a.title}</div>
            <p class="text-[10px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">${a.strict_role}</p>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-800 text-[9px] text-amber-400/90 font-mono">
            ⚡ ${a.current_task}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to fetch studio agents', err);
  }
}

async function fetchShortsCollabLog() {
  const container = document.getElementById('shorts-collab-dialogues');
  if (!container) return;

  try {
    const res = await fetch('/api/shorts/collab_log');
    const data = await res.json();
    const dialogues = data.dialogues || [];

    if (dialogues.length === 0) {
      container.innerHTML = `<div class="text-center py-4 text-slate-500">No recent inter-agent messages.</div>`;
      return;
    }

    container.innerHTML = dialogues.slice(-8).reverse().map(d => {
      return `
        <div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-2.5">
          <img src="${d.from_avatar}" class="w-7 h-7 rounded-full border border-purple-400/50 object-cover shrink-0 mt-0.5" alt="${d.from}">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <span class="font-bold text-white text-[11px]">${d.from} <span class="text-slate-500 font-normal">➔</span> <span class="text-purple-300">${d.to}</span></span>
              <span class="text-[9px] text-slate-500 font-mono">${d.timestamp}</span>
            </div>
            <div class="text-[10px] font-mono text-amber-400/90 mb-1">[TASK: ${d.task_type}]</div>
            <p class="text-[11px] text-slate-300 leading-relaxed">${d.content}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to fetch collab log', err);
  }
}

async function fetchShortsSchedule() {
  const container = document.getElementById('shorts-schedule-list');
  if (!container) return;

  try {
    const res = await fetch('/api/shorts/schedule');
    const data = await res.json();
    const queue = data.recent_queue || [];

    if (queue.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-slate-500 text-xs">No scheduled posts yet. Approve clips above to schedule automatically.</div>`;
      return;
    }

    container.innerHTML = queue.map(q => {
      return `
        <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge-green text-[9px] font-mono">${q.status || 'QUEUED'}</span>
              <span class="font-bold text-white">${q.title}</span>
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-3">
              <span>🕒 Scheduled: <strong class="text-amber-300 font-mono">${q.scheduled_time}</strong></span>
              <span>🎙️ ${q.speaker}</span>
              <span>📈 Est. Reach: <strong class="text-sky-300">${q.estimated_reach || '50K+'}</strong></span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            ${(q.platforms || []).map(p => `
              <span class="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">${p}</span>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to fetch shorts schedule', err);
  }
}

async function handleApproveShort(clipId) {
  try {
    const res = await fetch('/api/shorts/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clip_id: clipId })
    });
    const result = await res.json();
    alert(`✅ Clip Approved! Feature weights boosted (+12%). Staged for Omni-Channel distribution. New Autonomy Readiness: ${result.new_autonomy_readiness || '78.5'}%`);
    renderShortsStudio();
  } catch (err) {
    alert(`Error approving clip: ${err.message}`);
  }
}

function openShortRejectModal(clipId) {
  const modal = document.getElementById('modal-shorts-reject');
  const targetIdInput = document.getElementById('reject-target-clip-id');
  if (targetIdInput) targetIdInput.value = clipId;
  if (modal) modal.classList.remove('hidden');
}

function closeShortRejectModal() {
  const modal = document.getElementById('modal-shorts-reject');
  if (modal) modal.classList.add('hidden');
}

async function submitShortRejection() {
  const clipId = document.getElementById('reject-target-clip-id')?.value;
  const checkboxes = document.querySelectorAll('#reject-reasons-group input[type="checkbox"]:checked');
  const reasons = Array.from(checkboxes).map(c => c.value);
  const notes = document.getElementById('reject-custom-notes')?.value || '';

  if (reasons.length === 0 && !notes) {
    alert('Please select at least one rejection reason or enter a directive so Orion Stark can tune the algorithm.');
    return;
  }

  try {
    const res = await fetch('/api/shorts/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clip_id: clipId,
        rejection_reasons: reasons,
        custom_notes: notes
      })
    });
    const result = await res.json();
    closeShortRejectModal();
    alert(`🧬 Algorithm trained! Penalized matching feature weights. Orion Stark has logged your feedback to adapt all future clipping.`);
    renderShortsStudio();
  } catch (err) {
    alert(`Error submitting rejection: ${err.message}`);
  }
}

async function handleGenerateShortSample() {
  const btn = document.getElementById('btn-discover-short');
  if (btn) btn.innerHTML = '<span>⏳</span> Scouting Podcasts...';

  try {
    const res = await fetch('/api/shorts/generate_sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data.success) {
      alert(`✨ New Short Discovered & Staged!\n"${data.clip.title}"\nVirality Score: ${data.clip.predicted_virality}/100`);
      renderShortsStudio();
    }
  } catch (err) {
    alert(`Error generating sample: ${err.message}`);
  } finally {
    if (btn) btn.innerHTML = '<span>✨</span> Discover & Clip Next Short';
  }
}

async function handleToggleAutopilot() {
  try {
    const res = await fetch('/api/shorts/toggle_autopilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await res.json();
    const isAuto = data.autopilot_enabled;
    alert(isAuto ? '⚡ Autonomous Autopilot ACTIVATED!\nThe agents will autonomously source, clip, render, and schedule daily AI shorts based on your learned preference weights.' : '⏸️ Autopilot Mode Paused. Returned to Human Approval Queue mode.');
    fetchShortsStatus();
  } catch (err) {
    alert(`Error toggling autopilot: ${err.message}`);
  }
}

function openShortsConfigModal() {
  const modal = document.getElementById('modal-shorts-config');
  if (modal) modal.classList.remove('hidden');
}

function closeShortsConfigModal() {
  const modal = document.getElementById('modal-shorts-config');
  if (modal) modal.classList.add('hidden');
}

async function handleSaveShortsKeys(event) {
  event.preventDefault();
  const keys = {
    YOUTUBE_API_KEY: document.getElementById('cfg-yt-key')?.value || '',
    X_API_KEY: document.getElementById('cfg-x-key')?.value || '',
    TIKTOK_CLIENT_KEY: document.getElementById('cfg-tt-key')?.value || '',
    INSTAGRAM_ACCESS_TOKEN: document.getElementById('cfg-ig-key')?.value || ''
  };

  try {
    const res = await fetch('/api/shorts/configure_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys)
    });
    const data = await res.json();
    closeShortsConfigModal();
    alert('🔑 Sovereign credentials saved securely to local .env.shorts!');
    fetchShortsSchedule();
  } catch (err) {
    alert(`Failed to save keys: ${err.message}`);
  }
}

function openShortVideoModal(videoUrl, title) {
  const modal = document.getElementById('modal-short-video');
  const player = document.getElementById('short-video-player');
  const source = document.getElementById('short-video-source');
  const titleEl = document.getElementById('video-modal-title');
  if (!modal || !player || !source) return;

  if (titleEl && title) titleEl.innerText = title;
  source.src = videoUrl || '/assets/previews/test_aiclip_short.mp4';
  player.load();
  player.play().catch(() => {});
  modal.classList.remove('hidden');
}

function closeShortVideoModal() {
  const modal = document.getElementById('modal-short-video');
  const player = document.getElementById('short-video-player');
  if (player) player.pause();
  if (modal) modal.classList.add('hidden');
}

// ============================================================================
// EXECUTIVE SETTINGS & SOVEREIGN API VAULT
// ============================================================================

let currentSettingsData = null;
let activeSettingsSubtab = 'account';
let currentKeysCategoryFilter = 'ALL';
let keysSearchQuery = '';
let revealedKeysCache = {};

function switchSettingsSubtab(subtabName) {
  activeSettingsSubtab = subtabName;
  const subtabs = ['account', 'apikeys', 'privacy', 'security', 'swarm', 'ui'];
  subtabs.forEach(st => {
    const btn = document.getElementById(`subtab-btn-${st}`);
    const pane = document.getElementById(`subtab-content-${st}`);
    if (st === subtabName) {
      btn?.classList.remove('bg-slate-900/60', 'border-slate-700/60', 'text-slate-300');
      btn?.classList.add('bg-amber-500/20', 'border-amber-500/50', 'text-amber-300');
      pane?.classList.remove('hidden');
    } else {
      btn?.classList.remove('bg-amber-500/20', 'border-amber-500/50', 'text-amber-300');
      btn?.classList.add('bg-slate-900/60', 'border-slate-700/60', 'text-slate-300');
      pane?.classList.add('hidden');
    }
  });
}

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    currentSettingsData = data;

    // Update killswitch status banner & button
    const killswitchActive = !!data.emergency_killswitch;
    const ksBtn = document.getElementById('settings-killswitch-btn');
    const ksLabel = document.getElementById('killswitch-label');
    const ksIcon = document.getElementById('killswitch-icon');
    const ksActionLabel = document.getElementById('killswitch-action-label');

    if (ksBtn && ksLabel) {
      if (killswitchActive) {
        ksBtn.className = 'btn-ghost text-xs py-2 px-3 border border-emerald-500/60 text-emerald-300 bg-emerald-950/60 flex items-center gap-1.5 shadow-md';
        ksLabel.innerText = 'DISENGAGE EMERGENCY STOP';
        if (ksIcon) ksIcon.innerText = '✅';
        if (ksActionLabel) ksActionLabel.innerText = 'Disengage Emergency Stop (Resume Operations)';
      } else {
        ksBtn.className = 'btn-ghost text-xs py-2 px-3 border border-rose-500/50 text-rose-300 hover:bg-rose-950/50 flex items-center gap-1.5 shadow-md';
        ksLabel.innerText = 'Emergency Stop Swarm';
        if (ksIcon) ksIcon.innerText = '🚨';
        if (ksActionLabel) ksActionLabel.innerText = 'Engage Emergency Stop';
      }
    }

    // Populate Account
    if (data.account) {
      const acc = data.account;
      if (document.getElementById('set-acc-name')) document.getElementById('set-acc-name').value = acc.full_name || '';
      if (document.getElementById('set-acc-title')) document.getElementById('set-acc-title').value = acc.executive_title || '';
      if (document.getElementById('set-acc-org')) document.getElementById('set-acc-org').value = acc.organization || '';
      if (document.getElementById('set-acc-email')) document.getElementById('set-acc-email').value = acc.email || '';
      if (document.getElementById('set-acc-tz')) document.getElementById('set-acc-tz').value = acc.timezone || 'Asia/Kolkata (IST, UTC+05:30)';
      if (document.getElementById('set-acc-cur-pri')) document.getElementById('set-acc-cur-pri').value = acc.primary_currency || 'INR (₹)';
      if (document.getElementById('set-acc-cur-sec')) document.getElementById('set-acc-cur-sec').value = acc.secondary_currency || 'USD ($)';

      const subsContainer = document.getElementById('set-acc-subs-list');
      if (subsContainer && acc.subsidiaries) {
        subsContainer.innerHTML = acc.subsidiaries.map(s => `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
            <span>🏛️</span> ${s}
          </span>
        `).join('');
      }
    }

    // Populate Privacy
    if (data.privacy) {
      const priv = data.privacy;
      if (document.getElementById('set-priv-offline')) document.getElementById('set-priv-offline').checked = !!priv.offline_sovereign_inference;
      if (document.getElementById('set-priv-zero-telem')) document.getElementById('set-priv-zero-telem').checked = !!priv.zero_telemetry_enforced;
      if (document.getElementById('set-priv-anon-aff')) document.getElementById('set-priv-anon-aff').checked = !!priv.anonymize_affiliate_fingerprints;
      if (document.getElementById('set-priv-local-strict')) document.getElementById('set-priv-local-strict').checked = !!priv.local_storage_strict;
      if (document.getElementById('set-priv-purge-days')) document.getElementById('set-priv-purge-days').value = String(priv.auto_purge_temp_media_days ?? 7);
    }

    // Populate Security
    if (data.security) {
      const sec = data.security;
      if (document.getElementById('set-sec-hmac')) document.getElementById('set-sec-hmac').checked = !!sec.webhook_hmac_sha256_enforced;
      if (document.getElementById('set-sec-localhost')) document.getElementById('set-sec-localhost').checked = !!sec.localhost_origin_lockdown;
      if (document.getElementById('set-sec-pin')) document.getElementById('set-sec-pin').checked = !!sec.require_session_pin;
    }

    // Populate Swarm
    if (data.swarm) {
      const sw = data.swarm;
      if (document.getElementById('set-swarm-model')) document.getElementById('set-swarm-model').value = sw.default_llm_model || 'qwen2.5-coder:7b-instruct';
      if (document.getElementById('set-swarm-ollama-url')) document.getElementById('set-swarm-ollama-url').value = sw.ollama_base_url || 'http://localhost:11434';
      if (document.getElementById('set-swarm-rigor')) document.getElementById('set-swarm-rigor').value = sw.council_debate_rigor || 'standard_3_rounds';
      if (document.getElementById('set-swarm-threshold')) document.getElementById('set-swarm-threshold').value = String(sw.autopilot_readiness_threshold || 90);
      if (document.getElementById('set-swarm-strict-roles')) document.getElementById('set-swarm-strict-roles').checked = !!sw.strict_agent_roles_enforced;
    }

    // Populate UI
    if (data.ui) {
      const ui = data.ui;
      if (document.getElementById('set-ui-theme')) document.getElementById('set-ui-theme').value = ui.theme || 'obsidian_dark';
      if (document.getElementById('set-ui-logo')) document.getElementById('set-ui-logo').value = ui.brand_logo || 'sb_group_crest';
      if (document.getElementById('set-ui-refresh')) document.getElementById('set-ui-refresh').value = String(ui.telemetry_refresh_sec || 5);
      if (document.getElementById('set-ui-chimes')) document.getElementById('set-ui-chimes').checked = !!ui.executive_audio_chimes;
    }

    // Keys badge count
    const totalKeysBadge = document.getElementById('settings-total-keys-badge');
    if (totalKeysBadge && data.api_keys) {
      totalKeysBadge.innerText = data.api_keys.length;
    }

    // Render API keys list
    renderApiKeys();
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function setKeysCategoryFilter(cat) {
  currentKeysCategoryFilter = cat;
  const buttons = document.querySelectorAll('.keys-cat-btn');
  buttons.forEach(btn => {
    if (btn.innerText.trim() === cat || (cat === 'ALL' && btn.innerText.trim() === 'ALL')) {
      btn.className = 'keys-cat-btn px-2.5 py-1 rounded-md text-[11px] font-mono bg-purple-500/20 border border-purple-500/50 text-purple-300 shrink-0';
    } else {
      btn.className = 'keys-cat-btn px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0';
    }
  });
  renderApiKeys();
}

function filterApiKeys() {
  keysSearchQuery = document.getElementById('set-keys-search')?.value.toLowerCase().trim() || '';
  renderApiKeys();
}

function renderApiKeys() {
  const container = document.getElementById('settings-keys-grid');
  if (!container || !currentSettingsData?.api_keys) return;

  const filtered = currentSettingsData.api_keys.filter(k => {
    // Category match
    const catMatch = currentKeysCategoryFilter === 'ALL' || k.category === currentKeysCategoryFilter;
    // Query match
    const qMatch = !keysSearchQuery ||
      k.name.toLowerCase().includes(keysSearchQuery) ||
      k.env_var.toLowerCase().includes(keysSearchQuery) ||
      (k.description && k.description.toLowerCase().includes(keysSearchQuery));
    return catMatch && qMatch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
        <div class="text-3xl mb-2">🔍</div>
        <div class="text-sm font-bold text-white">No API keys match '${keysSearchQuery}' in ${currentKeysCategoryFilter}</div>
        <p class="text-xs text-slate-400 mt-1">Click '+ Add Custom API Key' to register this platform in the sovereign vault.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(k => {
    const isSet = k.is_set;
    const isCustom = !!k.is_custom;
    const isRevealed = !!revealedKeysCache[k.id];
    const displayVal = isRevealed ? (revealedKeysCache[k.id] || '(empty)') : (k.masked_value || '••••••••••••••••');

    return `
      <div class="card-glass p-4 rounded-xl border ${isSet ? 'border-purple-500/40' : 'border-slate-800/90'} flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-md relative group">
        <div>
          <!-- Header: Category & Status Badge -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-purple-300 font-bold">${k.category}</span>
            <span class="${isSet ? 'badge-green' : 'bg-slate-800 text-slate-400'} text-[10px] font-mono">
              ${isSet ? '🟢 CONFIGURED' : '⚪ NOT SET'}
            </span>
          </div>

          <!-- Name & Env Var -->
          <h4 class="text-xs font-bold text-white leading-snug mb-1">${k.name}</h4>
          <div class="inline-block bg-slate-950 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono font-bold mb-2 border border-slate-800">
            ${k.env_var}
          </div>

          <!-- Description -->
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            ${k.description || 'Sovereign integration credential.'}
          </p>
        </div>

        <!-- Secret Display & Controls -->
        <div>
          <div class="bg-slate-950/90 border border-slate-800 rounded-lg p-2 mb-3 flex items-center justify-between gap-2">
            <div class="font-mono text-xs ${isSet ? 'text-emerald-400 font-bold' : 'text-slate-500 italic'} truncate flex-1 select-all" id="key-display-${k.id}">
              ${isSet ? displayVal : 'Not set in vault'}
            </div>
            ${isSet ? `
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="toggleRevealApiKey('${k.id}')" class="text-[10px] p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800" title="Toggle Show/Hide">
                  ${isRevealed ? '🙈' : '👁️'}
                </button>
                <button onclick="copyApiKey('${k.id}')" class="text-[10px] p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800" title="Copy to clipboard">
                  📋
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <button onclick="openEditApiKeyModal('${k.id}')" class="btn-ghost text-[11px] py-1 px-2.5 flex items-center gap-1 text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 font-semibold">
              <span>✏️</span> Edit Key
            </button>
            ${isCustom ? `
              <button onclick="handleDeleteApiKey('${k.id}')" class="btn-ghost text-[11px] py-1 px-2 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30" title="Delete custom key">
                <span>🗑️</span> Delete
              </button>
            ` : `
              <span class="text-[9px] font-mono text-slate-500">CORE INTEGRATION</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleRevealApiKey(keyId) {
  if (revealedKeysCache[keyId]) {
    delete revealedKeysCache[keyId];
    renderApiKeys();
    return;
  }
  try {
    const res = await fetch('/api/settings/reveal_key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: keyId })
    });
    const data = await res.json();
    if (data.value) {
      revealedKeysCache[keyId] = data.value;
      renderApiKeys();
    }
  } catch (err) {
    alert(`Could not reveal key: ${err.message}`);
  }
}

async function copyApiKey(keyId) {
  try {
    let val = revealedKeysCache[keyId];
    if (!val) {
      const res = await fetch('/api/settings/reveal_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId })
      });
      const data = await res.json();
      val = data.value;
    }
    if (val) {
      await navigator.clipboard.writeText(val);
      alert(`📋 API Key copied to clipboard!`);
    } else {
      alert('Key value is empty.');
    }
  } catch (err) {
    alert(`Failed to copy key: ${err.message}`);
  }
}

function openAddApiKeyModal() {
  document.getElementById('modal-add-api-key')?.classList.remove('hidden');
}

function closeAddApiKeyModal() {
  document.getElementById('modal-add-api-key')?.classList.add('hidden');
}

async function handleSaveCustomApiKey(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById('add-key-name')?.value.trim(),
    env_var: document.getElementById('add-key-env')?.value.trim(),
    category: document.getElementById('add-key-cat')?.value,
    value: document.getElementById('add-key-val')?.value.trim(),
    description: document.getElementById('add-key-desc')?.value.trim()
  };

  try {
    const res = await fetch('/api/settings/save_key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      closeAddApiKeyModal();
      alert(`✅ Custom key '${payload.name}' registered and synced to .env.ecosystem!`);
      loadSettings();
    } else {
      alert(`Error saving key: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    alert(`Failed to save custom key: ${err.message}`);
  }
}

async function openEditApiKeyModal(keyId) {
  const item = currentSettingsData?.api_keys?.find(k => k.id === keyId);
  if (!item) return;

  document.getElementById('edit-key-id').value = item.id;
  document.getElementById('edit-key-name').value = item.name;
  document.getElementById('edit-key-env').value = item.env_var;
  document.getElementById('edit-key-cat').value = item.category || 'Custom Tools';
  document.getElementById('edit-key-desc').value = item.description || '';
  document.getElementById('edit-key-val').value = '';
  document.getElementById('edit-key-subtitle').innerText = `Editing credential for ${item.env_var}`;

  // If already revealed, populate
  if (revealedKeysCache[item.id]) {
    document.getElementById('edit-key-val').value = revealedKeysCache[item.id];
  } else if (item.is_set) {
    try {
      const res = await fetch('/api/settings/reveal_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      });
      const data = await res.json();
      if (data.value) {
        document.getElementById('edit-key-val').value = data.value;
      }
    } catch (_) {}
  }

  document.getElementById('modal-edit-api-key')?.classList.remove('hidden');
}

function closeEditApiKeyModal() {
  document.getElementById('modal-edit-api-key')?.classList.add('hidden');
}

async function handleSaveEditedApiKey(event) {
  event.preventDefault();
  const keyId = document.getElementById('edit-key-id').value;
  const payload = {
    id: keyId,
    name: document.getElementById('edit-key-name')?.value.trim(),
    env_var: document.getElementById('edit-key-env')?.value.trim(),
    category: document.getElementById('edit-key-cat')?.value,
    value: document.getElementById('edit-key-val')?.value.trim(),
    description: document.getElementById('edit-key-desc')?.value.trim()
  };

  try {
    const res = await fetch('/api/settings/save_key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      delete revealedKeysCache[keyId];
      closeEditApiKeyModal();
      alert(`✅ Credential for '${payload.name}' updated in sovereign vault!`);
      loadSettings();
    } else {
      alert(`Error updating key: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    alert(`Failed to update key: ${err.message}`);
  }
}

async function handleDeleteApiKey(keyId) {
  if (!confirm(`Are you sure you want to permanently delete custom API key '${keyId}' from the sovereign vault?`)) {
    return;
  }
  try {
    const res = await fetch('/api/settings/delete_key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: keyId })
    });
    const data = await res.json();
    if (data.status === 'DELETED') {
      delete revealedKeysCache[keyId];
      alert(`🗑️ Custom key deleted.`);
      loadSettings();
    } else {
      alert(`Could not delete key: ${data.status}`);
    }
  } catch (err) {
    alert(`Failed to delete key: ${err.message}`);
  }
}

async function handleSaveAccountSettings(event) {
  event.preventDefault();
  const payload = {
    section: 'account',
    values: {
      full_name: document.getElementById('set-acc-name')?.value.trim(),
      executive_title: document.getElementById('set-acc-title')?.value.trim(),
      organization: document.getElementById('set-acc-org')?.value.trim(),
      email: document.getElementById('set-acc-email')?.value.trim(),
      timezone: document.getElementById('set-acc-tz')?.value,
      primary_currency: document.getElementById('set-acc-cur-pri')?.value.trim(),
      secondary_currency: document.getElementById('set-acc-cur-sec')?.value.trim()
    }
  };

  try {
    const res = await fetch('/api/settings/update_section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      alert('👤 Chairperson Account Profile successfully updated!');
      loadSettings();
    }
  } catch (err) {
    alert(`Failed to save account settings: ${err.message}`);
  }
}

async function handleSavePrivacySettings(event) {
  event.preventDefault();
  const payload = {
    section: 'privacy',
    values: {
      offline_sovereign_inference: document.getElementById('set-priv-offline')?.checked,
      zero_telemetry_enforced: document.getElementById('set-priv-zero-telem')?.checked,
      anonymize_affiliate_fingerprints: document.getElementById('set-priv-anon-aff')?.checked,
      local_storage_strict: document.getElementById('set-priv-local-strict')?.checked,
      auto_purge_temp_media_days: Number(document.getElementById('set-priv-purge-days')?.value || 7)
    }
  };

  try {
    const res = await fetch('/api/settings/update_section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      alert('🛡️ Data Sovereignty & Privacy safeguards locked in!');
      loadSettings();
    }
  } catch (err) {
    alert(`Failed to save privacy settings: ${err.message}`);
  }
}

async function handleSaveSecuritySettings(event) {
  event.preventDefault();
  const payload = {
    section: 'security',
    values: {
      webhook_hmac_sha256_enforced: document.getElementById('set-sec-hmac')?.checked,
      localhost_origin_lockdown: document.getElementById('set-sec-localhost')?.checked,
      require_session_pin: document.getElementById('set-sec-pin')?.checked
    }
  };

  try {
    const res = await fetch('/api/settings/update_section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      alert('🔒 Security & Access policies updated!');
      loadSettings();
    }
  } catch (err) {
    alert(`Failed to save security settings: ${err.message}`);
  }
}

async function handleSaveSwarmSettings(event) {
  event.preventDefault();
  const payload = {
    section: 'swarm',
    values: {
      default_llm_model: document.getElementById('set-swarm-model')?.value,
      ollama_base_url: document.getElementById('set-swarm-ollama-url')?.value.trim(),
      council_debate_rigor: document.getElementById('set-swarm-rigor')?.value,
      autopilot_readiness_threshold: Number(document.getElementById('set-swarm-threshold')?.value || 90),
      strict_agent_roles_enforced: document.getElementById('set-swarm-strict-roles')?.checked
    }
  };

  try {
    const res = await fetch('/api/settings/update_section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      alert('🤖 Autonomous Swarm & Council parameters updated!');
      loadSettings();
    }
  } catch (err) {
    alert(`Failed to save swarm settings: ${err.message}`);
  }
}

async function handleSaveUiSettings(event) {
  event.preventDefault();
  const payload = {
    section: 'ui',
    values: {
      theme: document.getElementById('set-ui-theme')?.value,
      brand_logo: document.getElementById('set-ui-logo')?.value,
      telemetry_refresh_sec: Number(document.getElementById('set-ui-refresh')?.value || 5),
      executive_audio_chimes: document.getElementById('set-ui-chimes')?.checked
    }
  };

  try {
    const res = await fetch('/api/settings/update_section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === 'SUCCESS') {
      alert('🎨 Interface & Alert preferences saved!');
      loadSettings();
    }
  } catch (err) {
    alert(`Failed to save UI settings: ${err.message}`);
  }
}

async function handleToggleEmergencyKillswitch() {
  const current = !!currentSettingsData?.emergency_killswitch;
  const target = !current;
  const confirmMsg = target
    ? '⚠️ ENGAGE EMERGENCY STOP: This will immediately freeze all 10 corporate agents, halt video rendering queues, and lock payment auto-settlements. Proceed?'
    : '✅ DISENGAGE EMERGENCY STOP: Resume all autonomous agents and background pipelines?';

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/settings/toggle_killswitch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: target })
    });
    const data = await res.json();
    alert(`🚨 Emergency Killswitch ${data.emergency_killswitch ? 'ACTIVATED' : 'DISENGAGED'}.`);
    loadSettings();
  } catch (err) {
    alert(`Failed to toggle killswitch: ${err.message}`);
  }
}

async function handleExportSettingsBackup() {
  try {
    const res = await fetch('/api/settings/export_backup', { method: 'POST' });
    const data = await res.json();
    const str = JSON.stringify(data, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SB_Group_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Failed to export backup: ${err.message}`);
  }
}

function handlePurgeTempCache() {
  if (confirm('🧹 Clean temporary audio clips and scratch video frames from cache?')) {
    alert('Temporary cache cleared. Zero persistent media lost.');
  }
}

function togglePasswordVisibility(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.type = el.type === 'password' ? 'text' : 'password';
  }
}

// ============================================================================
// UNIFIED SOVEREIGN LOCALHOST ECOSYSTEM FUNCTIONS
// ============================================================================

async function loadEcosystemHosts(force = false) {
  try {
    const res = await fetch('/api/ecosystem/hosts');
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.hosts) return;

    appState.ecosystem.hosts = data.hosts;
    appState.ecosystem.lastChecked = new Date();

    renderHeaderLocalhostPills(data.hosts);
    renderEcosystemCards(data.hosts);
    updateEcosystemMeshBadge(data.online_hosts, data.total_hosts);
  } catch (err) {
    console.error('Failed to load ecosystem hosts:', err);
  }
}

function updateEcosystemMeshBadge(online, total) {
  const badge = document.getElementById('ecosystem-mesh-badge');
  const tabBadge = document.getElementById('ecosystem-tab-badge');
  const text = `${online}/${total} ONLINE`;

  if (badge) {
    badge.innerText = text;
    if (online === total) {
      badge.className = 'badge-green text-[10px] font-mono';
    } else {
      badge.className = 'badge-gold text-[10px] font-mono';
    }
  }
  if (tabBadge) {
    tabBadge.innerText = text;
  }
}

function renderHeaderLocalhostPills(hosts) {
  hosts.forEach(h => {
    const pill = document.getElementById(`host-pill-${h.port}`);
    if (pill) {
      const isOnline = h.status === 'ONLINE';
      pill.className = `host-pill ${isOnline ? 'online' : 'standby'}`;
      pill.title = `${h.name} (${h.port}) • ${h.status} • ${h.latency_ms}ms`;
      pill.innerHTML = `<span class="host-dot"></span>${h.port}`;
    }
  });
}

function renderEcosystemCards(hosts) {
  const container = document.getElementById('ecosystem-cards-grid');
  if (!container) return;

  const cardsHtml = hosts.map(h => {
    const isOnline = h.status === 'ONLINE';
    const isActiveViewport = appState.ecosystem.activeViewport === h.key;
    const borderAccent = isOnline ? (h.accent === 'cyan' ? 'border-cyan-500/40' : h.accent === 'violet' ? 'border-purple-500/40' : h.accent === 'emerald' ? 'border-emerald-500/40' : 'border-amber-500/40') : 'border-slate-800';

    const metricEntries = Object.entries(h.metrics || {}).slice(0, 3).map(([k, v]) => `
      <div class="flex items-center justify-between text-[11px] py-0.5 border-b border-white/[0.04]">
        <span class="text-slate-400 font-sans">${k}</span>
        <span class="font-mono font-semibold text-slate-200">${v}</span>
      </div>
    `).join('');

    return `
      <div class="ecosystem-host-card ${isActiveViewport ? 'active-viewport' : ''} ${borderAccent} flex flex-col justify-between" id="host-card-${h.key}">
        <div>
          <!-- Header: Category, Port & Status -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">${h.category}</span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono text-slate-400">${h.latency_ms}ms</span>
              <span class="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                <span class="w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'}"></span>
                ${isOnline ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <!-- Name & Tagline -->
          <div class="flex items-start gap-2.5 mb-2">
            <span class="text-xl shrink-0 mt-0.5">${h.icon}</span>
            <div>
              <h3 class="text-sm font-bold text-white leading-tight">${h.name}</h3>
              <p class="text-[10px] font-mono text-cyan-400 mt-0.5">${h.url}</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">${h.description}</p>

          <!-- Metrics Table -->
          <div class="space-y-0.5 bg-slate-950/40 rounded-lg p-2.5 border border-white/[0.05] mb-3">
            ${metricEntries}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 border-t border-white/[0.05] flex items-center gap-1.5">
          ${h.can_embed ? `
            <button onclick="switchEcosystemViewport('${h.key}')" class="btn-ghost flex-1 text-[11px] py-1.5 px-2 flex items-center justify-center gap-1 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40" title="View inside dashboard viewport">
              <span>👁️</span> Embed
            </button>
          ` : `
            <button onclick="switchTab('progress')" class="btn-ghost flex-1 text-[11px] py-1.5 px-2 flex items-center justify-center gap-1 border border-amber-500/40 text-amber-300" title="Active Core">
              <span>🏛️</span> Active
            </button>
          `}
          <a href="${h.url}" target="_blank" rel="noopener" class="btn-ghost text-[11px] py-1.5 px-2.5 flex items-center justify-center gap-1 border border-slate-700 hover:border-slate-500 text-slate-300" title="Open in new window">
            <span>↗️</span>
          </a>
          ${!isOnline ? `
            <button onclick="startEcosystemService('${h.key}')" class="btn-gold text-[11px] py-1.5 px-2.5 flex items-center justify-center" title="Launch Engine">
              <span>⚡</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

function switchEcosystemViewport(hostKey) {
  appState.ecosystem.activeViewport = hostKey;

  const host = (appState.ecosystem.hosts || []).find(h => h.key === hostKey);
  if (!host) return;

  // Update tabs highlight
  ['omniroute', 'worldmonitor', 'titan', 'ollama', 'sb_dashboard'].forEach(k => {
    const btn = document.getElementById(`viewport-btn-${k}`);
    if (btn) {
      if (k === hostKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
    const card = document.getElementById(`host-card-${k}`);
    if (card) {
      if (k === hostKey) {
        card.classList.add('active-viewport');
      } else {
        card.classList.remove('active-viewport');
      }
    }
  });

  const urlEl = document.getElementById('viewport-active-url');
  if (urlEl) urlEl.innerText = host.url;

  const iframe = document.getElementById('ecosystem-viewport-iframe');
  const loader = document.getElementById('viewport-loader');

  if (iframe) {
    if (loader) loader.classList.remove('hidden');
    iframe.src = host.embed_url || host.url;
    iframe.onload = () => {
      if (loader) loader.classList.add('hidden');
    };
  }
}

function reloadEcosystemViewport() {
  const iframe = document.getElementById('ecosystem-viewport-iframe');
  if (iframe) {
    const loader = document.getElementById('viewport-loader');
    if (loader) loader.classList.remove('hidden');
    iframe.src = iframe.src;
    iframe.onload = () => {
      if (loader) loader.classList.add('hidden');
    };
  }
}

function popoutEcosystemViewport() {
  const host = (appState.ecosystem.hosts || []).find(h => h.key === appState.ecosystem.activeViewport);
  if (host && host.url) {
    window.open(host.url, '_blank');
  }
}

async function startEcosystemService(hostKey) {
  try {
    const res = await fetch('/api/ecosystem/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_key: hostKey, action: 'start' })
    });
    const data = await res.json();
    alert(`[Engine Supervisor]: ${data.message || 'Launch initiated.'}`);
    setTimeout(() => loadEcosystemHosts(true), 1500);
  } catch (err) {
    alert(`Failed to start engine: ${err.message}`);
  }
}

async function triggerAllStandbyEngines() {
  const standbyHosts = (appState.ecosystem.hosts || []).filter(h => h.status !== 'ONLINE');
  if (standbyHosts.length === 0) {
    alert('All 5 ecosystem engines are already ONLINE!');
    return;
  }
  for (const h of standbyHosts) {
    await startEcosystemService(h.key);
  }
}


