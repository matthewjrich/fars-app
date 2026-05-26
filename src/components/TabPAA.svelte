<script>
  import { onMount } from 'svelte';
  import { NEW_LBS } from '../lib/data.js';
  import { fmt } from '../lib/utils.js';

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

  // Rounds on hand — live operational input
  let roundsOnHand = 0;
  let _initialized = false;

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_paa_v1');
      if (raw) roundsOnHand = JSON.parse(raw).roundsOnHand || 0;
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try { localStorage.setItem('fars_paa_v1', JSON.stringify({ roundsOnHand })); } catch (_) {}
  }

  // Consumption and reorder math
  $: hourlyUsage    = c.dailyUsage / 24;
  $: reorderPoint   = c.totalTurnaround > 0 && hourlyUsage > 0
                        ? Math.ceil(c.totalTurnaround * hourlyUsage)
                        : 0;
  $: hoursUntilEmpty = hourlyUsage > 0 ? roundsOnHand / hourlyUsage : null;

  $: reorderNow  = reorderPoint > 0 && roundsOnHand <= reorderPoint;
  $: reorderSoon = reorderPoint > 0 && roundsOnHand > reorderPoint && roundsOnHand <= reorderPoint * 2;

  function timeColor(hrs) {
    if (hrs === null) return 'var(--text-dim)';
    if (hrs <= c.totalTurnaround) return '#ffa198';
    if (hrs <= c.totalTurnaround * 2) return '#e3b341';
    return '#3fb950';
  }

  function fmtTime(hrs) {
    if (hrs === null) return '—';
    if (hrs >= 48) return `${(hrs / 24).toFixed(1)} days`;
    return `${hrs.toFixed(1)} hrs`;
  }

  // NEW reference — filter to relevant system
  $: newRows = Object.entries(NEW_LBS).filter(([k]) => {
    if (v.isM119)   return k.startsWith('105mm');
    if (v.isCannon) return k.startsWith('155mm') || k.startsWith('Propellant');
    return k.includes('GMLRS') || k.includes('ATACMS');
  });

  // Q-D Arc Calculator state
  let newOpen = false;
  let qdOpen  = false;
  let qdMun   = '';
  let infoOpen = {};
  function toggleInfo(k, e) { e.stopPropagation(); infoOpen = { ...infoOpen, [k]: !infoOpen[k] }; }

  const INFO = {
    new: 'Net Explosive Weight (NEW) is the explosive content per round or pod in pounds, used to calculate quantity-distance (Q-D) separation arcs for storage and handling under DA Pam 385-64. NEW drives how far a magazine or storage point must be from inhabited buildings, roads, and other munition stacks.',
    qd:  'Quantity-Distance (Q-D) arcs define minimum separation distances based on hazard division and total NEW. IBD = Inhabited Building Distance. PTR = Public Traffic Route. ILD = Intraline Distance (between storage points). Formula: D = K × NEW^(1/3). Verify with installation safety officer before site selection.',
  };
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

<div class="section-title">PAA Ammunition Status</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Rounds at position · Consumption rate · Reorder trigger</p>

<!-- Rounds on Hand entry -->
<div style="background:var(--surface2);border-radius:8px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap;">
  <div class="field" style="margin:0;min-width:200px;">
    <label>Rounds on Hand at PAA</label>
    <input type="number" bind:value={roundsOnHand} min="0" placeholder="0">
  </div>
  <div style="font-size:11px;color:var(--text-dim);padding-bottom:8px;max-width:340px;">
    Include all rounds at the position — ground stock and truck-borne combined.
  </div>
</div>

<!-- Metric cards -->
<div class="metric-grid" style="margin-bottom:16px;">
  <div class="metric-card">
    <div class="metric-label">Rounds on Hand</div>
    <div class="metric-value">{fmt(roundsOnHand)}</div>
    <div class="metric-sub">At position</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Daily Usage</div>
    <div class="metric-value">{c.dailyUsage > 0 ? fmt(Math.round(c.dailyUsage)) : '—'}</div>
    <div class="metric-sub">{v.tubes} tubes × {v.authCsr} CSR × {v.firingRate}%</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Time Until Empty</div>
    <div class="metric-value" style="color:{timeColor(hoursUntilEmpty)}">{fmtTime(hoursUntilEmpty)}</div>
    <div class="metric-sub">At current firing rate</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Reorder Point</div>
    <div class="metric-value">{reorderPoint > 0 ? fmt(reorderPoint) : '—'}</div>
    <div class="metric-sub">Min rds before calling resupply</div>
  </div>
</div>

<!-- Status alert -->
{#if c.dailyUsage === 0}
  <div class="alert" style="background:rgba(99,110,123,0.2);border:1px solid var(--border);color:var(--text-dim);">
    Configure tubes, CSR, and firing rate in the sidebar to enable reorder calculations.
  </div>
{:else if reorderNow}
  <div class="alert alert-error">⚠️ REORDER NOW — {fmt(roundsOnHand)} rds on hand is at or below the reorder point ({fmt(reorderPoint)} rds). The resupply truck must be rolling.</div>
{:else if reorderSoon}
  <div class="alert alert-warn">⚠️ REORDER SOON — {fmt(roundsOnHand)} rds on hand. Reorder point is {fmt(reorderPoint)} rds. Call for resupply before stock drops further.</div>
{:else}
  <div class="alert alert-success">✅ SUFFICIENT — {fmt(roundsOnHand)} rds on hand. Call for resupply when stock reaches {fmt(reorderPoint)} rds.</div>
{/if}

<!-- Reorder logic explanation -->
{#if c.dailyUsage > 0 && reorderPoint > 0}
<div style="background:var(--surface2);border-radius:6px;padding:12px 16px;margin-top:12px;margin-bottom:20px;font-size:12px;color:var(--text-dim);line-height:1.6;">
  <b style="color:var(--text);">How this is calculated:</b>
  Turnaround is {c.totalTurnaround.toFixed(1)} hrs
  ({v.dist} km × 2 at {v.speed} km/h + {v.loadTime} hr draw).
  At {hourlyUsage.toFixed(1)} rds/hr, {fmt(reorderPoint)} rounds will be consumed before the truck returns.
  If you wait until the position runs dry to call, you will have a gap in fires.
</div>
{/if}

<div class="expander" style="margin-top:4px;">
  <div class="expander-header" on:click={() => newOpen = !newOpen}>
    <span>Net Explosive Weight (NEW) Reference</span>
    <button class="info-btn" on:click={e => toggleInfo('new', e)}>ⓘ</button>
    <span>{newOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.new}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.new}</div>
  {/if}
  {#if newOpen}
  <div class="expander-body" style="padding:0;">
    <table class="data-table" style="margin:0;border-radius:0;">
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
    <div style="padding:8px 14px;font-size:11px;color:var(--text-dim);">
      Q-D arcs and compatible groups determine physical separation requirements. Consult DA Pam 385-64 and installation SOP for magazine construction standards.
    </div>
  </div>
  {/if}
</div>

<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => qdOpen = !qdOpen}>
    <span>Q-D Arc Calculator — DA Pam 385-64</span>
    <button class="info-btn" on:click={e => toggleInfo('qd', e)}>ⓘ</button>
    <span>{qdOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.qd}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.qd}</div>
  {/if}
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
