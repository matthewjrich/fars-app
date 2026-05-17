<script>
  // MIL-STD-2525 fire support overlay convention: red frame, black symbols
  export let unitType = 'M109A7';
  export let echelon  = 'Battery';   // Battalion | Battery | Platoon | Section | HHB
  export let isHQ     = false;
  export let size     = 64;

  const W  = size;
  const FH = Math.round(W * 0.55);
  const FY = 14;
  const cx = W / 2;
  const cy = FY + FH / 2;

  // Red frame, white fill so black symbols are readable on dark UI
  const FRAME = '#cc2200';   // FA red
  const FILL  = '#fff5f5';   // near-white with slight red tint
  const SYM   = '#111111';   // black symbols

  const ECHELON_SYM = {
    'Battalion': 'II',
    'Battery':   'I',
    'HHB':       'I',
    'Platoon':   '···',
    'Section':   '··',
  };
  $: echelonText = ECHELON_SYM[echelon] || '';

  $: isCannon = unitType.includes('M109') || unitType.includes('M777') || unitType.includes('M119');
  $: isRocket = unitType.includes('HIMARS') || unitType.includes('MLRS');
  $: r = Math.round(FH * 0.28);
</script>

<svg
  width={W}
  height={FY + FH + 2}
  viewBox="0 0 {W} {FY + FH + 2}"
  aria-hidden="true"
  style="display:block;filter:drop-shadow(0 0 4px rgba(204,34,0,0.55));"
>
  <!-- Echelon indicator above frame -->
  {#if echelonText}
    <text
      x={cx} y={FY - 2}
      text-anchor="middle"
      font-size={echelonText.length > 2 ? 9 : 11}
      font-weight="700"
      font-family="serif"
      fill={FRAME}
      letter-spacing="2"
    >{echelonText}</text>
  {/if}

  <!-- Unit frame: red border, white fill -->
  <rect x="2" y={FY} width={W - 4} height={FH} fill={FILL} stroke={FRAME} stroke-width="2.5" rx="0"/>

  <!-- Function symbol (black) -->
  {#if isHQ}
    <!-- HHB / HQ: horizontal staff bar + 3 vertical ticks -->
    <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke={SYM} stroke-width="2.5"/>
    <line x1={cx - 8}  y1={cy - 6} x2={cx - 8}  y2={cy + 6} stroke={SYM} stroke-width="2"/>
    <line x1={cx}      y1={cy - 6} x2={cx}      y2={cy + 6} stroke={SYM} stroke-width="2"/>
    <line x1={cx + 8}  y1={cy - 6} x2={cx + 8}  y2={cy + 6} stroke={SYM} stroke-width="2"/>

  {:else if isCannon}
    <!-- Field Artillery cannon: filled circle (gun wheel) + axle line -->
    <circle cx={cx} cy={cy} r={r} fill={SYM}/>
    <line x1={cx - r - 4} y1={cy} x2={cx + r + 4} y2={cy} stroke={SYM} stroke-width="2"/>

  {:else if isRocket}
    <!-- Rocket Artillery: filled circle + V-shaped rocket indicator -->
    <circle cx={cx} cy={cy + 3} r={r} fill={SYM}/>
    <line x1={cx}     y1={cy + 3 - r} x2={cx - 7} y2={cy + 3 - r - 8} stroke={SYM} stroke-width="2" stroke-linecap="round"/>
    <line x1={cx}     y1={cy + 3 - r} x2={cx + 7} y2={cy + 3 - r - 8} stroke={SYM} stroke-width="2" stroke-linecap="round"/>

  {:else}
    <!-- Generic attached unit: X inside frame -->
    <line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} stroke={SYM} stroke-width="2"/>
    <line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} stroke={SYM} stroke-width="2"/>
  {/if}
</svg>
