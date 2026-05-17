<script>
  import { VEH_COSTS, POL_ITEMS, MRE_COST, UGR_COST, JD_COST, WATER_CASE_COST, CL2_FACTOR, CL8_FACTOR, CL4_WIRE_COST, CL4_CONC_COST, JP8_PER_GAL, DSL_PER_GAL } from '../lib/data.js';
  import { fmt, fmtD, fmtCurrency } from '../lib/utils.js';

  export let config;

  const ECHELON_PAX = { Battalion: 400, Battery: 120, Platoon: 35 };

  // Event info
  let evtUnit  = '';
  let evtName  = '';
  let evtPax   = ECHELON_PAX[config?.echelon] ?? 181;
  let evtStart = '';
  let evtEnd   = '';
  let evtDays  = 10;

  // CL I
  let cl1Mre   = 1;
  let cl1Ugr   = 2;
  let cl1Jd    = 0;
  let cl1Water = 2;

  // CL II
  let cl2Extra = 298;
  let cl2Popo  = 0;

  // CL III(B) + CL IX vehicle rows: qty and miles per vehicle
  const vehNames = Object.keys(VEH_COSTS);
  let vehQty   = Object.fromEntries(vehNames.map(k => [k, 0]));
  let vehMiles = Object.fromEntries(vehNames.map(k => [k, 0]));

  // CL III(P) quantities
  let polQty = POL_ITEMS.map(() => 0);

  // CL IV
  let cl4Wire  = 0;
  let cl4Conc  = 0;
  let cl4Other = 0;

  // CL VIII
  let cl8Extra = 0;

  // ── Computed totals ──
  $: cl1Total = (cl1Mre * MRE_COST + cl1Ugr * UGR_COST + cl1Jd * JD_COST + cl1Water * WATER_CASE_COST) * evtPax * evtDays;

  $: cl2Total = (cl2Extra + cl2Popo) * evtPax;

  $: vehRows = vehNames.map(k => {
    const c = VEH_COSTS[k];
    const miles = vehMiles[k] || 0;
    const qty   = vehQty[k]   || 0;
    const fuelRate = c.fuel === 'JP-8' ? JP8_PER_GAL : DSL_PER_GAL;
    const clIXCost  = qty * miles * c.clIX;
    const fuelCost  = qty * miles * c.gal * fuelRate;
    return { name: k, qty, miles, clIXCost, fuelCost, total: clIXCost + fuelCost };
  });

  $: cl3bTotal = vehRows.reduce((a, r) => a + r.fuelCost, 0);
  $: clIXTotal = vehRows.reduce((a, r) => a + r.clIXCost, 0);

  $: cl3pTotal = POL_ITEMS.reduce((a, item, i) => a + (polQty[i] || 0) * item.cost, 0);

  $: cl4Total = (cl4Wire * CL4_WIRE_COST) + (cl4Conc * CL4_CONC_COST) + (cl4Other);

  $: cl8Total = cl8Extra * evtPax;

  $: grandTotal = cl1Total + cl2Total + cl3bTotal + cl3pTotal + clIXTotal + cl4Total + cl8Total;

  function copyCostLogstat() {
    const lines = [
      `TRAINING EVENT COST ESTIMATE — LOGSTAT`,
      `Unit: ${evtUnit || 'N/A'} | Event: ${evtName || 'N/A'} | PAX: ${evtPax} | Days: ${evtDays}`,
      `Dates: ${evtStart || 'TBD'} – ${evtEnd || 'TBD'}`,
      ``,
      `CL I  (Subsistence):   ${fmtCurrency(cl1Total)}`,
      `CL II (Clothing/Equip):${fmtCurrency(cl2Total)}`,
      `CL III(B) (Bulk Fuel): ${fmtCurrency(cl3bTotal)}`,
      `CL III(P) (POL):       ${fmtCurrency(cl3pTotal)}`,
      `CL IX (Parts):         ${fmtCurrency(clIXTotal)}`,
      `CL IV (Construction):  ${fmtCurrency(cl4Total)}`,
      `CL VIII (Medical):     ${fmtCurrency(cl8Total)}`,
      ``,
      `GRAND TOTAL: ${fmtCurrency(grandTotal)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }

  function resetAll() {
    if (!confirm('Reset all training cost data? This cannot be undone.')) return;
    evtUnit  = '';
    evtName  = '';
    evtPax   = ECHELON_PAX[config?.echelon] ?? 181;
    evtStart = '';
    evtEnd   = '';
    evtDays  = 10;
    cl1Mre   = 1;
    cl1Ugr   = 2;
    cl1Jd    = 0;
    cl1Water = 2;
    cl2Extra = 298;
    cl2Popo  = 0;
    vehQty   = Object.fromEntries(vehNames.map(k => [k, 0]));
    vehMiles = Object.fromEntries(vehNames.map(k => [k, 0]));
    polQty   = POL_ITEMS.map(() => 0);
    cl4Wire  = 0;
    cl4Conc  = 0;
    cl4Other = 0;
    cl8Extra = 0;
  }

  function downloadCostCsv() {
    const rows = [
      ['Class','Item','Qty','Cost'],
      ['CL I','MRE (meals/day/pax)',cl1Mre,fmtCurrency(cl1Mre * MRE_COST * evtPax * evtDays)],
      ['CL I','UGR (meals/day/pax)',cl1Ugr,fmtCurrency(cl1Ugr * UGR_COST * evtPax * evtDays)],
      ['CL I','JD (meals/day/pax)',cl1Jd,fmtCurrency(cl1Jd * JD_COST * evtPax * evtDays)],
      ['CL I','Water (cases/day/pax)',cl1Water,fmtCurrency(cl1Water * WATER_CASE_COST * evtPax * evtDays)],
      ['CL II','Equipment ($/pax)',cl2Extra,fmtCurrency(cl2Extra * evtPax)],
      ['CL II','POPO ($/pax)',cl2Popo,fmtCurrency(cl2Popo * evtPax)],
      ...vehRows.filter(r => r.qty > 0).map(r => ['CL III(B)/IX', r.name, r.qty, fmtCurrency(r.total)]),
      ...POL_ITEMS.map((item, i) => ['CL III(P)', item.name, polQty[i], fmtCurrency((polQty[i]||0)*item.cost)]).filter((_,i)=>polQty[i]>0),
      ['CL IV','Wire (rolls)',cl4Wire,fmtCurrency(cl4Wire*CL4_WIRE_COST)],
      ['CL IV','Concertina (rolls)',cl4Conc,fmtCurrency(cl4Conc*CL4_CONC_COST)],
      ['CL IV','Other CL IV','—',fmtCurrency(cl4Other)],
      ['CL VIII','Medical ($/pax)',cl8Extra,fmtCurrency(cl8Extra*evtPax)],
      ['TOTAL','','',fmtCurrency(grandTotal)],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `cost_estimate_${evtName||'event'}.csv`;
    a.click();
  }
</script>

<div class="section-title">Training Event Cost Estimator</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">FY24 OSMIS rates · Class I–IX estimator for unit training events.</p>

<!-- Event Info -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
  <div class="field"><label>Unit</label><input type="text" bind:value={evtUnit} placeholder="e.g. 1-15 FA"></div>
  <div class="field"><label>Event Name</label><input type="text" bind:value={evtName} placeholder="e.g. EFMB, XCTC"></div>
  <div class="field">
    <label>PAX</label>
    <input type="number" bind:value={evtPax} min="1">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">Default for {config?.echelon || 'Battalion'}: ~{ECHELON_PAX[config?.echelon] ?? 400}</div>
  </div>
  <div class="field"><label>Start Date</label><input type="date" bind:value={evtStart}></div>
  <div class="field"><label>End Date</label><input type="date" bind:value={evtEnd}></div>
  <div class="field"><label>Event Days</label><input type="number" bind:value={evtDays} min="1"></div>
</div>

<hr>

<!-- Grand Total Banner -->
<div style="background:linear-gradient(135deg,#1a2033,#2a1a2a);border:2px solid var(--gold);border-radius:8px;padding:18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
  <div>
    <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px;font-weight:700;">Estimated Grand Total</div>
    <div style="font-size:28px;color:var(--gold);font-family:'Share Tech',sans-serif;font-weight:700;">{fmtCurrency(grandTotal)}</div>
    <div style="font-size:12px;color:var(--text-dim);">{evtPax} PAX · {evtDays} days</div>
  </div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;">
    <button class="btn" on:click={copyCostLogstat}>📋 Copy LOGSTAT</button>
    <button class="btn" on:click={downloadCostCsv}>⬇ Download CSV</button>
    <button class="btn btn-outline" style="color:#ffa198;border-color:#ffa198;" on:click={resetAll}>↺ Reset</button>
  </div>
</div>

<!-- CL I Subsistence -->
<div class="section-title">CL I — Subsistence</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
  <div class="field">
    <label>MRE (meals/pax/day)</label>
    <input type="number" bind:value={cl1Mre} min="0" max="3">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${MRE_COST}/meal → {fmtCurrency(cl1Mre * MRE_COST * evtPax * evtDays)}</div>
  </div>
  <div class="field">
    <label>UGR (meals/pax/day)</label>
    <input type="number" bind:value={cl1Ugr} min="0" max="3">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${UGR_COST}/meal → {fmtCurrency(cl1Ugr * UGR_COST * evtPax * evtDays)}</div>
  </div>
  <div class="field">
    <label>JD (meals/pax/day)</label>
    <input type="number" bind:value={cl1Jd} min="0" max="3">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${JD_COST}/meal → {fmtCurrency(cl1Jd * JD_COST * evtPax * evtDays)}</div>
  </div>
  <div class="field">
    <label>Water (cases/pax/day)</label>
    <input type="number" bind:value={cl1Water} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${WATER_CASE_COST}/case → {fmtCurrency(cl1Water * WATER_CASE_COST * evtPax * evtDays)}</div>
  </div>
</div>
<div class="metric-card" style="margin-bottom:16px;"><div class="metric-label">CL I Total</div><div class="metric-value">{fmtCurrency(cl1Total)}</div></div>

<!-- CL II -->
<div class="section-title">CL II — Clothing &amp; Individual Equipment</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
  <div class="field">
    <label>Equipment Estimate ($/pax)</label>
    <input type="number" bind:value={cl2Extra} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl2Extra * evtPax)}</div>
  </div>
  <div class="field">
    <label>POPO / Miscellaneous ($/pax)</label>
    <input type="number" bind:value={cl2Popo} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl2Popo * evtPax)}</div>
  </div>
</div>
<div class="metric-card" style="margin-bottom:16px;"><div class="metric-label">CL II Total</div><div class="metric-value">{fmtCurrency(cl2Total)}</div></div>

<!-- CL III(B) + CL IX -->
<div class="section-title">CL III(B) Fuel &amp; CL IX Parts — By Vehicle</div>
<div style="overflow-x:auto;margin-bottom:16px;">
  <table class="data-table" style="min-width:700px;">
    <thead>
      <tr>
        <th>Vehicle</th><th>Qty</th><th>Miles</th><th>CL IX Cost</th><th>Fuel Cost</th><th>Total</th>
      </tr>
    </thead>
    <tbody>
      {#each vehNames as k, i}
        <tr class:dim={!vehQty[k]}>
          <td style="font-size:12px;">{k}</td>
          <td><input type="number" value={vehQty[k]} min="0" style="width:60px;"
            on:input={e => vehQty = {...vehQty, [k]: parseInt(e.target.value)||0}}></td>
          <td><input type="number" value={vehMiles[k]} min="0" style="width:70px;"
            on:input={e => vehMiles = {...vehMiles, [k]: parseFloat(e.target.value)||0}}></td>
          <td style="color:var(--gold);">{fmtCurrency(vehRows[i].clIXCost)}</td>
          <td style="color:#4fc3f7;">{fmtCurrency(vehRows[i].fuelCost)}</td>
          <td style="font-weight:700;">{fmtCurrency(vehRows[i].total)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
  <div class="metric-card blue"><div class="metric-label">CL III(B) Fuel Total</div><div class="metric-value">{fmtCurrency(cl3bTotal)}</div></div>
  <div class="metric-card"><div class="metric-label">CL IX Parts Total</div><div class="metric-value">{fmtCurrency(clIXTotal)}</div></div>
</div>

<!-- CL III(P) -->
<div class="section-title">CL III(P) — Packaged POL</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
  {#each POL_ITEMS as item, i}
    <div class="field">
      <label>{item.name} <span style="color:var(--text-dim);">(${item.cost}/unit)</span></label>
      <input type="number" value={polQty[i]} min="0"
        on:input={e => { polQty[i] = parseInt(e.target.value)||0; polQty = [...polQty]; }}>
      <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency((polQty[i]||0)*item.cost)}</div>
    </div>
  {/each}
</div>
<div class="metric-card" style="margin-bottom:16px;"><div class="metric-label">CL III(P) Total</div><div class="metric-value">{fmtCurrency(cl3pTotal)}</div></div>

<!-- CL IV -->
<div class="section-title">CL IV — Construction Material</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
  <div class="field">
    <label>Concertina Wire (rolls, ${CL4_WIRE_COST}/roll)</label>
    <input type="number" bind:value={cl4Wire} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl4Wire*CL4_WIRE_COST)}</div>
  </div>
  <div class="field">
    <label>Concertina Clips (rolls, ${CL4_CONC_COST}/roll)</label>
    <input type="number" bind:value={cl4Conc} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl4Conc*CL4_CONC_COST)}</div>
  </div>
  <div class="field">
    <label>Other CL IV ($)</label>
    <input type="number" bind:value={cl4Other} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl4Other)}</div>
  </div>
</div>
<div class="metric-card" style="margin-bottom:16px;"><div class="metric-label">CL IV Total</div><div class="metric-value">{fmtCurrency(cl4Total)}</div></div>

<!-- CL VIII -->
<div class="section-title">CL VIII — Medical Material</div>
<div style="display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:16px;">
  <div class="field">
    <label>Medical Estimate ($/pax)</label>
    <input type="number" bind:value={cl8Extra} min="0">
    <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">→ {fmtCurrency(cl8Extra * evtPax)}</div>
  </div>
</div>
<div class="metric-card" style="margin-bottom:16px;"><div class="metric-label">CL VIII Total</div><div class="metric-value">{fmtCurrency(cl8Total)}</div></div>

<!-- Summary Table -->
<div class="section-title">Cost Summary</div>
<table class="data-table">
  <thead><tr><th>Class</th><th>Description</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>CL I</td><td>Subsistence ({evtPax} PAX × {evtDays} days)</td><td>{fmtCurrency(cl1Total)}</td></tr>
    <tr><td>CL II</td><td>Clothing &amp; Equipment</td><td>{fmtCurrency(cl2Total)}</td></tr>
    <tr><td>CL III(B)</td><td>Bulk Fuel</td><td>{fmtCurrency(cl3bTotal)}</td></tr>
    <tr><td>CL III(P)</td><td>Packaged POL</td><td>{fmtCurrency(cl3pTotal)}</td></tr>
    <tr><td>CL IX</td><td>Repair Parts (OSMIS FY24)</td><td>{fmtCurrency(clIXTotal)}</td></tr>
    <tr><td>CL IV</td><td>Construction Material</td><td>{fmtCurrency(cl4Total)}</td></tr>
    <tr><td>CL VIII</td><td>Medical Material</td><td>{fmtCurrency(cl8Total)}</td></tr>
    <tr style="font-weight:700;color:var(--gold);border-top:2px solid var(--gold);">
      <td colspan="2">GRAND TOTAL</td><td>{fmtCurrency(grandTotal)}</td>
    </tr>
  </tbody>
</table>

<style>
  .dim td { opacity: 0.4; }
</style>
