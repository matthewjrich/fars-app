<script>
  import { NEW_LBS } from '../lib/data.js';
  import { fmt, fmtD, gaugeColor } from '../lib/utils.js';

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
