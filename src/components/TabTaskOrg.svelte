<script>
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

  $: bracketText = buildBracket();
  function buildBracket() {
    const lines = [];
    if (higherHQ) lines.push(`${higherHQ}  (${higherRel})`);
    lines.push(`  ${rootLabel}`);
    lines.push(`  ${v.echelon} · ${v.tubes} tubes · ${v.unitType}`);
    for (const k of children) {
      const tube = k.tubes > 0 ? ` [${k.tubes}× ${k.sub}]` : (k.sub ? ` [${k.sub}]` : '');
      lines.push(`    ${k.name}${tube}  (${k.rel})`);
      if (k.notes) lines.push(`      * ${k.notes}`);
    }
    return lines.join('\n');
  }
</script>

<div class="taskorg-wrap">

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
