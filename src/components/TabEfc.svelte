<script>
  import { EFC_TABLE, EFC_TABLE_105, BARREL_LIFE } from '../lib/data.js';
  import { fmtD } from '../lib/utils.js';

  export let config;

  $: v = config;
  $: efcTable = v.isM119 ? EFC_TABLE_105 : EFC_TABLE;
  $: barrelLife = v.isM119 ? 3000 : (BARREL_LIFE[v.unitType] || 1500);

  // Per-gun EFC trackers — keyed by tube number (1..tubes)
  let gunEfc = {};  // gunEfc[i] = { rounds per charge combo }

  $: tubeNums = Array.from({length: v.tubes || 0}, (_, i) => i + 1);

  // Each gun gets an array of entries: {charge, qty}
  function getGunEntries(i) {
    if (!gunEfc[i]) gunEfc[i] = efcTable.map(row => ({ charge: row.charge, qty: 0 }));
    return gunEfc[i];
  }

  function calcGunTotalEfc(i) {
    const entries = getGunEntries(i);
    return entries.reduce((a, e, idx) => a + (e.qty || 0) * efcTable[idx].efc, 0);
  }

  function setQty(tubeIdx, chargeIdx, val) {
    const entries = getGunEntries(tubeIdx);
    entries[chargeIdx].qty = parseInt(val) || 0;
    gunEfc = { ...gunEfc, [tubeIdx]: [...entries] };
  }

  $: gunTotals = tubeNums.map(i => ({
    gun: i,
    efc: calcGunTotalEfc(i),
    remaining: barrelLife - calcGunTotalEfc(i),
  }));

  $: totalFleetEfc = gunTotals.reduce((a, g) => a + g.efc, 0);
  $: highestEfc = gunTotals.reduce((a, g) => Math.max(a, g.efc), 0);
</script>

<div class="section-title">EFC (Equivalent Full Charge) Calculator</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Track barrel wear by EFC. Barrel life for {v.unitType}: <b style="color:var(--gold)">{barrelLife} EFC</b>.
</p>

<!-- EFC Reference Table -->
<div class="section-title" style="font-size:13px;">EFC Charge Table — {v.isM119 ? '105mm' : '155mm'}</div>
<table class="data-table" style="margin-bottom:20px;">
  <thead><tr><th>Charge</th><th>Projectile</th><th>EFC Factor</th><th>Notes</th></tr></thead>
  <tbody>
    {#each efcTable as row}
      <tr>
        <td style="font-family:'Share Tech Mono',monospace;">{row.charge}</td>
        <td style="font-size:12px;color:var(--text-dim);">{row.proj}</td>
        <td style="color:var(--gold);font-weight:700;">{row.efc}</td>
        <td style="font-size:11px;color:var(--text-dim);">{row.notes}</td>
      </tr>
    {/each}
  </tbody>
</table>

<!-- Fleet Summary -->
{#if tubeNums.length > 0}
  <div class="metric-grid" style="margin-bottom:16px;">
    <div class="metric-card">
      <div class="metric-label">Fleet EFC Total</div>
      <div class="metric-value">{fmtD(totalFleetEfc)}</div>
      <div class="metric-sub">All {v.tubes} tubes combined</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Highest Single Gun</div>
      <div class="metric-value">{fmtD(highestEfc)}</div>
      <div class="metric-sub">Barrel life: {barrelLife} EFC</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Barrel Life Remaining</div>
      <div class="metric-value">{fmtD(barrelLife - highestEfc)}</div>
      <div class="metric-sub">Worst-case gun</div>
    </div>
    <div class="metric-card {highestEfc >= barrelLife ? 'danger' : highestEfc >= barrelLife * 0.8 ? 'warn' : ''}">
      <div class="metric-label">Wear Status</div>
      <div class="metric-value">{fmtD(highestEfc / barrelLife * 100)}%</div>
      <div class="metric-sub">{highestEfc >= barrelLife ? 'REPLACE' : highestEfc >= barrelLife * 0.8 ? 'MONITOR' : 'OK'}</div>
    </div>
  </div>

  <!-- Per-Gun EFC Trackers -->
  <div class="section-title">Per-Gun EFC Entry</div>
  <div class="efc-grid">
    {#each tubeNums as i}
      {@const total = calcGunTotalEfc(i)}
      {@const pct = Math.min(total / barrelLife * 100, 100)}
      <div class="efc-tube-card">
        <div style="font-size:13px;font-weight:700;color:var(--gold);margin-bottom:10px;">Gun #{i}</div>
        {#each efcTable as row, ci}
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <label style="font-size:11px;color:var(--text-dim);flex:1;line-height:1.2;">{row.charge}</label>
            <input type="number" min="0" value={getGunEntries(i)[ci].qty}
              style="width:60px;font-size:12px;"
              on:input={e => setQty(i, ci, e.target.value)}>
            <span style="font-size:11px;color:var(--text-dim);width:40px;">×{row.efc}</span>
          </div>
        {/each}
        <div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span>Total EFC</span>
            <span style="color:var(--gold);font-weight:700;">{fmtD(total)}</span>
          </div>
          <div class="gauge-track" style="height:8px;">
            <div class="gauge-fill" style="width:{pct}%;background:{pct>=100?'#b31942':pct>=80?'#9e6a03':'#238636'};"></div>
          </div>
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">{fmtD(barrelLife - total)} EFC remaining</div>
        </div>
      </div>
    {/each}
  </div>

  {#if highestEfc >= barrelLife}
    <div class="alert alert-error" style="margin-top:16px;">🚨 BARREL REPLACEMENT REQUIRED: One or more guns have exceeded {barrelLife} EFC barrel life.</div>
  {:else if highestEfc >= barrelLife * 0.8}
    <div class="alert alert-warn" style="margin-top:16px;">⚠️ MONITOR: One or more guns approaching barrel life limit ({fmtD(barrelLife - highestEfc)} EFC remaining).</div>
  {:else}
    <div class="alert alert-success" style="margin-top:16px;">✅ All barrels within acceptable wear limits.</div>
  {/if}
{:else}
  <div class="alert alert-info">Set number of operational tubes in Configuration to enable per-gun EFC tracking.</div>
{/if}
