<script>
  import { createEventDispatcher } from 'svelte';
  import { MUNITION_155, MUNITION_ROCKETS, MUNITION_105, VEH_COSTS } from '../lib/data.js';
  import { fmt, fmtD, fmtCurrency, gaugeColor } from '../lib/utils.js';

  export let config;
  export let computed;
  export let rsrValues = {};
  export let csrByRound = {};
  export let autoSync = true;
  export let munKeys = [];

  const dispatch = createEventDispatcher();

  let expanderOpen = false;

  $: v = config;
  $: c = computed;
  $: pct = Math.min(c.spatialUtil, 100);
  $: fillColor = gaugeColor(pct);

  $: csrAlertHtml = buildCsrAlert();
  function buildCsrAlert() {
    if (c.currentTotalRsr > v.generalCsr && v.csrMode === 'general') {
      return `<div class="alert alert-error">⚠️ CSR VIOLATION: ${v.echelon} RSR (${fmtD(c.currentTotalRsr)}) exceeds General CSR (${v.generalCsr})</div>`;
    } else if (v.planMode === 'manual' && v.csrMode === 'byRound') {
      let viol = false, ah = '';
      for (const k of munKeys) {
        const limit = csrByRound[k] ?? 100;
        if ((rsrValues[k] || 0) / (v.tubes || 1) > limit) {
          ah += `<div class="alert alert-error">⚠️ CSR VIOLATION: ${k}</div>`;
          viol = true;
        }
      }
      if (!viol) ah = `<div class="alert alert-success">✅ ${v.echelon} RSR within authorized limits.</div>`;
      return ah;
    }
    return `<div class="alert alert-success">✅ ${v.echelon} RSR (${fmtD(c.currentTotalRsr)}) within authorized limits.</div>`;
  }

  $: expanderBodyHtml = buildExpanderBody();
  function buildExpanderBody() {
    const rPF = v.cclMode ? 144 : 160;
    let html = '';
    if (v.isM119) {
      const rph = Math.floor(2200 / 42);
      html += `▸ HMMWVs: ${v.hmmwvQty} × ~${rph} rds = <b style="color:var(--gold)">${fmt(v.hmmwvQty * rph)} rounds</b><br>`;
      html += `▸ Avg round weight: <b style="color:var(--gold)">~42 lbs</b> (complete 105mm cartridge)<br>`;
      html += `▸ Prime mover: M1097/M1152 HMMWV<br>`;
      html += `▸ FY24 CL IX rate (HMMWV): <b style="color:var(--gold)">$${VEH_COSTS["HMMWV (Series)"].clIX}/mile</b> · Round-trip: ${fmtD(c.distMiles, 1)} miles`;
    } else if (v.isCannon) {
      html += `▸ Flatracks: ${v.truckQty + v.trailQty} × ${rPF} = <b style="color:var(--gold)">${fmt(c.totalFlatracks * rPF)} rounds</b><br>`;
      if (v.catQty > 0) html += `▸ CATs: ${v.catQty} × 95 = <b style="color:var(--gold)">${fmt(v.catQty * 95)} rounds</b><br>`;
      html += `▸ Config: <b style="color:var(--gold)">${v.cclMode ? 'CCL' : 'Loose'}</b><br>`;
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

  // RSR input columns
  $: rsrCols = buildRsrCols();
  function buildRsrCols() {
    if (v.isM119) {
      return [
        { title: 'HE & RAP',      keys: Object.keys(MUNITION_105).slice(0,3) },
        { title: 'Specialty',     keys: Object.keys(MUNITION_105).slice(3,6) },
        { title: 'Support Items', keys: Object.keys(MUNITION_105).slice(6) },
      ];
    } else if (v.isCannon) {
      return [
        { title: 'HE & RAP',      keys: Object.keys(MUNITION_155).slice(0,4) },
        { title: 'Specialty',     keys: Object.keys(MUNITION_155).slice(4,11) },
        { title: 'Support Items', keys: Object.keys(MUNITION_155).slice(11) },
      ];
    } else {
      return [
        { title: 'Rockets',  keys: Object.keys(MUNITION_ROCKETS).slice(0,7) },
        { title: 'ATACMS',   keys: Object.keys(MUNITION_ROCKETS).slice(7,12) },
        { title: 'PrSM',     keys: Object.keys(MUNITION_ROCKETS).slice(12) },
      ];
    }
  }

  function onRsrInput(k, val) {
    dispatch('rsrchange', { key: k, value: parseInt(val) || 0 });
  }

  function onCsrInput(k, val) {
    dispatch('csrbyround', { key: k, value: parseFloat(val) || 0 });
  }

  // Per-round comparison: RSR total vs. CSR × tubes
  function rsrVsCsr(k) {
    const rsr  = rsrValues[k] || 0;
    const csr  = csrByRound[k] || 0;
    const auth = csr * (v.tubes || 1);
    return { rsr, csr, auth, set: csr > 0, exceeds: csr > 0 && rsr > auth };
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
</script>

<div class="section-title" style="margin-top:8px">{v.echelon} Organic Haul Capacity</div>
<div class="metric-grid">
  <div class="metric-card"><div class="metric-label">Total Weight (Lbs)</div><div class="metric-value">{fmt(c.haulLbs)}</div></div>
  <div class="metric-card"><div class="metric-label">Total Weight (STONS)</div><div class="metric-value">{fmtD(c.haulStons)}</div></div>
  <div class="metric-card"><div class="metric-label">Total Round Capacity</div><div class="metric-value">{fmt(c.totalRoundsCap)}</div></div>
  <div class="metric-card"><div class="metric-label">{c.capacityLabel}</div><div class="metric-value">{fmtD(c.capacityVal)}</div></div>
</div>

<div class="section-title">{v.echelon} Mission Requirements (RSR)</div>
<div class="metric-grid">
  <div class="metric-card"><div class="metric-label">Required Weight</div><div class="metric-value">{fmt(c.reqWeight)} lbs</div></div>
  <div class="metric-card"><div class="metric-label">Requested {v.isM119 ? 'Rounds' : v.isCannon ? 'Pallets' : 'Pods'}</div><div class="metric-value">{fmt(c.totalItems)}</div></div>
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
  <div class="section-title" style="margin-top:8px">
    RSR Input — {v.isM119 ? '105mm Munitions' : v.isCannon ? '155mm Munitions' : 'Rockets & Missiles'}
  </div>
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
                <span class="csr-badge {cmp.exceeds ? 'csr-exceed' : 'csr-ok'}">
                  {cmp.exceeds ? '⚠ EXCEEDS' : '✓ AUTH'}
                </span>
              {/if}
            </div>
            <div class="rsr-csr-inputs">
              <input type="number" class="rsr-input" value={cmp.rsr} min="0"
                on:input={e => onRsrInput(k, e.target.value)}>
              <input type="number" class="rsr-input csr-input" value={cmp.csr || ''} min="0"
                placeholder="—" title="CSR: rounds per system per day"
                on:input={e => onCsrInput(k, e.target.value)}>
            </div>
            {#if cmp.set}
              <div class="csr-auth-line">
                Auth: {cmp.auth.toLocaleString()} rds &nbsp;({cmp.csr} × {v.tubes} sys)
                {#if cmp.exceeds}
                  &nbsp;· <span style="color:#ffa198;">+{(cmp.rsr - cmp.auth).toLocaleString()} over</span>
                {/if}
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
