<script>
  import { fmt, fmtD, fmtCurrency } from '../lib/utils.js';

  export let config;
  export let computed;
  export let rsrValues = {};
  export let csrByRound = {};

  $: v = config;
  $: c = computed;

  $: logstatText = buildLogstat();

  function buildLogstat() {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10);
    const lines = [
      `═══════════════════════════════════════════════════════`,
      `LOGSTAT — ${v.echelon} ${v.unitType}`,
      `Generated: ${dateStr} | FARS Field Artillery Resource Sync`,
      `═══════════════════════════════════════════════════════`,
      ``,
      `UNIT STATUS:`,
      `  System:     ${v.unitType} (${v.echelon})`,
      `  Tubes/Lnch: ${v.tubes}`,
      `  Config:     ${v.isCannon ? (v.cclMode ? 'CCL (144 rds/flatrack)' : 'Loose (160 rds/flatrack)') : 'Rocket/Pod'}`,
      ``,
      `LIFT CAPACITY:`,
      `  Total Capacity:  ${fmt(c.totalRoundsCap)} ${v.isCannon ? 'rounds' : 'pods'}`,
      `  Effective Rounds: ${fmt(c.effectiveRounds)} (after ${v.dudRate}% dud)`,
      `  Haul (lbs):      ${fmt(c.haulLbs)}`,
      `  Haul (STONs):    ${fmtD(c.haulStons)}`,
      ``,
      `SUSTAINMENT:`,
      `  Dist to SP:       ${v.dist} km`,
      `  Turnaround:       ${fmtD(c.totalTurnaround)} hrs/run`,
      `  Runs Possible/Day: ${c.runsPerDay}`,
      `  Runs Needed/Day:   ${c.runsNeeded}`,
      `  Daily Lift Cap:    ${fmt(c.dailyLiftCap)} rds`,
      `  Daily Usage:       ${fmt(Math.round(c.dailyUsage))} rds`,
      `  DOS:               ${c.dosAvail >= 999 ? '∞' : fmtD(c.dosAvail)} days`,
      ``,
      `RESUPPLY COST (FY24 OSMIS):`,
      `  CL IX / Run:   ${fmtCurrency(c.totalRunCost)}`,
      `  Daily Run Cost: ${fmtCurrency(c.dailyRunCost)}`,
      `  Distance RT:   ${fmtD(c.distMiles, 1)} miles`,
      ``,
      `RSR (MISSION REQUIREMENTS):`,
    ];

    const munEntries = Object.entries(rsrValues).filter(([, v]) => v > 0);
    if (munEntries.length > 0) {
      munEntries.forEach(([k, val]) => {
        const csr = csrByRound[k];
        lines.push(`  ${k.padEnd(30)} ${String(val).padStart(6)} ${v.isCannon ? 'rds' : 'pods'}${csr ? ` (CSR: ${csr})` : ''}`);
      });
    } else {
      lines.push(`  (No RSR entered — use Manual planning mode)`);
    }

    lines.push(``);
    lines.push(`CAPACITY UTILIZATION: ${fmtD(c.spatialUtil)}%`);
    lines.push(`STATUS: ${c.runsPerDay >= c.runsNeeded ? 'SUSTAINMENT FEASIBLE' : '*** RESUPPLY SHORTFALL ***'}`);
    lines.push(`═══════════════════════════════════════════════════════`);

    return lines.join('\n');
  }

  function copyLogstat() {
    navigator.clipboard.writeText(logstatText).catch(() => {});
  }

  function downloadCsv() {
    const rows = [
      ['Field','Value'],
      ['Unit Type', v.unitType],
      ['Echelon', v.echelon],
      ['Tubes', v.tubes],
      ['Total Rounds Cap', c.totalRoundsCap],
      ['Effective Rounds', c.effectiveRounds],
      ['Haul lbs', c.haulLbs],
      ['Haul STONs', fmtD(c.haulStons)],
      ['Distance km', v.dist],
      ['Turnaround hrs', fmtD(c.totalTurnaround)],
      ['Runs/Day Possible', c.runsPerDay],
      ['Runs/Day Needed', c.runsNeeded],
      ['Daily Lift Cap', c.dailyLiftCap],
      ['Daily Usage', Math.round(c.dailyUsage)],
      ['DOS', c.dosAvail >= 999 ? 'Inf' : fmtD(c.dosAvail)],
      ['CL IX per Run', fmtCurrency(c.totalRunCost)],
      ['Daily Run Cost', fmtCurrency(c.dailyRunCost)],
      ['Capacity Util %', fmtD(c.spatialUtil)],
      [],
      ['RSR Values'],
      ['Munition','Qty'],
      ...Object.entries(rsrValues).filter(([,v])=>v>0).map(([k,val])=>[k,val]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `fars_logstat_${v.unitType}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }
</script>

<div class="section-title">Export / LOGSTAT</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Generate a plain-text LOGSTAT for briefings or copy to clipboard. Download as CSV for spreadsheet use.</p>

<div style="display:flex;gap:10px;margin-bottom:16px;">
  <button class="btn" on:click={copyLogstat}>📋 Copy LOGSTAT</button>
  <button class="btn" on:click={downloadCsv}>⬇ Download CSV</button>
</div>

<pre class="logstat-pre">{logstatText}</pre>
