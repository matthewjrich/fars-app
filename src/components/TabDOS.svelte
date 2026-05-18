<script>
  import { fmt, fmtD, fmtCurrency } from '../lib/utils.js';

  export let config;
  export let computed;

  $: v = config;
  $: c = computed;
  $: ok = c.runsPerDay >= c.runsNeeded;

  const scenarios = [
    { l: '25% Firing', p: 0.25 },
    { l: '50% Firing', p: 0.50 },
    { l: '75% Firing', p: 0.75 },
    { l: '100% Max',   p: 1.00 },
  ];

  function scenarioDos(p) {
    const u = v.tubes * v.authCsr * p;
    return u > 0 ? Math.min(c.effectiveRounds / u, 10) : 10;
  }

  function dosColor(d) {
    return d >= 3 ? '#238636' : d >= 1 ? '#9e6a03' : '#b31942';
  }

  let breakdownOpen = false;
  let forecastOpen  = false;
  let forecastDays  = 5;

  $: avgRdWt = v.isM119 ? 42 : v.isCannon ? 108 : 5111;
  $: forecastRows = Array.from({ length: Math.max(1, Math.min(forecastDays, 30)) }, (_, i) => ({
    day:         i + 1,
    rounds:      Math.round(c.dailyUsage),
    runs:        c.runsNeeded,
    weightStons: (c.dailyUsage * avgRdWt) / 2000,
    cost:        c.dailyRunCost,
    ok:          c.runsPerDay >= c.runsNeeded,
  }));
  $: cumRounds  = forecastRows.reduce((a, r) => a + r.rounds, 0);
  $: cumRuns    = forecastRows.reduce((a, r) => a + r.runs, 0);
  $: cumWeight  = forecastRows.reduce((a, r) => a + r.weightStons, 0);
  $: cumCost    = forecastRows.reduce((a, r) => a + r.cost, 0);
  $: shortfallDays = forecastRows.filter(r => !r.ok).length;
</script>

<div class="section-title">Days of Supply &amp; Resupply Cycle</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">How long can the unit sustain fires and how many truck runs per day?</p>

<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-label">Days of Supply</div>
    <div class="metric-value">{c.dosAvail >= 999 ? '∞' : fmtD(c.dosAvail)}</div>
    <div class="metric-sub">At current firing rate</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Daily Ammo Usage</div>
    <div class="metric-value">{fmt(Math.round(c.dailyUsage))} rds</div>
    <div class="metric-sub">{v.firingRate}% of {v.authCsr} CSR</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Total Rounds</div>
    <div class="metric-value">{fmt(c.totalRoundsCap)}</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Effective Rounds</div>
    <div class="metric-value">{fmt(c.effectiveRounds)}</div>
    <div class="metric-sub">After {v.dudRate}% dud</div>
  </div>
</div>

<div class="section-title">Daily Resupply Cycle</div>
<div class="metric-grid">
  <div class="metric-card">
    <div class="metric-label">Runs Possible/Day</div>
    <div class="metric-value">{c.runsPerDay}</div>
    <div class="metric-sub">{fmtD(c.totalTurnaround)} hr/run</div>
  </div>
  <div class="metric-card {ok ? '' : 'danger'}">
    <div class="metric-label">Runs Needed/Day</div>
    <div class="metric-value">{c.runsNeeded}</div>
    <div class="metric-sub">To sustain rate</div>
  </div>
  <div class="metric-card">
    <div class="metric-label">Daily Lift Capacity</div>
    <div class="metric-value">{fmt(c.dailyLiftCap)} rds</div>
    <div class="metric-sub">Organic only</div>
  </div>
  <div class="metric-card {ok ? 'green' : 'danger'}">
    <div class="metric-label">Surplus/Deficit</div>
    <div class="metric-value">{c.dailyLiftCap - Math.round(c.dailyUsage) >= 0 ? '+' : ''}{fmt(c.dailyLiftCap - Math.round(c.dailyUsage))} rds</div>
    <div class="metric-sub">{ok ? 'Sufficient' : 'SHORTFALL'}</div>
  </div>
</div>

<!-- DOS scenarios -->
<div style="margin-bottom:14px">
  <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.8px;font-weight:700;margin-bottom:10px">DOS By Firing Scenario</div>
  {#each scenarios as s}
    {@const d = scenarioDos(s.p)}
    {@const bp = Math.min(d / 10 * 100, 100)}
    {@const col = dosColor(d)}
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span>{s.l}</span>
        <span style="color:var(--gold);font-weight:700;font-family:'Share Tech',sans-serif">{d >= 9.9 ? '10+' : fmtD(d)} DOS</span>
      </div>
      <div class="dos-bar"><div class="dos-fill" style="width:{bp}%;background:{col}"></div></div>
    </div>
  {/each}
</div>

{#if c.dosAvail < 1 && c.dosAvail < 999}
  <div class="alert alert-error">🚨 CRITICAL: Less than 1 DOS.{!ok ? ` Resupply shortfall — need ${c.runsNeeded} runs/day, only ${c.runsPerDay} possible.` : ''}</div>
{:else if !ok && c.runsNeeded > 0}
  <div class="alert alert-error">⚠️ RESUPPLY SHORTFALL: Need {c.runsNeeded} runs/day, organic lift supports only {c.runsPerDay}.</div>
{:else if c.dosAvail < 3 && c.dosAvail < 999}
  <div class="alert alert-warn">⚠️ Less than 3 DOS. Initiate emergency resupply.</div>
{:else if c.dosAvail < 999}
  <div class="alert alert-success">✅ {fmtD(c.dosAvail)} DOS available.</div>
{/if}

<div class="expander">
  <div class="expander-header" on:click={() => breakdownOpen = !breakdownOpen}>
    <span>📋 Resupply Math Breakdown</span>
    <span>{breakdownOpen ? '▲' : '▼'}</span>
  </div>
  {#if breakdownOpen}
    <div class="expander-body">
      <b style="color:var(--gold)">Resupply Calculation:</b><br><br>
      ▸ Turnaround: ({v.dist}km×2)÷{v.speed}km/h+{v.loadTime}hr = <b style="color:var(--gold)">{fmtD(c.totalTurnaround)} hrs/run</b><br>
      ▸ Runs/day: {v.planHours}÷{fmtD(c.totalTurnaround)} = <b style="color:var(--gold)">{c.runsPerDay}</b><br>
      ▸ Rds/run: {c.totalFlatracks}×{v.cclMode ? 144 : 160} = <b style="color:var(--gold)">{fmt(c.roundsPerRun)}</b><br>
      ▸ FY24 CL IX cost/run: <b style="color:var(--gold)">{fmtCurrency(c.totalRunCost)}</b> ({fmtD(c.distMiles, 1)} miles RT)
    </div>
  {/if}
</div>

<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => forecastOpen = !forecastOpen}>
    <span>📈 N-Day Ammo Projection</span>
    <span>{forecastOpen ? '▲' : '▼'}</span>
  </div>
  {#if forecastOpen}
    <div class="expander-body" style="padding:0;">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:10px;">
          <label style="font-size:12px;color:var(--text-dim);white-space:nowrap;">Planning Horizon (days)</label>
          <input type="number" bind:value={forecastDays} min="1" max="30" style="width:65px;">
        </div>
        {#if c.dailyUsage === 0}
          <div style="font-size:12px;color:var(--text-dim);">Set firing rate in sidebar to project usage.</div>
        {:else if shortfallDays > 0}
          <div style="color:#ffa198;font-size:12px;font-weight:700;">⚠ {shortfallDays} day{shortfallDays > 1 ? 's' : ''} organic lift insufficient — augmentation required</div>
        {:else}
          <div style="color:#3fb950;font-size:12px;font-weight:700;">✓ Organic lift sustains all {forecastDays} days</div>
        {/if}
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table" style="margin:0;border-radius:0;">
          <thead>
            <tr>
              <th>Day</th>
              <th>{v.isCannon ? 'Rounds' : 'Pods'} Used</th>
              <th>Runs Req</th>
              <th>Weight (STONS)</th>
              <th>Est. Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each forecastRows as row}
              <tr>
                <td style="color:var(--text-dim);">D+{row.day}</td>
                <td>{fmt(row.rounds)}</td>
                <td>{row.runs}</td>
                <td>{fmtD(row.weightStons, 1)}</td>
                <td>{fmtCurrency(row.cost)}</td>
                <td style="font-weight:700;color:{row.ok ? '#3fb950' : '#ffa198'};">{row.ok ? 'GO' : 'SHORTFALL'}</td>
              </tr>
            {/each}
            <tr style="font-weight:700;border-top:2px solid var(--gold);color:var(--gold);">
              <td>{forecastDays}-Day Total</td>
              <td>{fmt(cumRounds)}</td>
              <td>{cumRuns}</td>
              <td>{fmtD(cumWeight, 1)}</td>
              <td>{fmtCurrency(cumCost)}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
