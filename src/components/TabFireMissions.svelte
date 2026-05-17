<script>
  import { fmt, fmtD } from '../lib/utils.js';

  export let config;
  export let computed;

  $: v = config;
  $: c = computed;

  let volleys = 6;
  let fireMode = 'pods'; // for rocket systems

  $: ul = v.isCannon ? 'Rounds' : 'Pods';
  $: docTubes = v.echelon === 'Battalion' ? (v.isCannon ? 18 : 27)
              : v.echelon === 'Battery'   ? (v.isCannon ? 6 : 9)
              : 3;
  $: degradePct = Math.round((1 - (v.tubes / docTubes)) * 100);
  $: isDegraded = v.tubes < docTubes;
  $: totalAvail = (!v.isCannon && fireMode === 'rockets') ? c.effectiveRounds * 6 : c.effectiveRounds;
  $: currentUl = (!v.isCannon && fireMode === 'rockets') ? 'Rockets' : ul;
  $: rdsMission = volleys * v.tubes;
  $: rawMax = rdsMission > 0 ? Math.floor(totalAvail / rdsMission) : 0;
  $: maxMissions = Math.floor(rawMax * (v.tubes / docTubes));
</script>

<div class="section-title">{v.echelon} Fire Mission Sustainability</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Dud/misfire rate applied before mission count calculation.</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
  <div>
    <div class="info-box"><b style="color:var(--gold)">Operational Guns:</b> {v.tubes}</div>
    <div class="info-box"><b style="color:var(--gold)">Ammo Capacity:</b> {fmt(c.totalRoundsCap)} {ul}</div>
    <div class="info-box"><b style="color:var(--gold)">Effective After Dud ({v.dudRate}%):</b> {fmt(c.effectiveRounds)}</div>
  </div>
  <div>
    {#if v.isCannon}
      <div class="field">
        <label for="volleys">Rounds per Target per Gun</label>
        <input id="volleys" type="number" bind:value={volleys} min="1">
      </div>
      <div class="info-box" id="t2rpmInfo">Total Rounds per Mission: {volleys * v.tubes}</div>
    {:else}
      <div class="radio-group" style="margin-bottom:12px">
        <label><input type="radio" bind:group={fireMode} value="pods"> Full Pods (ATACMS/Massed)</label>
        <label><input type="radio" bind:group={fireMode} value="rockets"> Individual Rockets (GMLRS 6-Pack)</label>
      </div>
      <div class="field">
        <label for="volleys2">{fireMode === 'rockets' ? 'Rockets/Target/Launcher' : 'Pods/Target/Launcher'}</label>
        <input id="volleys2" type="number" bind:value={volleys} min="1">
      </div>
      <div class="info-box">Total {currentUl} per Mission: {rdsMission.toLocaleString()}</div>
    {/if}
  </div>
</div>

<hr>

{#if isDegraded}
  <div class="alert {degradePct >= 50 ? 'alert-error' : degradePct >= 25 ? 'alert-warn' : 'alert-info'}">
    ⚠️ DEGRADED CAPABILITY: {v.tubes}/{docTubes} tubes operational ({degradePct}% reduction) — Max missions reduced proportionally.
  </div>
{/if}

<div class="metric-grid" style="grid-template-columns:repeat(4,1fr)">
  <div class="metric-card {isDegraded ? (degradePct >= 50 ? 'danger' : 'warn') : ''}">
    <div class="metric-label">Operational Tubes</div>
    <div class="metric-value">{v.tubes} / {docTubes}</div>
    <div class="metric-sub">{isDegraded ? `${degradePct}% degraded` : 'Full strength'}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Max Missions</div>
    <div class="metric-value">{maxMissions}</div>
    <div class="metric-sub">Tube-adjusted</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">{currentUl} per Mission</div>
    <div class="metric-value">{rdsMission.toLocaleString()}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Effective {currentUl}</div>
    <div class="metric-value">{totalAvail.toLocaleString()}</div>
    <div class="metric-sub">After {v.dudRate}% dud</div>
  </div>
</div>

{#if maxMissions === 0}
  <div class="alert alert-error">🚨 WINCHESTER: Insufficient ammo.</div>
{:else if maxMissions <= 3}
  <div class="alert alert-warn">⚠️ CRITICAL: Only {maxMissions} missions before Winchester.</div>
{:else}
  <div class="alert alert-success">✅ COMBAT EFFECTIVE: {maxMissions} missions before resupply.</div>
{/if}

{#if v.isM119}
  <div class="alert alert-info" style="margin-top:12px;">
    ℹ️ <b>M119A3 Rate of Fire:</b> 8 rpm max (first 2 min) · 3 rpm sustained · Prime mover: M1097/M1152 HMMWV
  </div>
{:else if !v.isCannon}
  <div class="alert alert-info" style="margin-top:12px;">
    ℹ️ <b>{v.isMlrs ? 'MLRS' : 'HIMARS'} Reload:</b> {v.isMlrs ? '2 pods' : '1 pod'}/launcher — ~{v.reloadTime} min/launcher after firing.
  </div>
{/if}
