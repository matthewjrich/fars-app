<script>
  import { computeValues } from './lib/compute.js';
  import { MUNITION_155, MUNITION_ROCKETS, MUNITION_105 } from './lib/data.js';
  import Sidebar from './components/Sidebar.svelte';
  import UnitBanner from './components/UnitBanner.svelte';
  import TabLogistics from './components/TabLogistics.svelte';
  import TabFireMissions from './components/TabFireMissions.svelte';
  import TabDOS from './components/TabDOS.svelte';
  import TabCost from './components/TabCost.svelte';
  import TabPAA from './components/TabPAA.svelte';
  import TabDodic from './components/TabDodic.svelte';
  import TabEfc from './components/TabEfc.svelte';
  import TabExport from './components/TabExport.svelte';
  import TabTaskOrg from './components/TabTaskOrg.svelte';

  // — Config state (sidebar inputs) —
  let echelon      = 'Battalion';
  let unitType     = 'M109A7';
  let unitCategory = 'Cannon (SP)';
  let tubes        = 18;
  let truckQty   = 24;
  let trailQty   = 24;
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
  let bannerOpen = false;
  let sidebarOpen = false;

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

  // Reset RSR/CSR when unit type changes
  $: {
    unitType;
    rsrValues = {};
    csrByRound = {};
  }

  function handleRsrChange(e) {
    rsrValues = { ...rsrValues, [e.detail.key]: e.detail.value };
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
    <UnitBanner {config} bind:bannerOpen pillRange={MAX_RANGE[unitType] || '—'} />

    <div class="main-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
      <!-- Two-tier tab bar (no page header) -->
      <div class="tabs-wrap">
        <div class="tabs-primary">
          <button class="tab" class:active={activeTab===8}  on:click={() => setActiveTab(8)}>🗂 Task Org</button>
          <button class="tab" class:active={activeTab===1}  on:click={() => setActiveTab(1)}>📊 Logistics</button>
          <button class="tab" class:active={activeTab===2}  on:click={() => setActiveTab(2)}>🎯 Fire Missions</button>
          <button class="tab" class:active={activeTab===3}  on:click={() => setActiveTab(3)}>📅 DOS &amp; Resupply</button>
          <button class="tab" class:active={activeTab===4}  on:click={() => setActiveTab(4)}>💰 Training Cost</button>
        </div>
        <div class="tabs-secondary">
          <span class="tabs-ref-label">Tools &amp; Ref</span>
          <button class="tab" class:active={activeTab===5}  on:click={() => setActiveTab(5)}>PAA &amp; Storage</button>
          <button class="tab" class:active={activeTab===6}  on:click={() => setActiveTab(6)}>DODIC</button>
          <button class="tab" class:active={activeTab===7}  on:click={() => setActiveTab(7)}>EFC</button>
          <button class="tab" class:active={activeTab===9}  on:click={() => setActiveTab(9)}>Export</button>
        </div>
      </div>

      <div class="tab-content" style="overflow-y:auto;flex:1;">
        {#if activeTab === 1}
          <TabLogistics
            {config} {computed} {rsrValues} {csrByRound} {autoSync} {munKeys} {compositeGroups}
            on:rsrchange={handleRsrChange}
            on:autosyncchange={e => autoSync = e.detail}
            on:csrbyround={handleCsrByRoundChange}
            on:addcustommun={handleAddCustomMun}
            on:removecustommun={handleRemoveCustomMun}
          />
        {:else if activeTab === 2}
          <TabFireMissions {config} {computed} />
        {:else if activeTab === 3}
          <TabDOS {config} {computed} />
        {:else if activeTab === 4}
          <TabCost />
        {:else if activeTab === 5}
          <TabPAA {config} {computed} />
        {:else if activeTab === 6}
          <TabDodic />
        {:else if activeTab === 7}
          <TabEfc {config} />
        {:else if activeTab === 9}
          <TabExport {config} {computed} {rsrValues} {csrByRound} />
        {:else if activeTab === 8}
          <TabTaskOrg {config} />
        {/if}
      </div>
    </div>
  </div>
</div>
