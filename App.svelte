<script>
  import Sidebar from './components/Sidebar.svelte';
  import Tab1_Logistics from './components/Tab1_Logistics.svelte';

  let currentTab = 1;
</script>

<div style="display: flex; min-height: 100vh; background: #0f1116; color: #d1d5db;">
  <Sidebar bind:currentTab />

  <div style="flex: 1; padding: 30px 40px; overflow-y: auto;">
    {#if currentTab === 1}
      <Tab1_Logistics />
    {:else}
      <div style="padding: 60px 20px; text-align: center; color: #8b8f98;">
        Tab {currentTab} coming soon...
      </div>
    {/if}
  </div>
</div>