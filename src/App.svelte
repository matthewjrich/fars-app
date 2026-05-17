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
  import TabGapCrossing from './components/TabGapCrossing.svelte';

  // — Config state (sidebar inputs) —
  let echelon    = 'Battalion';
  let unitType   = 'M109A7';
  let tubes      = 18;
  let truckQty   = 24;
  let trailQty   = 24;
  let catQty     = 18;
  let hmmwvQty   = 18;
  let cclMode    = false;
  let planMode   = 'manual';
  let loadPct    = 25;
  let csrMode    = 'general';
  let generalCsr = 60;
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
    echelon, unitType, isCannon, isM109, isMlrs, isM119,
    tubes,
    truckQty: isM119 ? 0 : truckQty,
    trailQty: isM119 ? 0 : trailQty,
    catQty: isM109 ? catQty : 0,
    hmmwvQty: isM119 ? hmmwvQty : 0,
    cclMode: (isCannon && !isM119) && cclMode,
    planMode, loadPct, csrMode, generalCsr,
    dist, speed, loadTime, planHours, authCsr,
    firingRate, paaGunLine, paaBsa, dudRate, reloadTime,
    customMunitions,
  };

  $: computed = computeValues(config, rsrValues, autoSync);

  $: baseKeys = isM119
    ? Object.keys(MUNITION_105)
    : isCannon
      ? Object.keys(MUNITION_155)
      : Object.keys(MUNITION_ROCKETS);

  $: munKeys = [...baseKeys, ...customMunitions.map(m => m.name)];

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
      bind:echelon bind:unitType bind:tubes
      bind:truckQty bind:trailQty bind:catQty bind:hmmwvQty
      bind:cclMode bind:planMode bind:loadPct
      bind:csrMode bind:generalCsr
      bind:dist bind:speed bind:loadTime bind:planHours
      bind:authCsr bind:firingRate
      bind:paaGunLine bind:paaBsa
      bind:dudRate bind:reloadTime
      {config} {munKeys} {csrByRound}
      {sidebarOpen}
      on:csrbyround={handleCsrByRoundChange}
    />
  </div>

  <div class="main">
    <UnitBanner {config} bind:bannerOpen pillRange={MAX_RANGE[unitType] || '—'} />

    <div class="main-content" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
      <!-- Two-tier tab bar (no page header) -->
      <div class="tabs-wrap">
        <div class="tabs-primary">
          <button class="tab" class:active={activeTab===1}  on:click={() => setActiveTab(1)}>📊 Logistics</button>
          <button class="tab" class:active={activeTab===2}  on:click={() => setActiveTab(2)}>🎯 Fire Missions</button>
          <button class="tab" class:active={activeTab===3}  on:click={() => setActiveTab(3)}>📅 DOS &amp; Resupply</button>
          <button class="tab" class:active={activeTab===4}  on:click={() => setActiveTab(4)}>💰 Training Cost</button>
          <button class="tab" class:active={activeTab===10} on:click={() => setActiveTab(10)}>🌉 Gap Crossing</button>
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
            {config} {computed} {rsrValues} {csrByRound} {autoSync} {munKeys}
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
        {:else if activeTab === 10}
          <TabGapCrossing {config} />
        {/if}
      </div>
    </div>
  </div>
</div>
