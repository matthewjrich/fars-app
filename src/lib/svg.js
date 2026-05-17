export function drawM109() {
  return `<svg viewBox="0 0 320 130" width="220" height="90" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><rect x="18" y="88" width="284" height="22" rx="11" fill="#444c56"/><rect x="22" y="90" width="276" height="18" rx="9" fill="#30363d"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${32+i*28}" y="92" width="18" height="14" rx="3" fill="#444c56"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<circle cx="${45+i*46}" cy="99" r="9" fill="#21262d" stroke="#444c56" stroke-width="1.5"/><circle cx="${45+i*46}" cy="99" r="4" fill="#30363d"/>`).join('')}<rect x="30" y="58" width="260" height="34" rx="4" fill="#2d333b"/><rect x="34" y="62" width="252" height="26" rx="3" fill="#30363d"/><rect x="80" y="30" width="150" height="36" rx="8" fill="#2d333b"/><rect x="86" y="34" width="138" height="28" rx="6" fill="#30363d"/><rect x="210" y="38" width="100" height="9" rx="4" fill="#444c56"/><rect x="280" y="36" width="22" height="13" rx="3" fill="#353d47"/><rect x="304" y="35" width="12" height="15" rx="2" fill="#444c56"/><ellipse cx="108" cy="31" rx="18" ry="10" fill="#2d333b" stroke="#444c56" stroke-width="1"/><line x1="95" y1="30" x2="90" y2="8" stroke="#444c56" stroke-width="1.5" stroke-linecap="round"/><text x="160" y="122" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="11" font-weight="700">M109A7 PALADIN</text></g></svg>`;
}

export function drawM777() {
  return `<svg viewBox="0 0 320 130" width="220" height="90" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><line x1="30" y1="105" x2="110" y2="78" stroke="#444c56" stroke-width="8" stroke-linecap="round"/><line x1="290" y1="105" x2="210" y2="78" stroke="#444c56" stroke-width="8" stroke-linecap="round"/><rect x="16" y="100" width="28" height="10" rx="3" fill="#30363d"/><rect x="276" y="100" width="28" height="10" rx="3" fill="#30363d"/><circle cx="100" cy="96" r="16" fill="#21262d" stroke="#444c56" stroke-width="2"/><circle cx="100" cy="96" r="7" fill="#30363d"/><circle cx="220" cy="96" r="16" fill="#21262d" stroke="#444c56" stroke-width="2"/><circle cx="220" cy="96" r="7" fill="#30363d"/><rect x="98" y="90" width="124" height="12" rx="4" fill="#2d333b"/><line x1="140" y1="58" x2="120" y2="78" stroke="#444c56" stroke-width="4" stroke-linecap="round"/><line x1="180" y1="58" x2="200" y2="78" stroke="#444c56" stroke-width="4" stroke-linecap="round"/><rect x="118" y="62" width="84" height="22" rx="5" fill="#2d333b"/><rect x="122" y="66" width="76" height="14" rx="3" fill="#30363d"/><rect x="190" y="50" width="120" height="10" rx="4" fill="#444c56"/><rect x="304" y="47" width="12" height="16" rx="2" fill="#444c56"/><rect x="100" y="54" width="26" height="28" rx="4" fill="#353d47"/><text x="160" y="122" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="11" font-weight="700">M777A2 LIGHTWEIGHT</text></g></svg>`;
}

export function drawM119() {
  return `<svg viewBox="0 0 320 130" width="220" height="90" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><line x1="40" y1="108" x2="130" y2="82" stroke="#444c56" stroke-width="6" stroke-linecap="round"/><line x1="280" y1="108" x2="190" y2="82" stroke="#444c56" stroke-width="6" stroke-linecap="round"/><rect x="26" y="103" width="22" height="8" rx="3" fill="#30363d"/><rect x="272" y="103" width="22" height="8" rx="3" fill="#30363d"/><circle cx="118" cy="98" r="13" fill="#21262d" stroke="#444c56" stroke-width="2"/><circle cx="118" cy="98" r="5" fill="#30363d"/><circle cx="202" cy="98" r="13" fill="#21262d" stroke="#444c56" stroke-width="2"/><circle cx="202" cy="98" r="5" fill="#30363d"/><rect x="110" y="93" width="100" height="10" rx="3" fill="#2d333b"/><rect x="128" y="68" width="64" height="18" rx="4" fill="#2d333b"/><rect x="132" y="72" width="56" height="10" rx="2" fill="#30363d"/><line x1="148" y1="62" x2="138" y2="75" stroke="#444c56" stroke-width="3" stroke-linecap="round"/><line x1="172" y1="62" x2="182" y2="75" stroke="#444c56" stroke-width="3" stroke-linecap="round"/><rect x="192" y="54" width="110" height="8" rx="3" fill="#444c56"/><rect x="298" y="51" width="10" height="14" rx="2" fill="#444c56"/><rect x="118" y="58" width="20" height="22" rx="3" fill="#353d47"/><text x="160" y="122" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="11" font-weight="700">M119A3 105mm</text></g></svg>`;
}

export function drawHIMARS() {
  return `<svg viewBox="0 0 320 130" width="220" height="90" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9">${[0,1,2].map(i=>`<circle cx="${52+i*86}" cy="100" r="16" fill="#21262d" stroke="#444c56" stroke-width="2"/><circle cx="${52+i*86}" cy="100" r="7" fill="#30363d"/>`).join('')}<rect x="30" y="76" width="260" height="28" rx="4" fill="#2d333b"/><rect x="32" y="44" width="88" height="38" rx="5" fill="#2d333b"/><rect x="38" y="50" width="76" height="26" rx="3" fill="#30363d"/><rect x="42" y="53" width="30" height="16" rx="2" fill="#1c2128" opacity="0.8"/><rect x="78" y="53" width="28" height="16" rx="2" fill="#1c2128" opacity="0.8"/><rect x="130" y="36" width="160" height="46" rx="6" fill="#2d333b"/><rect x="136" y="40" width="148" height="38" rx="4" fill="#30363d"/>${[0,1,2,3,4,5].map(i=>`<rect x="${140+i*23}" y="44" width="18" height="30" rx="3" fill="#1c2128" stroke="#444c56" stroke-width="0.5"/>`).join('')}<text x="214" y="57" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="8">M30 GMLRS</text><text x="160" y="122" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="11" font-weight="700">M142 HIMARS</text></g></svg>`;
}

export function drawMLRS() {
  return `<svg viewBox="0 0 320 130" width="220" height="90" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><rect x="14" y="88" width="292" height="22" rx="11" fill="#444c56"/><rect x="18" y="90" width="284" height="18" rx="9" fill="#30363d"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${26+i*27}" y="92" width="18" height="14" rx="2" fill="#444c56"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<circle cx="${42+i*46}" cy="99" r="9" fill="#21262d" stroke="#444c56" stroke-width="1.5"/><circle cx="${42+i*46}" cy="99" r="4" fill="#30363d"/>`).join('')}<rect x="22" y="60" width="276" height="32" rx="4" fill="#2d333b"/><rect x="26" y="64" width="268" height="24" rx="3" fill="#30363d"/><rect x="24" y="36" width="90" height="30" rx="4" fill="#2d333b"/><rect x="30" y="40" width="78" height="22" rx="3" fill="#30363d"/><rect x="120" y="24" width="178" height="44" rx="6" fill="#2d333b"/><rect x="126" y="28" width="166" height="36" rx="4" fill="#30363d"/>${[0,1,2,3,4,5].map(i=>`<rect x="${130+i*20}" y="32" width="15" height="28" rx="2" fill="#1c2128" stroke="#444c56" stroke-width="0.5"/>`).join('')}${[0,1,2,3,4,5].map(i=>`<rect x="${252+i*20}" y="32" width="15" height="28" rx="2" fill="#1c2128" stroke="#444c56" stroke-width="0.5"/>`).join('')}<text x="160" y="122" text-anchor="middle" fill="#e8c96a" font-family="'Share Tech',sans-serif" font-size="11" font-weight="700">M270A2 MLRS</text></g></svg>`;
}

export function getSvgFn(unitType) {
  switch(unitType) {
    case 'M109A7': case 'M109A6': return drawM109;
    case 'M777A2': return drawM777;
    case 'M119A3': return drawM119;
    case 'HIMARS':  return drawHIMARS;
    case 'MLRS':    return drawMLRS;
    default: return drawM109;
  }
}

export function buildOrgSvg(echelon, unit) {
  const isCannon = unit.includes('M109') || unit.includes('M777');
  const isMlrs = unit.includes('MLRS');
  const tn = isCannon ? 'Gun' : 'Launcher';
  const red = '#b31942', gold = '#e8c96a', dim = '#8b949e', card = '#21262d', border = '#30363d', text = '#cdd9e5';

  const box = (x, y, w, h, l, s, c) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${card}" stroke="${c||border}" stroke-width="${c?'1.5':'0.5'}"/>` +
    `<text x="${x+w/2}" y="${y+h/2-(s?5:0)}" text-anchor="middle" dominant-baseline="central" fill="${c===red?gold:text}" font-family="'Rajdhani',sans-serif" font-size="10" font-weight="700">${l}</text>` +
    (s ? `<text x="${x+w/2}" y="${y+h/2+8}" text-anchor="middle" dominant-baseline="central" fill="${dim}" font-family="'Rajdhani',sans-serif" font-size="9">${s}</text>` : '');

  const ln = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${border}" stroke-width="0.8"/>`;

  if (echelon === 'Battalion') {
    const tubes = isCannon ? 18 : 27, bt = isCannon ? 6 : 9, cats = unit.includes('M109') ? 18 : 0;
    return `<svg viewBox="0 0 300 160" width="300" height="160" xmlns="http://www.w3.org/2000/svg">` +
      box(90,4,120,28,'HHB','Bn HQ & Spt',red) + ln(150,32,150,50) +
      box(4,50,88,28,'HHB','Cmd & Spt',border) + box(106,50,88,28,'FSC','Spt Co',border) + box(208,50,88,28,'BSB Det','Sust',border) +
      ln(48,78,48,96) + ln(150,78,150,96) + ln(254,78,254,96) +
      box(4,96,88,28,'Btry A',`${bt} ${tn}s`,red) + box(106,96,88,28,'Btry B',`${bt} ${tn}s`,red) + box(208,96,88,28,'Btry C',`${bt} ${tn}s`,red) +
      `<text x="150" y="150" text-anchor="middle" fill="${dim}" font-family="'Share Tech',sans-serif" font-size="9">${tubes} total ${tn.toLowerCase()}s${cats>0?' · '+cats+' CATs':''}</text></svg>`;
  }
  if (echelon === 'Battery') {
    const bt = isCannon ? 6 : 9, pt = isCannon ? 2 : 3, cats = unit.includes('M109') ? 6 : 0;
    return `<svg viewBox="0 0 300 130" width="300" height="130" xmlns="http://www.w3.org/2000/svg">` +
      box(90,4,120,28,'Battery HQ','Cmd & Spt',red) + ln(150,32,150,50) +
      [0,1,2].map(i => box(4+i*98,50,88,28,`Plt ${i+1}`,`${pt} ${tn}s`,red)).join('') +
      [0,1,2].map(i => ln(48+i*98,78,48+i*98,96)).join('') +
      [0,1,2].map(i => [...Array(pt)].map((_,j) => box(4+i*98+j*(pt===3?28:42),96,pt===3?24:38,24,tn.slice(0,3)+' '+(i*pt+j+1),'',border)).join('')).join('') +
      `<text x="150" y="122" text-anchor="middle" fill="${dim}" font-family="'Share Tech',sans-serif" font-size="9">${bt} ${tn.toLowerCase()}s${cats>0?' · '+cats+' CATs':''}</text></svg>`;
  }
  const pt = isCannon ? 2 : 3;
  return `<svg viewBox="0 0 300 100" width="300" height="100" xmlns="http://www.w3.org/2000/svg">` +
    box(90,4,120,28,'Platoon HQ','Plt Ldr & PSG',red) + ln(150,32,150,50) +
    Array.from({length:pt},(_,i) => box(20+i*(260/pt)+10,50,70,28,`${tn} ${i+1}`,unit,border)).join('') +
    `<text x="150" y="92" text-anchor="middle" fill="${dim}" font-family="'Share Tech',sans-serif" font-size="9">${pt} ${tn.toLowerCase()}s per platoon</text></svg>`;
}
