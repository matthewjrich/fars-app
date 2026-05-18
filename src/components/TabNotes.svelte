<script>
  import { onMount } from 'svelte';

  let _initialized = false;
  let nextId = 2;

  let notes = [
    { id: 1, title: 'General Notes', body: '' },
  ];

  function addNote() {
    notes = [...notes, { id: nextId++, title: '', body: '' }];
  }

  function removeNote(id) {
    if (notes.length === 1) return;
    notes = notes.filter(n => n.id !== id);
  }

  function setTitle(id, val) {
    notes = notes.map(n => n.id === id ? { ...n, title: val } : n);
  }

  function setBody(id, val) {
    notes = notes.map(n => n.id === id ? { ...n, body: val } : n);
  }

  function copyAll() {
    const text = notes
      .filter(n => n.title || n.body)
      .map(n => [n.title ? `── ${n.title} ──` : null, n.body].filter(Boolean).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {});
  }

  onMount(() => {
    try {
      const raw = localStorage.getItem('fars_notes_v1');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.notes?.length) {
          notes = s.notes;
          nextId = Math.max(...notes.map(n => n.id)) + 1;
        }
      }
    } catch (_) {}
    _initialized = true;
  });

  $: if (_initialized) {
    try {
      localStorage.setItem('fars_notes_v1', JSON.stringify({ notes }));
    } catch (_) {}
  }
</script>

<div class="section-title" style="margin-top:8px;">Notes</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">
  Freeform planning notes. Add blocks for different categories, phases, or days.
</p>

{#each notes as note (note.id)}
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-bottom:12px;overflow:hidden;">
    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);background:var(--bg-input);">
      <input
        type="text"
        value={note.title}
        placeholder="Note title (e.g. D+1, Fire Support Coord, OPORD Notes…)"
        style="flex:1;background:transparent;border:none;color:var(--gold);font-weight:700;font-size:13px;padding:0;font-family:'Rajdhani',sans-serif;letter-spacing:0.3px;"
        on:input={e => setTitle(note.id, e.target.value)}>
      {#if notes.length > 1}
        <button
          on:click={() => removeNote(note.id)}
          style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;line-height:1;padding:0 4px;flex-shrink:0;"
          title="Remove this note block">×</button>
      {/if}
    </div>
    <textarea
      value={note.body}
      placeholder="Type notes here…"
      rows="6"
      style="width:100%;background:transparent;border:none;color:var(--text);font-size:13px;padding:12px 14px;resize:vertical;font-family:'Rajdhani',sans-serif;line-height:1.7;display:block;min-height:120px;"
      on:input={e => setBody(note.id, e.target.value)}></textarea>
  </div>
{/each}

<div style="display:flex;gap:10px;margin-top:4px;">
  <button class="btn btn-outline" on:click={addNote}>+ Add Note Block</button>
  <button class="btn btn-outline" on:click={copyAll}>Copy All Notes</button>
</div>
