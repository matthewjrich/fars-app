<script>
  import { MLC_DATA } from '../lib/data.js';
  import { getMlcVehiclesForUnit } from '../lib/compute.js';
  import { fmtD } from '../lib/utils.js';

  export let config;

  $: v = config;

  // Site inputs
  let bridgeClass  = 40;
  let bridgeType   = 'Wet'; // Wet or Dry
  let soilType     = 'Normal'; // Normal, Soft
  let treadway     = 'Double'; // Single, Double
  let speed        = 8;  // km/h crossing speed
  let gapWidth     = 60; // meters
  let bridgeName   = '';

  // CCN Calculator
  let ccnAxleLoads = [{ load: 0 }];
  $: ccnResult = calcCcn(ccnAxleLoads);

  function calcCcn(axles) {
    // Simplified CCN from NATO STANAG 2021: sum of axle loads / 10 (wheeled approx)
    const total = axles.reduce((a, x) => a + (parseFloat(x.load) || 0), 0);
    return Math.ceil(total / 10) * 10;
  }

  function addAxle() { ccnAxleLoads = [...ccnAxleLoads, { load: 0 }]; }
  function removeAxle(i) { ccnAxleLoads = ccnAxleLoads.filter((_, idx) => idx !== i); }

  // Unit vehicles from config
  $: unitVehicles = getMlcVehiclesForUnit(v);

  // MLC GO/NO-GO for each vehicle
  $: crossingMatrix = unitVehicles.map(uv => {
    const mlc = MLC_DATA[uv.name];
    if (!mlc) return { ...uv, mlcW: '?', mlcT: '?', status: 'UNKNOWN' };
    const relevant = mlc.type === 'tracked' ? mlc.t : mlc.w;
    const ok = relevant != null ? relevant <= bridgeClass : false;
    return {
      ...uv,
      mlcW: mlc.w ?? '—',
      mlcT: mlc.t ?? '—',
      relevant,
      type: mlc.type,
      notes: mlc.notes,
      status: relevant == null ? 'CHECK' : ok ? 'GO' : 'NO-GO',
    };
  });

  $: allGo   = crossingMatrix.every(r => r.status === 'GO');
  $: anyNoGo = crossingMatrix.some(r => r.status === 'NO-GO');

  // Crossing time estimate
  $: crossingTime = speed > 0 ? fmtD((gapWidth / 1000) / (speed / 60)) : '—'; // min

  // MLC data full reference table
  const mlcEntries = Object.entries(MLC_DATA);
</script>

<div class="section-title">Gap Crossing &amp; MLC Assessment</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Military Load Classification per NATO STANAG 2021 / FM 5-170. Enter bridge classification to determine GO/NO-GO for your task organization.
</p>

<!-- Site Configuration -->
<div class="section-title" style="font-size:13px;">Bridge Site Configuration</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
  <div class="field">
    <label>Bridge Name / Designation</label>
    <input type="text" bind:value={bridgeName} placeholder="e.g. TACT BR 1, Site A">
  </div>
  <div class="field">
    <label>Bridge MLC (Classification)</label>
    <input type="number" bind:value={bridgeClass} min="1" max="150">
  </div>
  <div class="field">
    <label>Bridge Type</label>
    <select bind:value={bridgeType}>
      <option>Wet</option>
      <option>Dry</option>
      <option>Float (Ribbon)</option>
    </select>
  </div>
  <div class="field">
    <label>Soil / Approach</label>
    <select bind:value={soilType}>
      <option>Normal</option>
      <option>Soft</option>
      <option>Very Soft</option>
    </select>
  </div>
  <div class="field">
    <label>Treadway</label>
    <select bind:value={treadway}>
      <option>Double</option>
      <option>Single</option>
    </select>
  </div>
  <div class="field">
    <label>Gap Width (m)</label>
    <input type="number" bind:value={gapWidth} min="1">
  </div>
  <div class="field">
    <label>Crossing Speed (km/h)</label>
    <input type="number" bind:value={speed} min="1" max="50">
  </div>
</div>

<div class="metric-grid" style="margin-bottom:16px;">
  <div class="metric-card"><div class="metric-label">Bridge MLC</div><div class="metric-value">{bridgeClass}</div><div class="metric-sub">{bridgeType}</div></div>
  <div class="metric-card"><div class="metric-label">Gap Width</div><div class="metric-value">{gapWidth} m</div></div>
  <div class="metric-card"><div class="metric-label">Est. Crossing Time</div><div class="metric-value">~{crossingTime} min</div><div class="metric-sub">Per vehicle at {speed} km/h</div></div>
  <div class="metric-card {anyNoGo ? 'danger' : allGo ? 'green' : 'warn'}">
    <div class="metric-label">Task Org Status</div>
    <div class="metric-value">{anyNoGo ? 'NO-GO' : allGo ? 'GO' : 'CHECK'}</div>
  </div>
</div>

<!-- GO/NO-GO Table -->
<div class="section-title" style="font-size:13px;">Task Organization GO/NO-GO</div>
{#if unitVehicles.length > 0}
  <table class="data-table" style="margin-bottom:16px;">
    <thead>
      <tr><th>Vehicle</th><th>Role</th><th>Qty</th><th>MLC (W)</th><th>MLC (T)</th><th>Type</th><th>Status</th></tr>
    </thead>
    <tbody>
      {#each crossingMatrix as row}
        <tr>
          <td style="font-size:12px;">{row.name}</td>
          <td style="font-size:11px;color:var(--text-dim);">{row.role}</td>
          <td>{row.qty}</td>
          <td style="color:var(--gold);">{row.mlcW}</td>
          <td style="color:var(--gold);">{row.mlcT}</td>
          <td style="font-size:11px;">{row.type || '—'}</td>
          <td style="font-weight:700;color:{row.status==='GO'?'#238636':row.status==='NO-GO'?'#b31942':'#9e6a03'};">
            {row.status}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if anyNoGo}
    <div class="alert alert-error">🚨 NO-GO: One or more vehicles exceed MLC {bridgeClass}. Requires reinforcement, bypass, or off-load procedures.</div>
  {:else if allGo}
    <div class="alert alert-success">✅ GO: All task organization vehicles within MLC {bridgeClass}.</div>
  {:else}
    <div class="alert alert-warn">⚠️ Some vehicles require MLC verification — check MLC data source for exact values.</div>
  {/if}
{:else}
  <div class="alert alert-info">Configure your unit in the sidebar to see task organization crossing assessment.</div>
{/if}

<!-- CCN Calculator -->
<div class="section-title" style="margin-top:20px;">CCN Calculator (Wheeled)</div>
<p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">
  Enter axle loads (lbs or tons per axle) to estimate Classification Number per NATO STANAG 2021.
</p>
<div style="margin-bottom:12px;">
  {#each ccnAxleLoads as axle, i}
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <label style="font-size:12px;color:var(--text-dim);width:80px;">Axle {i+1}</label>
      <input type="number" bind:value={axle.load} min="0" style="width:100px;" placeholder="lbs">
      <button class="btn btn-outline" style="font-size:11px;padding:2px 8px;" on:click={() => removeAxle(i)}>✕</button>
    </div>
  {/each}
  <button class="btn btn-outline" style="margin-top:6px;font-size:12px;" on:click={addAxle}>+ Add Axle</button>
</div>
<div class="metric-card" style="margin-bottom:16px;max-width:200px;">
  <div class="metric-label">Estimated CCN</div>
  <div class="metric-value">{ccnResult}</div>
  <div class="metric-sub">NATO STANAG 2021</div>
</div>

<!-- MLC Reference -->
<div class="section-title" style="margin-top:16px;">Full MLC Reference Table</div>
<table class="data-table">
  <thead>
    <tr><th>Vehicle</th><th>MLC (W)</th><th>MLC (T)</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    {#each mlcEntries as [name, d]}
      <tr>
        <td style="font-size:12px;">{name}</td>
        <td style="color:var(--gold);">{d.w ?? '—'}</td>
        <td style="color:var(--gold);">{d.t ?? '—'}</td>
        <td style="font-size:11px;color:var(--text-dim);">{d.type}</td>
        <td style="font-size:11px;color:var(--text-dim);">{d.notes}</td>
      </tr>
    {/each}
  </tbody>
</table>

<div style="font-size:11px;color:var(--text-dim);margin-top:12px;">
  MLC values per FM 5-170 / NATO STANAG 2021. W = Wheeled classification, T = Tracked classification. Verify against current engineer bridge data and vehicle TM for exact combat-loaded weights.
</div>
