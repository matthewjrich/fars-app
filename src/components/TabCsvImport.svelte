<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let munKeys = [];

  let dragOver = false;
  let preview  = [];
  let error    = '';
  let success  = '';

  function handleDrop(e) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    error = '';
    success = '';
    preview = [];
    if (!file.name.endsWith('.csv')) {
      error = 'Please upload a .csv file.';
      return;
    }
    const reader = new FileReader();
    reader.onload = evt => parseCsv(evt.target.result);
    reader.readAsText(file);
  }

  function parseCsv(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { error = 'CSV must have a header row and at least one data row.'; return; }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
    const keyCol  = headers.findIndex(h => /key|munition|dodic|item/i.test(h));
    const valCol  = headers.findIndex(h => /value|qty|rounds|pods/i.test(h));
    const csrCol  = headers.findIndex(h => /csr|limit/i.test(h));

    if (keyCol < 0 || valCol < 0) {
      error = 'CSV must have columns matching: key/munition/dodic, value/qty/rounds.';
      return;
    }

    const rsrValues = {};
    const csrByRound = {};
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g,''));
      const key = cols[keyCol];
      const val = parseFloat(cols[valCol]) || 0;
      if (!key) continue;
      const matched = munKeys.find(k => k.toLowerCase() === key.toLowerCase() || k.includes(key));
      const finalKey = matched || key;
      rsrValues[finalKey] = val;
      if (csrCol >= 0 && cols[csrCol]) csrByRound[finalKey] = parseFloat(cols[csrCol]) || 0;
      rows.push({ key: finalKey, val, csr: csrCol >= 0 ? cols[csrCol] : '—', matched: !!matched });
    }

    preview = rows;
    if (rows.length === 0) { error = 'No valid rows found.'; return; }
    success = `Parsed ${rows.length} rows. Review below and confirm import.`;
    pendingImport = { rsrValues, csrByRound };
  }

  let pendingImport = null;

  function confirmImport() {
    if (!pendingImport) return;
    dispatch('csvimport', pendingImport);
    success = 'Imported successfully! Switched to Logistics tab.';
    pendingImport = null;
  }

  const sampleCsv = `Key,Value,CSR
D529 M795 (HE),120,60
D579 M549A1 (RAP),48,30
DA45 M982 (EXCAL),12,10
D505 M485 (ILLUM),24,15`;

  function downloadSample() {
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(sampleCsv);
    a.download = 'fars_rsr_template.csv';
    a.click();
  }
</script>

<div class="section-title">CSV RSR Import</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Import RSR values from a CSV file. Required columns: <b>Key</b> (munition name/DODIC), <b>Value</b> (qty). Optional: <b>CSR</b> (limit per round).
</p>

<button class="btn btn-outline" style="margin-bottom:16px;" on:click={downloadSample}>⬇ Download CSV Template</button>

<!-- Drop Zone -->
<div class="csv-drop-zone {dragOver ? 'drag-over' : ''}"
  on:dragover|preventDefault={() => dragOver = true}
  on:dragleave={() => dragOver = false}
  on:drop={handleDrop}>
  <div style="font-size:32px;margin-bottom:8px;">📂</div>
  <div style="font-size:14px;color:var(--text-dim);">Drag &amp; drop a CSV file here</div>
  <div style="font-size:12px;color:var(--text-dim);margin:8px 0;">or</div>
  <label class="btn" style="cursor:pointer;">
    Browse File
    <input type="file" accept=".csv" style="display:none;" on:change={handleFile}>
  </label>
</div>

{#if error}
  <div class="alert alert-error" style="margin-top:12px;">⚠️ {error}</div>
{/if}
{#if success}
  <div class="alert alert-success" style="margin-top:12px;">✅ {success}</div>
{/if}

{#if preview.length > 0}
  <div class="section-title" style="margin-top:16px;">Preview ({preview.length} rows)</div>
  <div style="overflow-x:auto;margin-bottom:12px;">
    <table class="data-table">
      <thead>
        <tr><th>Munition Key</th><th>Qty (RSR)</th><th>CSR Limit</th><th>Matched?</th></tr>
      </thead>
      <tbody>
        {#each preview as row}
          <tr>
            <td style="font-size:12px;">{row.key}</td>
            <td style="color:var(--gold);">{row.val}</td>
            <td style="color:var(--text-dim);">{row.csr}</td>
            <td style="color:{row.matched ? '#238636' : '#9e6a03'};">{row.matched ? '✓ Matched' : '⚠ Unrecognized'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if pendingImport}
    <button class="btn" on:click={confirmImport}>✅ Confirm Import</button>
  {/if}
{/if}

<div class="section-title" style="margin-top:24px;">Format Reference</div>
<div class="expander">
  <div class="expander-body" style="display:block;">
    <b style="color:var(--gold);">Expected CSV format:</b><br><br>
    <code>Key,Value,CSR</code><br>
    <code>D529 M795 (HE),120,60</code><br>
    <code>D579 M549A1 (RAP),48,30</code><br><br>
    ▸ <b>Key</b>: Munition name as shown in the DODIC tab (case-insensitive matching)<br>
    ▸ <b>Value</b>: RSR quantity (rounds for cannon, pods for rockets)<br>
    ▸ <b>CSR</b>: Optional CSR limit per round type<br>
    ▸ Unrecognized keys are still imported but shown with a warning
  </div>
</div>
