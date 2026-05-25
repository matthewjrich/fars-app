<script>
  import { onMount } from 'svelte';
  import { BARREL_LIFE, EFC_TABLE, EFC_TABLE_105 } from '../lib/data.js';
  import { fmt, fmtD } from '../lib/utils.js';

  export let config;
  export let computed;
  export let rsrValues  = {};
  export let csrByRound = {};
  export let munKeys    = [];

  $: v = config;
  $: c = computed;

  // ── Header ──
  let unitDesig = '';
  let now = new Date();
  function refreshTime() { now = new Date(); }

  function dtg(d) {
    const dd  = String(d.getDate()).padStart(2, '0');
    const hh  = String(d.getHours()).padStart(2, '0');
    const mm  = String(d.getMinutes()).padStart(2, '0');
    const mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()];
    return `${dd}${hh}${mm}L ${mon} ${d.getFullYear()}`;
  }

  // ── Readiness data ──
  let perstatData = {};
  let maintData   = {};

  $: perstatElements = v.echelon === 'Battalion'
    ? ['HHB', 'A Battery', 'B Battery', 'C Battery']
    : v.echelon === 'Battery'
      ? ['HQ / FDC', '1st Platoon', '2nd Platoon', '3rd Platoon']
      : ['Section 1', 'Section 2'];

  $: totAssigned  = perstatElements.reduce((a, el) => a + (perstatData[el]?.assigned  || 0), 0);
  $: totPresent   = perstatElements.reduce((a, el) => a + (perstatData[el]?.present   || 0), 0);
  $: totAvailable = perstatElements.reduce((a, el) => a + (perstatData[el]?.available || 0), 0);
  $: pstatPct     = totAssigned > 0 ? Math.round(totAvailable / totAssigned * 100) : 0;

  function buildMaintVehicles(cfg) {
    const veh = [];
    if (cfg.isM109) {
      veh.push({ name: `${cfg.unitType} Paladin`, auth: cfg.tubes });
      if (cfg.catQty > 0) veh.push({ name: 'M992A3 CAT', auth: cfg.catQty });
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

  $: maintVehicles = buildMaintVehicles(v);
  $: maintRows = maintVehicles.map(veh => {
    const d   = maintData[veh.name] || { onHand: veh.auth, fmc: veh.auth, pmc: 0 };
    const nmc = Math.max(0, d.onHand - d.fmc - d.pmc);
    const pct = d.onHand > 0 ? Math.round(d.fmc / d.onHand * 100) : 100;
    return { ...veh, ...d, nmc, pct };
  });
  $: totOnHand   = maintRows.reduce((a, r) => a + r.onHand, 0);
  $: totFmc      = maintRows.reduce((a, r) => a + r.fmc, 0);
  $: totNmc      = maintRows.reduce((a, r) => a + r.nmc, 0);
  $: fleetFmcPct = totOnHand > 0 ? Math.round(totFmc / totOnHand * 100) : 100;

  // ── EFC / Barrel wear ──
  let efcData = {};
  $: efcTableRef = v.isM119 ? EFC_TABLE_105 : EFC_TABLE;
  $: barrelLife  = v.isM119 ? 3000 : (BARREL_LIFE[v.unitType] || 1500);

  function calcGunEfc(entries, table) {
    if (!Array.isArray(entries)) return 0;
    return entries.reduce((s, e, idx) => s + (e.qty || 0) * (table[idx]?.efc || 0), 0);
  }

  $: tubeNums = Array.from({length: v.tubes || 0}, (_, i) => i + 1);
  $: gunWear  = tubeNums.map(i => {
    const efc = calcGunEfc(efcData[i], efcTableRef);
    return { gun: i, efc, pct: barrelLife > 0 ? Math.round(efc / barrelLife * 100) : 0 };
  });
  $: anyEfcData = gunWear.some(g => g.efc > 0);

  function getBatteryGroups(tubes, echelon) {
    if (!tubes) return [];
    if (echelon === 'Battalion') {
      const size = Math.ceil(tubes / 3);
      return ['A Btry', 'B Btry', 'C Btry'].map((name, b) => ({
        name,
        guns: Array.from({length: size}, (_, i) => b * size + i + 1).filter(n => n <= tubes),
      })).filter(g => g.guns.length > 0);
    }
    if (echelon === 'Battery') {
      const size = Math.ceil(tubes / 3);
      return ['1st Plat', '2nd Plat', '3rd Plat'].map((name, p) => ({
        name,
        guns: Array.from({length: size}, (_, i) => p * size + i + 1).filter(n => n <= tubes),
      })).filter(g => g.guns.length > 0);
    }
    return [{ name: 'Section', guns: Array.from({length: tubes}, (_, i) => i + 1) }];
  }

  $: batteryGroups = getBatteryGroups(v.tubes || 0, v.echelon);
  $: batteryWear   = batteryGroups.map(grp => {
    const guns  = grp.guns.map(i => gunWear.find(g => g.gun === i) || { gun: i, efc: 0, pct: 0 });
    const worst = guns.reduce((a, g) => Math.max(a, g.pct), 0);
    return { name: grp.name, worst, guns };
  });

  // ── Ammo status ──
  function munLabel(k) { return k.includes('||') ? k.split('||')[1] : k; }

  $: munStatus = (() => {
    const byLabel = {};
    for (const k of munKeys) {
      const label  = munLabel(k);
      const rsr    = rsrValues[k]  || 0;
      const csrPer = csrByRound[k] || 0;
      const csrTot = csrPer * (v.tubes || 1);
      if (!byLabel[label]) byLabel[label] = { label, rsr: 0, csrTot: 0 };
      byLabel[label].rsr    += rsr;
      byLabel[label].csrTot += csrTot;
    }
    return Object.values(byLabel)
      .map(m => ({ ...m, pct: m.csrTot > 0 ? Math.round(m.rsr / m.csrTot * 100) : null }))
      .filter(m => m.rsr > 0 || m.csrTot > 0);
  })();

  // ── Color helpers ──
  function statusColor(pct) {
    return pct < 70 ? '#ffa198' : pct < 85 ? '#e3b341' : '#3fb950';
  }
  function wearColor(pct) {
    return pct >= 95 ? '#ffa198' : pct >= 80 ? '#e3b341' : pct >= 60 ? '#d29922' : '#3fb950';
  }
  function wearLabel(pct) {
    return pct >= 95 ? 'REPLACE' : pct >= 80 ? 'CAUTION' : pct >= 60 ? 'MONITOR' : 'OK';
  }
  function ammoColor(pct) {
    if (pct === null) return 'var(--text-dim)';
    return pct < 25 ? '#ffa198' : pct < 60 ? '#e3b341' : '#3fb950';
  }
  function ammstatLevel(pct) {
    if (pct === null) return { label: 'UNKN', color: 'var(--text-dim)' };
    if (pct >= 100) return { label: 'FULL', color: '#3fb950' };
    if (pct >= 60)  return { label: 'ADEQ', color: '#3fb950' };
    if (pct >= 25)  return { label: 'LOW',  color: '#e3b341' };
    return { label: 'CRIT', color: '#ffa198' };
  }
  function dosColor(d) {
    return d >= 3 ? '#3fb950' : d >= 1 ? '#e3b341' : '#ffa198';
  }

  // ── Critical Alerts ──
  $: alerts = (() => {
    const a = [];
    if (c.runsNeeded > c.runsPerDay && c.runsNeeded > 0)
      a.push({ sev: 'red',   msg: `RESUPPLY SHORTFALL — Need ${c.runsNeeded} runs/day, organic supports only ${c.runsPerDay}` });
    if (c.dosAvail < 1 && c.dosAvail < 999)
      a.push({ sev: 'red',   msg: `CRITICAL DOS — Less than 1 day of supply remaining` });
    else if (c.dosAvail < 3 && c.dosAvail < 999)
      a.push({ sev: 'amber', msg: `LOW DOS — ${fmtD(c.dosAvail)} days of supply, initiate resupply` });
    munStatus.filter(m => m.pct !== null && m.pct < 25).forEach(m =>
      a.push({ sev: 'red', msg: `LOW AMMO — ${m.label}: ${fmt(m.rsr)} rds (${m.pct}% of auth CSR)` })
    );
    munStatus.filter(m => m.pct !== null && m.pct >= 25 && m.pct < 50).forEach(m =>
      a.push({ sev: 'amber', msg: `AMMO MONITOR — ${m.label}: ${fmt(m.rsr)} rds (${m.pct}% of auth CSR)` })
    );
    munKeys.forEach(k => {
      const rsr = rsrValues[k] || 0;
      const csr = csrByRound[k] || 0;
      if (csr > 0 && rsr > csr * v.tubes)
        a.push({ sev: 'amber', msg: `CSR VIOLATION — ${munLabel(k)}: RSR ${fmt(rsr)} exceeds auth ${fmt(csr * v.tubes)}` });
    });
    if (totNmc >= 3)
      a.push({ sev: 'red',   msg: `${totNmc} vehicles NMC — combat power degraded` });
    else if (totNmc > 0)
      a.push({ sev: 'amber', msg: `${totNmc} vehicle${totNmc > 1 ? 's' : ''} NMC` });
    if (anyEfcData) {
      batteryWear.filter(b => b.worst >= 95).forEach(b =>
        a.push({ sev: 'red',   msg: `BARREL REPLACEMENT REQUIRED — ${b.name}: ${b.worst}% wear` })
      );
      batteryWear.filter(b => b.worst >= 80 && b.worst < 95).forEach(b =>
        a.push({ sev: 'amber', msg: `Barrel wear CAUTION — ${b.name}: ${b.worst}% (${b.guns.filter(g => g.pct >= 80).length} gun${b.guns.filter(g => g.pct >= 80).length > 1 ? 's' : ''})` })
      );
    }
    return a;
  })();

  $: redAlerts   = alerts.filter(a => a.sev === 'red');
  $: amberAlerts = alerts.filter(a => a.sev === 'amber');
  $: shortfall   = c.runsNeeded > c.runsPerDay;

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_readiness_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.perstatData != null) perstatData = s.perstatData;
        if (s.maintData   != null) maintData   = s.maintData;
      }
    } catch (_) {}
    try {
      const efcRaw = localStorage.getItem('fars_efc_v1');
      if (efcRaw) {
        const s = JSON.parse(efcRaw);
        if (s.gunEfc != null) efcData = s.gunEfc;
      }
    } catch (_) {}
    try {
      const sr = localStorage.getItem('fars_sitrep_v1');
      if (sr) {
        const s = JSON.parse(sr);
        if (s.unitDesig != null) unitDesig = s.unitDesig;
      }
    } catch (_) {}
  });

  $: try { localStorage.setItem('fars_sitrep_v1', JSON.stringify({ unitDesig })); } catch (_) {}
</script>

<!-- ── Header ─────────────────────────────────────────────── -->
<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;gap:12px;flex-wrap:wrap;">
  <div style="flex:1;min-width:200px;">
    <input
      type="text"
      bind:value={unitDesig}
      placeholder="Unit designation (e.g. 1-14 FA BN)"
      style="font-size:16px;font-weight:700;font-family:'Share Tech',sans-serif;letter-spacing:1px;
             background:transparent;border:none;border-bottom:1px solid var(--border);
             color:var(--gold);width:100%;padding:2px 0;outline:none;"
    >
    <div style="font-size:11px;color:var(--text-dim);margin-top:3px;">
      {v.echelon} · {v.unitType} · {v.tubes} tubes
    </div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:13px;font-weight:700;font-family:'Share Tech Mono',monospace;color:var(--gold);">
      {dtg(now)}
    </div>
    <button class="btn btn-outline" on:click={refreshTime}
      style="font-size:10px;padding:2px 10px;margin-top:4px;">↻ Update DTG</button>
  </div>
</div>

<!-- ── BLUF Alerts ──────────────────────────────────────────── -->
{#if alerts.length === 0}
  <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;margin-bottom:14px;
    background:rgba(63,185,80,0.1);border:1px solid #3fb950;border-radius:5px;
    font-size:12px;font-weight:700;color:#3fb950;">
    ✓ NO CRITICAL ALERTS — All systems GO
  </div>
{:else}
  <div style="margin-bottom:14px;">
    {#if redAlerts.length > 0}
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#ffa198;margin-bottom:5px;">
        🚨 Critical ({redAlerts.length})
      </div>
      {#each redAlerts as al}
        <div style="display:flex;gap:8px;padding:5px 10px;margin-bottom:3px;
          background:rgba(255,161,152,0.1);border-left:3px solid #ffa198;
          border-radius:0 4px 4px 0;font-size:12px;">
          {al.msg}
        </div>
      {/each}
    {/if}
    {#if amberAlerts.length > 0}
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#e3b341;margin-top:{redAlerts.length > 0 ? 8 : 0}px;margin-bottom:5px;">
        ⚠ Advisory ({amberAlerts.length})
      </div>
      {#each amberAlerts as al}
        <div style="display:flex;gap:8px;padding:5px 10px;margin-bottom:3px;
          background:rgba(227,179,65,0.08);border-left:3px solid #e3b341;
          border-radius:0 4px 4px 0;font-size:12px;">
          {al.msg}
        </div>
      {/each}
    {/if}
  </div>
{/if}

<!-- ── Row 1: Ammo + Logistics ─────────────────────────────── -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">

  <!-- Ammo Status -->
  <div style="background:var(--bg-card);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:6px;padding:12px;">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:10px;">
      Ammunition Status
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
      <div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">DOS</div>
        <div style="font-size:22px;font-weight:700;line-height:1;color:{dosColor(c.dosAvail)};">
          {c.dosAvail >= 999 ? '∞' : fmtD(c.dosAvail)}
        </div>
        <div style="font-size:10px;color:var(--text-dim);">days</div>
      </div>
      <div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">On Hand</div>
        <div style="font-size:22px;font-weight:700;line-height:1;">{fmt(c.totalRoundsCap)}</div>
        <div style="font-size:10px;color:var(--text-dim);">{v.isCannon ? 'rounds' : 'pods'}</div>
      </div>
      <div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Cap Used</div>
        <div style="font-size:22px;font-weight:700;line-height:1;
          color:{c.spatialUtil > 100 ? '#ffa198' : c.spatialUtil > 85 ? '#e3b341' : '#3fb950'};">
          {Math.min(c.spatialUtil, 999).toFixed(0)}%
        </div>
        <div style="font-size:10px;color:var(--text-dim);">capacity</div>
      </div>
    </div>

    {#if munStatus.length > 0}
      <div style="border-top:1px solid var(--border);padding-top:8px;">
        {#each munStatus as m}
          {@const barW = m.pct !== null ? Math.min(m.pct, 100) : 100}
          {@const col  = ammoColor(m.pct)}
          {@const lvl  = ammstatLevel(m.pct)}
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:11px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{m.label}</span>
            <span style="font-size:10px;font-weight:700;color:{lvl.color};background:rgba(0,0,0,0.25);padding:0 5px;border-radius:3px;flex-shrink:0;letter-spacing:0.5px;">{lvl.label}</span>
            <span style="font-size:11px;font-family:'Share Tech Mono',monospace;color:var(--gold);white-space:nowrap;min-width:52px;text-align:right;">{fmt(m.rsr)}</span>
            {#if m.pct !== null}
              <div style="width:50px;height:5px;background:var(--bg-input);border-radius:3px;flex-shrink:0;">
                <div style="height:100%;width:{barW}%;background:{col};border-radius:3px;"></div>
              </div>
              <span style="font-size:11px;font-weight:700;color:{col};width:32px;text-align:right;flex-shrink:0;">{m.pct}%</span>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div style="border-top:1px solid var(--border);padding-top:8px;font-size:11px;color:var(--text-dim);">
        Enter RSR values in the Logistics tab to show on-hand by type.
      </div>
    {/if}
  </div>

  <!-- Logistics -->
  <div style="background:var(--bg-card);border:1px solid var(--border);
    border-top:2px solid {shortfall ? '#ffa198' : '#3fb950'};border-radius:6px;padding:12px;">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:10px;">
      Logistics / Resupply
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Runs Possible</div>
        <div style="font-size:26px;font-weight:700;line-height:1;color:{shortfall ? '#ffa198' : '#3fb950'};">{c.runsPerDay}</div>
        <div style="font-size:10px;color:var(--text-dim);">per day</div>
      </div>
      <div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Runs Needed</div>
        <div style="font-size:26px;font-weight:700;line-height:1;">{c.runsNeeded}</div>
        <div style="font-size:10px;color:var(--text-dim);">per day</div>
      </div>
    </div>
    <div style="border-top:1px solid var(--border);padding-top:8px;font-size:11px;line-height:1.9;color:var(--text-dim);">
      <div>Turnaround: <b style="color:var(--text);">{fmtD(c.totalTurnaround)} hr / run</b></div>
      <div>Daily lift cap: <b style="color:var(--text);">{fmt(c.dailyLiftCap)} {v.isCannon ? 'rds' : 'pods'}</b></div>
      <div>Daily usage: <b style="color:var(--text);">{fmt(Math.round(c.dailyUsage))} {v.isCannon ? 'rds' : 'pods'}</b> ({v.firingRate}% CSR)</div>
    </div>
    <div style="margin-top:8px;padding:5px 10px;border-radius:4px;text-align:center;font-size:12px;font-weight:700;
      background:{shortfall ? 'rgba(255,161,152,0.12)' : 'rgba(63,185,80,0.10)'};
      color:{shortfall ? '#ffa198' : '#3fb950'};
      border:1px solid {shortfall ? '#ffa198' : '#3fb950'};">
      {shortfall ? '⚠ RESUPPLY SHORTFALL' : '✓ RESUPPLY VIABLE'}
    </div>
  </div>
</div>

<!-- ── Row 2: Equipment + Personnel ────────────────────────── -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">

  <!-- Equipment Readiness -->
  <div style="background:var(--bg-card);border:1px solid var(--border);
    border-top:2px solid {statusColor(fleetFmcPct)};border-radius:6px;padding:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);">
        Equipment Readiness
      </div>
      <div style="font-size:15px;font-weight:700;color:{statusColor(fleetFmcPct)};">
        {fleetFmcPct}% FMC
        {#if totNmc > 0}<span style="font-size:11px;color:#ffa198;margin-left:6px;">{totNmc} NMC</span>{/if}
      </div>
    </div>
    {#each maintRows as r}
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;">
        <span style="font-size:11px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{r.name}</span>
        <span style="font-size:11px;color:var(--text-dim);white-space:nowrap;">{r.fmc}/{r.onHand}</span>
        <div style="width:56px;height:6px;background:var(--bg-input);border-radius:3px;flex-shrink:0;overflow:hidden;">
          <div style="height:100%;width:{r.pct}%;background:{statusColor(r.pct)};border-radius:3px;"></div>
        </div>
        <span style="font-size:11px;font-weight:700;color:{statusColor(r.pct)};width:30px;text-align:right;flex-shrink:0;">{r.pct}%</span>
        {#if r.nmc > 0}
          <span style="font-size:10px;font-weight:700;color:#ffa198;flex-shrink:0;">{r.nmc}✗</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Personnel Strength -->
  <div style="background:var(--bg-card);border:1px solid var(--border);
    border-top:2px solid {totAssigned > 0 ? statusColor(pstatPct) : 'var(--border)'};border-radius:6px;padding:12px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);">
        Personnel Strength
      </div>
      {#if totAssigned > 0}
        <div style="font-size:15px;font-weight:700;color:{statusColor(pstatPct)};">
          {pstatPct}% avail
        </div>
      {/if}
    </div>
    {#if totAssigned > 0}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
        <div>
          <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Assigned</div>
          <div style="font-size:22px;font-weight:700;line-height:1;">{totAssigned}</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Present</div>
          <div style="font-size:22px;font-weight:700;line-height:1;">{totPresent}</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;">Available</div>
          <div style="font-size:22px;font-weight:700;line-height:1;color:{statusColor(pstatPct)};">{totAvailable}</div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border);padding-top:8px;">
        {#each perstatElements as el}
          {@const d   = perstatData[el] || { assigned: 0, present: 0, available: 0 }}
          {@const pct = d.assigned > 0 ? Math.round(d.available / d.assigned * 100) : 0}
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
            <span style="font-size:11px;flex:1;">{el}</span>
            <span style="font-size:11px;color:var(--text-dim);">{d.available}/{d.assigned}</span>
            <div style="width:50px;height:5px;background:var(--bg-input);border-radius:3px;flex-shrink:0;overflow:hidden;">
              <div style="height:100%;width:{d.assigned > 0 ? pct : 0}%;background:{statusColor(pct)};border-radius:3px;"></div>
            </div>
            <span style="font-size:11px;font-weight:700;color:{d.assigned > 0 ? statusColor(pct) : 'var(--text-dim)'};width:30px;text-align:right;flex-shrink:0;">
              {d.assigned > 0 ? pct + '%' : '—'}
            </span>
          </div>
        {/each}
      </div>
    {:else}
      <div style="font-size:11px;color:var(--text-dim);">Enter personnel data in the Readiness tab.</div>
    {/if}
  </div>
</div>

<!-- ── Row 3: Barrel Wear (cannon only, if data) ────────────── -->
{#if v.isCannon && anyEfcData}
<div style="background:var(--bg-card);border:1px solid var(--border);border-top:2px solid var(--gold);border-radius:6px;padding:12px;margin-bottom:10px;">
  <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:10px;">
    Barrel Wear — EFC Status ({v.unitType}, life: {barrelLife} EFC)
  </div>
  <div style="display:grid;grid-template-columns:repeat({batteryGroups.length},1fr);gap:10px;">
    {#each batteryWear as bw}
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;">
          <span style="font-size:11px;font-weight:700;">{bw.name}</span>
          <span style="font-size:11px;font-weight:700;color:{wearColor(bw.worst)};
            background:rgba(0,0,0,0.2);padding:1px 6px;border-radius:3px;">
            {wearLabel(bw.worst)}
          </span>
        </div>
        {#each bw.guns as g}
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <span style="font-size:10px;color:var(--text-dim);width:20px;flex-shrink:0;">G{g.gun}</span>
            <div style="flex:1;height:6px;background:var(--bg-input);border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:{Math.min(g.pct,100)}%;background:{wearColor(g.pct)};border-radius:3px;"></div>
            </div>
            <span style="font-size:10px;font-weight:700;color:{wearColor(g.pct)};width:28px;text-align:right;flex-shrink:0;">{g.pct}%</span>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
{/if}

<!-- ── Footer note ──────────────────────────────────────────── -->
<div style="font-size:10px;color:var(--text-dim);border-top:1px solid var(--border);padding-top:8px;line-height:1.6;">
  Data sourced from: Logistics (RSR/CSR) · Readiness (MAINTSTAT/PERSTAT) · EFC (barrel wear). Update source tabs to refresh this view.
  {#if redAlerts.length > 0}
    <span style="color:#ffa198;font-weight:700;margin-left:8px;">● {redAlerts.length} critical item{redAlerts.length > 1 ? 's' : ''} require commander action.</span>
  {/if}
</div>
