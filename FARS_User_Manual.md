# FARS — Field Artillery Resource Sync
## User Instruction Manual
**Version:** FY24 | **Cost Factors:** OSMIS FY24

---

## What Is FARS?

FARS (Field Artillery Resource Sync) is a browser-based logistics and planning tool for Field Artillery units. It provides a single interface for:

- Calculating organic haul capacity and ammunition requirements
- Comparing Required Supply Rate (RSR) against Controlled Supply Rate (CSR)
- Projecting Days of Supply (DOS) and resupply cycle feasibility
- Estimating training event costs across all supply classes (CL I–IX)
- Assessing fire mission sustainability and barrel wear
- Evaluating gap crossing feasibility for tactical convoys
- Referencing DODIC/munition data and military load classifications

All calculations update in real time as you adjust inputs. No login, no save button — values persist in the browser session.

---

## Getting Started — The Sidebar

Click **☰ Unit/Echelon** to open the configuration sidebar. This is the control panel for the entire app. All tabs read from these settings.

The sidebar is organized into collapsible accordion sections. Click any section header to expand or collapse it.

---

### Sidebar Sections

#### 1. Echelon & Unit
Sets the foundational unit identity for all calculations.

| Field | Description |
|---|---|
| **Echelon** | Battalion / Battery / Platoon — sets doctrinal tube counts and vehicle defaults |
| **Unit Type** | Select the weapon system: M109A7, M109A6, M777A2, M119A3, HIMARS, MLRS |
| **Operational Tubes / Launchers** | Actual number of systems available (can be less than doctrinal for degraded ops) |
| **PLS Trucks** | M1075A1 PLS trucks available for resupply (cannon/rocket systems) |
| **M1076 Trailers** | Trailer assets paired with PLS trucks |
| **M992A3 CATs** | Combat Ammunition Trailers — M109 systems only |
| **HMMWVs** | M1097/M1152 ammo carriers — M119A3 only |

Changing Echelon or Unit Type automatically resets vehicle counts to doctrinal defaults.

---

#### 2. Battery Roster *(Battalion echelon only)*
Allows configuration of non-standard or mixed battalions.

**Enable:** Check **Non-Standard Configuration** to activate.

Each row represents one battery. Set its unit type and tube count. The app automatically computes the total vehicle assets from all batteries combined.

**Example — Mixed Battalion:**
- Battery 1: M777A2, 6 tubes → 6 PLS trucks, 6 trailers
- Battery 2: M119A3, 6 tubes → 6 HMMWVs
- Battery 3: M119A3, 6 tubes → 6 HMMWVs
- **Result:** 18 total tubes, 6 trucks, 6 trailers, 12 HMMWVs

Use **+ Add Battery** to add batteries. The **×** button removes a battery. Click **Primary Ammo System** to select which munition type drives the RSR, DODIC, and EFC tabs when the battalion has mixed systems.

> Vehicle counts use a 1:1 tube ratio. You can still manually adjust individual counts in the Echelon & Unit section above.

---

#### 3. Load Configuration *(Cannon systems only)*
| Option | Description |
|---|---|
| **Loose** | 160 rounds per flatrack (default) |
| **CCL (Combat Configured Load)** | 144 rounds per flatrack — pre-configured for faster upload |

---

#### 4. Planning Mode
Determines how the RSR and haul calculations are populated.

| Mode | Description |
|---|---|
| **Manual (Detailed RSR)** | You enter exact round quantities per munition type in the Logistics tab. Most precise — recommended for actual mission planning. |
| **Daily Load % (Excel Mode)** | Set a percentage of total haul capacity to model a partial load. Useful for quick estimates without full RSR data. |

---

#### 5. CSR Management
Sets the Controlled Supply Rate limits for alert calculations at the top of the Logistics tab.

| Mode | Description |
|---|---|
| **General Limit** | One CSR number (rounds/tube/day) applied across all munition types |
| **By Round Type** | Individual CSR limits per munition — synced with the CSR inputs in the RSR grid |

> **Note:** Per-round CSR is now entered directly in the RSR grid on the Logistics tab. The sidebar CSR section and the grid inputs are linked — changes in either location update both.

---

#### 6. Sustainment & Routes
Drives all resupply cycle and cost calculations.

| Field | Description |
|---|---|
| **Distance to Supply Point (km)** | One-way road distance to the ASP/BSA |
| **Avg Speed (km/h)** | Convoy average speed |
| **Draw / Loading Time (hrs)** | Time to load at the supply point |
| **Available Planning Hours / Day** | Usable hours per day for resupply operations |

**Turnaround formula:** `(Distance × 2 ÷ Speed) + Loading Time`

---

#### 7. DOS & Firing Rate
Controls Days of Supply and firing intensity calculations.

| Field | Description |
|---|---|
| **Authorized CSR (rds/tube/day)** | Maximum authorized daily rate from higher HQ |
| **Expected Daily Firing Rate (%)** | Estimated percentage of CSR that will actually be fired each day |

---

#### 8. PAA Storage
Sets Position Area for Artillery storage limits used in the PAA & Storage tab.

| Field | Description |
|---|---|
| **Gun Line Capacity (rds/tube)** | Rounds that can be stored at the gun line per howitzer |
| **BSA Storage Capacity (total rds)** | Total round capacity at the Battery Support Area |

---

#### 9. Tactical Realism
| Field | Description |
|---|---|
| **Dud / Misfire Rate (%)** | Percentage of rounds expected to fail — reduces effective rounds in all calculations |
| **Pod Reload Time (min/launcher)** | Rocket systems only — time to reload one pod after firing |

---

## Tab Reference

### Primary Tabs
These are the most frequently used planning tabs, displayed prominently in the top row.

---

### Tab 1 — Logistics

**Purpose:** Core logistics planning — haul capacity, RSR entry, CSR comparison, cost estimation, and utilization.

#### Organic Haul Capacity
Displays total lift capacity of assigned vehicles:
- **Total Weight (lbs / STONs)** — gross weight capacity of all vehicles combined
- **Total Round Capacity** — maximum rounds that fit given current load config
- **Capacity Label** — varies by system (pallet equivalents for cannon, pods for rockets)

#### Mission Requirements (RSR)
Shows the current total mission request:
- **Required Weight** — total weight of all requested rounds
- **Requested Rounds/Pallets/Pods** — total items requested
- **Turnaround Time** — time per resupply run based on sustainment inputs
- **Capacity Utilization %** — how much of available haul capacity the RSR uses

#### FY24 Resupply Run Cost
Estimated cost per resupply run using OSMIS FY24 vehicle rates:
- **CL IX / Run** — parts cost based on miles and vehicle type
- **Fuel Cost / Run** — estimated CL III(B) at 15% of CL IX rate
- **Daily Run Cost** — total cost across all runs per day
- **Miles per Run** — round-trip mileage

#### Haul Utilization Gauge
Visual bar showing current RSR as a percentage of total haul capacity. Color coded:
- **Green** — under 70% utilized
- **Amber** — 70–90% utilized
- **Red** — over 90% utilized (approaching or exceeding capacity)

#### RSR Input *(Manual planning mode only)*
The main data entry area. Munitions are organized into three columns by type:

| Column | 155mm | 105mm | Rockets |
|---|---|---|---|
| Column 1 | HE & RAP | HE & RAP | Rockets |
| Column 2 | Specialty | Specialty | ATACMS |
| Column 3 | Support Items | Support Items | PrSM |

**Each munition row has two inputs:**

| Input | Label | What to enter |
|---|---|---|
| Left | **RSR — Required Supply Rate** | Total rounds your unit is requesting for this resupply period |
| Right | **CSR — Controlled Supply Rate** | Rounds per system per day authorized by higher headquarters |

**Authorized total** is automatically calculated: `CSR × number of systems`

**Status badge** appears once CSR is set:
- **✓ AUTH** (green) — RSR is within the authorized limit
- **⚠ EXCEEDS** (red) — RSR exceeds authorization; shows how many rounds over

**Auto-Sync Support Items** *(155mm only)* — when checked, automatically calculates propellant charges and fuze quantities based on projectile quantities entered. Uncheck to enter support items manually.

#### Custom / Non-Standard Ammunition
Allows entry of munitions not in the standard DODIC list.

**To add a custom round:**
1. Click **+ Add Custom Ammo**
2. Enter the munition name/designation (e.g., `XM1234 HE-ER`)
3. Enter round weight in lbs (used for haul weight calculations; leave 0 if unknown)
4. Click **Add**

Custom rounds appear in their own section with the same RSR/CSR inputs. Remove any custom round with the **×** button — its RSR value is also cleared.

---

### Tab 2 — Fire Missions

**Purpose:** Calculates how many fire missions can be supported with current ammunition on hand.

#### Key Inputs
- **Rounds per Target per Gun** *(cannon)* — how many rounds per gun per fire mission
- **Fire Mode** *(rockets)* — Full Pods (ATACMS/massed fires) or Individual Rockets (GMLRS 6-pack)

#### Outputs
| Metric | Description |
|---|---|
| **Operational Tubes** | Actual vs. doctrinal strength, with degradation percentage |
| **Max Missions** | Total supportable fire missions before Winchester (tube-adjusted for degradation) |
| **Rounds/Pods per Mission** | Total ammunition consumed per fire mission |
| **Effective Rounds** | Rounds on hand after dud/misfire rate is applied |

#### Status Alerts
- **WINCHESTER** — insufficient ammo for even one mission
- **CRITICAL** — 3 or fewer missions remaining
- **COMBAT EFFECTIVE** — sufficient ammunition for continued operations

System-specific notes are displayed for M119A3 (rate of fire) and HIMARS/MLRS (reload time).

---

### Tab 3 — DOS & Resupply

**Purpose:** Projects how long current ammunition supplies will last and whether organic lift can sustain the firing rate.

#### Days of Supply Metrics
| Metric | Description |
|---|---|
| **Days of Supply** | How many days current effective rounds will sustain the firing rate |
| **Daily Ammo Usage** | Rounds consumed per day at the configured firing rate % |
| **Total Rounds** | Total rounds across all organic vehicles |
| **Effective Rounds** | Total after dud rate deduction |

#### Daily Resupply Cycle
| Metric | Description |
|---|---|
| **Runs Possible/Day** | How many complete resupply runs can be completed in available planning hours |
| **Runs Needed/Day** | How many runs are required to sustain the current firing rate |
| **Daily Lift Capacity** | Total rounds that can be delivered per day with available runs |
| **Surplus/Deficit** | Difference between what can be delivered and what is consumed |

A **RESUPPLY SHORTFALL** alert appears if runs needed exceed runs possible.

#### DOS by Firing Scenario
Four scenario bars showing projected DOS at 25%, 50%, 75%, and 100% of authorized CSR. Color coded: Green (≥3 DOS), Amber (1–3 DOS), Red (<1 DOS).

#### Resupply Math Breakdown
Expandable section showing the full calculation chain:
- Turnaround formula with live values
- Runs per day calculation
- Rounds per run
- FY24 CL IX cost per run

---

### Tab 4 — Training Cost

**Purpose:** Estimates total training event cost across all Army supply classes using FY24 OSMIS rates.

#### Event Information
Enter unit, event name, number of personnel (PAX), dates, and number of event days. The grand total banner updates in real time.

#### Supply Classes Covered

| Class | What It Covers |
|---|---|
| **CL I** | Subsistence — MRE, UGR, JD (Jalapeño Dairy), bottled water. Enter meals/cases per person per day. |
| **CL II** | Clothing and individual equipment. Enter dollar estimate per person. |
| **CL III(B)** | Bulk fuel — calculated from vehicle miles and OSMIS fuel consumption rates |
| **CL III(P)** | Packaged POL — FRH, motor oil, antifreeze, CLP, grease, power steering fluid |
| **CL IX** | Repair parts — calculated from vehicle miles and OSMIS parts rates |
| **CL IV** | Construction material — concertina wire, concertina clips, other |
| **CL VIII** | Medical material — dollar estimate per person |

#### Vehicle Cost Table
For CL III(B) and CL IX: enter quantity and miles driven for each vehicle type. The app calculates fuel cost and parts cost separately using FY24 OSMIS rates per mile.

#### Export Options
- **📋 Copy LOGSTAT** — copies a formatted plain-text cost estimate to clipboard
- **⬇ Download CSV** — downloads a spreadsheet-ready breakdown of all line items

---

### Tab 5 — Gap Crossing

**Purpose:** Military Load Classification (MLC) assessment for river crossings and bridge sites. Determines GO/NO-GO for the task organization.

#### Bridge Site Configuration
| Field | Description |
|---|---|
| **Bridge MLC** | Classification number of the bridge or gap crossing site |
| **Bridge Type** | Wet / Dry / Float (Ribbon) |
| **Soil/Approach** | Approach condition affects effective MLC |
| **Treadway** | Single or Double — affects capacity |
| **Gap Width (m)** | Used to calculate estimated crossing time |
| **Crossing Speed (km/h)** | Speed of crossing |

#### Task Organization GO/NO-GO Table
Automatically populated from your sidebar unit configuration. Each vehicle is assessed against the bridge MLC:
- **GO** (green) — vehicle MLC is within bridge classification
- **NO-GO** (red) — vehicle exceeds bridge MLC; requires bypass, reinforcement, or off-load
- **CHECK** — MLC data requires field verification

An overall GO/NO-GO status for the entire task organization is shown.

#### CCN Calculator
Enter axle loads (lbs) to estimate the Classification Number for a non-standard wheeled vehicle per NATO STANAG 2021.

#### Full MLC Reference Table
Complete reference of all FA-relevant vehicles with wheeled (W) and tracked (T) MLC values, per FM 5-170.

---

### Reference & Tools Tabs
These tabs are available in the smaller secondary tab row.

---

### Tab 6 — PAA & Storage

**Purpose:** Assesses position area ammunition storage capacity against rounds on hand.

#### Storage Metrics
- **Gun Line Capacity** — total rounds the gun line can hold (rds/tube × tubes)
- **BSA Storage Capacity** — total BSA storage
- **Total PAA Capacity** — combined gun line + BSA
- **Effective Rounds on Hand** — current rounds after dud rate

#### Utilization Gauges
Two gauges show current rounds vs. gun line capacity and BSA capacity. Alerts trigger if rounds overflow either storage level.

#### NET Explosive Weight (NEW) Reference
Table of NEW values per round for the active weapon system — used for Q-D arc calculations, explosive site plans, and DA Pam 385-64 compliance.

---

### Tab 7 — DODIC Reference

**Purpose:** Quick-reference database for all standard FA munitions.

Use the **filter buttons** (ALL / 155mm / 105mm / Rockets / Charges / Fuzes) and the **search box** to find specific rounds.

Each card displays:
- Round designation and DODIC
- Weight (lbs)
- Cube (ft³)
- Hazmat class (per 49 CFR 173 / TB 9-1300-385)
- Compatibility group (per STANAG 4170 / FM 4-30.1)

---

### Tab 8 — EFC Calculator

**Purpose:** Tracks Equivalent Full Charge (EFC) barrel wear for each gun in the unit.

#### EFC Reference Table
Shows the EFC factor for each charge/projectile combination for the active weapon system (155mm or 105mm). Higher EFC = more barrel wear per round.

#### Per-Gun Trackers
One card per operational tube. For each gun, enter the number of rounds fired at each charge level. The app calculates:
- **Total EFC accumulated**
- **Remaining barrel life** (displayed as a wear gauge)
- **Wear status:** OK / MONITOR (≥80% life used) / REPLACE (at or over life limit)

Barrel life limits:
| System | Barrel Life |
|---|---|
| M109A7 / M109A6 | 1,500 EFC |
| M777A2 | 2,500 EFC |
| M119A3 | 3,000 EFC |

A fleet-wide summary shows total EFC across all tubes and identifies the worst-case gun.

---

### Tab 9 — Export / LOGSTAT

**Purpose:** Generates a formatted logistics status report from all current data.

#### LOGSTAT Output
A plain-text report including:
- Unit identity and configuration
- Lift capacity and effective rounds
- Sustainment metrics (turnaround, runs, DOS)
- FY24 resupply costs
- Full RSR entry (if in Manual mode)
- Overall sustainment status (FEASIBLE or SHORTFALL)

#### Export Options
- **📋 Copy LOGSTAT** — copies the full report to clipboard for pasting into a SIPR message, briefing, or DA Form
- **⬇ Download CSV** — downloads a structured spreadsheet with all key metrics and RSR values

---

## Quick Reference — Key Terms

| Term | Definition |
|---|---|
| **RSR** | Required Supply Rate — what the unit estimates it needs |
| **CSR** | Controlled Supply Rate — what higher HQ authorizes (rds/system/day) |
| **DOS** | Days of Supply — how long current ammo will sustain operations |
| **EFC** | Equivalent Full Charge — measure of barrel wear |
| **CCL** | Combat Configured Load — pre-packaged flatrack (144 rds vs 160 loose) |
| **PAA** | Position Area for Artillery — the unit's occupied firing position |
| **BSA** | Battery Support Area — rear logistics node |
| **ASP** | Ammunition Supply Point — source for resupply runs |
| **DODIC** | Department of Defense Identification Code — munition identifier |
| **MLC** | Military Load Classification — bridge/vehicle weight rating |
| **NEW** | Net Explosive Weight — explosive content for Q-D calculations |
| **Q-D** | Quantity-Distance — minimum safe separation from explosives |
| **Winchester** | Military term for completely out of ammunition |
| **OSMIS** | Operational and Support Management Information System — Army cost database |

---

## Typical Planning Workflow

1. **Open sidebar** → Set echelon, unit type, and vehicle quantities
2. **Sustainment** section → Enter distance to supply point, speed, load time, planning hours
3. **DOS & Firing Rate** → Enter authorized CSR and expected firing rate
4. **Logistics tab** → Switch to Manual planning mode → Enter RSR quantities and CSR limits per round
5. **DOS & Resupply tab** → Verify runs possible ≥ runs needed; check DOS at various firing scenarios
6. **Fire Missions tab** → Confirm max missions supportable with available ammo
7. **Training Cost tab** → Build cost estimate for upcoming event (if applicable)
8. **Export tab** → Copy or download LOGSTAT for the battle captain or S4

---

## FY24 OSMIS Cost Factors

All vehicle operating costs use FY24 OSMIS (Operational and Support Management Information System) rates:

| Vehicle | CL IX ($/mile) | Fuel (gal/mile) |
|---|---|---|
| PLS M1075 (Truck) | $9.83 | 0.41 |
| HEMTT M1120 (LHS) | $8.33 | 0.41 |
| HIMARS (M142) | $13.96 | 0.16 |
| MLRS (M270A2) | $428.07 | 1.15 |
| HMMWV (Series) | $8.51 | 0.19 |
| Paladin M109A6 | $457.36 | 0.88 |

Fuel cost calculated at **$4.31/gallon** (JP-8 and diesel).

---

*FARS — Field Artillery Resource Sync | Built for FA Officer/NCO Professional Development*
*All calculations are planning estimates. Verify against current unit SOP, TMs, and higher HQ guidance before operational use.*
