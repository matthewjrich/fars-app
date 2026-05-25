<script>
  import { onMount } from 'svelte';
  import { EFC_TABLE, EFC_TABLE_105, BARREL_LIFE } from '../lib/data.js';
  import { fmtD } from '../lib/utils.js';

  export let config;
  let _initialized = false;

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

  $: gunTotals = tubeNums.map(i => {
    const efc = calcGunTotalEfc(i);
    return {
      gun: i,
      efc,
      remaining: barrelLife - efc,
      pct: barrelLife > 0 ? Math.round(efc / barrelLife * 100) : 0,
    };
  });

  $: totalFleetEfc = gunTotals.reduce((a, g) => a + g.efc, 0);
  $: highestEfc = gunTotals.reduce((a, g) => Math.max(a, g.efc), 0);

  function wearColor(pct) {
    return pct >= 95 ? '#ffa198' : pct >= 80 ? '#e3b341' : pct >= 60 ? '#d29922' : '#3fb950';
  }
  function wearLabel(pct) {
    return pct >= 95 ? 'REPLACE' : pct >= 80 ? 'CAUTION' : pct >= 60 ? 'MONITOR' : 'OK';
  }

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

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_efc_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.gunEfc != null) {
          // Prune entries for tubes beyond current count
          const maxTube = v.tubes || 0;
          const pruned = {};
          for (const k of Object.keys(s.gunEfc)) {
            if (parseInt(k) <= maxTube) pruned[k] = s.gunEfc[k];
          }
          gunEfc = pruned;
        }
      }
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try {
      localStorage.setItem('fars_efc_v1', JSON.stringify({ gunEfc }));
    } catch (_) {}
  }

  let refOpen   = false;
  let entryOpen = false;
  let infoOpen  = {};
  function toggleInfo(k, e) { e.stopPropagation(); infoOpen = { ...infoOpen, [k]: !infoOpen[k] }; }

  const INFO = {
    ref: 'EFC factors convert each charge type into an equivalent number of "full charge" barrel wear units. A Charge 5 (max) = 1.0 EFC; lower charges and propellants impose proportionally less wear. Use this table to convert your actual rounds fired by charge into total barrel wear.',
    entry: 'Enter the number of rounds fired per charge type for each gun. FARS multiplies qty × EFC factor to calculate cumulative barrel wear. Update this after each fire mission or training event to keep wear totals current. Data persists in your browser.',
  };
</script>

<div class="section-title">EFC (Equivalent Full Charge) Calculator</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Track barrel wear by EFC. Barrel life for {v.unitType}: <b style="color:var(--gold)">{barrelLife} EFC</b>.
</p>

<!-- Fleet Summary — always visible -->
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

  {#if highestEfc >= barrelLife}
    <div class="alert alert-error" style="margin-bottom:16px;">🚨 BARREL REPLACEMENT REQUIRED: One or more guns have exceeded {barrelLife} EFC barrel life.</div>
  {:else if highestEfc >= barrelLife * 0.8}
    <div class="alert alert-warn" style="margin-bottom:16px;">⚠️ MONITOR: One or more guns approaching barrel life limit ({fmtD(barrelLife - highestEfc)} EFC remaining).</div>
  {:else}
    <div class="alert alert-success" style="margin-bottom:16px;">✅ All barrels within acceptable wear limits.</div>
  {/if}

  <!-- Battery Barrel Wear Overview -->
  <div style="margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-dim);margin-bottom:8px;">Barrel Wear by {v.echelon === 'Battalion' ? 'Battery' : v.echelon === 'Battery' ? 'Platoon' : 'Section'}</div>
    <div style="display:grid;grid-template-columns:repeat({Math.min(batteryGroups.length, 3)},1fr);gap:10px;">
      {#each batteryGroups as grp}
        {@const grpTotals = gunTotals.filter(g => grp.guns.includes(g.gun))}
        {@const worstPct  = grpTotals.reduce((a, g) => Math.max(a, g.pct), 0)}
        <div style="background:var(--bg-card);border:1px solid var(--border);border-top:2px solid {wearColor(worstPct)};border-radius:6px;padding:10px 12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">{grp.name}</span>
            <span style="font-size:11px;font-weight:700;color:{wearColor(worstPct)};background:rgba(0,0,0,0.2);padding:1px 6px;border-radius:3px;">{wearLabel(worstPct)}</span>
          </div>
          {#each grpTotals as g}
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;color:var(--text-dim);width:28px;flex-shrink:0;">G{g.gun}</span>
              <div style="flex:1;height:7px;background:var(--bg-input);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:{Math.min(g.pct,100)}%;background:{wearColor(g.pct)};border-radius:3px;transition:width 0.3s;"></div>
              </div>
              <span style="font-size:11px;font-weight:700;color:{wearColor(g.pct)};width:32px;text-align:right;flex-shrink:0;">{g.pct}%</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div style="font-size:10px;color:var(--text-dim);margin-top:6px;">
      Green &lt;60% · Amber 60–79% · Orange 80–94% · Red ≥95% (replace)
    </div>
  </div>

  <!-- Per-Gun EFC Entry — collapsible -->
  <div class="expander" style="margin-bottom:8px;">
    <div class="expander-header" on:click={() => entryOpen = !entryOpen}>
      <span>Per-Gun EFC Entry</span>
      <button class="info-btn" on:click={e => toggleInfo('entry', e)}>ⓘ</button>
      <span>{entryOpen ? '▲' : '▼'}</span>
    </div>
    {#if infoOpen.entry}
      <div class="info-popover" style="margin:0 0 0;border-top:none;border-radius:0;">{INFO.entry}</div>
    {/if}
    {#if entryOpen}
    <div class="expander-body">
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
    </div>
    {/if}
  </div>
{:else}
  <div class="alert alert-info">Set number of operational tubes in Configuration to enable per-gun EFC tracking.</div>
{/if}

<!-- EFC Charge Reference — collapsible -->
<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => refOpen = !refOpen}>
    <span>EFC Charge Reference — {v.isM119 ? '105mm' : '155mm'}</span>
    <button class="info-btn" on:click={e => toggleInfo('ref', e)}>ⓘ</button>
    <span>{refOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.ref}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.ref}</div>
  {/if}
  {#if refOpen}
  <div class="expander-body" style="padding:0;">
    <table class="data-table" style="margin:0;border-radius:0;">
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
  </div>
  {/if}
</div>
