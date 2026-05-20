<script>
  import { onMount } from 'svelte';
  import { nmcCount, paceDown } from './lib/nmc.js';
  import { computeValues } from './lib/compute.js';
  import { MUNITION_155, MUNITION_ROCKETS, MUNITION_105 } from './lib/data.js';
  import Sidebar from './components/Sidebar.svelte';
  import TabLogistics from './components/TabLogistics.svelte';
  import TabFireMissions from './components/TabFireMissions.svelte';
  import TabDOS from './components/TabDOS.svelte';
  import TabCost from './components/TabCost.svelte';
  import TabPAA from './components/TabPAA.svelte';
  import TabDodic from './components/TabDodic.svelte';
  import TabEfc from './components/TabEfc.svelte';
  import TabExport from './components/TabExport.svelte';
  import TabTaskOrg from './components/TabTaskOrg.svelte';
  import TabReadiness from './components/TabReadiness.svelte';
  import TabNotes from './components/TabNotes.svelte';
  import TabDoctrine from './components/TabDoctrine.svelte';

  // — Config state (sidebar inputs) —
  let echelon      = 'Battalion';
  let unitType     = 'M109A7';
  let unitCategory = 'Cannon (SP)';
  let tubes        = 18;
  let truckQty   = 18;
  let trailQty   = 18;
  let catQty     = 18;
  let hmmwvQty   = 18;
  let cclMode    = false;
  let planMode   = 'manual';
  let loadPct    = 25;
  let dist       = 25;
  let speed      = 30;
  let loadTime   = 2.0;
  let planHours  = 18;
  let authCsr    = 60;
  let firingRate = 50;
  let paaGunLine = 50;
  let paaBsa     = 2000;
  let dudRate    = 2;
  let reloadTime = 15;

  // — Battery Roster state —
  let useRoster = false;
  let rosterBatteries = [
    { id: 1, unitType: 'M109A7', tubes: 6 },
    { id: 2, unitType: 'M109A7', tubes: 6 },
    { id: 3, unitType: 'M109A7', tubes: 6 },
  ];

  // — RSR / CSR state —
  let rsrValues       = {};
  let csrByRound      = {};
  let autoSync        = true;
  let customMunitions = []; // [{name, wt}] — user-defined rounds

  // — UI state —
  let activeTab  = 1;
  let sidebarOpen = false;
  let _initialized = false;

  // — Derived config object —
  $: isCannon = unitType.includes('M109') || unitType.includes('M777') || unitType.includes('M119');
  $: isM109   = unitType.includes('M109');
  $: isMlrs   = unitType.includes('MLRS');
  $: isM119   = unitType === 'M119A3';

  $: config = {
    echelon, unitType, unitCategory, isCannon, isM109, isMlrs, isM119,
    tubes,
    truckQty: isM119 ? 0 : truckQty,
    trailQty: isM119 ? 0 : trailQty,
    catQty: isM109 ? catQty : 0,
    hmmwvQty: isM119 ? hmmwvQty : 0,
    cclMode: (isCannon && !isM119) && cclMode,
    planMode, loadPct,
    dist, speed, loadTime, planHours, authCsr,
    firingRate, paaGunLine, paaBsa, dudRate, reloadTime,
    customMunitions,
    useRoster, rosterBatteries,
  };

  // — Composite groups: unique systems + tube counts from roster —
  function getCompositeGroups(batteries) {
    const groups = {};
    for (const b of batteries) {
      if (!groups[b.unitType]) groups[b.unitType] = { unitType: b.unitType, tubes: 0 };
      groups[b.unitType].tubes += b.tubes;
    }
    return Object.values(groups);
  }
  $: compositeGroups = (unitCategory === 'Composite' && useRoster)
    ? getCompositeGroups(rosterBatteries)
    : [];

  // For compute.js: flatten compound keys ("M109A7||key") → simple keys by summing
  $: flatRsrValues = unitCategory !== 'Composite' ? rsrValues : (() => {
    const flat = {};
    for (const [k, val] of Object.entries(rsrValues)) {
      const munKey = k.includes('||') ? k.split('||')[1] : k;
      flat[munKey] = (flat[munKey] || 0) + val;
    }
    return flat;
  })();

  $: computed = computeValues(config, flatRsrValues, autoSync);

  $: baseKeys = isM119
    ? Object.keys(MUNITION_105)
    : isCannon
      ? Object.keys(MUNITION_155)
      : Object.keys(MUNITION_ROCKETS);

  // For Composite: compound keys per system; otherwise flat keys
  function munKeysForType(ut) {
    if (ut === 'M119A3') return Object.keys(MUNITION_105);
    if (ut.includes('M109') || ut.includes('M777')) return Object.keys(MUNITION_155);
    return Object.keys(MUNITION_ROCKETS);
  }
  $: munKeys = unitCategory === 'Composite' && compositeGroups.length > 0
    ? [
        ...compositeGroups.flatMap(g => munKeysForType(g.unitType).map(k => `${g.unitType}||${k}`)),
        ...customMunitions.map(m => m.name),
      ]
    : [...baseKeys, ...customMunitions.map(m => m.name)];

  function handleUnitChange() {
    rsrValues = {};
    csrByRound = {};
  }

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.echelon         != null) echelon         = s.echelon;
        if (s.unitType        != null) unitType         = s.unitType;
        if (s.unitCategory    != null) unitCategory     = s.unitCategory;
        if (s.tubes           != null) tubes            = s.tubes;
        if (s.truckQty        != null) truckQty         = s.truckQty;
        if (s.trailQty        != null) trailQty         = s.trailQty;
        if (s.catQty          != null) catQty           = s.catQty;
        if (s.hmmwvQty        != null) hmmwvQty         = s.hmmwvQty;
        if (s.cclMode         != null) cclMode          = s.cclMode;
        if (s.planMode        != null) planMode         = s.planMode;
        if (s.loadPct         != null) loadPct          = s.loadPct;
        if (s.dist            != null) dist             = s.dist;
        if (s.speed           != null) speed            = s.speed;
        if (s.loadTime        != null) loadTime         = s.loadTime;
        if (s.planHours       != null) planHours        = s.planHours;
        if (s.authCsr         != null) authCsr          = s.authCsr;
        if (s.firingRate      != null) firingRate       = s.firingRate;
        if (s.paaGunLine      != null) paaGunLine       = s.paaGunLine;
        if (s.paaBsa          != null) paaBsa           = s.paaBsa;
        if (s.dudRate         != null) dudRate          = s.dudRate;
        if (s.reloadTime      != null) reloadTime       = s.reloadTime;
        if (s.useRoster       != null) useRoster        = s.useRoster;
        if (s.rosterBatteries != null) rosterBatteries  = s.rosterBatteries;
        if (s.rsrValues       != null) rsrValues        = s.rsrValues;
        if (s.csrByRound      != null) csrByRound       = s.csrByRound;
        if (s.autoSync        != null) autoSync         = s.autoSync;
        if (s.customMunitions != null) customMunitions  = s.customMunitions;
        if (s.activeTab       != null) activeTab        = s.activeTab;
      }
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try {
      localStorage.setItem('fars_v1', JSON.stringify({
        echelon, unitType, unitCategory, tubes,
        truckQty, trailQty, catQty, hmmwvQty,
        cclMode, planMode, loadPct,
        dist, speed, loadTime, planHours,
        authCsr, firingRate, paaGunLine, paaBsa,
        dudRate, reloadTime,
        useRoster, rosterBatteries,
        rsrValues, csrByRound,
        autoSync, customMunitions,
        activeTab,
      }));
    } catch (_) {}
  }

  function handleRsrChange(e) {
    rsrValues = { ...rsrValues, [e.detail.key]: e.detail.value };
  }

  function handleApplyRsrDefaults(e) {
    rsrValues = { ...e.detail.values };
  }

  function handleCsrByRoundChange(e) {
    csrByRound = { ...csrByRound, [e.detail.key]: e.detail.value };
  }

  function handleAddCustomMun(e) {
    const { name, wt } = e.detail;
    if (!name || customMunitions.some(m => m.name === name)) return;
    customMunitions = [...customMunitions, { name, wt }];
  }

  function handleRemoveCustomMun(e) {
    const name = e.detail.name;
    customMunitions = customMunitions.filter(m => m.name !== name);
    const { [name]: _, ...rest } = rsrValues;
    rsrValues = rest;
  }

  function handleRosterChange(e) {
    rosterBatteries = e.detail;
  }

  function setActiveTab(n) {
    activeTab = n;
  }

  const MAX_RANGE = {
    "M109A7":"30 km", "M109A6":"30 km", "M777A2":"24.7 km",
    "M119A3":"14 km (19.5 RAP)", "HIMARS":"84+ km", "MLRS":"84+ km",
  };
</script>

<div class="app">
  <div class="sidebar">
    <button class="menu-btn" on:click={() => sidebarOpen = !sidebarOpen}>☰ Unit/Echelon</button>
    <Sidebar
      bind:echelon bind:unitType bind:unitCategory bind:tubes
      bind:truckQty bind:trailQty bind:catQty bind:hmmwvQty
      bind:useRoster {rosterBatteries}
      on:rosterchange={handleRosterChange}
      on:unitchange={handleUnitChange}
      bind:cclMode bind:planMode bind:loadPct
      bind:dist bind:speed bind:loadTime bind:planHours
      bind:authCsr bind:firingRate
      bind:paaGunLine bind:paaBsa
      bind:dudRate bind:reloadTime
      {config}
      {sidebarOpen}
    />
  </div>

  <div class="main">
    <div class="main-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
      <!-- Two-tier tab bar (no page header) -->
      <div class="tabs-wrap">
        <div class="tabs-primary">
          <button class="tab" class:active={activeTab===1}  on:click={() => setActiveTab(1)}>
            Task Org{#if $nmcCount > 0}<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f85149;margin-left:6px;vertical-align:middle;flex-shrink:0;" title="NMC equipment logged"></span>{/if}{#if $paceDown > 0}<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#e3b341;margin-left:4px;vertical-align:middle;flex-shrink:0;" title="PACE tier down"></span>{/if}
          </button>
          <button class="tab" class:active={activeTab===2}  on:click={() => setActiveTab(2)}>Logistics</button>
          <button class="tab" class:active={activeTab===3}  on:click={() => setActiveTab(3)}>DOS &amp; Resupply</button>
          <button class="tab" class:active={activeTab===4}  on:click={() => setActiveTab(4)}>Fire Missions</button>
          <button class="tab" class:active={activeTab===5}  on:click={() => setActiveTab(5)}>PAA &amp; Storage</button>
          <button class="tab" class:active={activeTab===6}  on:click={() => setActiveTab(6)}>Readiness</button>
        </div>
        <div class="tabs-secondary">
          <button class="tab" class:active={activeTab===7}  on:click={() => setActiveTab(7)}>Training Cost</button>
          <button class="tab" class:active={activeTab===8}  on:click={() => setActiveTab(8)}>DODIC</button>
          <button class="tab" class:active={activeTab===9}  on:click={() => setActiveTab(9)}>EFC</button>
          <button class="tab" class:active={activeTab===10} on:click={() => setActiveTab(10)}>Export</button>
          <button class="tab" class:active={activeTab===11} on:click={() => setActiveTab(11)}>Notes</button>
          <button class="tab" class:active={activeTab===12} on:click={() => setActiveTab(12)}>References</button>
        </div>
      </div>

      <div class="tab-content" style="overflow-y:auto;flex:1;">
        {#if activeTab === 1}
          <TabTaskOrg {config} />
        {:else if activeTab === 2}
          <TabLogistics
            {config} {computed} {rsrValues} {csrByRound} {autoSync} {munKeys} {compositeGroups}
            on:rsrchange={handleRsrChange}
            on:applyrsrdefaults={handleApplyRsrDefaults}
            on:autosyncchange={e => autoSync = e.detail}
            on:csrbyround={handleCsrByRoundChange}
            on:addcustommun={handleAddCustomMun}
            on:removecustommun={handleRemoveCustomMun}
          />
        {:else if activeTab === 3}
          <TabDOS {config} {computed} />
        {:else if activeTab === 4}
          <TabFireMissions {config} {computed} />
        {:else if activeTab === 5}
          <TabPAA {config} {computed} />
        {:else if activeTab === 6}
          <TabReadiness {config} />
        {:else if activeTab === 7}
          <TabCost {config} />
        {:else if activeTab === 8}
          <TabDodic />
        {:else if activeTab === 9}
          <TabEfc {config} />
        {:else if activeTab === 10}
          <TabExport {config} {computed} {rsrValues} {csrByRound} />
        {:else if activeTab === 11}
          <TabNotes />
        {:else if activeTab === 12}
          <TabDoctrine />
        {/if}
      </div>
    </div>
  </div>
</div>
