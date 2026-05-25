<script>
  import { fmt, fmtD } from '../lib/utils.js';

  export let config;
  export let computed;

  $: v = config;
  $: c = computed;

  let volleys = 6;
  let fireMode = 'pods'; // for rocket systems

  // ── Reference data ──
  const ROF_REF = {
    'M109A7': { burst: '4 rds/min', sustained: '1 rd/min',         note: '2-min burst limit' },
    'M109A6': { burst: '4 rds/min', sustained: '1 rd/min',         note: '2-min burst limit' },
    'M777A2': { burst: '5 rds/min', sustained: '2 rds/min',        note: '2-min burst limit' },
    'M119A3': { burst: '8 rds/min', sustained: '3 rds/min',        note: '2-min burst limit' },
    'HIMARS':  { burst: '6 rkts / 45 sec', sustained: 'Reload-limited', note: '1 pod per launcher · ~20 min reload' },
    'MLRS':    { burst: '12 rkts / 60 sec', sustained: 'Reload-limited', note: '2 pods per launcher · ~10 min reload' },
  };

  const RANGE_REF = {
    cannon155: [
      { mun: 'M795 HE',            min: 3,   max: 24,   note: 'Standard HE — all 155mm platforms' },
      { mun: 'M549A1 RAP',         min: 3,   max: 30,   note: 'Rocket-Assisted Projectile' },
      { mun: 'M982 Excalibur',     min: 6,   max: 57,   note: 'GPS-guided; 57 km (A7) · 40 km (A6/M777)' },
      { mun: 'M864 DPICM',         min: 4,   max: 29,   note: 'Dual-Purpose Improved Conv. Munition' },
      { mun: 'M110A2 WP/SMK',      min: 3,   max: 18,   note: 'White Phosphorus / Smoke' },
      { mun: 'M485/M1066 ILLUM',   min: 3,   max: 18,   note: 'Illumination' },
    ],
    cannon105: [
      { mun: 'M913 HE',            min: 3,   max: 14,   note: 'Standard HE — M119A3' },
      { mun: 'M916 RAP',           min: 3,   max: 19.5, note: 'Rocket-Assisted Projectile' },
      { mun: 'M84 ILLUM',          min: 4,   max: 12,   note: 'Illumination' },
      { mun: 'M60 WP',             min: 3,   max: 7,    note: 'White Phosphorus / Smoke' },
    ],
    rockets: [
      { mun: 'M30/M31 GMLRS',     min: 15,  max: 84,   note: 'HIMARS: 1 pod (6 rkts) · MLRS: 2 pods (12 rkts)' },
      { mun: 'M57 ATACMS',         min: 70,  max: 300,  note: 'Block IA — HIMARS & MLRS' },
      { mun: 'PrSM (M501/M502)',   min: 60,  max: 499,  note: 'Precision Strike Missile — HIMARS only' },
    ],
  };

  $: rofRef = !v.isCannon
    ? {
        burst:      v.isMlrs ? '12 rkts / 60 sec' : '6 rkts / 45 sec',
        sustained:  'Reload-limited',
        note:       `${v.isMlrs ? '2 pods' : '1 pod'} per launcher · ${v.reloadTime} min reload`,
        reloadMin:  v.reloadTime,
        podsPerHr:  +(60 / v.reloadTime).toFixed(1),
        rktsPerHr:  Math.round(60 / v.reloadTime * (v.isMlrs ? 12 : 6)),
      }
    : (ROF_REF[v.unitType] || null);
  $: rangeRows = v.isM119 ? RANGE_REF.cannon105 : v.isCannon ? RANGE_REF.cannon155 : RANGE_REF.rockets;
  let refOpen  = false;

  // ── Shell-Fuze Combinations ──
  const FUZE_REF = {
    cannon155: [
      { round: 'M795 HE',
        fuzes: [
          { fuze: 'M557',        mode: 'PD Superquick' },
          { fuze: 'M739A1',      mode: 'PD SQ / Delay' },
          { fuze: 'M767',        mode: 'PD SQ / Delay' },
          { fuze: 'M782 MOFA',   mode: 'PD / Delay / Time / Prox', pref: true },
          { fuze: 'M577A1',      mode: 'VT / Proximity' },
          { fuze: 'M728',        mode: 'Controlled VT (CVT)' },
          { fuze: 'M1156 PGK',   mode: 'GPS + PD / Delay', note: 'Converts M795 to precision-guided' },
        ],
        note: 'Widest fuze selection — standard HE mission',
      },
      { round: 'M549A1 RAP',
        fuzes: [
          { fuze: 'M557',      mode: 'PD Superquick' },
          { fuze: 'M739A1',    mode: 'PD SQ / Delay' },
          { fuze: 'M782 MOFA', mode: 'PD / Delay / Time / Prox', pref: true },
        ],
        note: 'Reduced fuze selection vs. M795 — verify TM 43-0001-28-2',
      },
      { round: 'M982 Excalibur',
        fuzes: [{ fuze: 'Integral', mode: 'GPS + PD (no selection)', note: 'Fuze assembly integral — no separate fuze authorized' }],
        note: 'GPS-guided; fuze integral to projectile',
      },
      { round: 'M864 DPICM',
        fuzes: [
          { fuze: 'M577A1', mode: 'VT — carrier ejection' },
          { fuze: 'M762A1', mode: 'Electronic Time — carrier ejection' },
        ],
        restricted: 'DC fires NOT authorized — submunitions self-function',
        note: 'Fuze ejects carrier shell; M42/M46 submunitions self-function on impact',
      },
      { round: 'M110A2 WP',
        fuzes: [{ fuze: 'M557', mode: 'PD Superquick' }],
        note: 'Point det only — WP bursts on impact',
      },
      { round: 'M485 / M1066 ILLUM',
        fuzes: [{ fuze: 'M501A3 / M500A3', mode: 'Mechanical Time' }],
        note: 'Set per firing table for desired burst height and illumination time',
      },
    ],
    cannon105: [
      { round: 'M913 HE',
        fuzes: [
          { fuze: 'M557',      mode: 'PD Superquick' },
          { fuze: 'M739A1',    mode: 'PD SQ / Delay' },
          { fuze: 'M782 MOFA', mode: 'PD / Delay / Time / Prox', pref: true },
        ],
        note: 'Standard HE — M119A3',
      },
      { round: 'M916 RAP',
        fuzes: [
          { fuze: 'M557',   mode: 'PD Superquick' },
          { fuze: 'M739A1', mode: 'PD SQ / Delay' },
        ],
        note: 'Verify current TM 43-0001-28-1 for all authorized fuze lots',
      },
      { round: 'M60 WP',
        fuzes: [{ fuze: 'M557', mode: 'PD Superquick' }],
        note: 'Point det only',
      },
      { round: 'M84 ILLUM',
        fuzes: [{ fuze: 'M514 / M500A3', mode: 'Mechanical Time' }],
        note: 'Set per firing table for desired burst height',
      },
    ],
    rockets: [
      { round: 'M30 GMLRS (HE Cargo)',
        fuzes: [{ fuze: 'Integral', mode: 'GPS + Proximity / Impact' }],
        note: 'No fuze selection — integral fuze assembly; submunitions self-function',
      },
      { round: 'M31 GMLRS (Unitary)',
        fuzes: [{ fuze: 'Integral', mode: 'GPS + PD / Delay (fire control selectable)' }],
        note: 'Effect selected via mission data upload — not a mechanical fuze change',
      },
      { round: 'M57 ATACMS',
        fuzes: [{ fuze: 'Integral', mode: 'GPS + Impact / Height-of-Burst' }],
        note: 'Block IA — integral fuze; no field selection authorized',
      },
      { round: 'PrSM (M501/M502)',
        fuzes: [{ fuze: 'Integral', mode: 'GPS / Multi-effect' }],
        note: 'HIMARS only — terminal effect configured via mission data',
      },
    ],
  };

  $: fuzeRows = v.isM119 ? FUZE_REF.cannon105 : v.isCannon ? FUZE_REF.cannon155 : FUZE_REF.rockets;
  let fuzeOpen = false;

  // ── Danger Close ──
  const DC_REF = {
    cannon: {
      dist: 600,
      precision: [
        { mun: 'M982 Excalibur', dist: 200, note: 'GPS-guided — reduced DC authorized' },
      ],
      restricted: ['M864 DPICM / M483A1 — DC fires NOT authorized'],
      source: 'FM 3-09 / ATP 3-09.30',
    },
    rockets: {
      dist: 750,
      precision: [
        { mun: 'GMLRS (M30/M31/M31A1 unitary)', dist: 200, note: 'GPS-guided unitary — reduced DC authorized' },
      ],
      restricted: ['DPICM rockets — DC fires NOT authorized'],
      source: 'FM 3-09 / ATP 3-09.30',
    },
  };

  $: dcRef   = v.isCannon ? DC_REF.cannon : DC_REF.rockets;
  let dcDist = null;
  let dcOpen = false;
  $: dcStatus = dcDist == null ? null : dcDist <= dcRef.dist ? 'DANGER CLOSE' : 'CLEAR';

  let infoOpen = {};
  function toggleInfo(k, e) { e.stopPropagation(); infoOpen = { ...infoOpen, [k]: !infoOpen[k] }; }

  const INFO = {
    dc:   'Danger Close applies when friendly troops are within the established minimum safe distance of the target. Standard distances: 600 m (cannon), 750 m (rockets). Precision-guided munitions (Excalibur, GMLRS unitary) have reduced DC distances of 200 m. DC must be announced with the fire mission and requires commander authorization.',
    rof:  'Rate of Fire data from current TM/TC series. Burst rate is maximum sustainable for 2 minutes before barrel cooling is required. For rocket systems, sustained rate is reload-limited — the reload time configured in the sidebar drives the Pods/Hour calculation shown here.',
    fuze: 'Shell-fuze combinations authorized per TM 43-0001-28 series. Combinations not listed are not authorized. PD = Point Detonating. VT = Variable Time (proximity). MT = Mechanical Time. CVT = Controlled Variable Time. ★ = preferred fuze for general-purpose fire missions.',
  };

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

<div class="expander" style="margin-top:16px;">
  <div class="expander-header" on:click={() => dcOpen = !dcOpen}>
    <span>Danger Close Criteria</span>
    <button class="info-btn" on:click={e => toggleInfo('dc', e)}>ⓘ</button>
    <span>{dcOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.dc}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.dc}</div>
  {/if}
  {#if dcOpen}
  <div class="expander-body" style="padding:0;">
    <div style="padding:14px;border-bottom:1px solid var(--border);">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div class="metric-card" style="margin-bottom:0;border-color:#ffa198;border-top-color:#ffa198;">
          <div class="metric-label">Standard DC Distance</div>
          <div class="metric-value" style="color:#ffa198;font-size:22px;">{dcRef.dist} m</div>
          <div class="metric-sub">Fires within this distance = DANGER CLOSE</div>
        </div>
        <div class="metric-card" style="margin-bottom:0;">
          <div class="metric-label">DC Check — Distance to Friendlies</div>
          <input type="number" bind:value={dcDist} min="0" placeholder="Enter meters…"
            style="width:100%;margin-top:4px;">
          {#if dcStatus}
            <div style="margin-top:6px;font-weight:700;font-size:13px;
              color:{dcStatus === 'DANGER CLOSE' ? '#ffa198' : '#3fb950'};">
              {dcStatus === 'DANGER CLOSE' ? '⚠️ DANGER CLOSE' : '✅ CLEAR'}
            </div>
          {/if}
        </div>
      </div>

      {#if dcRef.precision.length}
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;letter-spacing:0.8px;margin-bottom:6px;">Precision Munition Exceptions</div>
        {#each dcRef.precision as p}
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;margin-bottom:4px;">
            <span style="color:var(--gold);">{p.mun}</span>
            <span style="color:#3fb950;font-family:'Share Tech',sans-serif;font-weight:700;">{p.dist} m DC</span>
          </div>
          <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">{p.note}</div>
        {/each}
      {/if}

      {#each dcRef.restricted as r}
        <div class="alert alert-error" style="margin-bottom:0;font-size:12px;">🚫 {r}</div>
      {/each}
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-dim);">
      Report as DANGER CLOSE when announcing the mission. Requires commander approval. Source: {dcRef.source}.
    </div>
  </div>
  {/if}
</div>

<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => refOpen = !refOpen}>
    <span>Quick Reference — Rate of Fire &amp; Ranges</span>
    <button class="info-btn" on:click={e => toggleInfo('rof', e)}>ⓘ</button>
    <span>{refOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.rof}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.rof}</div>
  {/if}
  {#if refOpen}
  <div class="expander-body" style="padding:0;">
    {#if rofRef}
    <div style="padding:12px 14px;border-bottom:1px solid var(--border);">
      <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;font-weight:700;letter-spacing:0.8px;margin-bottom:10px;">Rate of Fire — {v.unitType}</div>
      <div style="display:grid;grid-template-columns:{!v.isCannon ? '1fr 1fr 1fr' : '1fr 1fr'};gap:8px;">
        <div class="metric-card" style="margin-bottom:0;">
          <div class="metric-label">Burst Rate</div>
          <div class="metric-value" style="font-size:15px;">{rofRef.burst}</div>
          <div class="metric-sub">{rofRef.note}</div>
        </div>
        <div class="metric-card" style="margin-bottom:0;">
          <div class="metric-label">Sustained Rate</div>
          <div class="metric-value" style="font-size:15px;">{rofRef.sustained}</div>
          {#if !v.isCannon}<div class="metric-sub">Reload: {rofRef.reloadMin} min / pod</div>{/if}
        </div>
        {#if !v.isCannon}
        <div class="metric-card" style="margin-bottom:0;">
          <div class="metric-label">Pods / Hr per Launcher</div>
          <div class="metric-value" style="font-size:15px;">{rofRef.podsPerHr}</div>
          <div class="metric-sub">{rofRef.rktsPerHr} rockets / hr</div>
        </div>
        {/if}
      </div>
    </div>
    {/if}
    <div style="overflow-x:auto;">
      <table class="data-table" style="margin:0;border-radius:0;">
        <thead>
          <tr>
            <th>Munition</th>
            <th>Min Range</th>
            <th>Max Range</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each rangeRows as r}
            <tr>
              <td style="font-weight:700;color:var(--gold);white-space:nowrap;">{r.mun}</td>
              <td style="font-family:'Share Tech',sans-serif;">{r.min} km</td>
              <td style="font-family:'Share Tech',sans-serif;color:var(--gold);font-weight:700;">{r.max} km</td>
              <td style="font-size:11px;color:var(--text-dim);">{r.note}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-dim);">
      Ranges are approximate planning figures. Actual range varies by charge, propellant lot, altitude, and temperature. Consult current firing tables (TM 43-0001-28 series).
    </div>
  </div>
  {/if}
</div>

<div class="expander" style="margin-top:8px;">
  <div class="expander-header" on:click={() => fuzeOpen = !fuzeOpen}>
    <span>Shell-Fuze Combinations</span>
    <button class="info-btn" on:click={e => toggleInfo('fuze', e)}>ⓘ</button>
    <span>{fuzeOpen ? '▲' : '▼'}</span>
  </div>
  {#if infoOpen.fuze}
    <div class="info-popover" style="margin:0;border-top:none;border-radius:0;">{INFO.fuze}</div>
  {/if}
  {#if fuzeOpen}
  <div class="expander-body" style="padding:0;">
    <div class="alert alert-warn" style="margin:12px 14px 0;font-size:12px;line-height:1.5;">
      ⚠️ PLANNING REFERENCE ONLY — Verify all fuze-projectile combinations against current TM 43-0001-28 series and applicable firing tables before live fire. Authorizations may be charge-, propellant-lot-, or mission-dependent.
    </div>
    <div style="overflow-x:auto;">
      <table class="data-table" style="margin:12px 0 0;border-radius:0;">
        <thead>
          <tr>
            <th>Round</th>
            <th>Fuze</th>
            <th>Mode(s)</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {#each fuzeRows as row}
            {#each row.fuzes as f, fi}
              <tr>
                {#if fi === 0}
                  <td rowspan={row.fuzes.length + (row.restricted ? 1 : 0)}
                      style="font-weight:700;color:var(--gold);white-space:nowrap;vertical-align:top;border-right:1px solid var(--border);">
                    {row.round}
                  </td>
                {/if}
                <td style="white-space:nowrap;font-family:'Share Tech',sans-serif;{f.pref ? 'color:var(--gold);font-weight:700;' : ''}">
                  {f.fuze}{f.pref ? ' ★' : ''}
                </td>
                <td style="font-size:12px;">{f.mode}</td>
                <td style="font-size:11px;color:var(--text-dim);">{fi === 0 ? (row.note || '') : (f.note || '')}</td>
              </tr>
            {/each}
            {#if row.restricted}
              <tr style="background:rgba(248,81,73,0.07);">
                <td colspan="3" style="font-size:12px;color:#ffa198;font-weight:700;padding:6px 12px;">
                  🚫 {row.restricted}
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-dim);">
      Sources: TM 43-0001-28 series · FM 3-09 · ATP 3-09.30. ★ = preferred fuze for general-purpose fire missions.
    </div>
  </div>
  {/if}
</div>
