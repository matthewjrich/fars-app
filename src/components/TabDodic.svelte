<script>
  import { onMount } from 'svelte';
  import { ALL_DODIC } from '../lib/data.js';

  export let config = null;

  const TYPES = ['all', '155mm', '105mm', 'rockets', 'charges', 'fuzes'];
  let activeFilter = 'all';
  let searchText = '';

  onMount(() => {
    if (config) {
      activeFilter = config.isM119 ? '105mm' : config.isCannon ? '155mm' : 'rockets';
    }
  });

  $: filtered = Object.entries(ALL_DODIC).filter(([name, d]) => {
    const matchType = activeFilter === 'all' || d.type === activeFilter;
    const matchSearch = !searchText || name.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchSearch;
  });
</script>

<div class="section-title">DODIC / Munition Reference</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Department of Defense Identification Code reference — weight, cube, hazmat class, and compatibility group.</p>

<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;">
  {#each TYPES as t}
    <button class="btn {activeFilter===t ? '' : 'btn-outline'}" style="font-size:11px;padding:4px 10px;"
      on:click={() => activeFilter = t}>{t.toUpperCase()}</button>
  {/each}
  <input type="text" bind:value={searchText} placeholder="Search DODIC / name…"
    style="margin-left:auto;padding:5px 10px;font-size:12px;background:var(--panel);border:1px solid var(--border);color:var(--text);border-radius:4px;width:200px;">
</div>

<div class="dodic-grid">
  {#each filtered as [name, d]}
    <div class="dodic-card">
      <div class="dodic-name">{name}</div>
      <div class="dodic-row"><span class="dodic-lbl">Weight</span><span class="dodic-val">{d.wt} lbs</span></div>
      <div class="dodic-row"><span class="dodic-lbl">Cube</span><span class="dodic-val">{d.cube} ft³</span></div>
      <div class="dodic-row"><span class="dodic-lbl">Hazmat</span><span class="dodic-val" style="color:var(--red);">{d.hazmat}</span></div>
      <div class="dodic-row"><span class="dodic-lbl">Compat</span><span class="dodic-val">{d.compat}</span></div>
      <div class="dodic-type">{d.type}</div>
    </div>
  {/each}
  {#if filtered.length === 0}
    <div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:40px;">No results found.</div>
  {/if}
</div>

<div style="font-size:11px;color:var(--text-dim);margin-top:16px;">
  Hazmat classes per 49 CFR 173 / TB 9-1300-385 · Compatibility groups per STANAG 4170 / FM 4-30.1
</div>
