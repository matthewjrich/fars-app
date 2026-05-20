<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  /** @type {string} */ export let echelon;
  /** @type {string} */ export let unitType;
  /** @type {number} */ export let tubes;
  /** @type {number} */ export let truckQty;
  /** @type {number} */ export let trailQty;
  /** @type {number} */ export let catQty;
  /** @type {number} */ export let hmmwvQty;
  export let cclMode, planMode, loadPct;
  export let dist, speed, loadTime, planHours;
  export let authCsr, firingRate;
  export let paaGunLine, paaBsa;
  export let dudRate, reloadTime;
  export let config;
  export let sidebarOpen = false;

  $: isM109   = config.isM109;
  $: isM119   = config.isM119;
  $: isCannon = config.isCannon;
  $: isMlrs   = config.isMlrs;

  // ── Accordion state ──
  let open = /** @type {Record<string,boolean>} */({ unit: true, load: false, plan: false, sustain: false, dos: false, paa: false, tac: false });
  function toggle(k) { open = { ...open, [k]: !open[k] }; }

  // ── Unit category ──
  export let unitCategory = 'Cannon (SP)';

  const CATEGORY_SYSTEMS = /** @type {Record<string,string[]>} */({
    'Cannon (SP)': ['M109A7', 'M109A6'],
    'Cannon (T)':  ['M777A2', 'M119A3'],
    'Rocket':      ['HIMARS', 'MLRS'],
  });
  const CATEGORY_DEFAULTS = /** @type {Record<string,string>} */({
    'Cannon (SP)': 'M109A7',
    'Cannon (T)':  'M777A2',
    'Rocket':      'HIMARS',
  });

  function onEchelonChange() {
    onUnitTypeChange();
    dispatch('unitchange');
  }

  function onSystemChange() {
    onUnitTypeChange();
    dispatch('unitchange');
  }

  function onCategoryChange() {
    if (unitCategory === 'Composite') {
      if (echelon === 'Battalion') {
        useRoster = true;
        syncRoster();
      }
      dispatch('unitchange');
    } else {
      useRoster = false;
      unitType = CATEGORY_DEFAULTS[unitCategory];
      onUnitTypeChange();
      dispatch('unitchange');
    }
  }

  // ── Battery Roster ──
  export let useRoster = false;
  export let rosterBatteries = [
    { id: 1, unitType: 'M109A7', tubes: 6 },
    { id: 2, unitType: 'M109A7', tubes: 6 },
    { id: 3, unitType: 'M109A7', tubes: 6 },
  ];
  let nextId = 4;

  // Vehicle counts derived from a single battery
  function batteryVehicles(b) {
    const bIsM109 = b.unitType.includes('M109');
    const bIsM119 = b.unitType === 'M119A3';
    return {
      tubes:    b.tubes,
      trucks:   bIsM119 ? 0 : b.tubes,
      trailers: bIsM119 ? 0 : b.tubes,
      cats:     bIsM109 ? b.tubes : 0,
      hmmwvs:   bIsM119 ? b.tubes : 0,
    };
  }

  // Aggregate roster → push into bound parent props
  function syncRoster() {
    if (!useRoster || echelon !== 'Battalion') return;
    let sumTubes = 0, sumTrucks = 0, sumTrailers = 0, sumCats = 0, sumHmmwvs = 0;
    for (const b of rosterBatteries) {
      const v = batteryVehicles(b);
      sumTubes    += v.tubes;
      sumTrucks   += v.trucks;
      sumTrailers += v.trailers;
      sumCats     += v.cats;
      sumHmmwvs   += v.hmmwvs;
    }
    tubes    = sumTubes;
    truckQty = sumTrucks;
    trailQty = sumTrailers;
    catQty   = sumCats;
    hmmwvQty = sumHmmwvs;
  }

  // Re-sync whenever the roster list changes
  $: { rosterBatteries; if (useRoster) syncRoster(); }

  // When echelon leaves Battalion, turn off roster mode
  $: if (echelon !== 'Battalion') useRoster = false;

  function addBattery() {
    rosterBatteries = [...rosterBatteries, { id: nextId++, unitType: 'M109A7', tubes: 6 }];
    dispatch('rosterchange', rosterBatteries);
  }
  function removeBattery(id) {
    if (rosterBatteries.length <= 1) return;
    rosterBatteries = rosterBatteries.filter(b => b.id !== id);
    dispatch('rosterchange', rosterBatteries);
  }
  function updateBattery(id, field, value) {
    rosterBatteries = rosterBatteries.map(b => b.id === id ? { ...b, [field]: value } : b);
    dispatch('rosterchange', rosterBatteries);
  }

  // Roster summary for display
  $: rosterSummary = (() => {
    const counts = {};
    for (const b of rosterBatteries) {
      counts[b.unitType] = (counts[b.unitType] || 0) + 1;
    }
    return Object.entries(counts).map(([t, n]) => `${n}× ${t}`).join(' + ');
  })();

  $: rosterTotals = rosterBatteries.reduce((acc, b) => {
    const v = batteryVehicles(b);
    return { tubes: acc.tubes + v.tubes, trucks: acc.trucks + v.trucks, trailers: acc.trailers + v.trailers, cats: acc.cats + v.cats, hmmwvs: acc.hmmwvs + v.hmmwvs };
  }, { tubes: 0, trucks: 0, trailers: 0, cats: 0, hmmwvs: 0 });

  // Auto-sync CATs and HMMWVs to tube count (1:1 doctrinal relationship)
  $: if (!useRoster && isM109) catQty   = tubes;
  $: if (!useRoster && isM119) hmmwvQty = tubes;

  // Standard unit type change — skipped when roster is driving config
  function onUnitTypeChange() {
    if (useRoster && echelon === 'Battalion') return;
    if (echelon === 'Battalion') {
      tubes    = isCannon ? 18 : 27;
      catQty   = isM109  ? 18 : 0;
      truckQty = isM119  ? 0  : isCannon ? 18 : 27;
      trailQty = isM119  ? 0  : isCannon ? 18 : 27;
      hmmwvQty = isM119  ? 18 : 0;
    } else if (echelon === 'Battery') {
      tubes    = isCannon ? 6 : 9;
      catQty   = isM109  ? 6 : 0;
      truckQty = isM119  ? 0  : isCannon ? 6 : 9;
      trailQty = isM119  ? 0  : isCannon ? 6 : 9;
      hmmwvQty = isM119  ? 6  : 0;
    } else {
      tubes    = isCannon ? 2 : 3;
      catQty   = isM109  ? 2  : 0;
      truckQty = 0;
      trailQty = 0;
      hmmwvQty = isM119  ? 2  : 0;
    }
  }


</script>

<div class="sidebar-inner" class:open={sidebarOpen}>
  <!-- Logo -->
  <div class="sidebar-logo">
    <div class="sidebar-logo-icon">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <polygon points="20,4 36,36 4,36" fill="none" stroke="#4a6741" stroke-width="2"/>
        <circle cx="20" cy="23" r="5" fill="#e8c96a"/>
      </svg>
    </div>
    <div>
      <div style="color:var(--gold);font-size:16px;font-weight:700;letter-spacing:3px;font-family:'Rajdhani',sans-serif;">FARS</div>
      <div style="color:var(--text-dim);font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;line-height:1.4;">Field Artillery<br>Resource Sync</div>
    </div>
  </div>

  <!-- 1. Echelon & Unit -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.unit} on:click={() => toggle('unit')}>
      <span>Echelon &amp; Unit</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.unit}
    <div class="acc-body">

      <!-- Echelon -->
      <div class="field">
        <label>Echelon</label>
        <select bind:value={echelon} on:change={onEchelonChange}>
          <option>Battalion</option>
          <option>Battery</option>
          <option>Platoon</option>
        </select>
      </div>

      <!-- Unit Type (doctrinal category) -->
      <div class="field">
        <label>Unit Type</label>
        <select bind:value={unitCategory} on:change={onCategoryChange}>
          <option>Composite</option>
          <option>Cannon (T)</option>
          <option>Cannon (SP)</option>
          <option>Rocket</option>
        </select>
      </div>

      <!-- Primary system selector — full list for Composite, sub-list otherwise -->
      {#if unitCategory === 'Composite'}
        <div class="field">
          <label>Primary Ammo System</label>
          <select bind:value={unitType} on:change={onSystemChange}>
            <option>M109A7</option>
            <option>M109A6</option>
            <option>M777A2</option>
            <option>M119A3</option>
            <option>HIMARS</option>
            <option>MLRS</option>
          </select>
          <div class="caption">Drives haul capacity, DODIC &amp; EFC calculations</div>
        </div>
      {:else}
        <div class="field">
          <label>Primary Weapon System</label>
          <select bind:value={unitType} on:change={onSystemChange}>
            {#each CATEGORY_SYSTEMS[unitCategory] as sys}
              <option>{sys}</option>
            {/each}
          </select>
        </div>
      {/if}

      <!-- Non-Standard checkbox (non-Composite Battalion only) -->
      {#if echelon === 'Battalion' && unitCategory !== 'Composite'}
        <div class="toggle-row" style="margin-bottom:10px;">
          <input type="checkbox" id="useRoster" bind:checked={useRoster}
            on:change={() => { if (useRoster) syncRoster(); else onUnitTypeChange(); }}>
          <label for="useRoster" style="color:var(--text-bright);font-weight:700;">Non-Standard Configuration</label>
        </div>
      {/if}

      <!-- Roster builder: Non-Standard OR Composite -->
      {#if echelon === 'Battalion' && useRoster}
        <div style="margin-bottom:10px;">
          {#each rosterBatteries as b (b.id)}
            <div style="display:grid;grid-template-columns:1fr 54px 24px;gap:5px;align-items:center;margin-bottom:5px;">
              <select value={b.unitType}
                on:change={e => updateBattery(b.id, 'unitType', e.target.value)}
                style="font-size:12px;padding:4px 6px;">
                <option>M109A7</option>
                <option>M109A6</option>
                <option>M777A2</option>
                <option>M119A3</option>
                <option>HIMARS</option>
                <option>MLRS</option>
              </select>
              <input type="number" value={b.tubes} min="1" max="18"
                on:input={e => updateBattery(b.id, 'tubes', parseInt(e.target.value) || 1)}
                style="font-size:12px;padding:4px 6px;text-align:center;">
              <button style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:14px;padding:0;line-height:1;"
                on:click={() => removeBattery(b.id)}
                title="Remove battery">×</button>
            </div>
          {/each}
          <button class="btn btn-sm btn-outline" style="margin-top:4px;width:100%;" on:click={addBattery}>
            + Add Battery
          </button>
        </div>

        <div style="background:var(--bg-input);border:1px solid var(--od-dim);border-radius:5px;padding:10px;font-size:11px;line-height:1.9;margin-bottom:8px;">
          <div style="color:var(--text-dim);font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.8px;">Roster: {rosterSummary}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;">
            <span style="color:var(--text-dim);">Total Tubes</span><span style="color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{rosterTotals.tubes}</span>
            <span style="color:var(--text-dim);">PLS Trucks</span><span style="color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{rosterTotals.trucks}</span>
            <span style="color:var(--text-dim);">Trailers</span><span style="color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{rosterTotals.trailers}</span>
            {#if rosterTotals.cats > 0}
              <span style="color:var(--text-dim);">CATs</span><span style="color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{rosterTotals.cats}</span>
            {/if}
            {#if rosterTotals.hmmwvs > 0}
              <span style="color:var(--text-dim);">HMMWVs</span><span style="color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{rosterTotals.hmmwvs}</span>
            {/if}
          </div>
        </div>
        <div class="caption" style="margin-bottom:8px;">Vehicle counts use 1:1 tube ratio. Adjust manually below if needed.</div>
      {/if}

      <!-- Operational counts -->
      <div class="field">
        <label>
          {isM119 ? 'Operational Tubes' : 'Operational Tubes / Launchers'}
          {#if useRoster}<span style="color:var(--od-bright);font-size:9px;"> (roster)</span>{/if}
        </label>
        <input type="number" bind:value={tubes} min="0" readonly={useRoster}
          style={useRoster ? 'opacity:0.6;cursor:default;' : ''}>
      </div>
      {#if !isM119}
        <div class="field">
          <label>
            {isCannon || isMlrs ? 'M1075A1 PLS Trucks' : 'M1120 HEMTT LHS Trucks'}
            {#if useRoster}<span style="color:var(--od-bright);font-size:9px;"> (roster)</span>{/if}
          </label>
          <input type="number" bind:value={truckQty} min="0" readonly={useRoster}
            style={useRoster ? 'opacity:0.6;cursor:default;' : ''}>
        </div>
        <div class="field">
          <label>M1076 Trailers{#if useRoster}<span style="color:var(--od-bright);font-size:9px;"> (roster)</span>{/if}</label>
          <input type="number" bind:value={trailQty} min="0" readonly={useRoster}
            style={useRoster ? 'opacity:0.6;cursor:default;' : ''}>
        </div>
      {/if}
      {#if isM109}
        <div class="field">
          <label>M992A3 CATs (FAASVs){#if useRoster}<span style="color:var(--od-bright);font-size:9px;"> (roster)</span>{/if}</label>
          <input type="number" bind:value={catQty} min="0" readonly={useRoster}
            style={useRoster ? 'opacity:0.6;cursor:default;' : ''}>
        </div>
      {/if}
      {#if isM119}
        <div class="field">
          <label>M1097/M1152 HMMWVs{#if useRoster}<span style="color:var(--od-bright);font-size:9px;"> (roster)</span>{/if}</label>
          <input type="number" bind:value={hmmwvQty} min="0" readonly={useRoster}
            style={useRoster ? 'opacity:0.6;cursor:default;' : ''}>
        </div>
      {/if}
    </div>
    {/if}
  </div>

  <!-- 3. Load Config (cannon only) -->
  {#if isCannon && !isM119}
  <div class="acc-section">
    <div class="acc-header" class:open={open.load} on:click={() => toggle('load')}>
      <span>Load Configuration</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.load}
    <div class="acc-body">
      <div class="toggle-row">
        <input type="checkbox" id="cclMode" bind:checked={cclMode}>
        <label for="cclMode">Combat Configured Loads (CCL)</label>
      </div>
      <div class="caption">Planning factor: 86 complete rds/flatrack (Army rule of thumb)</div>
    </div>
    {/if}
  </div>
  {/if}

  <!-- 4. Planning Mode -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.plan} on:click={() => toggle('plan')}>
      <span>Ammo Entry Mode</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.plan}
    <div class="acc-body">
      <div class="radio-group">
        <label><input type="radio" name="planMode" value="manual" bind:group={planMode}> Manual (Detailed RSR)</label>
        <label><input type="radio" name="planMode" value="daily"  bind:group={planMode}> Daily Load % (Excel Mode)</label>
      </div>
      {#if planMode === 'daily'}
        <div class="field">
          <label>Daily Load % — <span style="color:var(--gold)">{loadPct}</span>%</label>
          <input type="range" bind:value={loadPct} min="0" max="100">
        </div>
      {/if}
    </div>
    {/if}
  </div>

  <!-- 5. Sustainment -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.sustain} on:click={() => toggle('sustain')}>
      <span>Sustainment &amp; Routes</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.sustain}
    <div class="acc-body">
      <div class="field">
        <label>Distance to Supply Point (km)</label>
        <div class="range-row">
          <input type="range" bind:value={dist} min="5" max="150">
          <span class="range-val">{dist}</span>
        </div>
      </div>
      <div class="field">
        <label>Avg Speed (km/h)</label>
        <div class="range-row">
          <input type="range" bind:value={speed} min="10" max="60">
          <span class="range-val">{speed}</span>
        </div>
      </div>
      <div class="field">
        <label>Draw / Loading Time (Hrs)</label>
        <input type="number" bind:value={loadTime} step="0.5" min="0">
      </div>
      <div class="field">
        <label>Available Planning Hours / Day</label>
        <input type="number" bind:value={planHours} min="1" max="24">
      </div>
    </div>
    {/if}
  </div>

  <!-- 7. DOS & Firing Rate -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.dos} on:click={() => toggle('dos')}>
      <span>Firing Rate Assumptions</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.dos}
    <div class="acc-body">
      <div class="field">
        <label>Authorized CSR (rds/tube/day)</label>
        <input type="number" bind:value={authCsr} min="1">
      </div>
      <div class="field">
        <label>Expected Daily Firing Rate (%)</label>
        <div class="range-row">
          <input type="range" bind:value={firingRate} min="0" max="100">
          <span class="range-val">{firingRate}</span>
        </div>
      </div>
    </div>
    {/if}
  </div>

  <!-- 8. PAA Storage -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.paa} on:click={() => toggle('paa')}>
      <span>PAA Storage</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.paa}
    <div class="acc-body">
      <div class="field">
        <label>Gun Line Capacity (rds / tube)</label>
        <input type="number" bind:value={paaGunLine} min="0">
      </div>
      <div class="field">
        <label>BSA Storage Capacity (total rds)</label>
        <input type="number" bind:value={paaBsa} min="0">
      </div>
    </div>
    {/if}
  </div>

  <!-- 9. Tactical Realism -->
  <div class="acc-section">
    <div class="acc-header" class:open={open.tac} on:click={() => toggle('tac')}>
      <span>Friction Factors</span><span class="acc-arrow">▼</span>
    </div>
    {#if open.tac}
    <div class="acc-body">
      <div class="field">
        <label>Dud / Misfire Rate (%)</label>
        <div class="range-row">
          <input type="range" bind:value={dudRate} min="0" max="15" step="1">
          <span class="range-val">{dudRate}</span>
        </div>
      </div>
      {#if !isCannon}
        <div class="field">
          <label>Pod Reload Time (min / launcher)</label>
          <input type="number" bind:value={reloadTime} min="1">
        </div>
      {/if}
    </div>
    {/if}
  </div>
</div>
