# FARS — Field Artillery Resource Sync
## User Manual
**Version:** 2.1 | **Updated:** May 2026 | **Cost Factors:** OSMIS FY24 | **Classification:** UNCLASSIFIED // FOR OFFICIAL USE ONLY

---

## What Is FARS?

FARS (Field Artillery Resource Sync) is a browser-based planning and situational awareness tool for Field Artillery units at Battalion, Battery, and Platoon echelons. It consolidates the information an FA officer or NCO needs to plan, brief, and track unit operations in a single interface.

**Core capabilities:**
- Ammunition logistics: haul capacity, RSR/CSR comparison, Days of Supply
- Fire mission sustainability planning
- Unit situational awareness: task organization, CP/PAA locations, PACE plan, NMC status
- Barrel life tracking (EFC)
- Training event cost estimation
- LOGSTAT generation and export

All inputs persist automatically in the browser. No login, no save button. Data survives tab switches and page refreshes.

---

## Getting Started — The Sidebar

Click **☰ Unit/Echelon** to open the configuration sidebar. Every tab reads from these settings. Change any sidebar value and all calculations update in real time.

The sidebar is organized into collapsible accordion sections. Click a section header to expand or collapse it.

---

### Sidebar Sections

#### 1. Echelon & Unit
| Field | Description |
|---|---|
| **Echelon** | Battalion / Battery / Platoon — sets doctrinal tube counts and vehicle defaults |
| **Unit Type** | Weapon system: M109A7, M109A6, M777A2, M119A3, HIMARS, MLRS |
| **Unit Category** | Cannon (SP), Cannon (T), Rocket, or Composite |
| **Operational Tubes / Launchers** | Actual systems available — can be set below doctrinal for degraded operations |
| **PLS Trucks** | M1075A1 PLS trucks (cannon/rocket systems) |
| **M1076 Trailers** | Trailers paired with PLS trucks |
| **M992A3 CATs** | Combat Ammunition Trailers — M109 systems only |
| **HMMWVs** | M1097/M1152 ammo carriers — M119A3 only |

#### 2. Battery Roster *(Battalion echelon only)*
Enable **Non-Standard Configuration** to configure a mixed or non-standard battalion. Set each battery's weapon system and tube count independently. Use **+ Add Battery** and **×** to manage the roster.

#### 3. Load Configuration *(Cannon systems only)*
| Option | Description |
|---|---|
| **Loose** | 160 rounds per flatrack (default) |
| **CCL** | Combat Configured Load — 144 rounds per flatrack, faster upload |

#### 4. Planning Mode
| Mode | Description |
|---|---|
| **Manual (Detailed RSR)** | Enter exact round quantities per munition type in the Logistics tab |
| **Daily Load %** | Set a percentage of total haul capacity — useful for quick estimates |

#### 5. CSR Management
| Mode | Description |
|---|---|
| **General Limit** | Single CSR (rounds/tube/day) applied across all munition types |
| **By Round Type** | Individual CSR limits per munition, entered in the RSR grid |

#### 6. Sustainment & Routes
| Field | Description |
|---|---|
| **Distance to Supply Point (km)** | One-way road distance to ASP/BSA |
| **Avg Speed (km/h)** | Convoy average speed |
| **Draw / Loading Time (hrs)** | Time to load at the supply point |
| **Available Planning Hours / Day** | Usable hours per day for resupply operations |

**Turnaround formula:** `(Distance × 2 ÷ Speed) + Loading Time`

#### 7. DOS & Firing Rate
| Field | Description |
|---|---|
| **Authorized CSR (rds/tube/day)** | Maximum authorized daily rate from higher HQ |
| **Expected Daily Firing Rate (%)** | Estimated percentage of CSR actually fired each day |

#### 8. PAA Storage
| Field | Description |
|---|---|
| **Gun Line Capacity (rds/tube)** | Rounds stored at the gun line per howitzer |
| **BSA Storage Capacity (total rds)** | Total round capacity at the Battery Support Area |

#### 9. Tactical Realism
| Field | Description |
|---|---|
| **Dud / Misfire Rate (%)** | Percentage of rounds expected to fail — reduces effective rounds in all calculations |
| **Pod Reload Time (min/launcher)** | Rockets only — time to reload one pod after firing |

---

## Primary Tabs

### Tab 1 — Task Organization

**Purpose:** Unit disposition, command structure, situational awareness, and operational tracking.

#### Task Organization Chart
Select **Tree** or **Bracket** view. The tree displays organic elements and attached/assigned units in a visual org chart. Enter a **Unit Designation** and **Higher HQ** with relationship (OPCON, DS, GS, etc.) at the top.

**Battery names** (Battalion echelon): click **Edit Battery Names** to customize.

**Attaching units:** Click **+ Attach / Assign Unit** → enter the unit name, relationship type, capability, and notes. Click × on a node to remove.

#### Command Post (CP) Locations
Two CP cards display by default — pre-labeled **Main CP** with a blank card beside it for medics, mechanics, supply, or any other element. Each card has:
- **CP designation** — editable name (e.g., Main CP, TAC CP, CTCP, BSA)
- **Status** — Active / Displaced / En Route / Stand-by (color-coded dot indicator)
- **Grid** — 8-digit MGRS coordinate

Click **+ Add CP** to add more cards. The × button removes a card (minimum 1 remains).

#### Position Areas (PAA)
Two PAA cards display by default in a 2-column layout. Each card has:
- **PAA name** — e.g., PAA IRON, PAA STEEL
- **Status** — In Position / Displacing / En Route / Unoccupied (color-coded dot)
- **Grid** — 8-digit MGRS coordinate of the firing position
- **Occupying Unit** — dropdown populated from your organic firing batteries and attached units
- **Guns** — number of systems in this PAA (auto-populates from the selected battery's tube count; adjust as needed)

**Multiple PAAs per battery:** A battery can be assigned to more than one PAA — assign the battery in each PAA card and both will reflect on the org chart.

**Reset Occupancy button:** Clears all unit and gun assignments while keeping PAA names, grids, and status intact. Use this at the start of a new operation when positions change.

**Org chart integration:** When a battery is assigned to a PAA, the PAA name appears as a blue sub-line on that battery's node in the tree view, and as `→ PAA IRON` in the bracket view. Updates live.

#### PACE Plan
Tracks Primary / Alternate / Contingency / Emergency communications or coordination methods. Each plan has a title (e.g., **Fires Net**, **C2**, **Logistics**) and four rows — one per tier.

Each row:
- **Means** — e.g., SINCGARS FM, HF Radio, Messenger
- **Details** — frequency, callsign, or contact information
- **Status** — UP / DEGRADED / DOWN

**Visual indicators:**
- DEGRADED row: amber highlight
- DOWN row: red highlight
- Card border turns red (DOWN) or amber (DEGRADED) when any tier is affected
- **"NET DOWN" / "DEGRADED"** badge appears in the card header
- **Amber dot** appears on the Task Org tab button when any PACE tier is DOWN

Click **+ Add PACE Plan** to add plans for additional nets.

#### NMC — Non-Mission Capable

Tracks equipment that is non-mission capable and provides a unit roll-up.

**To log an NMC item:**
1. Click **+ Log NMC Item**
2. Fill in the row: Unit (dropdown from your batteries), Equipment (e.g., `Gun 2`, `PLS #3`, `M992 CAT`), Fault/Reason, and Est. RTD
3. Click × to clear an item when equipment is restored

**Visual indicators:**
- **Red alert banner** appears at the top of the Task Org tab listing total NMC items and a count per battery
- **Red dot** appears on the Task Org tab button — visible from any other tab

**Tab button indicators at a glance:**
| Dot Color | Meaning |
|---|---|
| Red dot | NMC equipment is logged |
| Amber dot | One or more PACE tiers are DOWN |
| Both dots | Both conditions are present |

---

### Tab 2 — Logistics

**Purpose:** Core logistics planning — haul capacity, RSR entry, CSR comparison, and utilization.

#### Organic Haul Capacity
- **Total Weight** — gross lift capacity of all assigned vehicles
- **Total Round Capacity** — maximum rounds that fit given current load config
- **Capacity Utilization** — how much of available haul capacity the RSR uses

#### RSR Input *(Manual planning mode only)*
Munitions organized in three columns by type. Each row has two inputs:
| Input | What to enter |
|---|---|
| **RSR** | Total rounds your unit is requesting for this resupply period |
| **CSR** | Rounds per system per day authorized by higher HQ |

Authorized total is automatically calculated: `CSR × number of systems`

**Status badge** once CSR is set:
- **AUTH** (green) — RSR is within the authorized limit
- **EXCEEDS** (red) — RSR exceeds authorization; shows how many rounds over

**Auto-Sync Support Items** *(155mm only)* — automatically calculates propellant charges and fuze quantities from projectile quantities. Uncheck to enter manually.

#### Custom / Non-Standard Ammunition
Click **+ Add Custom Ammo** → enter name and weight (lbs) → click **Add**. Custom rounds appear in the RSR grid with the same inputs. Remove with ×.

#### FY24 Resupply Run Cost
- **CL IX / Run** — parts cost by vehicle type and mileage
- **Daily Run Cost** — total cost across all runs per day

---

### Tab 3 — DOS & Resupply

**Purpose:** Projects how long current ammunition will last and whether organic lift can sustain the firing rate.

#### Days of Supply Metrics
| Metric | Description |
|---|---|
| **Days of Supply** | How long current effective rounds sustain the firing rate |
| **Daily Ammo Usage** | Rounds consumed per day at configured firing rate |
| **Runs Possible/Day** | Complete resupply runs achievable in available planning hours |
| **Runs Needed/Day** | Runs required to sustain the current firing rate |

A **RESUPPLY SHORTFALL** alert appears if runs needed exceed runs possible.

#### DOS by Firing Scenario
Four scenario bars at 25%, 50%, 75%, and 100% of authorized CSR. Color coded: Green (≥3 DOS), Amber (1–3 DOS), Red (<1 DOS).

#### Resupply Math Breakdown
Expandable section showing the full calculation chain with live values.

---

### Tab 4 — Fire Missions

**Purpose:** Calculates fire mission sustainability and provides quick-reference tactical data.

#### Mission Sustainability
| Input | Description |
|---|---|
| **Rounds per Target per Gun** *(cannon)* | Rounds per gun per fire mission |
| **Fire Mode** *(rockets)* | Full Pods (ATACMS/massed) or Individual Rockets (GMLRS 6-pack) |

| Output | Description |
|---|---|
| **Operational Tubes** | Actual vs. doctrinal strength with degradation % |
| **Max Missions** | Supportable fire missions before Winchester (tube-adjusted) |
| **Rounds per Mission** | Total ammo consumed per fire mission |
| **Effective Rounds** | Rounds on hand after dud/misfire rate |

**Status alerts:** WINCHESTER / CRITICAL (≤3 missions) / COMBAT EFFECTIVE

#### Danger Close Criteria *(expandable)*
- Standard DC distance: **600m** (cannon) / **750m** (rockets)
- **DC Check:** enter distance to friendlies in meters → app returns DANGER CLOSE or CLEAR
- Precision munition exceptions (Excalibur: 200m, GMLRS unitary: 200m)
- Restricted munitions (DPICM — DC fires NOT authorized)

Source: FM 3-09 / ATP 3-09.30

#### Quick Reference — Rate of Fire & Ranges *(expandable)*
Rate of fire cards (burst and sustained) for the active weapon system, plus a range table showing minimum and maximum range for each munition type.

#### Shell-Fuze Combinations *(expandable)*
Authorized fuze-projectile combinations for the active weapon system, organized by round. Includes:
- Authorized fuze designations and modes (PD, delay, VT, time, integral)
- Preferred fuze for general-purpose missions (marked ★)
- Restricted combinations (DPICM — no separate fuze authorized)
- Red restriction row for munitions where DC is not authorized

> **PLANNING REFERENCE ONLY** — Verify all combinations against current TM 43-0001-28 series and applicable firing tables before live fire. Authorizations may be charge-, propellant-lot-, or mission-dependent.

---

### Tab 5 — PAA & Storage

**Purpose:** Ammunition storage capacity assessment and Q-D arc calculation.

#### Storage Metrics
- **Gun Line Capacity** — total rounds the gun line can hold (rds/tube × tubes)
- **BSA Storage Capacity** — total BSA storage configured in sidebar
- **Total PAA Capacity** — gun line + BSA combined
- **Effective Rounds on Hand** — rounds after dud rate

Two utilization gauges show current rounds vs. gun line and BSA capacity. Overflow alerts trigger if rounds exceed capacity.

#### NET Explosive Weight (NEW) Reference
Table of NEW values per round for the active weapon system. Used for explosive site plans and Q-D arc calculations (DA Pam 385-64).

#### Q-D Arc Calculator *(expandable)*
Calculate quantity-distance arcs by munition type and quantity.

**Formula:** D = K × NEW^(1/3)
- HD 1.1 (mass detonating — HE, DPICM, rockets): K = 1250 / 600 / 200
- HD 1.3 (mass fire — WP, ILLUM, propellant): K = 900 / 375 / 75

Outputs IBD, PTR, and ILD distances in both feet and meters.

> Results are computed estimates only. Verify with installation safety officer and current DA Pam 385-64 before site selection.

---

### Tab 6 — Readiness

**Purpose:** Personnel status (PERSTAT) and vehicle maintenance status (MAINTSTAT) tracking.

#### PERSTAT
Enter assigned, present, and available personnel for each element (HHB, batteries, or platoons depending on echelon). Totals and availability percentage calculated automatically.

#### MAINTSTAT
Vehicle maintenance tracker for all organic vehicle types. Enter on-hand, FMC (Fully Mission Capable), and PMC (Partially Mission Capable) counts. NMC is computed automatically.

FMC % color coding:
- Green: ≥85%
- Amber: 70–85%
- Red: <70%

Data persists separately from the main configuration and exports in the LOGSTAT.

---

## Reference & Tools Tabs

### Tab 7 — Training Cost

**Purpose:** Estimates total training event cost across all Army supply classes using FY24 OSMIS rates.

#### Event Information
Enter unit designation, event name, personnel count (PAX), start/end dates (event days auto-calculate), and location. Grand total banner updates in real time.

#### Supply Classes (accordion sections)
| Class | Contents |
|---|---|
| **CL I** | MRE, UGR, JD (Jalapeño Dairy), bottled water — enter meals/cases per person per day |
| **CL II** | Clothing and individual equipment — dollar estimate per person |
| **CL III(B)** | Bulk fuel — calculated from vehicle miles × OSMIS fuel consumption rates |
| **CL III(P)** | Packaged POL — FRH, motor oil, antifreeze, CLP, grease |
| **CL IX** | Repair parts — calculated from vehicle miles × OSMIS parts rates |
| **CL IV** | Construction material — concertina wire, sandbags, lumber |
| **CL VIII** | Medical material — dollar estimate per person |

Each CL section shows its running subtotal in the accordion header. Sections default to open for the most-used classes (CL I, CL III(B)/IX).

---

### Tab 8 — DODIC Reference

**Purpose:** Quick-reference database for all standard FA munitions.

Use filter buttons (ALL / 155mm / 105mm / Rockets / Charges / Fuzes) and the search box to find specific rounds.

Each card shows: round designation, DODIC, weight (lbs), cube (ft³), hazmat class, and compatibility group.

---

### Tab 9 — EFC Calculator

**Purpose:** Tracks Equivalent Full Charge barrel wear per gun.

For each gun, enter rounds fired at each charge level. The app calculates total EFC accumulated, remaining barrel life, and wear status (OK / MONITOR / REPLACE).

**Barrel life limits:**
| System | Barrel Life |
|---|---|
| M109A7 / M109A6 | 1,500 EFC |
| M777A2 | 2,500 EFC |
| M119A3 | 3,000 EFC |

A fleet summary shows total EFC across all tubes and identifies the highest-wear gun.

Data persists and exports in the LOGSTAT.

---

### Tab 10 — Export / LOGSTAT

**Purpose:** Generates a formatted logistics and status report from all current data.

#### LOGSTAT Output
A plain-text report that includes (when data is entered):
- Unit identity and configuration
- Lift capacity and effective rounds
- Sustainment metrics (turnaround, runs, DOS)
- FY24 resupply costs
- Full RSR with CSR comparison
- Sustainment feasibility status
- PACE plan status
- NMC equipment roll-up (by unit)
- CP and PAA locations
- Personnel status (PERSTAT)
- Maintenance status (MAINTSTAT)
- Barrel life / EFC summary
- Planning notes

#### Export Options
- **Copy LOGSTAT** — copies full plain-text report to clipboard
- **Download CSV** — structured spreadsheet with all metrics, RSR, PERSTAT, MAINTSTAT, EFC, NMC, CP/PAA locations, and notes
- **Refresh (Readiness / EFC / Notes)** — re-reads data from Readiness, EFC, Notes, and Task Org tabs if you updated them after opening the Export tab

---

### Tab 11 — Notes

**Purpose:** Freeform planning notes organized into labeled blocks.

Each block has an editable title (e.g., D+1, OPORD Notes, Fire Support Coord) and a resizable text area. Notes auto-save as you type.

- **+ Add Note Block** — adds a new block below
- **Copy All Notes** — copies all note blocks to clipboard, formatted with titles as section headers
- × button removes a block (minimum 1 block remains)

---

## Quick Reference — Key Terms

| Term | Definition |
|---|---|
| **RSR** | Required Supply Rate — what the unit requests |
| **CSR** | Controlled Supply Rate — what higher HQ authorizes (rds/system/day) |
| **DOS** | Days of Supply — how long current ammo sustains operations at the firing rate |
| **EFC** | Equivalent Full Charge — measure of cumulative barrel wear |
| **CCL** | Combat Configured Load — pre-packaged flatrack (144 rds vs 160 loose) |
| **PAA** | Position Area for Artillery — the firing position occupied by the battery |
| **BSA** | Battery Support Area — rear logistics node |
| **ASP** | Ammunition Supply Point — source for resupply runs |
| **DODIC** | Department of Defense Identification Code — munition identifier |
| **NEW** | Net Explosive Weight — explosive content used for Q-D calculations |
| **Q-D** | Quantity-Distance — minimum separation from explosives per DA Pam 385-64 |
| **PACE** | Primary / Alternate / Contingency / Emergency — communications plan |
| **NMC** | Non-Mission Capable — equipment unable to perform its mission |
| **DC** | Danger Close — fires within 600m (cannon) or 750m (rockets) of friendly forces |
| **Winchester** | Military term for completely out of ammunition |
| **OSMIS** | Operational and Support Management Information System — Army cost database |
| **PERSTAT** | Personnel Status report |
| **MAINTSTAT** | Maintenance Status report |

---

## Typical Planning Workflow

1. **Sidebar** → Set echelon, unit type, vehicle quantities, distance to supply point, CSR, and firing rate
2. **Task Org tab** → Set unit designation, higher HQ, CP locations, and PAA positions with occupying batteries
3. **Task Org tab** → Enter PACE plan for fires net and C2; log any NMC equipment
4. **Logistics tab** → Manual mode → Enter RSR and CSR per round type; verify haul capacity is not exceeded
5. **DOS & Resupply tab** → Confirm runs possible ≥ runs needed; verify DOS at expected firing rate
6. **Fire Missions tab** → Confirm max missions supportable; check danger close criteria if applicable
7. **Readiness tab** → Enter PERSTAT and MAINTSTAT data
8. **EFC tab** → Update barrel wear per gun if tracking long-term
9. **Notes tab** → Capture planning notes, OPORD extracts, or mission-specific data
10. **Export tab** → Refresh → Copy LOGSTAT or Download CSV for battle captain / S4

---

## FY24 OSMIS Cost Factors

| Vehicle | CL IX ($/mile) | Fuel (gal/mile) |
|---|---|---|
| PLS M1075A1 | $9.83 | 0.41 |
| HEMTT M1120 LHS | $8.33 | 0.41 |
| HIMARS M142 | $13.96 | 0.16 |
| MLRS M270A2 | $428.07 | 1.15 |
| HMMWV | $8.51 | 0.19 |
| M109A6 Paladin | $457.36 | 0.88 |

Fuel cost calculated at **$4.31/gallon** (JP-8 and diesel blend).

---

*FARS — Field Artillery Resource Sync*
*All calculations are planning estimates. Verify against current unit SOP, TMs, and higher HQ guidance before operational use.*
*UNCLASSIFIED // FOR OFFICIAL USE ONLY*
