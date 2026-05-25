<script>
  import { onMount } from 'svelte';
  import { BARREL_LIFE, EFC_TABLE, EFC_TABLE_105 } from '../lib/data.js';
  export let config;
  $: v = config;
  let _initialized = false;

  // ── PERSTAT ──
  $: perstatElements = v.echelon === 'Battalion'
    ? ['HHB', 'A Battery', 'B Battery', 'C Battery']
    : v.echelon === 'Battery'
      ? ['HQ / FDC', '1st Platoon', '2nd Platoon', '3rd Platoon']
      : ['Section 1', 'Section 2'];

  let perstatData = {};

  function getPstat(el) {
    return perstatData[el] || { assigned: 0, present: 0, available: 0, notes: '' };
  }
  function setPstat(el, field, val) {
    const cur = getPstat(el);
    perstatData = { ...perstatData, [el]: { ...cur, [field]: field === 'notes' ? val : (parseInt(val) || 0) } };
  }

  $: totAssigned  = perstatElements.reduce((a, el) => a + (perstatData[el]?.assigned  || 0), 0);
  $: totPresent   = perstatElements.reduce((a, el) => a + (perstatData[el]?.present   || 0), 0);
  $: totAvailable = perstatElements.reduce((a, el) => a + (perstatData[el]?.available || 0), 0);
  $: pstatPct = totAssigned > 0 ? Math.round(totAvailable / totAssigned * 100) : 0;

  // ── MAINTSTAT ──
  $: maintVehicles = buildMaintVehicles(v);

  function buildMaintVehicles(cfg) {
    const veh = [];
    if (cfg.isM109) {
      veh.push({ name: `${cfg.unitType} Paladin`, auth: cfg.tubes });
      if (cfg.catQty > 0) veh.push({ name: 'M992A3 CAT (FAASV)', auth: cfg.catQty });
    } else if (cfg.isM119) {
      veh.push({ name: 'M119A3', auth: cfg.tubes });
      if (cfg.hmmwvQty > 0) veh.push({ name: 'M1097 HMMWV', auth: cfg.hmmwvQty });
    } else {
      veh.push({ name: cfg.isMlrs ? 'M270A2 MLRS' : 'M142 HIMARS', auth: cfg.tubes });
    }
    if (cfg.truckQty > 0) veh.push({ name: 'M1075A1 PLS', auth: cfg.truckQty });
    if (cfg.trailQty > 0) veh.push({ name: 'M1076 Trailer', auth: cfg.trailQty });
    return veh;
  }

  let maintData = {};

  function getMaint(name, auth) {
    return maintData[name] || { onHand: auth, fmc: auth, pmc: 0 };
  }
  function setMaint(name, field, val, auth) {
    const cur = getMaint(name, auth);
    maintData = { ...maintData, [name]: { ...cur, [field]: parseInt(val) || 0 } };
  }

  $: maintRows = maintVehicles.map(veh => {
    const d = getMaint(veh.name, veh.auth);
    const nmc    = Math.max(0, d.onHand - d.fmc - d.pmc);
    const fmcPct = d.onHand > 0 ? Math.round(d.fmc / d.onHand * 100) : 100;
    return { ...veh, ...d, nmc, fmcPct };
  });

  $: totOnHand    = maintRows.reduce((a, r) => a + r.onHand, 0);
  $: totFmc       = maintRows.reduce((a, r) => a + r.fmc, 0);
  $: totNmc       = maintRows.reduce((a, r) => a + r.nmc, 0);
  $: fleetFmcPct  = totOnHand > 0 ? Math.round(totFmc / totOnHand * 100) : 100;

  function statusColor(pct) {
    return pct < 70 ? '#ffa198' : pct < 85 ? '#e3b341' : '#3fb950';
  }

  // ── Barrel Wear (EFC) ──
  let efcData = {};

  $: efcTableRef = v.isM119 ? EFC_TABLE_105 : EFC_TABLE;
  $: barrelLife  = v.isM119 ? 3000 : (BARREL_LIFE[v.unitType] || 1500);

  function calcGunEfc(entries, table) {
    if (!Array.isArray(entries)) return 0;
    return entries.reduce((sum, e, idx) => sum + (e.qty || 0) * (table[idx]?.efc || 0), 0);
  }

  $: tubeNums = Array.from({length: v.tubes || 0}, (_, i) => i + 1);
  $: barrelWear = tubeNums.map(i => {
    const efc = calcGunEfc(efcData[i], efcTableRef);
    const pct = barrelLife > 0 ? Math.round(efc / barrelLife * 100) : 0;
    return { gun: i, efc, pct, remaining: Math.max(0, barrelLife - efc) };
  });
  $: highestWearPct = barrelWear.reduce((a, g) => Math.max(a, g.pct), 0);
  $: criticalCount  = barrelWear.filter(g => g.pct >= 80).length;
  $: anyEfcData     = barrelWear.some(g => g.efc > 0);

  function wearColor(pct) {
    return pct >= 95 ? '#ffa198' : pct >= 80 ? '#e3b341' : pct >= 60 ? '#d29922' : '#3fb950';
  }
  function wearLabel(pct) {
    return pct >= 95 ? 'REPLACE' : pct >= 80 ? 'CAUTION' : pct >= 60 ? 'MONITOR' : 'OK';
  }

  let echelonMismatch = false;

  function resetPerstat() {
    perstatData = {};
    echelonMismatch = false;
  }

  // ── Fault Log (per NMC vehicle) ──
  let faultLog = {};

  function getFault(name) {
    return faultLog[name] || { fault: '', partsOnOrder: '', eta: '' };
  }
  function setFault(name, field, val) {
    const cur = getFault(name);
    faultLog = { ...faultLog, [name]: { ...cur, [field]: val } };
  }

  let perstatOpen = true;
  let maintOpen   = true;
  let infoOpen    = {};
  function toggleInfo(k, e) { e.stopPropagation(); infoOpen = { ...infoOpen, [k]: !infoOpen[k] }; }

  const INFO = {
    perstat: 'PERSTAT (Personnel Status) tracks assigned, present, and available strength by element. "Available" means fit for duty and capable of performing assigned mission tasks. Update after each roll call or significant personnel change.',
    maint:   'MAINTSTAT (Maintenance Status) tracks vehicle readiness by system type. FMC = Fully Mission Capable (all systems operational). PMC = Partially Mission Capable (some systems degraded but primary mission still possible). NMC = Non-Mission Capable. Auth quantities auto-populate from sidebar configuration.',
  };

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_readiness_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.perstatData != null) perstatData = s.perstatData;
        if (s.maintData   != null) maintData   = s.maintData;
        if (s.faultLog    != null) faultLog    = s.faultLog;
        if (s.echelon != null && s.echelon !== v.echelon) echelonMismatch = true;
      }
    } catch (_) {}
    try {
      const efcRaw = localStorage.getItem('fars_efc_v1');
      if (efcRaw) {
        const s = JSON.parse(efcRaw);
        if (s.gunEfc != null) efcData = s.gunEfc;
      }
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try {
      localStorage.setItem('fars_readiness_v1', JSON.stringify({ perstatData, maintData, faultLog, echelon: v.echelon }));
    } catch (_) {}
  }
</script>

<div class="section-title" style="margin-top:8px;">Unit Readiness — PERSTAT / MAINTSTAT</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Personnel and equipment readiness snapshot. Elements auto-populate from echelon; vehicle auth quantities from sidebar.
</p>

<!-- Summary -->
<div class="metric-grid" style="margin-bottom:20px;">
  <div class="metric-card" style="border-color:{statusColor(pstatPct)};">
    <div class="metric-label">Personnel Readiness</div>
    <div class="metric-value" style="color:{statusColor(pstatPct)};">{pstatPct}%</div>
    <div class="metric-sub">{totAvailable} / {totAssigned} available</div>
  </div>
  <div class="metric-card" style="border-color:{statusColor(fleetFmcPct)};">
    <div class="metric-label">Fleet FMC Rate</div>
    <div class="metric-value" style="color:{statusColor(fleetFmcPct)};">{fleetFmcPct}%</div>
    <div class="metric-sub">{totFmc} / {totOnHand} FMC</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Strength Present</div>
    <div class="metric-value">{totPresent}</div>
    <div class="metric-sub">of {totAssigned} assigned</div>
  </div>
  <div class="metric-card {totNmc > 0 ? 'warn' : ''}">
    <div class="metric-label">Vehicles NMC</div>
    <div class="metric-value">{totNmc}</div>
    <div class="metric-sub">Non-mission capable</div>
  </div>
  {#if v.isCannon && anyEfcData}
  <div class="metric-card" style="border-color:{wearColor(highestWearPct)};">
    <div class="metric-label">Highest Barrel Wear</div>
    <div class="metric-value" style="color:{wearColor(highestWearPct)};">{highestWearPct}%</div>
    <div class="metric-sub">{criticalCount > 0 ? `${criticalCount} gun${criticalCount > 1 ? 's' : ''} at CAUTION/REPLACE` : 'All barrels OK'}</div>
  </div>
  {/if}
</div>

<!-- Echelon mismatch warning -->
{#if echelonMismatch}
  <div style="background:rgba(227,179,65,0.1);border:1px solid #e3b341;border-radius:5px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;flex-wrap:wrap;">
    <span style="color:#e3b341;font-weight:700;">⚠ Echelon changed — saved PERSTAT data was recorded for a different element structure and may not reflect the current configuration.</span>
    <button class="btn btn-sm" style="color:#ffa198;border-color:#ffa198;flex-shrink:0;" on:click={resetPerstat}>Reset PERSTAT</button>
  </div>
{/if}

<!-- PERSTAT -->
<div class="expander" style="margin-bottom:8px;">
  <div class="expander-header" on:click={() => perstatOpen = !perstatOpen}>
    <span>PERSTAT — Personnel Status</span>
    <button class="info-btn" on:click={e => toggleInfo('perstat', e)}>ⓘ</button>
    <span>{perstatOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.perstat}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.perstat}</div>
  {/if}
  {#if perstatOpen}
  <div class="expander-body" style="padding:0;">
    <div style="overflow-x:auto;">
      <table class="data-table" style="margin:0;border-radius:0;">
        <thead>
          <tr>
            <th>Element</th>
            <th>Assigned</th>
            <th>Present</th>
            <th>Available</th>
            <th>Avail %</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each perstatElements as el}
            {@const d = getPstat(el)}
            {@const pct = d.assigned > 0 ? Math.round(d.available / d.assigned * 100) : 0}
            <tr>
              <td style="font-weight:700;color:var(--gold);white-space:nowrap;">{el}</td>
              <td>
                <input type="number" value={d.assigned} min="0" style="width:65px;"
                  on:input={e => setPstat(el, 'assigned', e.target.value)}>
              </td>
              <td>
                <input type="number" value={d.present} min="0" style="width:65px;"
                  on:input={e => setPstat(el, 'present', e.target.value)}>
              </td>
              <td>
                <input type="number" value={d.available} min="0" style="width:65px;"
                  on:input={e => setPstat(el, 'available', e.target.value)}>
              </td>
              <td style="font-weight:700;color:{statusColor(pct)};">{d.assigned > 0 ? pct + '%' : '—'}</td>
              <td>
                <input type="text" value={d.notes} style="width:100%;min-width:140px;"
                  placeholder="e.g. 2x sick, 1x det"
                  on:input={e => setPstat(el, 'notes', e.target.value)}>
              </td>
            </tr>
          {/each}
          <tr style="font-weight:700;border-top:2px solid var(--gold);color:var(--gold);">
            <td>TOTAL</td>
            <td>{totAssigned}</td>
            <td>{totPresent}</td>
            <td>{totAvailable}</td>
            <td style="color:{statusColor(pstatPct)};">{totAssigned > 0 ? pstatPct + '%' : '—'}</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  {/if}
</div>

<!-- MAINTSTAT -->
<div class="expander" style="margin-bottom:8px;">
  <div class="expander-header" on:click={() => maintOpen = !maintOpen}>
    <span>MAINTSTAT — Equipment Status</span>
    <button class="info-btn" on:click={e => toggleInfo('maint', e)}>ⓘ</button>
    <span>{maintOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.maint}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.maint}</div>
  {/if}
  {#if maintOpen}
  <div class="expander-body" style="padding:0;">
    <div style="overflow-x:auto;">
      <table class="data-table" style="margin:0;border-radius:0;">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Auth</th>
            <th>On-Hand</th>
            <th>FMC</th>
            <th>PMC</th>
            <th>NMC</th>
            <th>FMC %</th>
          </tr>
        </thead>
        <tbody>
          {#each maintVehicles as veh}
            {@const d = getMaint(veh.name, veh.auth)}
            {@const nmc = Math.max(0, d.onHand - d.fmc - d.pmc)}
            {@const fmcPct = d.onHand > 0 ? Math.round(d.fmc / d.onHand * 100) : 100}
            <tr>
              <td style="font-size:12px;white-space:nowrap;">{veh.name}</td>
              <td style="color:var(--text-dim);">{veh.auth}</td>
              <td>
                <input type="number" value={d.onHand} min="0" style="width:58px;"
                  on:input={e => setMaint(veh.name, 'onHand', e.target.value, veh.auth)}>
              </td>
              <td>
                <input type="number" value={d.fmc} min="0" style="width:58px;"
                  on:input={e => setMaint(veh.name, 'fmc', e.target.value, veh.auth)}>
              </td>
              <td>
                <input type="number" value={d.pmc} min="0" style="width:58px;"
                  on:input={e => setMaint(veh.name, 'pmc', e.target.value, veh.auth)}>
              </td>
              <td style="font-weight:700;color:{nmc > 0 ? '#ffa198' : 'var(--text-dim)'};">{nmc}</td>
              <td style="font-weight:700;color:{statusColor(fmcPct)};">{fmcPct}%</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-dim);">
      Auth quantities pull from sidebar configuration. NMC is auto-calculated (On-Hand − FMC − PMC).
      FMC = Fully Mission Capable · PMC = Partially Mission Capable · NMC = Non-Mission Capable.
    </div>
    {#if maintRows.some(r => r.nmc > 0)}
    <div style="padding:10px 14px;border-top:1px solid var(--border);">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#ffa198;margin-bottom:8px;">NMC Fault Log</div>
      {#each maintRows.filter(r => r.nmc > 0) as veh}
        {@const f = getFault(veh.name)}
        <div style="margin-bottom:10px;background:rgba(255,161,152,0.05);border:1px solid rgba(255,161,152,0.2);border-radius:5px;padding:8px 10px;">
          <div style="font-size:12px;font-weight:700;color:#ffa198;margin-bottom:6px;">{veh.name} — {veh.nmc} NMC</div>
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;">
            <div class="field" style="margin:0;">
              <label style="font-size:10px;">Fault Description</label>
              <input type="text" value={f.fault} placeholder="e.g. MG mount damaged, fuel leak"
                style="font-size:12px;" on:input={e => setFault(veh.name, 'fault', e.target.value)}>
            </div>
            <div class="field" style="margin:0;">
              <label style="font-size:10px;">Parts on Order (NSN)</label>
              <input type="text" value={f.partsOnOrder} placeholder="NSN or TBD"
                style="font-size:12px;" on:input={e => setFault(veh.name, 'partsOnOrder', e.target.value)}>
            </div>
            <div class="field" style="margin:0;">
              <label style="font-size:10px;">ETA</label>
              <input type="text" value={f.eta} placeholder="e.g. D+3, TBD"
                style="font-size:12px;" on:input={e => setFault(veh.name, 'eta', e.target.value)}>
            </div>
          </div>
        </div>
      {/each}
    </div>
    {/if}
  </div>
  {/if}
</div>

<!-- Barrel Wear (EFC) — cannon systems only -->
{#if v.isCannon}
<div class="section-title" style="margin-top:24px;">Barrel Wear — EFC Status</div>
{#if !anyEfcData}
  <div class="alert alert-info" style="font-size:12px;">
    No EFC data found. Enter rounds fired per gun in the <b>EFC</b> tab to track barrel wear here.
  </div>
{:else}
  {#if criticalCount > 0}
    <div class="alert {highestWearPct >= 95 ? 'alert-error' : 'alert-warn'}" style="font-size:12px;margin-bottom:12px;">
      {highestWearPct >= 95 ? '🚨' : '⚠️'} {criticalCount} gun{criticalCount > 1 ? 's' : ''} at or above 80% barrel life — verify serviceability before live fire.
    </div>
  {/if}
  <div style="overflow-x:auto;margin-bottom:8px;">
    <table class="data-table">
      <thead>
        <tr>
          <th>Gun #</th>
          <th>EFC Accumulated</th>
          <th>Barrel Life</th>
          <th>Wear %</th>
          <th>Remaining</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each barrelWear as g}
          <tr>
            <td style="font-weight:700;color:var(--gold);">Gun {g.gun}</td>
            <td style="font-family:'Share Tech Mono',monospace;">{g.efc.toFixed(1)}</td>
            <td style="color:var(--text-dim);">{barrelLife}</td>
            <td>
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="flex:1;height:6px;background:var(--bg-input);border-radius:3px;min-width:60px;">
                  <div style="height:100%;width:{Math.min(g.pct,100)}%;background:{wearColor(g.pct)};border-radius:3px;"></div>
                </div>
                <span style="font-weight:700;color:{wearColor(g.pct)};min-width:34px;">{g.pct}%</span>
              </div>
            </td>
            <td style="font-family:'Share Tech Mono',monospace;color:{g.remaining < barrelLife*0.1 ? '#ffa198' : 'inherit'};">{g.remaining.toFixed(1)}</td>
            <td style="font-weight:700;color:{wearColor(g.pct)};">{wearLabel(g.pct)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div style="font-size:11px;color:var(--text-dim);">
    Barrel life: {v.unitType} = {barrelLife} EFC.
    Status thresholds — OK: &lt;60% · MONITOR: 60–79% · CAUTION: 80–94% · REPLACE: ≥95%.
    EFC data sourced from the EFC tab. Update rounds fired there to keep wear current.
  </div>
{/if}
{/if}
