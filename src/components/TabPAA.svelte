<script>
  import { NEW_LBS } from '../lib/data.js';
  import { fmt, fmtD, gaugeColor } from '../lib/utils.js';

  // Q-D hazard classification and K-factors (DA Pam 385-64 Table 2-1)
  const QD_HAZARD = {
    '155mm HE':           { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '155mm RAP':          { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '155mm DPICM':        { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '155mm WP/SMK':       { hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
    '155mm EXCAL':        { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '155mm ILLUM':        { hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
    '105mm HE':           { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '105mm RAP':          { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    '105mm ILLUM':        { hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
    '105mm WP/SMK':       { hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
    'GMLRS Pod':          { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    'ATACMS':             { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 },
    'Propellant Charge L':{ hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
    'Propellant Charge H':{ hd:'1.3', k_ibd:900,  k_ptr:375, k_ild:75  },
  };

  export let config;
  export let computed;

  $: v = config;
  $: c = computed;

  $: gunLineCap  = v.paaGunLine * v.tubes;
  $: bsaCap      = v.paaBsa;
  $: totalPaaCap = gunLineCap + bsaCap;

  $: gunLineUtil = gunLineCap > 0 ? Math.min((c.effectiveRounds / gunLineCap) * 100, 200) : 0;
  $: bsaUtil     = bsaCap    > 0 ? Math.min((c.effectiveRounds / bsaCap)     * 100, 200) : 0;

  $: gunLineColor = gaugeColor(Math.min(gunLineUtil, 100));
  $: bsaColor     = gaugeColor(Math.min(bsaUtil, 100));

  // NEW reference — filter to relevant system
  $: newRows = Object.entries(NEW_LBS).filter(([k]) => {
    if (v.isM119)  return k.startsWith('105mm');
    if (v.isCannon) return k.startsWith('155mm') || k.startsWith('Propellant');
    return k.includes('GMLRS') || k.includes('ATACMS');
  });

  // Q-D Arc Calculator state
  let qdOpen = false;
  let qdMun = '';
  let qdQty = 1;

  $: qdOptions = newRows.map(([k]) => k);
  $: { if (qdOptions.length > 0 && !qdOptions.includes(qdMun)) qdMun = qdOptions[0]; }
  $: qdNewPerRound = NEW_LBS[qdMun] || 0;
  $: qdTotalNew    = qdNewPerRound * Math.max(1, qdQty || 1);
  $: qdH           = QD_HAZARD[qdMun] || { hd:'1.1', k_ibd:1250, k_ptr:600, k_ild:200 };
  $: qdCbrt        = Math.cbrt(qdTotalNew);
  $: qdIbd_ft      = Math.round(qdH.k_ibd * qdCbrt);
  $: qdPtr_ft      = Math.round(qdH.k_ptr * qdCbrt);
  $: qdIld_ft      = Math.max(50, Math.round(qdH.k_ild * qdCbrt));
  $: qdIbd_m       = Math.round(qdIbd_ft * 0.3048);
  $: qdPtr_m       = Math.round(qdPtr_ft * 0.3048);
  $: qdIld_m       = Math.round(qdIld_ft * 0.3048);
</script>

<div class="section-title">PAA Storage &amp; Distribution</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Position Area for Artillery storage capacity vs. effective rounds on hand.</p>

<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-label">Gun Line Capacity</div>
    <div class="metric-value">{fmt(gunLineCap)}</div>
    <div class="metric-sub">{v.paaGunLine} rds/tube × {v.tubes} tubes</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">BSA Storage Capacity</div>
    <div class="metric-value">{fmt(bsaCap)}</div>
    <div class="metric-sub">Total rounds</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Total PAA Capacity</div>
    <div class="metric-value">{fmt(totalPaaCap)}</div>
    <div class="metric-sub">Gun line + BSA</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Effective Rounds on Hand</div>
    <div class="metric-value">{fmt(c.effectiveRounds)}</div>
    <div class="metric-sub">After {v.dudRate}% dud/misfire</div>
  </div>
</div>

<!-- Gun Line Utilization -->
<div style="margin-bottom:20px;">
  <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.8px;font-weight:700;margin-bottom:8px">Gun Line Utilization</div>
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
    <span>Rounds vs. Gun Line Capacity ({fmt(gunLineCap)} rds)</span>
    <span style="color:var(--gold);font-weight:700;font-family:'Share Tech',sans-serif">{fmtD(gunLineUtil)}%</span>
  </div>
  <div class="gauge-track">
    <div class="gauge-fill" style="width:{Math.min(gunLineUtil,100)}%;background:{gunLineColor}"></div>
    <span class="gauge-pct">{fmtD(Math.min(gunLineUtil,100))}%</span>
  </div>
  <div class="gauge-labels"><span>0% Empty</span><span>50%</span><span>100% Full</span></div>
</div>

<!-- BSA Utilization -->
<div style="margin-bottom:20px;">
  <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.8px;font-weight:700;margin-bottom:8px">BSA Utilization</div>
  <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
    <span>Rounds vs. BSA Capacity ({fmt(bsaCap)} rds)</span>
    <span style="color:var(--gold);font-weight:700;font-family:'Share Tech',sans-serif">{fmtD(bsaUtil)}%</span>
  </div>
  <div class="gauge-track">
    <div class="gauge-fill" style="width:{Math.min(bsaUtil,100)}%;background:{bsaColor}"></div>
    <span class="gauge-pct">{fmtD(Math.min(bsaUtil,100))}%</span>
  </div>
  <div class="gauge-labels"><span>0% Empty</span><span>50%</span><span>100% Full</span></div>
</div>

{#if c.effectiveRounds > totalPaaCap}
  <div class="alert alert-error">⚠️ OVERFLOW: Effective rounds ({fmt(c.effectiveRounds)}) exceed total PAA storage capacity ({fmt(totalPaaCap)}).</div>
{:else if c.effectiveRounds > gunLineCap}
  <div class="alert alert-warn">⚠️ Gun line at capacity. {fmt(c.effectiveRounds - gunLineCap)} rds require BSA storage.</div>
{:else}
  <div class="alert alert-success">✅ Rounds fit within gun line storage capacity.</div>
{/if}

<!-- NEW Reference Table -->
<div class="section-title" style="margin-top:20px;">Net Explosive Weight (NEW) Reference</div>
<p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">NEW values per round/pod — used for explosive site plan, Q-D arcs, and storage calculations (DA Pam 385-64).</p>
<table class="data-table">
  <thead>
    <tr><th>Munition Type</th><th>NEW (lbs)</th><th>Notes</th></tr>
  </thead>
  <tbody>
    {#each newRows as [name, wt]}
      <tr>
        <td>{name}</td>
        <td style="color:var(--gold);font-family:'Share Tech',sans-serif;">{wt}</td>
        <td style="font-size:11px;color:var(--text-dim);">lbs NEW per unit</td>
      </tr>
    {/each}
  </tbody>
</table>

<div class="alert alert-info" style="margin-top:16px;">
  ℹ️ <b>Storage Note:</b> Q-D arcs and compatible groups determine physical separation requirements. Consult DA Pam 385-64 and installation SOP for magazine construction standards. CCL configuration reduces handling time but does not change Q-D requirements.
</div>

<div class="expander" style="margin-top:16px;">
  <div class="expander-header" on:click={() => qdOpen = !qdOpen}>
    <span>Q-D Arc Calculator — DA Pam 385-64</span>
    <span>{qdOpen ? '▲' : '▼'}</span>
  </div>
  {#if qdOpen}
  <div class="expander-body">
    <p style="font-size:12px;color:var(--text-dim);margin-bottom:14px;">
      Quantity-Distance arcs by munition type and quantity. Formula: D = K × NEW<sup>1/3</sup>.
      HD 1.1 = mass detonating (HE, DPICM, rockets) · HD 1.3 = mass fire (WP, ILLUM, propellant).
    </p>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;align-items:end;margin-bottom:16px;">
      <div class="field">
        <label>Munition Type</label>
        <select bind:value={qdMun}>
          {#each qdOptions as opt}
            <option>{opt}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <label>Quantity (rounds / pods)</label>
        <input type="number" bind:value={qdQty} min="1">
      </div>
      <div style="padding-bottom:8px;">
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px;">HD {qdH.hd} · {qdNewPerRound} lbs NEW/rd</div>
        <div style="font-size:14px;font-family:'Share Tech',sans-serif;color:var(--gold);font-weight:700;">Total NEW: {qdTotalNew.toFixed(1)} lbs</div>
      </div>
    </div>
    <div class="metric-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px;">
      <div class="metric-card">
        <div class="metric-label">IBD</div>
        <div class="metric-value">{fmt(qdIbd_ft)} ft</div>
        <div class="metric-sub">{fmt(qdIbd_m)} m · Inhabited Building</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">PTR</div>
        <div class="metric-value">{fmt(qdPtr_ft)} ft</div>
        <div class="metric-sub">{fmt(qdPtr_m)} m · Public Traffic Route</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">ILD</div>
        <div class="metric-value">{fmt(qdIld_ft)} ft</div>
        <div class="metric-sub">{fmt(qdIld_m)} m · Intraline (min 50 ft)</div>
      </div>
    </div>
    <div style="font-size:11px;color:var(--text-dim);">
      Results are computed estimates only. Verify with installation safety officer and current DA Pam 385-64 before site selection.
    </div>
  </div>
  {/if}
</div>
