<script>
  import { onMount } from 'svelte';
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

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_readiness_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.perstatData != null) perstatData = s.perstatData;
        if (s.maintData   != null) maintData   = s.maintData;
      }
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try {
      localStorage.setItem('fars_readiness_v1', JSON.stringify({ perstatData, maintData }));
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
</div>

<!-- PERSTAT -->
<div class="section-title">PERSTAT — Personnel Status</div>
<div style="overflow-x:auto;margin-bottom:24px;">
  <table class="data-table">
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

<!-- MAINTSTAT -->
<div class="section-title">MAINTSTAT — Equipment Status</div>
<div style="overflow-x:auto;margin-bottom:12px;">
  <table class="data-table">
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
<div style="font-size:11px;color:var(--text-dim);">
  Auth quantities pull from sidebar configuration. NMC is auto-calculated (On-Hand − FMC − PMC).
  FMC = Fully Mission Capable · PMC = Partially Mission Capable · NMC = Non-Mission Capable.
</div>
