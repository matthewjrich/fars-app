<script>
  // Main Configuration
  let echelon = 'Battery';
  let unitType = 'M109A7';
  let tubes = 6;
  let catQty = 6;
  let truckQty = 6;
  let trailQty = 6;

  let planMode = 'manual';
  let loadPct = 80;
  let generalCsr = 100;
  let dudRate = 5; // Default 5% dud rate

  let rsrData = [];

  // Calculations
  $: roundsPerTube = getRoundsPerTube(unitType);
  $: roundWeight = getRoundWeight(unitType);
  $: totalRounds = Math.round(tubes * roundsPerTube * (planMode === 'daily' ? loadPct / 100 : 1));
  $: totalWeightLbs = Math.round(totalRounds * roundWeight);
  $: totalStons = (totalWeightLbs / 2000).toFixed(1);

  // RSR Calculations
  $: totalRsrWeight = rsrData.reduce((sum, item) => sum + (item.rsr * roundWeight), 0);
  $: totalRsrStons = (totalRsrWeight / 2000).toFixed(1);
  $: totalRsrRounds = rsrData.reduce((sum, item) => sum + item.rsr, 0);
  $: effectiveRsrRounds = Math.round(totalRsrRounds * (1 - dudRate / 100));
  $: roundsPerTubeFromRsr = totalRsrRounds > 0 ? (totalRsrRounds / tubes).toFixed(1) : 0;

  // Custom Battalion
  let customBatteries = [
    { id: 1, type: 'M109A7', tubes: 6 },
    { id: 2, type: 'M119A3', tubes: 6 },
    { id: 3, type: 'M119A3', tubes: 6 }
  ];

  $: customTotalTubes = customBatteries.reduce((sum, b) => sum + b.tubes, 0);
  $: customTotalRounds = customBatteries.reduce((sum, b) => sum + (b.tubes * getRoundsPerTube(b.type)), 0);
  $: customTotalWeight = customBatteries.reduce((sum, b) => sum + (b.tubes * getRoundsPerTube(b.type) * getRoundWeight(b.type)), 0);
  $: customTotalStons = (customTotalWeight / 2000).toFixed(1);

  function getRoundsPerTube(type) {
    if (type === 'M119A3') return 65;
    if (type === 'M777A2') return 38;
    if (type === 'M109A6' || type === 'M109A7') return 40;
    if (type === 'M270A2') return 12;
    if (type === 'M142') return 6;
    return 40;
  }

  function getRoundWeight(type) {
    if (type === 'M119A3') return 35;
    if (type === 'M777A2') return 95;
    if (type === 'M109A6' || type === 'M109A7') return 98;
    if (type === 'M270A2' || type === 'M142') return 520;
    return 95;
  }

  function addBattery() {
    const newId = Math.max(0, ...customBatteries.map(b => b.id)) + 1;
    customBatteries = [...customBatteries, { id: newId, type: 'M109A7', tubes: 6 }];
  }

  function removeBattery(id) {
    if (customBatteries.length > 1) {
      customBatteries = customBatteries.filter(b => b.id !== id);
    }
  }

  function updateBattery(id, field, value) {
    customBatteries = customBatteries.map(b => {
      if (b.id === id) {
        return { ...b, [field]: field === 'tubes' ? (parseInt(value) || 0) : value };
      }
      return b;
    });
  }

  function setDefaults(newEchelon) {
    if (newEchelon === 'Battalion') {
      tubes = 18; catQty = 18; truckQty = 24; trailQty = 24;
    } else if (newEchelon === 'Battery') {
      tubes = 6; catQty = 6; truckQty = 6; trailQty = 6;
    } else if (newEchelon === 'Mixed Battalion (Custom)') {
      // keep custom
    } else {
      tubes = 2; catQty = 2; truckQty = 2; trailQty = 2;
    }
  }

  $: setDefaults(echelon);

  // RSR Data
  $: updateRsrData(unitType);

  function updateRsrData(type) {
    if (type === 'M119A3') {
      rsrData = [
       { name: 'M1 HE', rsr: 120, csr: 150 },
      { name: 'M913 RAP', rsr: 40, csr: 60 },
      { name: 'M314 Illum', rsr: 20, csr: 30 },
      { name: 'M60 WP', rsr: 30, csr: 40 },
    ];
  } else if (type === 'M777A2' || type === 'M109A6' || type === 'M109A7') {
    rsrData = [
      { name: 'M795 HE', rsr: 180, csr: 220 },
      { name: 'M982 Excalibur', rsr: 24, csr: 36 },
      { name: 'M825A1 WP', rsr: 36, csr: 48 },
      { name: 'M1122 HE', rsr: 60, csr: 80 },
      { name: 'M314 Illum', rsr: 24, csr: 36 },
      { name: 'M60 WP', rsr: 30, csr: 40 },
      { name: 'M731 DPICM', rsr: 48, csr: 60 },
    ];
  } else {
    // Rockets (MLRS / HIMARS)
    rsrData = [
      { name: 'M31A1 GMLRS', rsr: 48, csr: 60 },
      { name: 'M30A1 GMLRS AW', rsr: 24, csr: 36 },
      { name: 'M26A2 MLRS', rsr: 36, csr: 48 },
      { name: 'M28A2 MLRS', rsr: 24, csr: 30 },
      ];
    }
  }

  function updateRsr(index, field, value) {
    rsrData[index][field] = parseInt(value) || 0;
  }

  // CSR Upload
  function uploadCSR(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      
      // Simple CSV parser: Munition,RSR,CSR
      rsrData = lines.slice(1).map(line => {
        const [name, rsr, csr] = line.split(',').map(s => s.trim());
        return { name, rsr: parseInt(rsr) || 0, csr: parseInt(csr) || 0 };
      });
    };
    reader.readAsText(file);
  }
</script>

<div class="tab-content">
  <h2>1. Logistics Planning</h2>
  
  <!-- Unit Configuration -->
  <div class="section">
    <h3>Unit Configuration</h3>
    
    <div class="field">
      <label>Echelon</label>
      <select bind:value={echelon}>
        <option value="Platoon">Platoon</option>
        <option value="Battery">Battery</option>
        <option value="Battalion">Battalion</option>
        <option value="Mixed Battalion (Custom)">Mixed Battalion (Custom)</option>
      </select>
    </div>

    {#if echelon !== 'Mixed Battalion (Custom)'}
      <div class="grid">
        <div class="field">
          <label>Unit Type</label>
          <select bind:value={unitType}>
            <option value="M119A3">M119A3 (105mm)</option>
            <option value="M777A2">M777A2 (155mm)</option>
            <option value="M109A6">M109A6 Paladin</option>
            <option value="M109A7">M109A7 Paladin</option>
            <option value="M270A2">M270A2 MLRS</option>
            <option value="M142">M142 HIMARS</option>
          </select>
        </div>
        
        <div class="field">
          <label>Tubes / Launchers</label>
          <input type="number" bind:value={tubes} min="1" />
        </div>
        
        <div class="field">
          <label>Ammo Carriers (CAT)</label>
          <input type="number" bind:value={catQty} min="0" />
        </div>
        
        <div class="field">
          <label>Ammo Trucks</label>
          <input type="number" bind:value={truckQty} min="0" />
        </div>
        
        <div class="field">
          <label>Trailers</label>
          <input type="number" bind:value={trailQty} min="0" />
        </div>
      </div>
    {:else}
      <!-- Custom Battalion -->
      <div class="custom-battalion">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h4 style="color:#c9a227; margin:0;">Custom Battalion Configuration</h4>
          <button class="add-btn" on:click={addBattery}>+ Add Battery / Platoon</button>
        </div>
        
        {#each customBatteries as battery}
          <div class="battery-row">
            <div class="field" style="flex:2.5;">
              <label>Battery Type</label>
              <select value={battery.type} on:change={(e) => updateBattery(battery.id, 'type', e.target.value)}>
                <option value="M119A3">M119A3 (105mm)</option>
                <option value="M777A2">M777A2 (155mm)</option>
                <option value="M109A6">M109A6 Paladin</option>
                <option value="M109A7">M109A7 Paladin</option>
                <option value="M270A2">M270A2 MLRS</option>
                <option value="M142">M142 HIMARS</option>
              </select>
            </div>
            <div class="field" style="flex:1;">
              <label>Tubes</label>
              <input type="number" value={battery.tubes} on:input={(e) => updateBattery(battery.id, 'tubes', e.target.value)} />
            </div>
            <button class="remove-btn" on:click={() => removeBattery(battery.id)}>×</button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Planning Mode + Dud Rate -->
  <div class="section">
    <h3>Planning Mode</h3>
    
    <div class="radio-group">
      <label><input type="radio" bind:group={planMode} value="manual" /> Manual Entry</label>
      <label><input type="radio" bind:group={planMode} value="daily" /> Daily Load Percentage</label>
    </div>
    
    {#if planMode === 'daily'}
      <div class="field" style="margin-top:12px;">
        <label>Load Percentage: {loadPct}%</label>
        <input type="range" bind:value={loadPct} min="25" max="100" step="5" />
      </div>
    {/if}
    
    <div class="field" style="margin-top:16px; display:flex; gap:20px;">
      <div style="flex:1;">
        <label>General CSR Limit</label>
        <input type="number" bind:value={generalCsr} min="0" />
      </div>
      <div style="flex:1;">
        <label>Dud Rate (%)</label>
        <input type="number" bind:value={dudRate} min="0" max="20" />
      </div>
    </div>
  </div>

  <!-- RSR / CSR Table -->
  <div class="section">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h3 style="margin:0;">RSR / CSR by Munition</h3>
      <label class="upload-btn">
        Upload CSR CSV
        <input type="file" accept=".csv" on:change={uploadCSR} style="display:none" />
      </label>
    </div>
    
    <table class="rsr-table">
      <thead>
        <tr>
          <th>Munition</th>
          <th>RSR Qty</th>
          <th>CSR Limit</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each rsrData as item, i}
          <tr class:exceeds={item.rsr > item.csr}>
            <td>{item.name}</td>
            <td><input type="number" value={item.rsr} on:input={(e) => updateRsr(i, 'rsr', e.target.value)} /></td>
            <td><input type="number" value={item.csr} on:input={(e) => updateRsr(i, 'csr', e.target.value)} /></td>
            <td>
              {#if item.rsr > item.csr}
                <span style="color:#b83a3a; font-weight:700;">EXCEEDS CSR</span>
              {:else}
                <span style="color:#556b2f;">OK</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    
    <div style="margin-top:16px; display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px; font-size:13px;">
      <div><strong>Total RSR Rounds:</strong> {totalRsrRounds}</div>
      <div><strong>Effective Rounds (after dud):</strong> {effectiveRsrRounds}</div>
      <div><strong>Rounds per Tube:</strong> {roundsPerTubeFromRsr}</div>
      <div><strong>Total RSR Weight:</strong> {(totalRsrWeight / 1000).toFixed(0)}k lbs</div>
      <div><strong>Total RSR STONS:</strong> {totalRsrStons}</div>
    </div>
  </div>

  <!-- Summary -->
  <div class="summary">
    <h3>Calculated Requirements</h3>
    
    {#if echelon === 'Mixed Battalion (Custom)'}
      <div class="metrics">
        <div class="metric">
          <div class="value">{customTotalTubes}</div>
          <div class="label">Total Tubes</div>
        </div>
        <div class="metric">
          <div class="value">{customTotalRounds}</div>
          <div class="label">Total Rounds</div>
        </div>
        <div class="metric">
          <div class="value">{customTotalStons}</div>
          <div class="label">Short Tons</div>
        </div>
      </div>
    {:else}
      <div class="metrics">
        <div class="metric">
          <div class="value">{tubes}</div>
          <div class="label">Tubes / Launchers</div>
        </div>
        <div class="metric">
          <div class="value">{totalRounds}</div>
          <div class="label">Total Rounds</div>
        </div>
        <div class="metric">
          <div class="value">{totalStons}</div>
          <div class="label">Short Tons</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .tab-content { max-width: 900px; }
  h2 { color: #c9a227; margin-bottom: 24px; }
  .section { background: #1c2028; padding: 24px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #323842; }
  h3 { color: #c9a227; margin-bottom: 16px; font-size: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  .field { margin-bottom: 12px; }
  label { display: block; font-size: 11px; color: #8b8f98; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  select, input[type="number"], input[type="range"] { width: 100%; padding: 10px 14px; background: #252a33; border: 1px solid #454d5a; color: #e6e8eb; border-radius: 4px; font-size: 14px; }
  .radio-group label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; }
  .custom-battalion { background: #252a33; padding: 20px; border-radius: 8px; }
  .battery-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 12px; }
  .remove-btn { background: #9c2a2a; color: white; border: none; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; font-size: 18px; }
  .add-btn { background: #556b2f; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; }
  .upload-btn { background: #3a7ca5; color: white; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; }
  .rsr-table { width: 100%; border-collapse: collapse; }
  .rsr-table th, .rsr-table td { padding: 10px 12px; border-bottom: 1px solid #323842; }
  .rsr-table th { color: #8b8f98; font-size: 11px; text-transform: uppercase; }
  .rsr-table input { width: 70px; padding: 6px 8px; background: #252a33; border: 1px solid #454d5a; color: #e6e8eb; border-radius: 4px; }
  .exceeds { background: #3a2525; }
  .summary { background: #16191f; padding: 24px; border-radius: 8px; border: 2px solid #c9a227; }
  .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 20px; }
  .metric { text-align: center; }
  .metric .value { font-size: 26px; font-weight: 700; color: #c9a227; font-family: 'Share Tech', monospace; }
  .metric .label { font-size: 11px; color: #8b8f98; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
</style>