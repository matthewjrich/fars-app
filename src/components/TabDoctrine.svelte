<script>
  const LAST_REVIEWED = 'May 2026';

  const PUBS = [
    {
      category: 'Doctrine — Field Artillery',
      items: [
        {
          pub:    'ATP 3-09.23',
          title:  'Field Artillery Battalion',
          date:   '25 February 2026',
          status: 'verified',
          data: [
            { what: 'RSR/CSR planning factors (Table 7-4) — rounds/weapon/day by operation type, intensity, and day phase', tabs: ['Logistics'] },
            { what: 'Complete-round planning weights: 155mm = 135.7 lbs/rd, 105mm = 68.5 lbs/rd (Table 7-4, fn 3)', tabs: ['Logistics', 'DODIC'] },
            { what: 'Flat rack capacities: 160 rds loose / 144 rds CCL projectiles only (Table 7-2) — app uses Army planning rule of thumb of 86 complete rounds (projectile + propellant + fuze)', tabs: ['Logistics'] },
          ],
          note: 'Supersedes ATP 3-09.23 (2015). Current as of app build.',
        },
        {
          pub:    'TC 3-09.81',
          title:  'Field Artillery Cannon Gunnery',
          date:   'Check current edition',
          status: 'stale',
          data: [
            { what: 'Propellant charge planning factors — M231/M232 bags per round by zone (Auto-Sync ratios unverified)', tabs: ['Logistics'] },
            { what: 'Fuze planning factors — PGK, MOFA, ET per round (Auto-Sync ratios unverified)', tabs: ['Logistics'] },
          ],
          note: 'WIP: Auto-sync charge and fuze ratios in the Logistics tab have not been verified against this publication. Update required before operational use.',
        },
        {
          pub:    'ATP 3-09.70',
          title:  'Paladin Operations',
          date:   'Check current edition',
          status: 'stale',
          data: [
            { what: 'M109A7/A6 propellant and fuze planning factors (may supplement TC 3-09.81)', tabs: ['Logistics'] },
          ],
          note: 'WIP: Verify Auto-Sync charge ratios against this publication for Paladin-specific planning factors.',
        },
        {
          pub:    'TM 9-2350-314-10',
          title:  'Operator Manual — M109A7 Paladin',
          date:   'Check current edition',
          status: 'stale',
          data: [
            { what: 'On-board stowage: 39 rounds per M109A7 (used in Total Rounds capacity)', tabs: ['Logistics'] },
            { what: 'Propellant and ammunition handling procedures', tabs: ['Logistics'] },
          ],
          note: 'WIP: Confirm 39-round on-board stowage figure and verify any charge planning data against current edition.',
        },
        {
          pub:    'FM 3-09',
          title:  'Fires',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Danger close distance — cannon: 600 m', tabs: ['Fire Missions'] },
            { what: 'Danger close distance — rockets: 750 m', tabs: ['Fire Missions'] },
            { what: 'General fire support planning procedures', tabs: ['Fire Missions'] },
          ],
          note: 'Verify edition date against current Army publishing.',
        },
        {
          pub:    'ATP 3-09.30',
          title:  'Observed Fire',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Danger close criteria and commander approval requirements', tabs: ['Fire Missions'] },
          ],
          note: 'Verify edition date against current Army publishing.',
        },
      ],
    },
    {
      category: 'Technical Manuals — Ammunition',
      items: [
        {
          pub:    'TM 43-0001-28-1',
          title:  'Artillery Ammunition (105mm)',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Shell-fuze combinations for 105mm munitions', tabs: ['Fire Missions'] },
            { what: 'Authorized fuze lots and charge restrictions — M119A3', tabs: ['Fire Missions'] },
            { what: 'DODIC codes, hazmat class, compatibility group, cube (ft³)', tabs: ['DODIC'] },
          ],
          note: 'TM 43-0001 series is updated frequently. Always verify current lot authorizations before live fire.',
        },
        {
          pub:    'TM 43-0001-28-2',
          title:  'Artillery Ammunition (155mm)',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Shell-fuze combinations for 155mm munitions', tabs: ['Fire Missions'] },
            { what: 'Authorized fuze lots and charge restrictions — M109A7/A6, M777A2', tabs: ['Fire Missions'] },
            { what: 'Range data (min/max) per munition type', tabs: ['Fire Missions'] },
            { what: 'DODIC codes, hazmat class, compatibility group, cube (ft³)', tabs: ['DODIC'] },
          ],
          note: 'TM 43-0001 series is updated frequently. Always verify current lot authorizations before live fire.',
        },
        {
          pub:    'TM 43-0001-28-3',
          title:  'Artillery Ammunition (Rockets)',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'GMLRS and ATACMS pod weights, hazmat class, compatibility group', tabs: ['DODIC'] },
            { what: 'PrSM (M501/M502) munition data', tabs: ['DODIC', 'Fire Missions'] },
          ],
          note: 'Verify PrSM data against current fielding documentation — system is actively evolving.',
        },
      ],
    },
    {
      category: 'Safety — Explosives and Storage',
      items: [
        {
          pub:    'DA Pam 385-64',
          title:  'Ammunition and Explosives Safety Standards',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Q-D arc K-factors (Table 2-1): HD 1.1 K = 1250/600/200 · HD 1.3 K = 900/375/75', tabs: ['PAA & Storage'] },
            { what: 'Hazard Division (HD) classifications by munition type', tabs: ['PAA & Storage'] },
            { what: 'IBD, PTR, and ILD arc formula: D = K × NEW^(1/3)', tabs: ['PAA & Storage'] },
          ],
          note: 'Q-D arc results in the app are planning estimates only. Verify with installation safety officer before site selection.',
        },
      ],
    },
    {
      category: 'Cost & Logistics Data',
      items: [
        {
          pub:    'OSMIS FY24',
          title:  'Operational and Support Management Information System — FY2024 Rates',
          date:   'FY2024 (Army G4)',
          status: 'stale',
          data: [
            { what: 'CL IX cost per mile by vehicle type (PLS, HEMTT, HIMARS, MLRS, HMMWV, Paladin)', tabs: ['Training Cost', 'Logistics'] },
            { what: 'Fuel consumption (gal/mile) by vehicle type', tabs: ['Training Cost', 'Logistics'] },
            { what: 'Fuel cost factor: $4.31/gallon (JP-8/diesel blend)', tabs: ['Training Cost', 'Logistics'] },
          ],
          note: 'FY24 rates are one to two fiscal years behind. Pull current OSMIS factors from Army G4 and update before use in budget or LOGSTAT submissions.',
        },
      ],
    },
    {
      category: 'Equipment — Barrel Life',
      items: [
        {
          pub:    'DA Form 2408-4',
          title:  'Weapon Record Data',
          date:   'JAN 1979 (current edition in use)',
          status: 'verified',
          data: [
            { what: 'Tube Serial No. — identifies the physical barrel; resets to zero when a tube is replaced (retubings column)', tabs: ['EFC'] },
            { what: 'Rounds Fired / EFC RDS Fired / Cumulative EFC RDS — the per-event log FARS replicates in aggregate', tabs: ['EFC'] },
            { what: 'Remaining Life (EFC RDS) — same metric shown in FARS barrel wear display', tabs: ['EFC'] },
            { what: 'Remarks — Recoil Exercise (RE), gage/velocity readings, Safety Inspection (SI) — not tracked in FARS', tabs: ['EFC'] },
          ],
          note: 'DA Form 2408-4 is the authoritative Army record for tube barrel wear (DA PAM 738-750). FARS replicates the EFC calculation per-gun but does not replace the form. Record tube serial numbers and retubings in the EFC tab to keep FARS data tied to a specific barrel.',
        },
        {
          pub:    'DA PAM 738-750 / 738-751',
          title:  'The Army Maintenance Management System (TAMMS) Functional Users Manual',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'Governing procedures for DA Form 2408-4 — when to start a new form, how to record retubings and rebushings', tabs: ['EFC'] },
            { what: 'EFC conversion table authority — charge-type EFC factors used in FARS barrel wear calculations', tabs: ['EFC'] },
          ],
          note: 'DA PAM 738-750 governs ground equipment; DA PAM 738-751 governs aviation. Verify current edition with unit S4/maintenance officer.',
        },
        {
          pub:    'Applicable -10 / -23 TMs',
          title:  'Weapon System Operator and Maintenance Manuals',
          date:   'Check current edition',
          status: 'check',
          data: [
            { what: 'M109A7 / M109A6 barrel life: 1,500 EFC', tabs: ['EFC'] },
            { what: 'M777A2 barrel life: 2,500 EFC', tabs: ['EFC'] },
            { what: 'M119A3 barrel life: 3,000 EFC', tabs: ['EFC'] },
          ],
          note: 'Barrel life limits are from applicable weapons system TMs. Limits may differ by propellant lot or charge authority — verify with unit armorers and the applicable TM.',
        },
      ],
    },
  ];

  const STATUS_LABEL = {
    verified: 'Verified',
    check:    'Check Edition',
    stale:    'Update Required',
  };

  const STATUS_COLOR = {
    verified: 'var(--od-good)',
    check:    'var(--od-warn)',
    stale:    'var(--od-bad)',
  };
</script>

<div class="section-title">Doctrine &amp; Reference Sources</div>
<p style="font-size:13px;color:var(--text-dim);margin-bottom:6px;">
  All planning data in FARS is derived from the publications listed below. Review this tab periodically to determine whether new editions have been published and the application needs updating.
</p>
<div style="font-size:12px;color:var(--text-dim);margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;">
  <span>App last reviewed: <b style="color:var(--gold)">{LAST_REVIEWED}</b></span>
  <span style="display:flex;gap:14px;align-items:center;">
    <span><span class="status-dot" style="background:var(--od-good)"></span> Verified — edition confirmed at review</span>
    <span><span class="status-dot" style="background:var(--od-warn)"></span> Check Edition — verify before use</span>
    <span><span class="status-dot" style="background:var(--od-bad)"></span> Update Required — known gap</span>
  </span>
</div>

{#each PUBS as group}
  <div class="section-title" style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);margin-bottom:10px;">{group.category}</div>
  {#each group.items as item}
    <div class="doc-card" style="margin-bottom:12px;">
      <div class="doc-card-header">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span class="doc-pub">{item.pub}</span>
          <span class="doc-title">{item.title}</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <span class="doc-date">{item.date}</span>
          <span class="doc-status" style="background:color-mix(in srgb,{STATUS_COLOR[item.status]} 15%,transparent);color:{STATUS_COLOR[item.status]};border-color:{STATUS_COLOR[item.status]};">
            {STATUS_LABEL[item.status]}
          </span>
        </div>
      </div>

      <table class="doc-data-table">
        <thead>
          <tr>
            <th style="width:60%">Data Used in FARS</th>
            <th>Tab(s)</th>
          </tr>
        </thead>
        <tbody>
          {#each item.data as d}
            <tr>
              <td>{d.what}</td>
              <td style="white-space:nowrap;">
                {#each d.tabs as tab}
                  <span class="tab-badge">{tab}</span>
                {/each}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if item.note}
        <div class="doc-note">{item.note}</div>
      {/if}
    </div>
  {/each}
{/each}

<div class="alert alert-info" style="margin-top:8px;">
  ℹ️ All values in FARS are planning estimates. Before operational or budgetary use, verify all data against the current edition of each publication listed above and applicable higher HQ guidance.
</div>

<style>
  .status-dot {
    display:inline-block;
    width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle;
  }
  .doc-card {
    background:var(--bg-card);
    border:1px solid var(--border);
    border-radius:6px;
    overflow:hidden;
  }
  .doc-card-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:8px;
    padding:10px 14px;
    border-bottom:1px solid var(--border);
    background:var(--bg-row-alt);
  }
  .doc-pub {
    font-family:'Share Tech',sans-serif;
    font-size:14px;
    font-weight:700;
    color:var(--gold);
  }
  .doc-title {
    font-size:13px;
    color:var(--text);
  }
  .doc-date {
    font-size:11px;
    color:var(--text-dim);
  }
  .doc-status {
    font-size:11px;
    font-weight:700;
    padding:2px 8px;
    border-radius:4px;
    border:1px solid;
    letter-spacing:0.4px;
    text-transform:uppercase;
  }
  .doc-data-table {
    width:100%;
    border-collapse:collapse;
    font-size:12px;
  }
  .doc-data-table th {
    background:transparent;
    color:var(--text-dim);
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:0.8px;
    padding:6px 14px;
    text-align:left;
    border-bottom:1px solid var(--border);
  }
  .doc-data-table td {
    padding:6px 14px;
    vertical-align:top;
    border-bottom:1px solid var(--border);
    color:var(--text);
    line-height:1.4;
  }
  .doc-data-table tr:last-child td {
    border-bottom:none;
  }
  .doc-note {
    padding:7px 14px;
    font-size:11px;
    color:var(--text-dim);
    border-top:1px solid var(--border);
    background:var(--bg-row-alt);
    font-style:italic;
  }
  .tab-badge {
    display:inline-block;
    background:color-mix(in srgb,var(--gold) 12%,transparent);
    color:var(--gold);
    border:1px solid color-mix(in srgb,var(--gold) 30%,transparent);
    border-radius:3px;
    padding:1px 5px;
    font-size:10px;
    font-weight:700;
    letter-spacing:0.3px;
  }
</style>
