<script>
  import { onMount } from 'svelte';
  import { nmcCount, paceDown } from '../lib/nmc.js';

  export let config;
  $: v = config;

  let unitDesig = '';
  let higherHQ  = '';
  let higherRel = 'OPCON';
  let viewMode  = 'tree';

  let btryNames   = ['A Btry', 'B Btry', 'C Btry', 'D Btry', 'E Btry', 'F Btry'];
  let editingNames = false;

  let attached = [];
  let nextId   = 1;
  let showAdd  = false;
  let newUnit  = { name: '', rel: 'DS', sub: '', notes: '' };
  let addErr   = '';

  const RELS = ['OPCON', 'TACON', 'ADCON', 'DS', 'GS', 'R', 'GSR', 'ATT'];

  const REL_COLOR = {
    ORG:   '#4a6741',
    OPCON: '#e8c96a',
    TACON: '#e07c1a',
    ADCON: '#7f8c8d',
    DS:    '#4a90d9',
    GS:    '#27ae60',
    R:     '#8e44ad',
    GSR:   '#16a085',
    ATT:   '#c0392b',
  };

  const REL_DESC = {
    ORG:   'Organic — permanently assigned',
    OPCON: 'Operational Control — organize, employ, assign tasks',
    TACON: 'Tactical Control — detailed direction of movements',
    ADCON: 'Administrative Control — admin & support only',
    DS:    'Direct Support — support one specific unit',
    GS:    'General Support — support the force as a whole',
    R:     'Reinforcing — support another supporting unit',
    GSR:   'General Support-Reinforcing',
    ATT:   'Attached — temporary command authority',
  };

  function vdropStyle(rel) {
    const c = REL_COLOR[rel] || REL_COLOR.ORG;
    if (rel === 'TACON')
      return `background:repeating-linear-gradient(to bottom,${c} 0,${c} 4px,transparent 4px,transparent 8px);`;
    if (rel === 'ADCON')
      return `background:repeating-linear-gradient(to bottom,${c} 0,${c} 2px,transparent 2px,transparent 5px);`;
    return `background:${c};`;
  }

  function badgeTextColor(rel) {
    return ['OPCON','TACON','GS','R','GSR'].includes(rel) ? '#111' : '#fff';
  }

  $: organic = inferOrganic(v, btryNames, v.useRoster || false, v.rosterBatteries || []);

  function inferOrganic(cfg, names, roster, batteries) {
    if (cfg.echelon === 'Battalion') {
      const nodes = [{ id: 'hhb', name: 'HHB', rel: 'ORG', sub: '', tubes: 0, isOrganic: true }];

      if (roster && batteries.length > 0) {
        // Non-standard: use exact per-battery data from the roster
        batteries.forEach((b, i) => {
          const label = names[i] || (String.fromCharCode(65 + i) + ' Btry');
          nodes.push({ id: `b${i}`, name: label, rel: 'ORG', sub: b.unitType, tubes: b.tubes, isOrganic: true });
        });
      } else {
        // Standard: infer equal batteries from config totals
        const stdSize = cfg.isM119 ? 6 : cfg.isCannon ? 6 : 9;
        const numBtr  = Math.max(1, Math.round(cfg.tubes / stdSize));
        const perBtr  = Math.floor(cfg.tubes / numBtr);
        const rem     = cfg.tubes - perBtr * numBtr;
        for (let i = 0; i < numBtr; i++) {
          const label = names[i] || (String.fromCharCode(65 + i) + ' Btry');
          nodes.push({ id: `b${i}`, name: label, rel: 'ORG', sub: cfg.unitType, tubes: i < rem ? perBtr + 1 : perBtr, isOrganic: true });
        }
      }
      return nodes;
    } else if (cfg.echelon === 'Battery') {
      return [
        { id: 'hq', name: 'Btry HQ',  rel: 'ORG', sub: '',           tubes: 0,                         isOrganic: true },
        { id: 'p1', name: '1st Plt',   rel: 'ORG', sub: cfg.unitType, tubes: Math.ceil(cfg.tubes / 2),  isOrganic: true },
        { id: 'p2', name: '2nd Plt',   rel: 'ORG', sub: cfg.unitType, tubes: Math.floor(cfg.tubes / 2), isOrganic: true },
      ];
    } else {
      return [
        { id: 's1', name: '1st Section', rel: 'ORG', sub: cfg.unitType, tubes: Math.ceil(cfg.tubes / 2),  isOrganic: true },
        { id: 's2', name: '2nd Section', rel: 'ORG', sub: cfg.unitType, tubes: Math.floor(cfg.tubes / 2), isOrganic: true },
      ];
    }
  }

  function bnType(cfg) {
    // Use the authoritative category from the sidebar when available
    if (cfg.unitCategory) return cfg.unitCategory;
    // Fallback: infer from roster or primary weapon system
    const roster = cfg.useRoster ? (cfg.rosterBatteries || []) : [];
    const cats = roster.length > 0
      ? roster.map(b => unitCat(b.unitType))
      : [unitCat(cfg.unitType)];
    const unique = [...new Set(cats)];
    if (unique.length > 1) return 'Composite';
    return unique[0];
  }

  function unitCat(ut) {
    if (ut === 'M109A7' || ut === 'M109A6') return 'Cannon (SP)';
    if (ut === 'M777A2' || ut === 'M119A3') return 'Cannon (T)';
    if (ut === 'HIMARS' || ut === 'MLRS')   return 'Rocket';
    return ut;
  }

  $: rootLabel = unitDesig || defaultLabel(v);
  function defaultLabel(cfg) {
    const cat = cfg.unitCategory || unitCat(cfg.unitType);
    if (cfg.echelon === 'Battalion') return `FA BN · ${cat}`;
    if (cfg.echelon === 'Battery')   return `FA BTRY · ${cat}`;
    return `FA PLT · ${cat}`;
  }

  $: children = [...organic, ...attached];

  function submitUnit() {
    const name = newUnit.name.trim();
    if (!name) { addErr = 'Unit name is required.'; return; }
    attached = [...attached, { ...newUnit, id: nextId++, name }];
    newUnit  = { name: '', rel: 'DS', sub: '', notes: '' };
    addErr   = '';
    showAdd  = false;
  }

  function removeUnit(id) { attached = attached.filter(u => u.id !== id); }

  // ── PACE Plan ──
  const PACE_TIERS = ['P', 'A', 'C', 'E'];
  const PACE_TIER_FULL = { P: 'Primary', A: 'Alternate', C: 'Contingency', E: 'Emergency' };
  const PACE_STATUS_COLOR = { UP: '#3fb950', DEGRADED: '#e3b341', DOWN: '#ffa198' };

  function makePlan(id, title = '') {
    return { id, title, entries: PACE_TIERS.map(tier => ({ tier, means: '', details: '', status: 'UP' })) };
  }

  let pacePlans  = [makePlan(1, '')];
  let paceNextId = 2;

  $: paceDown.set(pacePlans.reduce((a, pl) => a + pl.entries.filter(e => e.status === 'DOWN').length, 0));

  function addPlan() { pacePlans = [...pacePlans, makePlan(paceNextId++)]; }
  function removePlan(id) {
    if (pacePlans.length <= 1) return;
    pacePlans = pacePlans.filter(p => p.id !== id);
  }
  function setPaceTitle(id, val) {
    pacePlans = pacePlans.map(p => p.id === id ? { ...p, title: val } : p);
  }
  function setPaceEntry(planId, tier, field, val) {
    pacePlans = pacePlans.map(p => {
      if (p.id !== planId) return p;
      return { ...p, entries: p.entries.map(e => e.tier === tier ? { ...e, [field]: val } : e) };
    });
  }

  // ── NMC Tracker ──
  let nmcItems  = [];
  let nmcNextId = 1;

  $: nmcCount.set(nmcItems.length);

  $: nmcRollup = nmcItems.reduce((acc, n) => {
    const key = n.unit || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  function addNmc() {
    nmcItems = [...nmcItems, { id: nmcNextId++, unit: '', equipment: '', fault: '', rtd: '' }];
  }
  function removeNmc(id) { nmcItems = nmcItems.filter(n => n.id !== id); }
  function setNmc(id, field, val) {
    nmcItems = nmcItems.map(n => n.id === id ? { ...n, [field]: val } : n);
  }

  // ── CP Locations ──
  const CP_STATUSES = ['Active', 'Displaced', 'En Route', 'Stand-by'];
  const CP_STATUS_COLOR = {
    'Active':    '#3fb950',
    'Displaced': '#e3b341',
    'En Route':  '#79c0ff',
    'Stand-by':  '#7d917a',
  };

  let cpList    = [
    { id: 1, name: 'Main CP', grid: '', status: 'Active' },
    { id: 2, name: '',        grid: '', status: 'Active' },
  ];
  let cpNextId  = 3;

  function addCp() {
    cpList = [...cpList, { id: cpNextId++, name: '', grid: '', status: 'Active' }];
  }
  function removeCp(id) {
    if (cpList.length <= 1) return;
    cpList = cpList.filter(c => c.id !== id);
  }
  function setCp(id, field, val) {
    cpList = cpList.map(c => c.id === id ? { ...c, [field]: val } : c);
  }

  // ── PAA Locations ──
  const PAA_STATUSES = ['In Position', 'Displacing', 'En Route', 'Unoccupied'];
  const PAA_STATUS_COLOR = {
    'In Position': '#3fb950',
    'Displacing':  '#e3b341',
    'En Route':    '#79c0ff',
    'Unoccupied':  '#7d917a',
  };

  let paaList = [
    { id: 1, name: '', grid: '', unit: '', guns: '', status: 'In Position' },
    { id: 2, name: '', grid: '', unit: '', guns: '', status: 'In Position' },
  ];
  let paaNextId = 3;
  let _paaInit  = false;

  // Lookup: unit name → array of PAA labels (name preferred, grid as fallback)
  $: paaByUnit = paaList
    .filter(p => p.unit && (p.name || p.grid))
    .reduce((acc, p) => {
      const label = p.name || p.grid;
      if (!acc[p.unit]) acc[p.unit] = [];
      acc[p.unit].push(label);
      return acc;
    }, {});

  // Firing elements available for PAA assignment (organic + attached with tubes)
  $: paaUnitOptions = [
    ...organic.filter(o => o.tubes > 0),
    ...attached,
  ];

  function addPaa() {
    paaList = [...paaList, { id: paaNextId++, name: '', grid: '', unit: '', guns: '', status: 'In Position' }];
  }
  function resetPaaOccupancy() {
    paaList = paaList.map(p => ({ ...p, unit: '', guns: '' }));
  }
  function removePaa(id) {
    if (paaList.length <= 1) return;
    paaList = paaList.filter(p => p.id !== id);
  }
  function setPaa(id, field, val) {
    if (field === 'unit') {
      const match = paaUnitOptions.find(o => o.name === val);
      paaList = paaList.map(p => p.id !== id ? p : { ...p, unit: val, guns: match?.tubes || '' });
    } else {
      paaList = paaList.map(p => p.id === id ? { ...p, [field]: val } : p);
    }
  }

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_taskorg_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.paaList?.length) {
          paaList   = s.paaList;
          paaNextId = Math.max(...paaList.map(p => p.id)) + 1;
        }
        if (s.cpList?.length) {
          cpList   = s.cpList;
          cpNextId = Math.max(...cpList.map(c => c.id)) + 1;
        }
        if (s.nmcItems?.length) {
          nmcItems  = s.nmcItems;
          nmcNextId = Math.max(...nmcItems.map(n => n.id)) + 1;
        }
        if (s.pacePlans?.length) {
          pacePlans  = s.pacePlans;
          paceNextId = Math.max(...pacePlans.map(p => p.id)) + 1;
        }
      }
    } catch (_) {}
    _paaInit = true;
  });

  $: if (_paaInit) {
    try { localStorage.setItem('fars_taskorg_v1', JSON.stringify({ paaList, cpList, nmcItems, pacePlans })); } catch (_) {}
  }

  $: bracketText = buildBracket();
  function buildBracket() {
    const lines = [];
    if (higherHQ) lines.push(`${higherHQ}  (${higherRel})`);
    lines.push(`  ${rootLabel}`);
    lines.push(`  ${v.echelon} · ${v.tubes} tubes · ${v.unitType}`);
    for (const k of children) {
      const tube = k.tubes > 0 ? ` [${k.tubes}× ${k.sub}]` : (k.sub ? ` [${k.sub}]` : '');
      const paa  = paaByUnit[k.name]?.length ? `  → ${paaByUnit[k.name].join(' / ')}` : '';
      lines.push(`    ${k.name}${tube}  (${k.rel})${paa}`);
      if (k.notes) lines.push(`      * ${k.notes}`);
    }
    return lines.join('\n');
  }
</script>

<div class="taskorg-wrap">

  <!-- NMC Alert Banner -->
  {#if nmcItems.length > 0}
  <div style="background:rgba(248,81,73,0.1);border:1px solid rgba(248,81,73,0.5);border-radius:6px;padding:10px 14px;margin-bottom:14px;">
    <div style="font-size:12px;font-weight:700;color:#ffa198;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px;">
      ⚠ NMC — {nmcItems.length} Item{nmcItems.length !== 1 ? 's' : ''} Non-Mission Capable
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      {#each Object.entries(nmcRollup) as [unit, count]}
        <span style="background:rgba(248,81,73,0.15);border:1px solid rgba(248,81,73,0.35);border-radius:4px;padding:2px 10px;font-size:12px;color:#ffa198;font-weight:700;font-family:'Share Tech',sans-serif;">
          {unit}: {count}
        </span>
      {/each}
    </div>
  </div>
  {/if}

  <!-- Header bar -->
  <div class="to-header">
    <div class="section-title" style="margin:0;">Task Organization</div>
    <div style="display:flex;gap:6px;">
      <button class="btn btn-sm" class:btn-primary={viewMode==='tree'}    on:click={() => viewMode='tree'}>Tree</button>
      <button class="btn btn-sm" class:btn-primary={viewMode==='bracket'} on:click={() => viewMode='bracket'}>Bracket</button>
    </div>
  </div>

  <!-- Unit identity -->
  <div class="to-identity">
    <div class="field" style="margin:0;">
      <label>Unit Designation</label>
      <input type="text" bind:value={unitDesig} placeholder={defaultLabel(v)}>
    </div>
    <div class="field" style="margin:0;">
      <label>Higher HQ &amp; Relationship</label>
      <div style="display:flex;gap:6px;">
        <input type="text" bind:value={higherHQ} placeholder="e.g. 17 FA BDE" style="flex:1;min-width:0;">
        <select bind:value={higherRel} style="width:90px;flex-shrink:0;">
          {#each RELS as r}<option>{r}</option>{/each}
        </select>
      </div>
    </div>
  </div>

  {#if viewMode === 'tree'}
    <div class="org-chart-wrap">

      <!-- Higher HQ node -->
      {#if higherHQ}
        <div class="org-node-row">
          <div class="org-box" style="border-color:{REL_COLOR[higherRel]};opacity:0.85;">
            <span class="org-badge" style="background:{REL_COLOR[higherRel]};color:{badgeTextColor(higherRel)};">{higherRel}</span>
            <div class="org-name">{higherHQ}</div>
          </div>
        </div>
        <div class="org-stem" style={vdropStyle(higherRel)}></div>
      {/if}

      <!-- Root node -->
      <div class="org-node-row">
        <div class="org-box org-box-root">
          <div class="org-name">{rootLabel}</div>
          <div class="org-sub">{v.echelon} &nbsp;·&nbsp; {v.tubes} tubes</div>
        </div>
      </div>

      <!-- Children -->
      {#if children.length > 0}
        <div class="org-stem" style="background:{REL_COLOR.ORG};"></div>
        <ul class="org-children">
          {#each children as node (node.id)}
            <li class="org-child-li">
              <div class="org-vdrop" style={vdropStyle(node.rel)}></div>
              <div class="org-box" style="border-color:{REL_COLOR[node.rel]};">
                <span class="org-badge" style="background:{REL_COLOR[node.rel]};color:{badgeTextColor(node.rel)};">{node.rel}</span>
                <div class="org-name">{node.name}</div>
                {#if node.tubes > 0}
                  <div class="org-sub">{node.tubes}× {node.sub}</div>
                {:else if node.sub}
                  <div class="org-sub">{node.sub}</div>
                {/if}
                {#if paaByUnit[node.name]?.length}
                  <div class="org-sub" style="color:#79c0ff;font-weight:700;">{paaByUnit[node.name].join(' / ')}</div>
                {/if}
                {#if node.notes}
                  <div class="org-sub" style="font-style:italic;">{node.notes}</div>
                {/if}
                {#if !node.isOrganic}
                  <button class="org-rm" on:click={() => removeUnit(node.id)} title="Remove">×</button>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      {/if}

    </div>

  {:else}
    <pre class="bracket-view">{bracketText}</pre>
  {/if}

  <!-- Add unit -->
  <div style="margin-bottom:14px;">
    {#if showAdd}
      <div class="to-add-form">
        <div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.8px;">Attach / Assign Unit</div>
        <div class="field">
          <label>Unit Name / Designation</label>
          <input type="text" bind:value={newUnit.name} placeholder="e.g. C/2-16 EN, 1-26 FA, TPQ-53 Sec">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="field">
            <label>Relationship</label>
            <select bind:value={newUnit.rel}>
              {#each RELS as r}<option>{r}</option>{/each}
            </select>
          </div>
          <div class="field">
            <label>Type / Capability</label>
            <input type="text" bind:value={newUnit.sub} placeholder="e.g. 6× M777A2">
          </div>
        </div>
        <div class="field">
          <label>Notes (optional)</label>
          <input type="text" bind:value={newUnit.notes} placeholder="e.g. DS to 2nd BDE">
        </div>
        {#if addErr}<div style="color:#ffa198;font-size:12px;margin-bottom:8px;">⚠ {addErr}</div>{/if}
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary btn-sm" on:click={submitUnit}>Add</button>
          <button class="btn btn-sm" on:click={() => { showAdd = false; addErr = ''; }}>Cancel</button>
        </div>
      </div>
    {:else}
      <button class="btn btn-outline btn-sm" on:click={() => showAdd = true}>+ Attach / Assign Unit</button>
    {/if}
  </div>

  <!-- Battery name editor (Battalion only) -->
  {#if v.echelon === 'Battalion'}
    <div style="margin-bottom:14px;">
      {#if editingNames}
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">Edit battery names:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
          {#each btryNames as _, i}
            <input type="text" bind:value={btryNames[i]} style="width:80px;font-size:12px;padding:4px 6px;">
          {/each}
        </div>
        <button class="btn btn-sm" on:click={() => editingNames = false}>Done</button>
      {:else}
        <button class="btn btn-outline btn-sm" on:click={() => editingNames = true}>Edit Battery Names</button>
      {/if}
    </div>
  {/if}

  <!-- CP Locations -->
  <hr style="margin:6px 0 14px;">
  <div class="section-title">Command Post (CP) Locations</div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
    {#each cpList as cp (cp.id)}
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow:hidden;">
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--bg-input);border-bottom:1px solid var(--border);">
          <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:{CP_STATUS_COLOR[cp.status]};"></div>
          <input type="text" value={cp.name}
            placeholder="CP designation (e.g. Main CP, TAC CP, CTCP)"
            style="flex:1;background:transparent;border:none;color:var(--gold);font-weight:700;font-size:13px;padding:0;font-family:'Rajdhani',sans-serif;min-width:0;"
            on:input={e => setCp(cp.id, 'name', e.target.value)}>
          <select value={cp.status}
            style="width:100px;font-size:11px;padding:2px 4px;flex-shrink:0;color:{CP_STATUS_COLOR[cp.status]};font-weight:700;"
            on:change={e => setCp(cp.id, 'status', e.target.value)}>
            {#each CP_STATUSES as s}<option>{s}</option>{/each}
          </select>
          {#if cpList.length > 1}
            <button on:click={() => removeCp(cp.id)}
              style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:15px;line-height:1;padding:0;flex-shrink:0;"
              title="Remove">×</button>
          {/if}
        </div>
        <div style="padding:9px 10px;">
          <div class="field" style="margin:0;">
            <label>Grid (8-digit MGRS)</label>
            <input type="text" value={cp.grid}
              placeholder="18S UJ 1234 5678"
              style="font-family:'Share Tech',sans-serif;"
              on:input={e => setCp(cp.id, 'grid', e.target.value)}>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <button class="btn btn-outline btn-sm" on:click={addCp} style="margin-bottom:16px;">+ Add CP</button>

  <!-- PAA Locations -->
  <hr style="margin:6px 0 14px;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <div class="section-title" style="margin:0;flex:1;">Position Areas (PAA)</div>
    <button class="btn btn-outline btn-sm" on:click={resetPaaOccupancy}
      style="font-size:11px;padding:3px 10px;color:var(--text-dim);"
      title="Clear all unit assignments — keeps PAA names, grids, and status">
      Reset Occupancy
    </button>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
    {#each paaList as paa (paa.id)}
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow:hidden;">
        <!-- Card header -->
        <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--bg-input);border-bottom:1px solid var(--border);">
          <div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:{PAA_STATUS_COLOR[paa.status]};"></div>
          <input type="text" value={paa.name}
            placeholder="PAA name (e.g. PAA IRON)"
            style="flex:1;background:transparent;border:none;color:var(--gold);font-weight:700;font-size:13px;padding:0;font-family:'Rajdhani',sans-serif;min-width:0;"
            on:input={e => setPaa(paa.id, 'name', e.target.value)}>
          <select value={paa.status}
            style="width:112px;font-size:11px;padding:2px 4px;flex-shrink:0;color:{PAA_STATUS_COLOR[paa.status]};font-weight:700;"
            on:change={e => setPaa(paa.id, 'status', e.target.value)}>
            {#each PAA_STATUSES as s}<option>{s}</option>{/each}
          </select>
          {#if paaList.length > 1}
            <button on:click={() => removePaa(paa.id)}
              style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:15px;line-height:1;padding:0;flex-shrink:0;"
              title="Remove">×</button>
          {/if}
        </div>
        <!-- Card body -->
        <div style="padding:9px 10px;display:flex;flex-direction:column;gap:7px;">
          <div class="field" style="margin:0;">
            <label>Grid (8-digit MGRS)</label>
            <input type="text" value={paa.grid}
              placeholder="18S UJ 1234 5678"
              style="font-family:'Share Tech',sans-serif;"
              on:input={e => setPaa(paa.id, 'grid', e.target.value)}>
          </div>
          <div style="display:grid;grid-template-columns:1fr 60px;gap:7px;align-items:end;">
            <div class="field" style="margin:0;">
              <label>Occupying Unit</label>
              <select value={paa.unit} on:change={e => setPaa(paa.id, 'unit', e.target.value)}>
                <option value="">— Unassigned —</option>
                {#each paaUnitOptions as o}
                  <option value={o.name}>{o.name}{o.tubes > 0 ? ` (${o.tubes})` : ''}</option>
                {/each}
              </select>
            </div>
            <div class="field" style="margin:0;">
              <label>Guns</label>
              <input type="number" value={paa.guns} min="0" placeholder="—"
                on:input={e => setPaa(paa.id, 'guns', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <button class="btn btn-outline btn-sm" on:click={addPaa} style="margin-bottom:16px;">+ Add PAA</button>

  <!-- PACE Plan -->
  <hr style="margin:6px 0 14px;">
  <div class="section-title">PACE Plan</div>

  {#each pacePlans as plan (plan.id)}
    {@const hasDown     = plan.entries.some(e => e.status === 'DOWN')}
    {@const hasDegraded = plan.entries.some(e => e.status === 'DEGRADED')}
    <div style="background:var(--bg-card);border:1px solid {hasDown ? 'rgba(248,81,73,0.55)' : hasDegraded ? 'rgba(200,130,10,0.45)' : 'var(--border)'};border-radius:6px;overflow:hidden;margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg-input);border-bottom:1px solid var(--border);">
        <input type="text" value={plan.title}
          placeholder="PACE Plan name (e.g. Fires Net, C2, Logistics)"
          style="flex:1;background:transparent;border:none;color:var(--gold);font-weight:700;font-size:13px;padding:0;font-family:'Rajdhani',sans-serif;min-width:0;"
          on:input={e => setPaceTitle(plan.id, e.target.value)}>
        {#if hasDown}
          <span style="font-size:11px;font-weight:700;color:#ffa198;letter-spacing:0.5px;">NET DOWN</span>
        {:else if hasDegraded}
          <span style="font-size:11px;font-weight:700;color:#e3b341;letter-spacing:0.5px;">DEGRADED</span>
        {/if}
        {#if pacePlans.length > 1}
          <button on:click={() => removePlan(plan.id)}
            style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:15px;line-height:1;padding:0;flex-shrink:0;"
            title="Remove plan">×</button>
        {/if}
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
        {#each plan.entries as entry}
          {@const isDown = entry.status === 'DOWN'}
          {@const isDeg  = entry.status === 'DEGRADED'}
          <tr style="background:{isDown ? 'rgba(248,81,73,0.08)' : isDeg ? 'rgba(200,130,10,0.07)' : 'transparent'};border-bottom:1px solid var(--border);">
            <td style="width:36px;padding:6px 10px;text-align:center;font-family:'Share Tech',sans-serif;font-size:15px;font-weight:700;color:{isDown ? '#ffa198' : isDeg ? '#e3b341' : 'var(--gold)'};"
                title="{PACE_TIER_FULL[entry.tier]}">{entry.tier}</td>
            <td style="padding:4px 6px;width:35%;">
              <input type="text" value={entry.means}
                placeholder="Means (e.g. SINCGARS FM, HF, Messenger)"
                style="width:100%;font-size:12px;"
                on:input={e => setPaceEntry(plan.id, entry.tier, 'means', e.target.value)}>
            </td>
            <td style="padding:4px 6px;">
              <input type="text" value={entry.details}
                placeholder="Freq / Callsign / Details"
                style="width:100%;font-size:12px;font-family:'Share Tech',sans-serif;"
                on:input={e => setPaceEntry(plan.id, entry.tier, 'details', e.target.value)}>
            </td>
            <td style="width:110px;padding:4px 6px;">
              <select value={entry.status}
                style="width:100%;font-size:12px;font-weight:700;color:{PACE_STATUS_COLOR[entry.status]};"
                on:change={e => setPaceEntry(plan.id, entry.tier, 'status', e.target.value)}>
                <option>UP</option>
                <option>DEGRADED</option>
                <option>DOWN</option>
              </select>
            </td>
          </tr>
        {/each}
        </tbody>
      </table>
    </div>
  {/each}
  <button class="btn btn-outline btn-sm" on:click={addPlan} style="margin-bottom:16px;">+ Add PACE Plan</button>

  <!-- NMC Tracker -->
  <hr style="margin:6px 0 14px;">
  <div class="section-title" style="color:#ffa198;">NMC — Non-Mission Capable</div>

  {#if nmcItems.length > 0}
  <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
    {#each nmcItems as item (item.id)}
      <div style="background:var(--bg-card);border:1px solid rgba(248,81,73,0.3);border-radius:5px;padding:7px 10px;display:grid;grid-template-columns:140px 1fr 1fr 100px auto;gap:8px;align-items:center;">
        <select value={item.unit} on:change={e => setNmc(item.id, 'unit', e.target.value)}
          style="font-size:12px;padding:4px 6px;">
          <option value="">— Unit —</option>
          {#each [...organic, ...attached] as o}
            <option value={o.name}>{o.name}</option>
          {/each}
        </select>
        <input type="text" value={item.equipment} placeholder="Equipment (e.g. Gun 2, PLS #3)"
          style="font-size:12px;"
          on:input={e => setNmc(item.id, 'equipment', e.target.value)}>
        <input type="text" value={item.fault} placeholder="Fault / Reason"
          style="font-size:12px;"
          on:input={e => setNmc(item.id, 'fault', e.target.value)}>
        <input type="text" value={item.rtd} placeholder="Est. RTD"
          style="font-size:12px;"
          on:input={e => setNmc(item.id, 'rtd', e.target.value)}>
        <button on:click={() => removeNmc(item.id)}
          style="background:none;border:none;color:#ffa198;cursor:pointer;font-size:16px;line-height:1;padding:0;"
          title="Clear NMC item">×</button>
      </div>
    {/each}
  </div>
  {/if}

  <button class="btn btn-outline btn-sm" on:click={addNmc}
    style="margin-bottom:16px;border-color:rgba(248,81,73,0.4);color:#ffa198;">
    + Log NMC Item
  </button>

  <!-- Legend -->
  <div class="to-legend">
    <div class="legend-title">Command &amp; Support Relationships</div>
    <div class="legend-grid">
      {#each Object.entries(REL_DESC) as [rel, desc]}
        <div class="legend-item">
          <div class="legend-swatch" style="background:{REL_COLOR[rel]};"></div>
          <div><span class="legend-rel">{rel}</span><span class="legend-desc">{desc}</span></div>
        </div>
      {/each}
    </div>
  </div>

</div>

<style>
  .taskorg-wrap { padding: 8px 0; }

  .to-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .to-identity {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 18px;
  }

  /* ── Chart ── */
  .org-chart-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 12px;
    overflow-x: auto;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 14px;
  }

  .org-node-row { display: flex; justify-content: center; }

  .org-stem { width: 2px; height: 24px; margin: 0 auto; }

  .org-box {
    border: 2px solid var(--od);
    border-radius: 5px;
    background: var(--bg-input);
    padding: 8px 14px;
    min-width: 100px;
    max-width: 160px;
    text-align: center;
    position: relative;
  }
  .org-box-root {
    border-color: var(--od-bright) !important;
    min-width: 170px;
  }

  .org-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 3px;
    margin-bottom: 5px;
  }

  .org-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-bright);
    font-family: 'Share Tech', sans-serif;
    line-height: 1.3;
  }

  .org-sub {
    font-size: 10px;
    color: var(--text-dim);
    margin-top: 3px;
    line-height: 1.3;
  }

  .org-rm {
    position: absolute;
    top: 2px; right: 4px;
    background: none; border: none;
    color: var(--text-dim); cursor: pointer;
    font-size: 14px; line-height: 1; padding: 0;
  }

  /* Children row */
  .org-children {
    list-style: none;
    padding: 0; margin: 0;
    display: flex;
    justify-content: center;
  }

  .org-child-li {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 8px;
    position: relative;
  }

  /* Horizontal arms at top of each child slot */
  .org-child-li::before {
    content: '';
    position: absolute;
    top: 0; right: 50%; left: 0;
    height: 24px;
    border-top: 2px solid var(--od);
  }
  .org-child-li::after {
    content: '';
    position: absolute;
    top: 0; left: 50%; right: 0;
    height: 24px;
    border-top: 2px solid var(--od);
  }
  .org-child-li:first-child::before { display: none; }
  .org-child-li:last-child::after   { display: none; }

  /* Vertical drop from horizontal bar to box */
  .org-vdrop { width: 2px; height: 24px; margin: 0 auto; }

  /* Bracket view */
  .bracket-view {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 16px;
    font-family: 'Share Tech', monospace;
    font-size: 13px;
    line-height: 2;
    white-space: pre-wrap;
    color: var(--text);
    margin-bottom: 14px;
  }

  .to-add-form {
    background: var(--bg-card);
    border: 1px solid var(--od-dim);
    border-radius: 6px;
    padding: 14px;
    max-width: 500px;
  }

  /* Legend */
  .to-legend { border-top: 1px solid var(--border); padding-top: 12px; margin-top: 4px; }
  .legend-title {
    font-size: 11px; font-weight: 700;
    color: var(--text-dim);
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 5px;
  }
  .legend-item { display: flex; align-items: flex-start; gap: 8px; }
  .legend-swatch { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
  .legend-rel { font-size: 11px; font-weight: 700; color: var(--text-bright); font-family: 'Share Tech', sans-serif; margin-right: 6px; }
  .legend-desc { font-size: 11px; color: var(--text-dim); }
</style>
