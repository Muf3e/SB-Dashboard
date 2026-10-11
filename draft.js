/**
 * ==========================================================================
 * MUNDER-DIFFLIN × AGENT STANDUP (SB GROUP DRAFT PLATFORM)
 * Frontend Interactive Controller
 *
 * Implements:
 * 1. Exact agent-standup system UI:
 *    - 8 illustrated room scenes with desks
 *    - Procedural SVG animated characters (blinking eyes, bobbing, typing laptops, mouth lip-sync, props)
 *    - Speech bubbles above agent tiles
 *    - Animal Crossing procedural Web Audio blip synthesizer
 *    - Live shared screen: Terminal (bash outputs), Diff editor, Task lists
 * 2. Exact Munder-Difflin system UI:
 *    - Chunky retro SNES/Earthbound panels, pixel buttons, badges
 *    - 363+ Ecosystem Agents directory with "What each agent is currently doing"
 *    - Blue sticky task notes, context gauges, division pills, search
 *    - 2D Office Floor scene with animated desk speech bubbles
 *    - Command Center Kanban & Executive Watercooler chat
 * ==========================================================================
 */

(function() {
  'use strict';

  // ------------------------------------------------------------------------
  // HASH & PERSONA ENGINE (from agent-standup)
  // ------------------------------------------------------------------------

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    }
    return h;
  }

  const PALETTE = ['#E07A5F', '#3D5A80', '#EE6C4D', '#293241', '#98C1D9', '#588B76', '#F2CC8F', '#81B29A', '#9B5DE5', '#F15BB5'];

  function getAgentPersona(agent) {
    const h = hashStr(agent.id || agent.key || agent.name || 'agent');
    return {
      id: agent.id,
      name: agent.name,
      role: agent.title,
      shirt: agent.color || PALETTE[(h >>> 6) % PALETTE.length],
      shape: (h >>> 3) % 5,
      acc: (h >>> 9) % 6,
      eye: (h >>> 12) % 3,
      glasses: ((h >>> 15) % 4) === 0,
      scene: (h >>> 18) % 8,
      prop: (h >>> 21) % 3,
      acc2: PALETTE[(h >>> 24) % PALETTE.length],
      gid: 'p' + (h >>> 0).toString(36),
      lead: agent.tier === 'c-suite' || agent.id === 'agent-ceo'
    };
  }

  // ------------------------------------------------------------------------
  // ILLUSTRATED ROOMS & SVG GENERATOR (from agent-standup)
  // ------------------------------------------------------------------------

  const SCENES = [
    // 0. Sunrise mountain window
    {
      desk: ['#C98A5A', '#9A6238'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs0" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#FFC2A8"/><stop offset=".55" stop-color="#FF93B4"/><stop offset="1" stop-color="#9A7BFF"/>
          </linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs0)"/>
        <circle cx="74" cy="31" r="19" fill="#FFF3D0" opacity=".22"/><circle cx="74" cy="31" r="11" fill="#FFF3D0"/>
        <path d="M0 50Q24 34 48 48T100 44V75H0z" fill="#7B5FD6"/><path d="M0 57Q30 45 62 56T100 53V75H0z" fill="#5B46B8"/>
        <path d="M18 22q2-3 4 0M26 17q2-3 4 0" stroke="#5A3D8A" stroke-width=".8" fill="none" stroke-linecap="round"/>
      `
    },
    // 1. Cyber night skyline
    {
      desk: ['#6B6FA8', '#43467A'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0D1230"/><stop offset="1" stop-color="#2A2E68"/>
          </linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs1)"/>
        <circle cx="80" cy="18" r="7" fill="#FFF4CF"/><circle cx="83" cy="16" r="6.2" fill="#1D2150"/>
        <g fill="#161A45">
          <rect x="0" y="40" width="14" height="35"/><rect x="16" y="32" width="12" height="43"/>
          <rect x="30" y="44" width="15" height="31"/><rect x="48" y="30" width="14" height="45"/>
          <rect x="64" y="38" width="16" height="37"/><rect x="82" y="34" width="18" height="41"/>
        </g>
        <g fill="#FFD36E">
          <rect x="5" y="46" width="2" height="2"/><rect x="20" y="38" width="2" height="2"/>
          <rect x="52" y="36" width="2" height="2"/><rect x="68" y="44" width="2" height="2"/>
          <rect x="86" y="40" width="2" height="2"/>
        </g>
      `
    },
    // 2. Cozy library with books & succulent
    {
      desk: ['#CAA27A', '#9C7650'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFEADB"/><stop offset="1" stop-color="#FFD2B5"/></linearGradient>
          <linearGradient id="${uid}gw2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE9FF"/><stop offset="1" stop-color="#EAF8FF"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs2)"/>
        <rect x="9" y="9" width="30" height="30" rx="3" fill="#FFF"/><rect x="11" y="11" width="26" height="26" rx="2" fill="url(#${uid}gw2)"/>
        <path d="M24 11v26M11 24h26" stroke="#FFF" stroke-width="1.6"/>
        <rect x="62" y="22" width="32" height="2.4" rx="1" fill="#B98A64"/><rect x="62" y="40" width="32" height="2.4" rx="1" fill="#B98A64"/>
        <rect x="64" y="12" width="3.6" height="10" rx=".8" fill="#FF7A6B"/><rect x="69" y="10" width="3.6" height="12" rx=".8" fill="#4CC3FF"/>
        <rect x="74" y="14" width="3.6" height="8" rx=".8" fill="#FFD84A"/><rect x="79" y="11" width="3.6" height="11" rx=".8" fill="#7C8CFF"/>
      `
    },
    // 3. Garden terrace & flowers
    {
      desk: ['#B9E0C4', '#86BE9A'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDF1FF"/><stop offset="1" stop-color="#EFFFF6"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs3)"/>
        <ellipse cx="25" cy="16" rx="10" ry="4" fill="#FFF" opacity=".8"/><ellipse cx="75" cy="22" rx="9" ry="3.5" fill="#FFF" opacity=".8"/>
        <path d="M0 48Q25 36 52 47T100 42V75H0z" fill="#7DDC9A"/><path d="M0 56Q30 46 64 56T100 52V75H0z" fill="#4FC482"/>
        <rect x="80" y="30" width="2.6" height="14" fill="#8A5A3A"/><circle cx="81.3" cy="27" r="8" fill="#3FAE6C"/>
      `
    },
    // 4. Beach sunset
    {
      desk: ['#E6C48F', '#BF9A63'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9AE"/><stop offset="1" stop-color="#A4E8FF"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs4)"/>
        <circle cx="22" cy="22" r="9" fill="#FFF6D6"/>
        <path d="M0 46Q12 41 24 46T48 46T72 46T100 46V75H0z" fill="#3CB7D9"/>
        <path d="M0 52Q12 47 24 52T48 52T72 52T100 52V75H0z" fill="#2A95C4"/>
        <path d="M70 42V26L82 42z" fill="#FFF"/>
      `
    },
    // 5. Retro space synthwave
    {
      desk: ['#7A5EA8', '#4D3A7A'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#190F3D"/><stop offset="1" stop-color="#4C2183"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs5)"/>
        <circle cx="22" cy="26" r="11" fill="#FF9BB8"/>
        <ellipse cx="22" cy="26" rx="18" ry="3.6" fill="none" stroke="#FFE0A8" stroke-width="1.6" transform="rotate(-18 22 26)"/>
        <circle cx="80" cy="20" r="6" fill="#6FD3FF"/>
      `
    },
    // 6. Tech operations center
    {
      desk: ['#506B73', '#2F4850'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10282F"/><stop offset="1" stop-color="#18444F"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs6)"/>
        <rect x="6" y="8" width="26" height="20" rx="2" fill="#0A1A1F" stroke="#2B6A78" stroke-width=".8"/>
        <polyline points="9,22 15,16 20,18 26,11" fill="none" stroke="#FF9A6B" stroke-width="1.3"/>
        <rect x="37" y="6" width="26" height="20" rx="2" fill="#0A1A1F" stroke="#2B6A78" stroke-width=".8"/>
        <polyline points="40,20 46,14 51,17 58,10" fill="none" stroke="#4FD1A5" stroke-width="1.3"/>
        <rect x="68" y="8" width="26" height="20" rx="2" fill="#0A1A1F" stroke="#2B6A78" stroke-width=".8"/>
        <polyline points="71,22 77,15 82,19 89,12" fill="none" stroke="#FFD84A" stroke-width="1.3"/>
      `
    },
    // 7. Warm mahogany library
    {
      desk: ['#A87A56', '#7C5438'],
      svg: (uid) => `
        <defs>
          <linearGradient id="${uid}gs7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2B52"/><stop offset="1" stop-color="#6B4A68"/></linearGradient>
        </defs>
        <rect width="100" height="75" fill="url(#${uid}gs7)"/>
        <circle cx="82" cy="30" r="18" fill="#FFD98A" opacity=".35"/><circle cx="82" cy="30" r="10" fill="#FFD98A"/>
        <path d="M82 54V36" stroke="#2A2233" stroke-width="1.6"/>
        <rect x="12" y="10" width="22" height="16" rx="1.5" fill="#2A2233"/><rect x="14" y="12" width="18" height="12" rx="1" fill="#FF9A8B"/>
      `
    }
  ];

  const SHAPES = [
    { top: 20, fy: 40, hw: 23 },
    { top: 14, fy: 35, hw: 19 },
    { top: 15, fy: 41, hw: 24 },
    { top: 16, fy: 40, hw: 22 },
    { top: 22, fy: 40, hw: 22 }
  ];

  function getBodyShapeSVG(i, fill, dark) {
    switch (i) {
      case 0:
        return `<rect x="27" y="20" width="46" height="56" rx="22" fill="${fill}"/>`;
      case 1:
        return `<rect x="31" y="14" width="38" height="64" rx="19" fill="${fill}"/>`;
      case 2:
        return `<circle cx="38" cy="36" r="13" fill="${fill}"/><circle cx="50" cy="29" r="15" fill="${fill}"/><circle cx="62" cy="36" r="13" fill="${fill}"/><rect x="26" y="36" width="48" height="40" rx="12" fill="${fill}"/>`;
      case 3:
        return `<path d="M28 78V38a22 22 0 0 1 44 0V78z" fill="${fill}"/>`;
      default:
        return `<rect x="28" y="22" width="44" height="54" rx="11" fill="${fill}"/><rect x="23.5" y="36" width="4.4" height="11" rx="2.2" fill="${dark}"/><rect x="72.1" y="36" width="4.4" height="11" rx="2.2" fill="${dark}"/><path d="M50 22V13" stroke="${dark}" stroke-width="1.5" stroke-linecap="round"/><circle cx="50" cy="11.4" r="2.8" fill="#8FF0FF"/>`;
    }
  }

  function getAccessorySVG(i, top, color, fy, hw, isLead) {
    let acc = '';
    switch (i) {
      case 0: // Sprout
        acc = `<path d="M50 ${top + 1}v-7" stroke="#3A9D68" stroke-width="1.6" stroke-linecap="round"/><path d="M50 ${top - 5}q-8-1-8-8q7 0 8 8z" fill="#53C98A"/><path d="M50 ${top - 5}q8-1 8-8q-7 0-8 8z" fill="#3FB677"/>`;
        break;
      case 1: // Headset
        acc = `<path d="M${50 - hw - .5} ${fy - 3}Q${50 - hw} ${top - 7} 50 ${top - 7}Q${50 + hw} ${top - 7} ${50 + hw + .5} ${fy - 3}" fill="none" stroke="#2C2F40" stroke-width="3" stroke-linecap="round"/>
               <rect x="${50 - hw - 4}" y="${fy - 7}" width="7" height="14" rx="3.5" fill="${color}" stroke="#2C2F40" stroke-width="1.4"/>
               <rect x="${50 + hw - 3}" y="${fy - 7}" width="7" height="14" rx="3.5" fill="${color}" stroke="#2C2F40" stroke-width="1.4"/>`;
        break;
      case 2: // Cap
        acc = `<path d="M30 ${top + 11}Q30 ${top - 9} 50 ${top - 9}Q70 ${top - 9} 70 ${top + 11}z" fill="${color}"/><rect x="29" y="${top + 7}" width="42" height="7" rx="3.5" fill="#2C2F40" opacity=".4"/>`;
        break;
      case 3: // Visor
        acc = `<path d="M31 ${top + 8}Q31 ${top - 8} 50 ${top - 8}Q69 ${top - 8} 69 ${top + 8}z" fill="${color}"/><path d="M45 ${top + 7}q22-3 30 3q-12 3-30-1z" fill="#1A1320" opacity=".5"/>`;
        break;
      case 4: // Ribbon
        acc = `<g transform="translate(60 ${top + 3}) rotate(14)"><path d="M0 0L-9-5V5z" fill="${color}"/><path d="M0 0L9-5V5z" fill="${color}"/><circle r="2.6" fill="#1A1320" opacity=".3"/></g>`;
        break;
      default: // Antennas
        acc = `<path d="M44 ${top + 2}L40 ${top - 8}M56 ${top + 2}L60 ${top - 8}" stroke="#2C2F40" stroke-width="1.2" stroke-linecap="round"/><circle cx="40" cy="${top - 9}" r="2.4" fill="${color}"/><circle cx="60" cy="${top - 9}" r="2.4" fill="${color}"/>`;
        break;
    }
    if (isLead) {
      acc += `<path d="M${50 - hw} ${fy + 5}q-2 11 13 12" fill="none" stroke="#2C2F40" stroke-width="1.2" stroke-linecap="round"/><circle cx="${50 - hw + 13}" cy="${fy + 17}" r="2" fill="#F5C04A"/>`;
    }
    return acc;
  }

  function renderAgentStandupSVG(p, isSpeaking = false, isWorking = false, isDone = false, uid = '') {
    const sh = SHAPES[p.shape];
    const fy = sh.fy;
    const top = sh.top;
    const scene = SCENES[p.scene] || SCENES[0];
    const shirtColor = p.shirt;
    const darkColor = '#1A1320';
    const ink = p.shape === 4 ? '#8FF0FF' : '#2A2233';

    const eyeX = p.shape === 1 ? [43, 57] : [41.5, 58.5];
    const my = fy + 10.5;

    // Face elements
    const eyes = `
      <g class="eye">
        <ellipse cx="${eyeX[0]}" cy="${fy}" rx="3.2" ry="4" fill="${ink}"/>
        <circle cx="${eyeX[0] + 1}" cy="${fy - 1.5}" r="1.1" fill="#FFF"/>
      </g>
      <g class="eye">
        <ellipse cx="${eyeX[1]}" cy="${fy}" rx="3.2" ry="4" fill="${ink}"/>
        <circle cx="${eyeX[1] + 1}" cy="${fy - 1.5}" r="1.1" fill="#FFF"/>
      </g>
    `;

    const happyEyes = `
      <path d="M${eyeX[0] - 3.6} ${fy + 1.4}Q${eyeX[0]} ${fy - 4.2} ${eyeX[0] + 3.6} ${fy + 1.4}" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M${eyeX[1] - 3.6} ${fy + 1.4}Q${eyeX[1]} ${fy - 4.2} ${eyeX[1] + 3.6} ${fy + 1.4}" fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>
    `;

    const eyebrows = `
      <path class="brow l" d="M${eyeX[0] - 3.6} ${fy - 7}q3.6-2 7.2 0" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>
      <path class="brow r" d="M${eyeX[1] - 3.6} ${fy - 7}q3.6-2 7.2 0" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round"/>
    `;

    const mouth = isSpeaking ?
      `<ellipse class="mouth" cx="50" cy="${my + 1}" rx="4.5" ry="3.5" fill="#4B1C2C"/>` :
      (isDone ?
        `<path d="M44.5 ${my - .6}q5.5 8 11 0z" fill="#4B1C2C"/>` :
        `<path d="M46 ${my}q4 3.6 8 0" fill="none" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`
      );

    const blush = p.shape !== 4 ?
      `<ellipse cx="${eyeX[0] - 6}" cy="${fy + 6}" rx="3.3" ry="2" fill="#FF6F91" opacity=".35"/><ellipse cx="${eyeX[1] + 6}" cy="${fy + 6}" rx="3.3" ry="2" fill="#FF6F91" opacity=".35"/>` : '';

    const glasses = p.glasses ?
      `<g fill="rgba(255,255,255,.2)" stroke="#2C2F40" stroke-width="1.1">
         <circle cx="${eyeX[0]}" cy="${fy}" r="6.2"/><circle cx="${eyeX[1]}" cy="${fy}" r="6.2"/>
         <path d="M${eyeX[0] + 6.2} ${fy}h${eyeX[1] - eyeX[0] - 12.4}" fill="none"/>
       </g>` : '';

    const accessory = getAccessorySVG(p.acc, top, p.acc2, fy, sh.hw, p.lead);

    const arms = `
      <g class="arm l"><ellipse cx="25" cy="56" rx="4.6" ry="9" fill="${shirtColor}" transform="rotate(12 25 56)"/></g>
      <g class="arm r"><ellipse cx="75" cy="56" rx="4.6" ry="9" fill="${shirtColor}" transform="rotate(-12 75 56)"/></g>
    `;

    // Props: coffee, books, succulent
    const propsList = [
      // Succulent
      `<path d="M11 62.4l1.6-7.4h7.2l1.6 7.4z" fill="#E07A5F"/><path d="M16 55q-6-8-2-12q5 4 2 12z" fill="#3FBF7F"/><path d="M16 55q6-7 10-5q-1 6-10 5z" fill="#53C98A"/>`,
      // Steaming coffee mug
      `<rect x="79" y="55.6" width="7.4" height="6.8" rx="1.6" fill="#F6F2EA"/><path d="M86.2 57q3.2 0 3.2 2.2t-3.2 2.2" fill="none" stroke="#F6F2EA" stroke-width="1.3"/>
       <g class="steam" fill="none" stroke="#FFF" stroke-width=".8" stroke-linecap="round" opacity=".7"><path d="M81.5 53q-1.4-1.8 0-3.4M84.3 53q-1.4-1.8 0-3.4"/></g>`,
      // Reference book stack
      `<rect x="76" y="58.2" width="14" height="4.2" rx="1" fill="#FF7A6B"/><rect x="77.5" y="54.4" width="12" height="3.8" rx="1" fill="#4CC3FF"/><rect x="76.5" y="50.8" width="11" height="3.6" rx="1" fill="#FFD84A"/>`
    ];
    const deskProp = propsList[p.prop] || propsList[1];

    // Open laptop with glowing apple logo and typing hands
    const laptop = `
      <rect x="33" y="46" width="34" height="18" rx="2.8" fill="#D3D8E6"/>
      <circle cx="50" cy="55" r="2.3" fill="${p.shirt}"/>
      <rect x="29.5" y="63.4" width="41" height="3" rx="1.5" fill="#AAB1C2"/>
    `;
    const hands = `<circle class="hand l" cx="38" cy="65.6" r="3.1" fill="${shirtColor}"/><circle class="hand r" cx="62" cy="65.6" r="3.1" fill="${shirtColor}"/>`;

    return `
      <svg viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        ${scene.svg(uid)}
        <g class="fig">
          ${arms}
          ${getBodyShapeSVG(p.shape, shirtColor, darkColor)}
          ${blush}
          ${isDone ? happyEyes : eyes}
          ${eyebrows}
          ${mouth}
          ${glasses}
          ${accessory}
        </g>
        <!-- Desk Surface -->
        <rect y="62" width="100" height="13" fill="${scene.desk[0]}"/>
        <rect y="62" width="100" height="1.3" fill="#FFF" opacity=".35"/>
        <rect y="63.3" width="100" height="2.6" fill="#000" opacity=".12"/>
        ${deskProp}
        ${laptop}
        ${hands}
      </svg>
    `;
  }

  // ------------------------------------------------------------------------
  // ANIMAL CROSSING PROCEDURAL PROCEDURAL VOICE SYNTHESIZER
  // ------------------------------------------------------------------------

  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playBlip(baseFreq = 420) {
    if (!state.audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, t + 0.06);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch (e) {}
  }

  function playSentenceBlips(text, pitchBase = 420) {
    if (!state.audioEnabled || !text) return;
    const words = text.split(/\s+/).slice(0, 14);
    words.forEach((word, idx) => {
      setTimeout(() => {
        const charCodeSum = word.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const pitchVariation = (charCodeSum % 140) - 70;
        playBlip(Math.max(220, pitchBase + pitchVariation));
      }, idx * 110);
    });
  }

  // ------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------------------------------------

  const state = {
    activeTab: 'standup',
    theme: 'light',
    audioEnabled: true,
    agents: [],
    standupSessions: [],
    currentSessionIndex: 0,
    currentStepIndex: 0,
    isPlayingStandup: false,
    playbackTimer: null,
    searchQuery: '',
    selectedDivision: 'ALL',
    modalAgent: null,
    tasks: [],
    watercoolerMessages: []
  };

  const el = {};

  function initElements() {
    el.tabs = document.querySelectorAll('.tab-btn');
    el.sections = document.querySelectorAll('.view-section');
    el.audioToggle = document.getElementById('btn-audio-toggle');
    el.themeToggle = document.getElementById('btn-theme-toggle');
    el.activeAgentsCount = document.getElementById('stat-active-agents');
    el.totalAgentsCount = document.getElementById('stat-total-agents');
    el.tabAgentsBadge = document.getElementById('tab-agents-badge');

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

    // Watercooler
    el.watercoolerFeed = document.getElementById('watercooler-feed-messages');
    el.chatInput = document.getElementById('watercooler-input');
    el.chatSendBtn = document.getElementById('btn-watercooler-send');

    // Floor Canvas
    el.floorContainer = document.getElementById('floor-canvas-container');
  }

  // ------------------------------------------------------------------------
  // INITIALIZATION & DATA LOADING
  // ------------------------------------------------------------------------

  async function init() {
    initElements();
    attachEventListeners();
    await loadInitialData();
    renderAllViews();
    startFloorSpeechAnimation();
  }

  async function loadInitialData() {
    try {
      // 1. Fetch all 363+ agents
      const agentsRes = await fetch('/api/draft/agents');
      if (agentsRes.ok) {
        const data = await agentsRes.json();
        state.agents = data.agents || [];
      } else {
        const legacyRes = await fetch('/api/agents');
        if (legacyRes.ok) {
          const lData = await legacyRes.json();
          state.agents = lData.agents || [];
        }
      }

      if (el.totalAgentsCount) el.totalAgentsCount.textContent = state.agents.length;
      if (el.tabAgentsBadge) el.tabAgentsBadge.textContent = state.agents.length;
      if (el.activeAgentsCount) {
        const active = state.agents.filter(a => a.status === 'ONLINE' || a.status === 'WORKING').length;
        el.activeAgentsCount.textContent = active;
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
        const tData = await tasksRes.json();
        state.tasks = tData.tasks || [];
      }

      // 4. Default Watercooler Conversation
      state.watercoolerMessages = [
        { sender_name: 'Arthur Pendelton (CEO)', time: '09:15 AM', text: 'Good morning executive team. The board ledger confirms 100% zero-cloud status for all four subsidiaries.' },
        { sender_name: 'Dr. Vikram Shenoy (CTO)', time: '09:17 AM', text: 'Local Ollama on RTX GPU running at 11.2ms latency. 70 tools verified clean.' },
        { sender_name: 'Thaddeus Stone (CFO)', time: '09:20 AM', text: 'Zero recurring SaaS fees verified. Treasury margin is expanding ahead of Q4.' },
        { sender_name: 'Tariq Burhani (Fragrance)', time: '09:24 AM', text: 'Cambodian Oud Private Reserve crystal flacons sealed and ready for high-margin packaging.' },
        { sender_name: 'Hiroshi Tanaka (TITAN)', time: '09:28 AM', text: 'Live price index tracker ingested 1,240 retailer rows. Daylight Prismatic loading screen is live.' },
        { sender_name: 'Fatima Al-Burhani (Alfann)', time: '09:31 AM', text: 'WhatsApp concierge automated 42 personalized gifts today. 78.5% net margin.' }
      ];

    } catch (e) {
      console.error('Error loading draft data:', e);
    }
  }

  function attachEventListeners() {
    // Navigation Tabs
    el.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        switchTab(tabId);
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

    // Audio Toggle
    if (el.audioToggle) {
      el.audioToggle.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        el.audioToggle.textContent = state.audioEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: OFF';
        el.audioToggle.classList.toggle('btn-primary', state.audioEnabled);
        if (state.audioEnabled) {
          playBlip(540);
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
      renderStandupStep();
    }
  }

  function renderAllViews() {
    renderStandupStage();
    renderOfficeFloor();
    renderAgentsDirectory();
    renderKanbanBoard();
    renderWatercooler();
  }

  // ------------------------------------------------------------------------
  // STANDUP SYSTEM ENGINE (Exact agent-standup reproduction)
  // ------------------------------------------------------------------------

  function renderStandupStage() {
    if (!el.standupStage) return;
    el.standupStage.innerHTML = '';

    const session = state.standupSessions[state.currentSessionIndex];
    const participantIds = session ? session.participants : [];

    let callAgents = state.agents.filter(a => participantIds.includes(a.id));
    if (callAgents.length === 0) {
      callAgents = state.agents.slice(0, 10);
    }

    callAgents.forEach(agent => {
      const persona = getAgentPersona(agent);
      const tile = document.createElement('div');
      tile.className = 'agent-video-tile';
      tile.id = `tile-${agent.id}`;
      tile.onclick = () => openAgentModal(agent);

      const svgContent = renderAgentStandupSVG(persona, false, agent.status === 'WORKING', false, `tile_${agent.id}_`);

      tile.innerHTML = `
        <div class="tile-top-bar">
          <span class="tile-agent-name">${agent.name}</span>
          <span class="tile-activity-tag" id="tag-${agent.id}">${agent.status}</span>
        </div>
        <div class="tile-svg-stage" id="svg-stage-${agent.id}">
          ${svgContent}
        </div>
        <div class="bubble" id="bubble-${agent.id}">
          <b>${agent.name.split(' ')[0]}:</b> Initializing standup...
        </div>
        <div class="tile-bottom-ticker">
          <span class="ticker-tool" id="ticker-tool-${agent.id}">⚡ ${agent.active_tool || 'OmniRoute'}</span>
          <span class="ticker-tokens">⚡ ${(agent.tokens?.input || 12000).toLocaleString()} tok</span>
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

    // 1. Reset previous speaker highlights
    document.querySelectorAll('.agent-video-tile').forEach(t => t.classList.remove('speaking'));

    // 2. Identify speaker & highlight
    const speakerId = step.agent;
    const speakerAgent = state.agents.find(a => a.id === speakerId) || { name: 'Executive Leader', id: speakerId, title: 'Leader' };
    const tile = document.getElementById(`tile-${speakerId}`);

    if (tile) {
      tile.classList.add('speaking');

      // Update speech bubble text on tile
      const bubble = document.getElementById(`bubble-${speakerId}`);
      if (bubble) {
        bubble.innerHTML = `<b>${speakerAgent.name.split(' ')[0]}:</b> ${step.text || (step.tool ? `Running ${step.tool}` : 'Reporting status...')}`;
      }

      // Re-render SVG with speaking state (mouth open)
      const svgStage = document.getElementById(`svg-stage-${speakerId}`);
      if (svgStage) {
        const persona = getAgentPersona(speakerAgent);
        svgStage.innerHTML = renderAgentStandupSVG(persona, true, step.kind === 'tools', step.kind === 'report', `tile_${speakerId}_`);
      }
    }

    // 3. Update Subtitles & Speaker Label
    if (el.standupSpeakerLabel) {
      el.standupSpeakerLabel.innerHTML = `🎙️ ${speakerAgent.name} (${speakerAgent.title || 'Leader'}) <span class="pixel-badge badge-working">${step.kind.toUpperCase()}</span>`;
    }
    if (el.standupSubtitleText) {
      typewriterEffect(el.standupSubtitleText, step.text || `Executing tool: ${step.tool || ''}`);
    }

    // 4. Update Shared Screen Stage (Terminal / Diff / Directive)
    updateSharedScreen(step, speakerAgent);

    // 5. Procedural Animal Crossing Speech Blips
    if (state.audioEnabled && step.text) {
      const pitch = 300 + (hashStr(speakerId) % 240);
      playSentenceBlips(step.text, pitch);
    }

    // 6. Update Activity Tag on Tile
    const tag = document.getElementById(`tag-${speakerId}`);
    if (tag) {
      if (step.kind === 'tools') tag.textContent = `Using ${step.tool}`;
      else if (step.kind === 'say') tag.textContent = `Speaking`;
      else if (step.kind === 'report') tag.textContent = `✓ Reported`;
      else if (step.kind === 'order') tag.textContent = `Delegating`;
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
            <span style="color: #4ADE80;">bash 5.2</span>
          </div>
          <div class="terminal-content">
            <div class="terminal-prompt-line">❯ ${step.command || step.tool}</div>
            <div style="color: #4ADE80;">${step.output || 'Executing in local sovereign sandbox... ✓ Success (duration 1.2s)'}</div>
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
          <div style="font-size: 14px; font-weight: 700; color: #FFF; margin-bottom: 8px;">
            ${step.title || 'Conglomerate Milestone Sync'}
          </div>
          <div style="font-size: 13px; color: #CAD0E5; line-height: 1.5;">
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

    state.playbackTimer = setTimeout(runStandupLoop, 4500);
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

    const newStep = {
      step: session.timeline.length + 1,
      agent: 'agent-ceo',
      kind: 'order',
      title: 'Chairperson Directive',
      text: `Chairperson Order: "${text}". Delegating immediately across the swarm.`
    };

    const toolExecution = {
      step: session.timeline.length + 2,
      agent: 'agent-cto',
      kind: 'tools',
      tool: 'ast-grep / OmniRoute',
      command: `dispatch_swarm_directive("${text.replace(/"/g, '\\"')}")`,
      output: `[200 OK] Dispatched directive across 70 ecosystem tools. Zero cloud leak. Swarm executing.`
    };

    session.timeline.push(newStep, toolExecution);
    state.currentStepIndex = session.timeline.length - 2;
    renderStandupStep();

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

    const zones = [
      { name: 'EXECUTIVE BOARDROOM', x: 20, y: 20, w: 340, h: 230, color: '#D4AF37' },
      { name: 'TECH R&D & CODE PIT', x: 380, y: 20, w: 340, h: 230, color: '#38BDF8' },
      { name: 'MEDIA & MOTION STUDIO', x: 740, y: 20, w: 320, h: 230, color: '#C084FC' },
      { name: 'SUBSIDIARY COMMERCE FLOOR', x: 20, y: 270, w: 700, h: 250, color: '#34D399' },
      { name: 'EXECUTIVE LOUNGE & COFFEE', x: 740, y: 270, w: 320, h: 250, color: '#FB923C' }
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

    const deskPositions = [
      { id: 'agent-ceo', x: 70, y: 75, bubble: 'Building sovereign conglomerate legacy.' },
      { id: 'agent-cfo', x: 210, y: 75, bubble: 'Unit economics confirmed. $0.00 cloud burn.' },
      { id: 'agent-coo', x: 140, y: 155, bubble: 'Military precision across all pipelines.' },
      { id: 'agent-cto', x: 430, y: 75, bubble: '100% sovereign inference on RTX GPU.' },
      { id: 'agent-specialist-qa', x: 570, y: 75, bubble: 'Regression suite passed: 106 clean.' },
      { id: 'agent-cmo', x: 800, y: 75, bubble: 'Emotion drives conversion.' },
      { id: 'agent-zuri-chen', x: 940, y: 75, bubble: 'Timing Remotion hooks to 60fps drops.' },
      { id: 'agent-sub-fragrance', x: 70, y: 330, bubble: 'Artisanal Cambodian oud distillation.' },
      { id: 'agent-sub-titan', x: 210, y: 330, bubble: 'Ingesting 1,240 retailer price rows.' },
      { id: 'agent-sub-alfann', x: 350, y: 330, bubble: 'WhatsApp Arabic calligraphy concierge.' },
      { id: 'agent-sub-adwell', x: 490, y: 330, bubble: 'Free spring water sponsor billboards.' }
    ];

    deskPositions.forEach(d => {
      const agent = state.agents.find(a => a.id === d.id) || { name: d.id, id: d.id, tier: 'other' };
      const persona = getAgentPersona(agent);
      const desk = document.createElement('div');
      desk.className = 'floor-desk-item';
      desk.style.left = `${d.x}px`;
      desk.style.top = `${d.y}px`;
      desk.onclick = () => openAgentModal(agent);

      const miniSvg = renderAgentStandupSVG(persona, false, true, false, `floor_${d.id}_`);

      desk.innerHTML = `
        <div class="floor-speech-bubble" id="bubble-${agent.id}">${d.bubble}</div>
        <div class="floor-desk-svg">${miniSvg}</div>
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
    }, 4500);
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
      'Engineering', 'Marketing', 'Design', 'Security', 'Testing', 'Sales', 'Product',
      'Academic', 'Game-Development', 'GIS', 'Healthcare', 'Research'
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
      if (state.selectedDivision !== 'ALL' && agent.division !== state.selectedDivision) {
        return false;
      }
      if (state.searchQuery) {
        const text = `${agent.name} ${agent.title} ${agent.division} ${agent.focus} ${agent.current_task} ${agent.active_tool}`.toLowerCase();
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
      const persona = getAgentPersona(agent);
      const avatarSvg = renderAgentStandupSVG(persona, false, agent.status === 'WORKING', false, `card_${agent.id}_`);

      card.innerHTML = `
        <div class="agent-card-header">
          <div class="agent-card-avatar">
            ${avatarSvg}
          </div>
          <div class="agent-card-info">
            <div class="agent-card-name">${agent.name}</div>
            <div class="agent-card-title">${agent.title}</div>
          </div>
          ${statusBadge}
        </div>
        <div class="agent-current-task-box">
          <span class="task-box-label">CURRENT TASK (${agent.division})</span>
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
    const persona = getAgentPersona(agent);
    const modalSvg = renderAgentStandupSVG(persona, false, true, false, `modal_${agent.id}_`);

    if (el.modalTitle) el.modalTitle.textContent = agent.name;
    if (el.modalBody) {
      el.modalBody.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: center; border-bottom: var(--border-thin); padding-bottom: 12px;">
          <div style="width: 72px; height: 56px; border: var(--border-thick); border-radius: 4px; overflow: hidden; background: #000;">
            ${modalSvg}
          </div>
          <div>
            <div style="font-size: 17px; font-weight: 800;">${agent.name}</div>
            <div style="font-size: 13px; color: var(--cth-ink-500);">${agent.title} · ${agent.division}</div>
          </div>
          <div style="margin-left: auto;">${getStatusBadgeHtml(agent.status)}</div>
        </div>

        <div>
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 4px; color: var(--cth-ink-700);">WHAT AGENT IS CURRENTLY DOING:</div>
          <div class="pixel-panel-inset" style="padding: 10px; font-weight: 600; font-size: 14px;">
            ${agent.current_task || agent.focus}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="pixel-panel-inset" style="padding: 8px;">
            <div style="font-size: 10px; color: var(--cth-ink-500); font-family: var(--cth-font-display);">PRIMARY TOOL</div>
            <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${agent.active_tool || 'OmniRoute'}</div>
          </div>
          <div class="pixel-panel-inset" style="padding: 8px;">
            <div style="font-size: 10px; color: var(--cth-ink-500); font-family: var(--cth-font-display);">INFERENCE ENGINE</div>
            <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${agent.model || 'qwen2.5-coder:7b-instruct'}</div>
          </div>
        </div>

        <div>
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 4px; color: var(--cth-ink-700);">RECENT EXECUTION METRICS:</div>
          <div style="font-family: var(--cth-font-mono); font-size: 13.5px; color: var(--cth-ink-700); background: var(--cth-cream-200); padding: 8px; border-radius: 4px;">
            • Input Tokens: ${(agent.tokens?.input || 12000).toLocaleString()}<br>
            • Output Tokens: ${(agent.tokens?.output || 3400).toLocaleString()}<br>
            • Cache Hits: ${(agent.tokens?.cache || 45000).toLocaleString()}<br>
            • Cloud Egress: $0.00 (Zero Recurring SaaS Burn)
          </div>
        </div>

        <div style="margin-top: 8px;">
          <div style="font-family: var(--cth-font-display); font-size: 8.5px; margin-bottom: 6px;">DISPATCH DIRECT TASK TO ${agent.name.toUpperCase()}:</div>
          <div style="display: flex; gap: 6px;">
            <input type="text" id="modal-task-input" class="agent-search-input" style="height: 36px; font-size: 13px;" placeholder="Assign task to this agent...">
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
          <span style="font-size: 12px; font-family: var(--cth-font-mono); color: var(--cth-ink-500);">${t.business}</span>
        </div>
        <div style="font-size: 13.5px; font-weight: 700; color: var(--cth-ink-900);">${t.title}</div>
        <div style="font-size: 12px; color: var(--cth-ink-500);">Assignee: <b>${t.assignee_name}</b></div>
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

      row.innerHTML = `
        <div class="chat-avatar">🏢</div>
        <div class="chat-bubble">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
            <span class="chat-sender-name">${msg.sender_name}</span>
            <span style="font-size: 11px; color: var(--cth-ink-300); font-family: var(--cth-font-mono);">${msg.time}</span>
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

    state.watercoolerMessages.push({
      sender_name: 'Chairperson',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    });

    renderWatercooler();

    // Auto-reply after 1.5s
    setTimeout(() => {
      const responder = state.agents[Math.floor(Math.random() * Math.min(10, state.agents.length))] || { name: 'Arthur Pendelton (CEO)' };
      state.watercoolerMessages.push({
        sender_name: responder.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Received Chairperson: "${text}". Incorporating into our operational rhythm immediately.`
      });
      renderWatercooler();
      if (state.audioEnabled) {
        playSentenceBlips(text, 380);
      }
    }, 1200);
  }

  function typewriterEffect(element, text) {
    if (!element) return;
    element.textContent = '';
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < text.length) {
        element.textContent += text.charAt(idx);
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 16);
  }

  // Auto-boot on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
