<script>
  import { createEventDispatcher } from 'svelte';
  import { MUNITION_155, MUNITION_ROCKETS, MUNITION_105, VEH_COSTS, MLC_DATA, RSR_DEFAULTS } from '../lib/data.js';
  import { getMlcVehiclesForUnit } from '../lib/compute.js';
  import { fmt, fmtD, fmtCurrency, gaugeColor } from '../lib/utils.js';

  export let config;
  export let computed;
  export let rsrValues = {};
  export let csrByRound = {};
  export let autoSync = true;
  export let munKeys = [];
  export let compositeGroups = [];

  const dispatch = createEventDispatcher();

  let expanderOpen = false;

  $: v = config;
  $: c = computed;
  $: pct = Math.min(c.spatialUtil, 100);
  $: fillColor = gaugeColor(pct);

  // Resolve tube count for a munition key (handles Composite compound keys)
  function tubesForKey(k) {
    if (v.unitCategory === 'Composite' && k.includes('||')) {
      const sys = k.split('||')[0];
      return (compositeGroups.find(g => g.unitType === sys) || {}).tubes || v.tubes;
    }
    return v.tubes;
  }

  $: csrAlertHtml = buildCsrAlert();
  function buildCsrAlert() {
    if (v.planMode !== 'manual') return '';
    const setCsrs = munKeys.filter(k => (csrByRound[k] || 0) > 0);
    if (setCsrs.length === 0) return '';
    const violations = setCsrs
      .filter(k => (rsrValues[k] || 0) > (csrByRound[k] || 0) * tubesForKey(k))
      .map(k => {
        const tubes = tubesForKey(k);
        const auth  = ((csrByRound[k] || 0) * tubes).toLocaleString();
        const label = k.includes('||') ? k.split('||')[1] : k;
        return `<div class="alert alert-error">⚠️ CSR VIOLATION: ${label} — RSR ${(rsrValues[k]||0).toLocaleString()} exceeds auth ${auth}</div>`;
      });
    if (violations.length) return violations.join('');
    return `<div class="alert alert-success">✅ ${v.echelon} RSR within all CSR limits.</div>`;
  }

  $: expanderBodyHtml = buildExpanderBody();
  function buildExpanderBody() {
    const rPF = 86;
    let html = '';
    if (v.isM119) {
      const rph = Math.floor(2200 / 68.5);
      html += `▸ HMMWVs: ${v.hmmwvQty} × ~${rph} rds = <b style="color:var(--gold)">${fmt(v.hmmwvQty * rph)} rounds</b><br>`;
      html += `▸ Avg round weight: <b style="color:var(--gold)">~68.5 lbs</b> (complete 105mm round, IAW ATP 3-09.23)<br>`;
      html += `▸ Prime mover: M1097/M1152 HMMWV<br>`;
      html += `▸ FY24 CL IX rate (HMMWV): <b style="color:var(--gold)">$${VEH_COSTS["HMMWV (Series)"].clIX}/mile</b> · Round-trip: ${fmtD(c.distMiles, 1)} miles`;
    } else if (v.isCannon) {
      html += `▸ Flatracks (PLS/trailer): ${v.truckQty + v.trailQty} × ${rPF} = <b style="color:var(--gold)">${fmt(c.totalFlatracks * rPF)} rounds</b><br>`;
      if (v.catQty > 0) html += `▸ CATs: ${v.catQty} × 95 = <b style="color:var(--gold)">${fmt(v.catQty * 95)} rounds</b><br>`;
      if (v.isM109) html += `▸ On-board (M109A7/A6): ${v.tubes} × 39 = <b style="color:var(--gold)">${fmt(v.tubes * 39)} rounds</b><br>`;
      html += `▸ Planning factor: <b style="color:var(--gold)">86 complete rds/flatrack</b> (Army rule of thumb — projectile + propellant + fuze)<br>`;
      html += `▸ FY24 CL IX rate (PLS): <b style="color:var(--gold)">$${VEH_COSTS["PLS M1075 (Truck)"].clIX}/mile</b> · Round-trip: ${fmtD(c.distMiles, 1)} miles`;
    } else {
      const sys = v.isMlrs ? 'MLRS' : 'HIMARS';
      const rate = v.isMlrs ? VEH_COSTS["MLRS (M270A2)"].clIX : VEH_COSTS["HIMARS (M142)"].clIX;
      html += `▸ ${sys}: ${v.tubes} × ${c.podsPerLauncher} pod = <b style="color:var(--gold)">${c.launcherPods}</b><br>`;
      html += `▸ Flatracks: ${c.totalFlatracks} × 4 = <b style="color:var(--gold)">${c.flackPods}</b> | Total: <b style="color:var(--gold)">${c.totalRoundsCap}</b><br>`;
      html += `▸ FY24 CL IX rate (${sys}): <b style="color:var(--gold)">$${rate}/mile</b>`;
    }
    return html;
  }

  // RSR columns for a given system type
  function buildRsrColsForType(ut) {
    if (ut === 'M119A3') return [
      { title: 'HE & RAP',      keys: Object.keys(MUNITION_105).slice(0,3) },
      { title: 'Specialty',     keys: Object.keys(MUNITION_105).slice(3,6) },
      { title: 'Support Items', keys: Object.keys(MUNITION_105).slice(6) },
    ];
    if (ut.includes('M109') || ut.includes('M777')) return [
      { title: 'HE & RAP',      keys: Object.keys(MUNITION_155).slice(0,4) },
      { title: 'Specialty',     keys: Object.keys(MUNITION_155).slice(4,11) },
      { title: 'Support Items', keys: Object.keys(MUNITION_155).slice(11) },
    ];
    return [
      { title: 'Rockets',  keys: Object.keys(MUNITION_ROCKETS).slice(0,7) },
      { title: 'ATACMS',   keys: Object.keys(MUNITION_ROCKETS).slice(7,12) },
      { title: 'PrSM',     keys: Object.keys(MUNITION_ROCKETS).slice(12) },
    ];
  }

  $: rsrCols = buildRsrColsForType(v.unitType);

  function onRsrInput(k, val) {
    dispatch('rsrchange', { key: k, value: parseInt(val) || 0 });
  }

  function onCsrInput(k, val) {
    dispatch('csrbyround', { key: k, value: parseFloat(val) || 0 });
  }

  // Per-round comparison: RSR total vs. CSR × tubes (tube count overridable for Composite)
  function rsrVsCsr(k, tubeOverride) {
    const rsr   = rsrValues[k] || 0;
    const csr   = csrByRound[k] || 0;
    const tubes = tubeOverride != null ? tubeOverride : (v.tubes || 1);
    const auth  = csr * tubes;
    return { rsr, csr, auth, set: csr > 0, exceeds: csr > 0 && rsr > auth };
  }

  // ── Doctrinal RSR defaults (ATP 3-09.23 Table 7-4) ──
  let useDoctrinalRsr = false;
  let docOpType = 'Defense of Position';
  let docLevel  = '1-Heavy';
  let docPhase  = 'first';
  let savedRsrValues = {};

  $: docCaliber   = v.isM119 ? '105mm' : '155mm';
  $: docRate      = RSR_DEFAULTS[docCaliber]?.[docOpType]?.[docLevel]?.[docPhase] ?? 0;
  $: docTotal     = Math.round(docRate * (v.tubes || 0));
  $: primaryHEKey = v.isM119 ? 'A064 M1 (HE)' : 'D529 M795 (HE)';

  // Re-apply whenever selector state changes while the panel is active.
  // Explicitly reference all inputs so Svelte tracks them as reactive dependencies.
  $: if (useDoctrinalRsr && docCaliber && docOpType && docLevel && docPhase) applyDocDefaults();

  // Reset when unit type changes
  let _prevUnitType = '';
  $: if (v.unitType !== _prevUnitType) {
    if (_prevUnitType !== '') { useDoctrinalRsr = false; savedRsrValues = {}; }
    _prevUnitType = v.unitType;
  }

  function handleDocDefaultToggle() {
    if (useDoctrinalRsr) {
      savedRsrValues = { ...rsrValues };
      applyDocDefaults();
    } else {
      dispatch('applyrsrdefaults', { values: { ...savedRsrValues } });
      savedRsrValues = {};
    }
  }

  function applyDocDefaults() {
    if (!useDoctrinalRsr) return;
    const rate  = RSR_DEFAULTS[docCaliber]?.[docOpType]?.[docLevel]?.[docPhase] ?? 0;
    const total = Math.round(rate * (v.tubes || 0));
    const newVals = {};
    munKeys.forEach(k => { newVals[k] = 0; });
    if (total > 0) newVals[primaryHEKey] = total;
    dispatch('applyrsrdefaults', { values: newVals });
  }

  // Custom munition add form
  let showAddForm = false;
  let newMunName  = '';
  let newMunWt    = 0;
  let addError    = '';

  function submitCustomMun() {
    const name = newMunName.trim();
    if (!name) { addError = 'Name is required.'; return; }
    if (munKeys.includes(name)) { addError = 'Name already exists in the munition list.'; return; }
    dispatch('addcustommun', { name, wt: parseFloat(newMunWt) || 0 });
    newMunName = '';
    newMunWt   = 0;
    addError   = '';
    showAddForm = false;
  }

  $: customMuns = (v.customMunitions || []);

  // ── Column MLC ──
  function buildMlcVehicles(cfg, groups) {
    if (cfg.unitCategory === 'Composite' && groups.length > 0) {
      const vehicles = [];
      for (const grp of groups) {
        const ut = grp.unitType;
        if      (ut === 'M109A7') vehicles.push({ name: 'M109A7 Paladin',    qty: grp.tubes, role: 'Gun System' });
        else if (ut === 'M109A6') vehicles.push({ name: 'M109A6 Paladin',    qty: grp.tubes, role: 'Gun System' });
        else if (ut === 'M777A2') vehicles.push({ name: 'M777A2 w/LMTV',     qty: grp.tubes, role: 'Gun System' });
        else if (ut === 'M119A3') vehicles.push({ name: 'M119A3 w/HMMWV',    qty: grp.tubes, role: 'Gun System' });
        else if (ut === 'HIMARS') vehicles.push({ name: 'M142 HIMARS',        qty: grp.tubes, role: 'Launcher'   });
        else if (ut === 'MLRS')   vehicles.push({ name: 'M270A2 MLRS',        qty: grp.tubes, role: 'Launcher'   });
      }
      if (cfg.catQty  > 0) vehicles.push({ name: 'M992A3 CAT (FAASV)',    qty: cfg.catQty,   role: 'Ammo Carrier' });
      if (cfg.truckQty > 0) vehicles.push({ name: 'M1075A1 PLS (loaded)', qty: cfg.truckQty, role: 'Ammo Truck'   });
      if (cfg.trailQty > 0) vehicles.push({ name: 'M1076 Trailer (loaded)', qty: cfg.trailQty, role: 'Ammo Trailer' });
      if (cfg.hmmwvQty > 0) vehicles.push({ name: 'M1097 HMMWV',          qty: cfg.hmmwvQty, role: 'Ammo HMMWV'  });
      return vehicles;
    }
    return getMlcVehiclesForUnit(cfg);
  }

  $: mlcVehicles = buildMlcVehicles(v, compositeGroups);
  $: mlcRows = mlcVehicles.map(uv => {
    const d = MLC_DATA[uv.name];
    if (!d) return { ...uv, mlcW: '?', mlcT: '?', type: '?' };
    return { ...uv, mlcW: d.w ?? '—', mlcT: d.t ?? '—', type: d.type };
  });
  $: columnMlcW = mlcRows.reduce((m, r) => (typeof r.mlcW === 'number' && r.mlcW > m ? r.mlcW : m), 0);
  $: columnMlcT = mlcRows.reduce((m, r) => (typeof r.mlcT === 'number' && r.mlcT > m ? r.mlcT : m), 0);
  $: limitingW = columnMlcW > 0 ? mlcRows.find(r => r.mlcW === columnMlcW) : null;
  $: limitingT = columnMlcT > 0 ? mlcRows.find(r => r.mlcT === columnMlcT) : null;
</script>

<div class="section-title" style="margin-top:8px">
  {v.echelon} Organic Haul Capacity
  {#if v.unitCategory === 'Composite'}<span style="font-weight:400;color:var(--text-dim);font-size:11px;"> — aggregate from roster</span>{/if}
</div>
<div class="metric-grid">
  <div class="metric-card"><div class="metric-label">Total Weight (Lbs)</div><div class="metric-value">{fmt(c.haulLbs)}</div></div>
  <div class="metric-card"><div class="metric-label">Total Weight (STONS)</div><div class="metric-value">{fmtD(c.haulStons)}</div></div>
  <div class="metric-card"><div class="metric-label">{c.capacityLabel}</div><div class="metric-value">{fmt(c.capacityVal)}</div></div>
</div>

<div class="section-title">{v.echelon} Mission Requirements (RSR)</div>
<div class="metric-grid">
  <div class="metric-card"><div class="metric-label">Required Weight</div><div class="metric-value">{fmt(c.reqWeight)} lbs</div></div>
  <div class="metric-card"><div class="metric-label">Requested {v.isCannon ? 'Rounds' : 'Pods'}</div><div class="metric-value">{fmt(c.totalItems)}</div></div>
  <div class="metric-card"><div class="metric-label">Turnaround Time</div><div class="metric-value">{fmtD(c.totalTurnaround)} Hrs</div></div>
  <div class="metric-card"><div class="metric-label">Capacity Utilization</div><div class="metric-value">{fmtD(c.spatialUtil)}%</div></div>
</div>

<div class="section-title">FY24 Resupply Run Cost Estimate <span class="fy-badge">OSMIS FY24</span></div>
<div class="metric-grid">
  <div class="metric-card blue"><div class="metric-label">CL IX / Run</div><div class="metric-value">{fmtCurrency(c.totalRunCost)}</div><div class="metric-sub">Parts cost per resupply run</div></div>
  <div class="metric-card blue"><div class="metric-label">Fuel Cost / Run</div><div class="metric-value">{fmtCurrency(c.totalRunCost * 0.15)}</div><div class="metric-sub">Estimated CL III(B)</div></div>
  <div class="metric-card warn"><div class="metric-label">Daily Run Cost</div><div class="metric-value">{fmtCurrency(c.dailyRunCost)}</div><div class="metric-sub">{c.runsPerDay} runs/day</div></div>
  <div class="metric-card"><div class="metric-label">Miles per Run</div><div class="metric-value">{fmtD(c.distMiles, 1)} mi</div><div class="metric-sub">Round trip distance</div></div>
</div>

<div class="expander">
  <div class="expander-header" on:click={() => expanderOpen = !expanderOpen}>
    <span>📋 Load Configuration &amp; Cost Breakdown</span>
    <span>{expanderOpen ? '▲' : '▼'}</span>
  </div>
  {#if expanderOpen}
    <div class="expander-body">{@html expanderBodyHtml}</div>
  {/if}
</div>

<div style="font-size:11px;color:var(--text-dim);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">Haul Utilization</div>
<div class="gauge-track">
  <div class="gauge-fill" style="width:{pct}%;background:{fillColor}"></div>
  <span class="gauge-pct">{fmtD(pct)}%</span>
</div>
<div class="gauge-labels"><span>0% Empty</span><span>50%</span><span>100% Full</span></div>

{@html csrAlertHtml}
<hr>

{#if v.planMode === 'manual'}

  {#if v.unitCategory === 'Composite' && compositeGroups.length > 0}
    <!-- ── Composite: one RSR section per system ── -->
    {#each compositeGroups as grp}
      {@const grpCols = buildRsrColsForType(grp.unitType)}
      {@const grpIsM109 = grp.unitType.includes('M109')}
      {@const grpIsCannon = grp.unitType.includes('M109') || grp.unitType.includes('M777')}
      <div class="section-title" style="margin-top:12px">
        RSR — {grp.unitType} &nbsp;<span style="font-weight:400;color:var(--text-dim);">({grp.tubes} tubes)</span>
      </div>
      <div class="rsr-grid">
        {#each grpCols as col}
          <div class="rsr-col">
            <h3>{col.title}</h3>
            <div class="rsr-csr-inputs" style="margin-bottom:6px;border-bottom:1px solid var(--border);padding-bottom:5px;">
              <div class="rsr-col-hdr">RSR — Required Supply Rate<br><span style="color:var(--gold);font-size:9px;">Total rounds requested</span></div>
              <div class="rsr-col-hdr" style="color:var(--od-bright);">CSR — Controlled Supply Rate<br><span style="color:var(--gold);font-size:9px;">Rds / system / day (HQ auth)</span></div>
            </div>
            {#each col.keys as rawKey}
              {@const k = `${grp.unitType}||${rawKey}`}
              {@const cmp = rsrVsCsr(k, grp.tubes)}
              <div class="rsr-item">
                <div class="rsr-item-hdr">
                  <label style="margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title={rawKey}>{rawKey}</label>
                  {#if cmp.set}
                    <span class="csr-badge {cmp.exceeds ? 'csr-exceed' : 'csr-ok'}">{cmp.exceeds ? '⚠ EXCEEDS' : '✓ AUTH'}</span>
                  {/if}
                </div>
                <div class="rsr-csr-inputs">
                  <input type="number" class="rsr-input" value={cmp.rsr} min="0"
                    on:input={e => onRsrInput(k, e.target.value)}>
                  <input type="number" class="rsr-input csr-input" value={cmp.csr || ''} min="0" step="0.1"
                    placeholder="—" title="CSR: rounds per system per day"
                    on:input={e => onCsrInput(k, e.target.value)}>
                </div>
                {#if cmp.set}
                  <div class="csr-auth-line">
                    Auth: {cmp.auth.toLocaleString()} rds &nbsp;({cmp.csr} × {grp.tubes} sys)
                    {#if cmp.exceeds}&nbsp;· <span style="color:#ffa198;">+{(cmp.rsr - cmp.auth).toLocaleString()} over</span>{/if}
                  </div>
                {/if}
              </div>
            {/each}
            {#if col.title === 'Support Items' && grpIsCannon && !grp.unitType.includes('M119')}
              <div class="toggle-row" style="margin-top:10px">
                <input type="checkbox" id="autoSync_{grp.unitType}" checked={autoSync}
                  on:change={e => dispatch('autosyncchange', e.target.checked)}>
                <label for="autoSync_{grp.unitType}">Auto-Sync Support Items</label>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}

  {:else}
    <!-- ── Standard single-system RSR ── -->
    <div class="section-title" style="margin-top:8px">
      RSR Input — {v.isM119 ? '105mm Munitions' : v.isCannon ? '155mm Munitions' : 'Rockets & Missiles'}
    </div>

    {#if v.isCannon}
    <div class="doc-defaults-panel" class:doc-active={useDoctrinalRsr}>
      <div class="toggle-row" style="margin-bottom:0;">
        <input type="checkbox" id="useDocDefault" bind:checked={useDoctrinalRsr}
          on:change={handleDocDefaultToggle}>
        <label for="useDocDefault" style="font-weight:600;">
          Use Doctrinal Defaults
          <span style="font-weight:400;color:var(--text-dim);font-size:10px;margin-left:4px;">ATP 3-09.23 Table 7-4</span>
        </label>
      </div>
      {#if useDoctrinalRsr}
        <div class="doc-selectors">
          <div class="field" style="margin:0;">
            <label style="font-size:10px;">Operation Type</label>
            <select bind:value={docOpType} style="font-size:12px;padding:4px 6px;">
              <option>Covering Force</option>
              <option>Defense of Position</option>
              <option>Attack of Position</option>
            </select>
          </div>
          <div class="field" style="margin:0;">
            <label style="font-size:10px;">Level</label>
            <select bind:value={docLevel} style="font-size:12px;padding:4px 6px;">
              <option>1-Heavy</option>
              <option>2-Moderate</option>
              <option>3-Light</option>
            </select>
          </div>
          <div class="field" style="margin:0;">
            <label style="font-size:10px;">Day Phase</label>
            <select bind:value={docPhase} style="font-size:12px;padding:4px 6px;">
              <option value="first">First Day</option>
              <option value="succ">Succeeding Days (2–4)</option>
              <option value="prot">Protracted (6–15)</option>
            </select>
          </div>
        </div>
        <div class="doc-rate-display">
          <span>Doctrinal rate: <b style="color:var(--gold);">{docRate} rds/tube/day</b> × {v.tubes} tubes = <b style="color:var(--gold);">{docTotal.toLocaleString()} rds</b></span>
          <span style="color:var(--text-dim);font-size:10px;">Applied to {primaryHEKey} — uncheck to distribute manually</span>
        </div>
      {/if}
    </div>
    {/if}

    <div class="rsr-grid">
      {#each rsrCols as col}
        <div class="rsr-col">
          <h3>{col.title}</h3>
          <div class="rsr-csr-inputs" style="margin-bottom:6px;border-bottom:1px solid var(--border);padding-bottom:5px;">
            <div class="rsr-col-hdr">RSR — Required Supply Rate<br><span style="color:var(--gold);font-size:9px;">Total rounds requested</span></div>
            <div class="rsr-col-hdr" style="color:var(--od-bright);">CSR — Controlled Supply Rate<br><span style="color:var(--gold);font-size:9px;">Rds / system / day (HQ auth)</span></div>
          </div>
          {#each col.keys as k}
            {@const cmp = rsrVsCsr(k)}
            <div class="rsr-item">
              <div class="rsr-item-hdr">
                <label style="margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title={k}>{k}</label>
                {#if cmp.set}
                  <span class="csr-badge {cmp.exceeds ? 'csr-exceed' : 'csr-ok'}">{cmp.exceeds ? '⚠ EXCEEDS' : '✓ AUTH'}</span>
                {/if}
              </div>
              <div class="rsr-csr-inputs">
                <input type="number" class="rsr-input" value={cmp.rsr} min="0"
                  disabled={useDoctrinalRsr}
                  on:input={e => onRsrInput(k, e.target.value)}>
                <input type="number" class="rsr-input csr-input" value={cmp.csr || ''} min="0" step="0.1"
                  placeholder="—" title="CSR: rounds per system per day"
                  on:input={e => onCsrInput(k, e.target.value)}>
              </div>
              {#if cmp.set}
                <div class="csr-auth-line">
                  Auth: {cmp.auth.toLocaleString()} rds &nbsp;({cmp.csr} × {v.tubes} sys)
                  {#if cmp.exceeds}&nbsp;· <span style="color:#ffa198;">+{(cmp.rsr - cmp.auth).toLocaleString()} over</span>{/if}
                </div>
              {/if}
            </div>
          {/each}
          {#if col.title === 'Support Items' && v.isCannon && !v.isM119}
            <div class="toggle-row" style="margin-top:10px">
              <input type="checkbox" id="autoSync" checked={autoSync}
                on:change={e => dispatch('autosyncchange', e.target.checked)}>
              <label for="autoSync">Auto-Sync Support Items</label>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Custom Ammunition -->
  <div class="section-title" style="margin-top:4px">Custom / Non-Standard Ammunition</div>

  {#if customMuns.length > 0}
    <div class="rsr-grid" style="margin-bottom:10px;">
      <div class="rsr-col">
        <h3>Custom Rounds</h3>
        {#each customMuns as m}
          {@const cmp = rsrVsCsr(m.name)}
          <div class="rsr-item">
            <div class="rsr-item-hdr">
              <label style="margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title={m.name}>{m.name}</label>
              <button style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:14px;padding:0 2px;line-height:1;flex-shrink:0;"
                title="Remove {m.name}"
                on:click={() => dispatch('removecustommun', { name: m.name })}>×</button>
              {#if cmp.set}
                <span class="csr-badge {cmp.exceeds ? 'csr-exceed' : 'csr-ok'}">{cmp.exceeds ? '⚠ EXCEEDS' : '✓ AUTH'}</span>
              {/if}
            </div>
            <div class="rsr-csr-inputs">
              <input type="number" class="rsr-input" value={cmp.rsr} min="0"
                on:input={e => onRsrInput(m.name, e.target.value)}>
              <input type="number" class="rsr-input csr-input" value={cmp.csr || ''} min="0"
                placeholder="—" on:input={e => onCsrInput(m.name, e.target.value)}>
            </div>
            {#if cmp.set}
              <div class="csr-auth-line">Auth: {cmp.auth.toLocaleString()} rds ({cmp.csr} × {v.tubes} sys){#if cmp.exceeds} · <span style="color:#ffa198;">+{(cmp.rsr - cmp.auth).toLocaleString()} over</span>{/if}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if showAddForm}
    <div style="background:var(--bg-card);border:1px solid var(--od-dim);border-radius:6px;padding:14px;margin-bottom:12px;max-width:420px;">
      <div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.8px;">Add Custom Ammunition</div>
      <div class="field">
        <label>Munition Name / Designation</label>
        <input type="text" bind:value={newMunName} placeholder="e.g. XM1234 (New HE-ER)">
      </div>
      <div class="field">
        <label>Round Weight (lbs) — used for haul calc</label>
        <input type="number" bind:value={newMunWt} min="0" placeholder="0 = unknown">
      </div>
      {#if addError}
        <div style="color:#ffa198;font-size:12px;margin-bottom:8px;">⚠ {addError}</div>
      {/if}
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" on:click={submitCustomMun}>Add</button>
        <button class="btn btn-sm" on:click={() => { showAddForm = false; addError = ''; }}>Cancel</button>
      </div>
    </div>
  {:else}
    <button class="btn btn-outline btn-sm" style="margin-bottom:16px;" on:click={() => showAddForm = true}>
      + Add Custom Ammo
    </button>
  {/if}
{/if}

<!-- ── Column MLC Assessment ── -->
<hr style="margin-top:20px;margin-bottom:16px;">
<div class="section-title">Column MLC Assessment</div>
<p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">
  Per FM 5-170 / NATO STANAG 2021. Column MLC equals the highest vehicle classification in the formation — bridges must meet or exceed this rating to cross.
</p>

{#if mlcVehicles.length > 0}
  <div class="metric-grid" style="margin-bottom:12px;">
    <div class="metric-card {columnMlcW >= 30 ? 'warn' : ''}">
      <div class="metric-label">Column MLC (Wheeled)</div>
      <div class="metric-value">{columnMlcW > 0 ? columnMlcW : '—'}</div>
      {#if limitingW}<div class="metric-sub">Limited by: {limitingW.name}</div>{/if}
    </div>
    <div class="metric-card {columnMlcT >= 45 ? 'warn' : ''}">
      <div class="metric-label">Column MLC (Tracked)</div>
      <div class="metric-value">{columnMlcT > 0 ? columnMlcT : '—'}</div>
      {#if limitingT}<div class="metric-sub">Limited by: {limitingT.name}</div>{/if}
    </div>
  </div>

  <table class="data-table" style="margin-bottom:12px;">
    <thead>
      <tr><th>Vehicle</th><th>Role</th><th>Qty</th><th>MLC (W)</th><th>MLC (T)</th><th>Type</th></tr>
    </thead>
    <tbody>
      {#each mlcRows as row}
        <tr>
          <td style="font-size:12px;">{row.name}</td>
          <td style="font-size:11px;color:var(--text-dim);">{row.role}</td>
          <td>{row.qty}</td>
          <td style="color:var(--gold);">{row.mlcW}</td>
          <td style="color:var(--gold);">{row.mlcT}</td>
          <td style="font-size:11px;color:var(--text-dim);">{row.type ?? '—'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div style="font-size:11px;color:var(--text-dim);">
    W = Wheeled classification, T = Tracked. Verify against current engineer bridge data and vehicle TMs for exact combat-loaded weights.
  </div>
{:else}
  <div class="alert alert-info">Configure your unit in the sidebar to see MLC assessment.</div>
{/if}
