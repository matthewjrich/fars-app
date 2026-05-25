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
  let lossOpen      = false;
  let infoOpen      = {};

  // Loss impact calculator
  let lossSimTrucks = 0;
  $: lossSimFlatracks    = Math.max(0, c.totalFlatracks - lossSimTrucks);
  $: lossSimRoundsPerRun = lossSimFlatracks * 86 + (v.catQty || 0) * 95;
  $: lossSimDailyLiftCap = lossSimRoundsPerRun * c.runsPerDay;
  $: lossSimSurplus      = lossSimDailyLiftCap - Math.round(c.dailyUsage);
  $: lossSimShortfall    = lossSimSurplus < 0;
  function toggleInfo(k, e) { e.stopPropagation(); infoOpen = { ...infoOpen, [k]: !infoOpen[k] }; }

  const INFO = {
    breakdown: 'Shows the step-by-step math behind the resupply calculation: turnaround time (distance ÷ speed + load time), runs possible per planning day, and rounds per run based on flatracks and CATs. Use this to verify the model matches your actual route and vehicle plan.',
    forecast:  'Projects daily and cumulative ammunition consumption, truck runs, lift weight (short tons), and estimated cost over a planning horizon of up to 30 days. Each row assumes a constant firing rate at the current CSR setting. Shortfall days indicate organic lift cannot sustain the firing rate — augmentation or reduced tempo required.',
  };
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
    <button class="info-btn" on:click={e => toggleInfo('breakdown', e)}>ⓘ</button>
    <span>{breakdownOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.breakdown}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.breakdown}</div>
  {/if}
  {#if breakdownOpen}
    <div class="expander-body">
      <b style="color:var(--gold)">Resupply Calculation:</b><br><br>
      ▸ Turnaround: ({v.dist}km×2)÷{v.speed}km/h+{v.loadTime}hr = <b style="color:var(--gold)">{fmtD(c.totalTurnaround)} hrs/run</b><br>
      ▸ Runs/day: {v.planHours}÷{fmtD(c.totalTurnaround)} = <b style="color:var(--gold)">{c.runsPerDay}</b><br>
      ▸ Rds/run: {c.totalFlatracks}×86 (flatrack) + {v.catQty}×95 (CAT) = <b style="color:var(--gold)">{fmt(c.roundsPerRun)}</b><br>
      ▸ FY24 CL IX cost/run: <b style="color:var(--gold)">{fmtCurrency(c.totalRunCost)}</b> ({fmtD(c.distMiles, 1)} miles RT)
    </div>
  {/if}
</div>

{#if v.isCannon}
<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => lossOpen = !lossOpen}>
    <span>🚛 Loss Impact Calculator</span>
    <span>{lossOpen ? '▲' : '▼'}</span>
  </div>
  {#if lossOpen}
  <div class="expander-body">
    <p style="font-size:12px;color:var(--text-dim);margin-bottom:14px;">
      Model the effect of losing or deadlining haul trucks. Simulates reduced flatrack capacity while keeping run count and firing rate constant.
    </p>
    <div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:16px;flex-wrap:wrap;">
      <div class="field" style="margin:0;max-width:200px;">
        <label>PLS Trucks Lost / Deadlined</label>
        <input type="number" bind:value={lossSimTrucks} min="0" max={v.truckQty}>
      </div>
      <div style="font-size:12px;color:var(--text-dim);padding-bottom:8px;">
        Base: {v.truckQty} PLS + {v.trailQty} trailers = {c.totalFlatracks} flatracks
        &rarr; sim: {lossSimFlatracks} flatracks remaining
      </div>
    </div>
    <div class="metric-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="metric-card">
        <div class="metric-label">Sim Rounds / Run</div>
        <div class="metric-value">{fmt(lossSimRoundsPerRun)}</div>
        <div class="metric-sub">was {fmt(c.roundsPerRun)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Sim Daily Lift Cap</div>
        <div class="metric-value">{fmt(lossSimDailyLiftCap)} rds</div>
        <div class="metric-sub">was {fmt(c.dailyLiftCap)}</div>
      </div>
      <div class="metric-card {lossSimShortfall ? 'danger' : 'green'}">
        <div class="metric-label">Sim Surplus / Deficit</div>
        <div class="metric-value">{lossSimSurplus >= 0 ? '+' : ''}{fmt(lossSimSurplus)} rds</div>
        <div class="metric-sub">{lossSimShortfall ? 'SHORTFALL' : 'Sufficient'}</div>
      </div>
    </div>
    {#if lossSimTrucks > 0}
      {#if lossSimShortfall}
        <div class="alert alert-error" style="margin-top:8px;">
          ⚠️ With {lossSimTrucks} truck{lossSimTrucks !== 1 ? 's' : ''} lost, daily lift ({fmt(lossSimDailyLiftCap)} rds) falls {fmt(Math.abs(lossSimSurplus))} rds short of daily usage ({fmt(Math.round(c.dailyUsage))} rds). Augmentation required.
        </div>
      {:else}
        <div class="alert alert-success" style="margin-top:8px;">
          ✅ With {lossSimTrucks} truck{lossSimTrucks !== 1 ? 's' : ''} lost, organic lift still sustains the current firing rate.
        </div>
      {/if}
    {/if}
  </div>
  {/if}
</div>
{/if}

<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => forecastOpen = !forecastOpen}>
    <span>📈 N-Day Ammo Projection</span>
    <button class="info-btn" on:click={e => toggleInfo('forecast', e)}>ⓘ</button>
    <span>{forecastOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.forecast}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.forecast}</div>
  {/if}
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
