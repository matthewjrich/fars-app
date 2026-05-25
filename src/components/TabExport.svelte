<script>
  import { onMount } from 'svelte';
  import { fmt, fmtD, fmtCurrency } from '../lib/utils.js';
  import { EFC_TABLE, EFC_TABLE_105, BARREL_LIFE } from '../lib/data.js';

  export let config;
  export let computed;
  export let rsrValues = {};
  export let csrByRound = {};

  $: v = config;
  $: c = computed;

  let unitDesig = '';

  // — Data pulled from sibling localStorage stores —
  let readinessData = null;
  let efcData = null;
  let notesData = null;
  let taskorgData = null;

  onMount(() => {
    try { readinessData = JSON.parse(localStorage.getItem('fars_readiness_v1')); } catch (_) {}
    try { efcData       = JSON.parse(localStorage.getItem('fars_efc_v1'));        } catch (_) {}
    try { notesData     = JSON.parse(localStorage.getItem('fars_notes_v1'));      } catch (_) {}
    try { taskorgData   = JSON.parse(localStorage.getItem('fars_taskorg_v1'));    } catch (_) {}
  });

  function computeEfcSummary(cfg) {
    if (!efcData?.gunEfc) return null;
    const table = cfg.isM119 ? EFC_TABLE_105 : EFC_TABLE;
    const barrelLife = cfg.isM119 ? 3000 : (BARREL_LIFE[cfg.unitType] || 1500);
    const gunTotals = Object.entries(efcData.gunEfc).map(([idx, entries]) => {
      const total = entries.reduce((a, e, i) => a + (e.qty || 0) * (table[i]?.efc || 0), 0);
      return { gun: Number(idx), efc: Math.round(total * 10) / 10 };
    });
    const fleet = gunTotals.reduce((a, g) => a + g.efc, 0);
    const highest = gunTotals.reduce((a, g) => Math.max(a, g.efc), 0);
    return { gunTotals, fleet: Math.round(fleet * 10) / 10, highest: Math.round(highest * 10) / 10, barrelLife };
  }

  $: logstatText = buildLogstat(unitDesig, readinessData, efcData, notesData, taskorgData);

  function buildLogstat(desig, rdns, efc, nts, torg) {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10);
    const unitLabel = desig || `${v.echelon} ${v.unitType}`;
    const lines = [
      `═══════════════════════════════════════════════════════`,
      `LOGSTAT — ${unitLabel}`,
      `Generated: ${dateStr} | FARS Field Artillery Resource Sync`,
      `═══════════════════════════════════════════════════════`,
      ``,
      `UNIT STATUS:`,
      `  Unit:       ${unitLabel}`,
      `  System:     ${v.unitType} (${v.echelon})`,
      `  Tubes/Lnch: ${v.tubes}`,
      `  Config:     ${v.isCannon ? '86 complete rds/flatrack (Army planning factor)' : 'Rocket/Pod'}`,
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

    // — PERSTAT —
    if (rdns?.perstatData && Object.keys(rdns.perstatData).length > 0) {
      lines.push(``);
      lines.push(`PERSONNEL STATUS (PERSTAT):`);
      for (const [el, d] of Object.entries(rdns.perstatData)) {
        if (!d || (!d.assigned && !d.present && !d.available)) continue;
        lines.push(`  ${el.padEnd(18)} Assigned: ${String(d.assigned || 0).padStart(3)}  Present: ${String(d.present || 0).padStart(3)}  Available: ${String(d.available || 0).padStart(3)}${d.notes ? `  (${d.notes})` : ''}`);
      }
      const totA = Object.values(rdns.perstatData).reduce((a, d) => a + (d?.assigned || 0), 0);
      const totAv = Object.values(rdns.perstatData).reduce((a, d) => a + (d?.available || 0), 0);
      lines.push(`  ${'TOTAL'.padEnd(18)} Assigned: ${String(totA).padStart(3)}  Available: ${String(totAv).padStart(3)}  (${totA > 0 ? Math.round(totAv / totA * 100) : 100}%)`);
    }

    // — MAINTSTAT —
    if (rdns?.maintData && Object.keys(rdns.maintData).length > 0) {
      lines.push(``);
      lines.push(`MAINTENANCE STATUS (MAINTSTAT):`);
      let totOH = 0, totFmc = 0, totNmc = 0;
      for (const [name, d] of Object.entries(rdns.maintData)) {
        if (!d) continue;
        const nmc = Math.max(0, (d.onHand || 0) - (d.fmc || 0) - (d.pmc || 0));
        const pct = d.onHand > 0 ? Math.round(d.fmc / d.onHand * 100) : 100;
        lines.push(`  ${name.padEnd(28)} OH: ${String(d.onHand || 0).padStart(3)}  FMC: ${String(d.fmc || 0).padStart(3)}  PMC: ${String(d.pmc || 0).padStart(3)}  NMC: ${String(nmc).padStart(3)}  (${pct}% FMC)`);
        totOH += d.onHand || 0; totFmc += d.fmc || 0; totNmc += nmc;
      }
      const fleetPct = totOH > 0 ? Math.round(totFmc / totOH * 100) : 100;
      lines.push(`  ${'FLEET TOTAL'.padEnd(28)} OH: ${String(totOH).padStart(3)}  FMC: ${String(totFmc).padStart(3)}  NMC: ${String(totNmc).padStart(3)}  (${fleetPct}% FMC)`);
    }

    // — EFC —
    const efcSummary = computeEfcSummary(v);
    if (efcSummary && efcSummary.gunTotals.length > 0) {
      lines.push(``);
      lines.push(`BARREL LIFE / EFC (Equivalent Full Charge):`);
      lines.push(`  Barrel Life Limit: ${efcSummary.barrelLife} EFC`);
      efcSummary.gunTotals.sort((a, b) => a.gun - b.gun).forEach(g => {
        const remaining = efcSummary.barrelLife - g.efc;
        const pct = Math.round(g.efc / efcSummary.barrelLife * 100);
        lines.push(`  Gun ${String(g.gun).padStart(2)}: ${String(g.efc).padStart(7)} EFC  (${pct}% life used · ${remaining > 0 ? remaining + ' remaining' : 'REPLACE'})`);
      });
      lines.push(`  Fleet Total: ${efcSummary.fleet} EFC  |  Highest Gun: ${efcSummary.highest} EFC`);
    }

    // — PACE PLAN —
    if (torg?.pacePlans?.length) {
      lines.push(``);
      lines.push(`PACE PLAN:`);
      torg.pacePlans.forEach(plan => {
        lines.push(`  ${plan.title || '(untitled)'}`);
        plan.entries.forEach(e => {
          const tier    = `  ${e.tier} (${['P','A','C','E'].indexOf(e.tier) === 0 ? 'Primary' : e.tier === 'A' ? 'Alternate' : e.tier === 'C' ? 'Contingency' : 'Emergency'})`.padEnd(20);
          const means   = (e.means   || '—').padEnd(24);
          const details = (e.details || '—').padEnd(20);
          const status  = `[${e.status}]`;
          lines.push(`  ${tier} ${means} ${details} ${status}`);
        });
      });
    }

    // — NMC —
    if (torg?.nmcItems?.length) {
      lines.push(``);
      lines.push(`NMC — NON-MISSION CAPABLE EQUIPMENT (${torg.nmcItems.length} items):`);
      const byUnit = torg.nmcItems.reduce((a, n) => {
        const k = n.unit || 'Unassigned'; if (!a[k]) a[k] = []; a[k].push(n); return a;
      }, {});
      for (const [unit, items] of Object.entries(byUnit)) {
        lines.push(`  ${unit} (${items.length}):`);
        items.forEach(n => {
          const eq   = n.equipment || '?';
          const fault = n.fault    || '—';
          const rtd  = n.rtd       ? `  RTD: ${n.rtd}` : '';
          lines.push(`    ${eq.padEnd(20)} ${fault}${rtd}`);
        });
      }
    }

    // — CP LOCATIONS —
    if (torg?.cpList?.length) {
      const filled = torg.cpList.filter(c => c.name || c.grid);
      if (filled.length) {
        lines.push(``);
        lines.push(`COMMAND POST (CP) LOCATIONS:`);
        filled.forEach(c => {
          const name   = (c.name || '(unnamed)').padEnd(20);
          const status = `[${c.status}]`.padEnd(14);
          const grid   = c.grid || '—';
          lines.push(`  ${name} ${status} ${grid}`);
        });
      }
    }

    // — PAA LOCATIONS —
    if (torg?.paaList?.length) {
      const filled = torg.paaList.filter(p => p.name || p.grid);
      if (filled.length) {
        lines.push(``);
        lines.push(`POSITION AREAS (PAA):`);
        filled.forEach(p => {
          const name   = (p.name || '(unnamed)').padEnd(20);
          const status = `[${p.status}]`.padEnd(16);
          const grid   = (p.grid || '—').padEnd(22);
          const unit   = p.unit ? `${p.unit}${p.guns ? ` (${p.guns} guns)` : ''}` : '—';
          lines.push(`  ${name} ${status} ${grid} ${unit}`);
        });
      }
    }

    // — NOTES —
    if (nts?.notes?.length) {
      const hasContent = nts.notes.some(n => n.title || n.body);
      if (hasContent) {
        lines.push(``);
        lines.push(`PLANNING NOTES:`);
        nts.notes.forEach(n => {
          if (!n.title && !n.body) return;
          if (n.title) lines.push(`  ── ${n.title} ──`);
          if (n.body) n.body.split('\n').forEach(l => lines.push(`  ${l}`));
          lines.push(``);
        });
      }
    }

    lines.push(`═══════════════════════════════════════════════════════`);

    return lines.join('\n');
  }

  function copyLogstat() {
    navigator.clipboard.writeText(logstatText).catch(() => {});
  }

  function refreshSiblingData() {
    try { readinessData = JSON.parse(localStorage.getItem('fars_readiness_v1')); } catch (_) {}
    try { efcData       = JSON.parse(localStorage.getItem('fars_efc_v1'));        } catch (_) {}
    try { notesData     = JSON.parse(localStorage.getItem('fars_notes_v1'));      } catch (_) {}
    try { taskorgData   = JSON.parse(localStorage.getItem('fars_taskorg_v1'));    } catch (_) {}
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
      ['Munition','RSR','CSR'],
      ...Object.entries(rsrValues).filter(([,v])=>v>0).map(([k,val])=>[k, val, csrByRound[k] || '']),
    ];

    // PERSTAT
    if (readinessData?.perstatData && Object.keys(readinessData.perstatData).length > 0) {
      rows.push([], ['PERSTAT'], ['Element','Assigned','Present','Available']);
      for (const [el, d] of Object.entries(readinessData.perstatData)) {
        if (!d) continue;
        rows.push([el, d.assigned || 0, d.present || 0, d.available || 0]);
      }
    }

    // MAINTSTAT
    if (readinessData?.maintData && Object.keys(readinessData.maintData).length > 0) {
      rows.push([], ['MAINTSTAT'], ['Vehicle','On Hand','FMC','PMC','NMC','FMC %']);
      for (const [name, d] of Object.entries(readinessData.maintData)) {
        if (!d) continue;
        const nmc = Math.max(0, (d.onHand || 0) - (d.fmc || 0) - (d.pmc || 0));
        const pct = d.onHand > 0 ? Math.round(d.fmc / d.onHand * 100) : 100;
        rows.push([name, d.onHand || 0, d.fmc || 0, d.pmc || 0, nmc, pct + '%']);
      }
    }

    // EFC
    const efcSummary = computeEfcSummary(v);
    if (efcSummary?.gunTotals.length > 0) {
      rows.push([], ['BARREL LIFE / EFC'], ['Gun','EFC','Barrel Life','% Used','Remaining']);
      efcSummary.gunTotals.sort((a, b) => a.gun - b.gun).forEach(g => {
        rows.push([`Gun ${g.gun}`, g.efc, efcSummary.barrelLife, Math.round(g.efc / efcSummary.barrelLife * 100) + '%', efcSummary.barrelLife - g.efc]);
      });
    }

    // NMC
    if (taskorgData?.nmcItems?.length) {
      rows.push([], ['NMC — NON-MISSION CAPABLE'], ['Unit','Equipment','Fault / Reason','Est. RTD']);
      taskorgData.nmcItems.forEach(n => rows.push([
        n.unit || '', n.equipment || '', n.fault || '', n.rtd || '',
      ]));
    }

    // CP Locations
    if (taskorgData?.cpList?.length) {
      const filled = taskorgData.cpList.filter(c => c.name || c.grid);
      if (filled.length) {
        rows.push([], ['COMMAND POST (CP) LOCATIONS'], ['CP Name','Status','Grid']);
        filled.forEach(c => rows.push([
          `"${(c.name||'').replace(/"/g,'""')}"`,
          c.status,
          c.grid || '',
        ]));
      }
    }

    // PAA Locations
    if (taskorgData?.paaList?.length) {
      const filled = taskorgData.paaList.filter(p => p.name || p.grid);
      if (filled.length) {
        rows.push([], ['POSITION AREAS (PAA)'], ['PAA Name','Status','Grid','Occupying Unit','Guns']);
        filled.forEach(p => rows.push([
          `"${(p.name||'').replace(/"/g,'""')}"`,
          p.status,
          p.grid  || '',
          p.unit  || '',
          p.guns  || '',
        ]));
      }
    }

    // Notes
    if (notesData?.notes?.length) {
      rows.push([], ['PLANNING NOTES'], ['Title','Body']);
      notesData.notes.forEach(n => {
        if (n.title || n.body) rows.push([`"${(n.title || '').replace(/"/g,'""')}"`, `"${(n.body || '').replace(/"/g,'""').replace(/\n/g,' | ')}"`]);
      });
    }

    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `fars_logstat_${v.unitType}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }
</script>

<div class="section-title">Export / LOGSTAT</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Generate a plain-text LOGSTAT for briefings or copy to clipboard. Download as CSV for spreadsheet use.</p>

<div class="field" style="max-width:360px;margin-bottom:16px;">
  <label>Unit Designation <span style="color:var(--text-dim);font-weight:400;">(optional — overrides auto-generated header)</span></label>
  <input type="text" bind:value={unitDesig} placeholder="e.g. 1-15 FA, A/1-15 FA, 3rd PLT B/1-15 FA">
</div>

<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
  <button class="btn" on:click={copyLogstat}>Copy LOGSTAT</button>
  <button class="btn" on:click={downloadCsv}>Download CSV</button>
  <button class="btn btn-outline" on:click={refreshSiblingData} style="font-size:12px;">Refresh (Readiness / EFC / Notes)</button>
</div>
<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;">
  Readiness, EFC, and Notes data are read from their tabs at load time. Click Refresh if you updated those tabs in this session.
</div>

<pre class="logstat-pre">{logstatText}</pre>
