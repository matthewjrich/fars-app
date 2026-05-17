<script>
  import { UNIT_DATA } from '../lib/data.js';
  import { getSvgFn, buildOrgSvg } from '../lib/svg.js';

  export let config;
  export let bannerOpen = true;
  export let pillRange = '—';

  $: ud = UNIT_DATA[config.unitType];
  $: svgHtml = ud ? getSvgFn(config.unitType)() : '';
  $: orgSvgHtml = ud ? buildOrgSvg(config.echelon, config.unitType) : '';
  $: isCannon = config.isCannon;
</script>

<div class="unit-banner" class:banner-collapsed={!bannerOpen}>
  <div class="unit-banner-accent"></div>
  <div class="unit-banner-inner">
    <div class="unit-banner-left">
      {#if ud}
        <div>
          <div class="unit-banner-title">{ud.name}</div>
          <div class="unit-banner-sub">{ud.sub}</div>
        </div>
        <div class="stat-row">
          {#each ud.stats as s}
            <div class="stat-item">
              <span class="stat-label">{s.label}</span>
              <span class="stat-value">{s.value}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    <div class="unit-banner-center">
      {@html svgHtml}
    </div>
    <div class="unit-banner-right">
      <div class="org-label">Task Organization</div>
      {#if ud}
        <div style="font-size:12px;color:var(--text);line-height:1.8;">
          {#each Object.entries(ud.org) as [k, val]}
            <div>
              <span style="color:var(--text-dim);font-size:10px;text-transform:uppercase;font-weight:700;">{k}:</span>
              <span style="color:var(--gold);font-family:'Share Tech',sans-serif;"> {val}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="org-section">
    <div class="org-label">Doctrinal Task Organization — {config.echelon}</div>
    {@html orgSvgHtml}
  </div>
  <button class="banner-toggle" on:click={() => bannerOpen = !bannerOpen}>
    {bannerOpen ? '▲ COLLAPSE' : '▼ EXPAND'}
  </button>
  <div class="banner-collapsed-bar">
    <span style="color:var(--text-dim);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Unit:</span>
    <span class="banner-pill">{config.unitType} — {config.echelon}</span>
    <span class="banner-pill">{config.tubes} {isCannon ? 'Tubes' : 'Launchers'}</span>
    <span class="banner-pill">{pillRange} Max Range</span>
  </div>
</div>
