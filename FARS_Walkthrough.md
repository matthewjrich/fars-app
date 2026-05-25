# FARS — Classroom Walkthrough
## 1-15 FA Demonstration Scenario

**Classification:** UNCLASSIFIED // FOR OFFICIAL USE ONLY
**Scenario:** Defense of Position — D+1 Planning

---

## SCENARIO OVERVIEW

**Unit:** 1-15 FA (M109A7 Battalion), DS to 1st BCT / 1st ID  
**Mission:** Provide direct support fires in support of a brigade defense. Battalion is holding a defensive line; S3 needs a LOGSTAT for the S4 by 1800.  
**Situation:** One gun is NMC awaiting repair parts. Fires net is SINCGARS primary — alternate radio is down for maintenance. S2 estimates moderate enemy activity.

---

## STEP 1 — SIDEBAR CONFIGURATION
*Click ☰ Unit/Echelon (top left)*

Configure the following — everything else updates in real time:

| Field | Value |
|---|---|
| **Echelon** | Battalion |
| **Unit Type** | M109A7 |
| **Operational Tubes** | 17 *(1 NMC — reduces from default 18)* |
| **PLS Trucks** | 18 |
| **M1076 Trailers** | 18 |
| **M992A3 CATs** | 18 |
| **Load Config** | Loose (160 rds/flatrack) |
| **Planning Mode** | Manual (Detailed RSR) |
| **Distance to Supply Point** | 35 km |
| **Avg Speed** | 30 km/h |
| **Draw / Loading Time** | 2.0 hrs |
| **Available Planning Hours** | 18 hrs |
| **Authorized CSR** | 60 rds/tube/day |
| **Expected Firing Rate** | 50% |

**Key point to make:** Every tab reads from these inputs. Change the distance and watch turnaround time, DOS, and run cost update live across the entire app.

---

## STEP 2 — TASK ORGANIZATION TAB
*Tab 1 — the command picture*

### Unit Identity
- **Unit Designation:** `1-15 FA`
- **Higher HQ / Relationship:** `1st BCT, 1st ID — DS`

### Command Posts
**Main CP:**
- Status: **Active**
- Grid: `38TLL 12345 67890`

**CTCP (add a second CP):**
- Name: `CTCP`
- Status: **Active**
- Grid: `38TLL 11100 65500`

### Position Areas (PAA)
**PAA IRON:**
- Status: **In Position**
- Grid: `38TLL 14500 71200`
- Occupying Unit: **A Battery** — 6 guns

**PAA STEEL:**
- Status: **In Position**
- Grid: `38TLL 16800 69400`
- Occupying Unit: **B Battery** — 6 guns

**PAA BRONZE:**
- Status: **En Route**
- Grid: `38TLL 13200 73100`
- Occupying Unit: **C Battery** — 5 guns *(1 NMC in transit)*

**Key point to make:** Notice PAA names appear on each battery's node in the org chart automatically. The tree view updates live.

### PACE Plan
*Click "+ Add PACE Plan" — title it "Fires Net"*

| Tier | Means | Details | Status |
|---|---|---|---|
| P | SINCGARS FM | 46.750 / PALADIN | UP |
| A | HF Radio | 8.985 USB / AUTH | **DOWN** |
| C | Messenger | BN CP to Btry CP | UP |
| E | VHF FM | 67.500 / THUNDER | UP |

Set the Alternate tier to **DOWN**.

**Key point to make:** Watch the amber dot appear on the Task Org tab button — visible from any other tab. The card border turns red and shows "NET DOWN." This is your status-at-a-glance without clicking into the tab.

### NMC Log
*Click "+ Log NMC Item"*

| Unit | Equipment | Fault / Reason | Est. RTD |
|---|---|---|---|
| C Battery | Gun 3 (M109A7) | Recoil mechanism failure — awaiting parts | D+3 |

**Key point to make:** The red dot appears on the Task Org tab button. Between the red dot (NMC) and the amber dot (PACE DOWN), leadership can see two open issues from anywhere in the app without navigating away.

---

## STEP 3 — LOGISTICS TAB
*Tab 2 — the ammo math*

### Point out the Haul Capacity summary
- Total Weight, Total Rounds, Capacity Utilization auto-populated from sidebar
- Column MLC (bottom) — tells you bridge class requirements for the convoy

### Doctrinal RSR Defaults
Check **"Use Doctrinal Defaults (ATP 3-09.23)"**

Select:
- Operation Type: **Defense of Position**
- Level: **2-Moderate**
- Day Phase: **Succeeding Days (2–4)**

**Key point to make:** The app pulls from ATP 3-09.23 Table 7-4 and computes `135 rds/tube/day × 17 tubes = 2,295 rounds`, placing that total in M795 HE. This is the doctrinal planning baseline. Uncheck to redistribute across round types manually.

### Uncheck and manually enter RSR
*Uncheck the box, then enter realistic values:*

| Munition | RSR | CSR |
|---|---|---|
| D529 M795 (HE) | 1,800 | 60 |
| D579 M549A1 (RAP) | 200 | 10 |
| D505 M485 (ILLUM) | 150 | — |
| D528 M825 (SMK) | 100 | — |

**Key point to make:** Watch the **AUTH / EXCEEDS** badges appear as you enter CSR. M795 AUTH means the request is within what higher will support. Auto-Sync calculates propellant charges automatically — no manual math.

---

## STEP 4 — DOS & RESUPPLY TAB
*Tab 3 — can we sustain this?*

### Key metrics to highlight
- **Days of Supply** — how long current ammo lasts at the firing rate
- **Runs Possible/Day vs. Runs Needed/Day** — the go/no-go for sustainment

### Trigger a shortfall (optional demo)
Temporarily set **Distance to Supply Point → 80 km** in the sidebar.
Watch the **RESUPPLY SHORTFALL** alert appear — runs needed now exceed what organic assets can execute in 18 hours.

Reset distance back to 35 km.

### Loss Impact Calculator
Open the **🚛 Loss Impact Calculator** expander. Enter **Trucks Lost → 4**.

Watch the sim daily lift cap drop and a **SHORTFALL** or **SUFFICIENT** result appear instantly.

**Key point to make:** An enemy counter-battery strike, an IED, a breakdown — the question becomes "how many trucks can I lose before I can't sustain fires?" This answers it in real time, before anyone has to do the math manually.

---

## STEP 5 — FIRE MISSIONS TAB
*Tab 4 — mission math and fire control reference*

### Danger Close Check
- Open **Danger Close Criteria**
- Enter **450 m** in the DC Check field
- Result: **⚠ DANGER CLOSE** (standard cannon threshold = 600 m)
- Change to **650 m** → **✅ CLEAR**

**Key point to make:** DC criteria are embedded — no card, no TM flip. Includes the Excalibur exception (200 m) and the DPICM restriction in red.

### Shell-Fuze Combinations
- Open **Shell-Fuze Combinations**
- Point out the ★ preferred fuze (M782 MOFA on M795)
- Point out the red restricted row (M864 DPICM — DC NOT authorized)

**Key point to make:** This is the reference FDC operators would otherwise carry in a laminated card or flip open a TM for. It's in the same window as the mission math.

---

## STEP 6 — READINESS TAB
*Tab 6 — personnel and vehicle status*

### PERSTAT (quick entry)
| Element | Assigned | Present | Available |
|---|---|---|---|
| HHB | 85 | 80 | 78 |
| A Battery | 62 | 60 | 58 |
| B Battery | 62 | 61 | 59 |
| C Battery | 62 | 59 | 55 |

### MAINTSTAT (quick entry — just a few rows)
| Vehicle | On Hand | FMC | PMC |
|---|---|---|---|
| M109A7 Paladin | 18 | 17 | 0 |
| M992A3 CAT | 18 | 16 | 1 |
| M1075A1 PLS | 24 | 22 | 1 |

Notice the **NMC Fault Log** section appears automatically below the table because one Paladin is NMC. Fill in:
- **M109A7 Paladin** → Fault: `Recoil mechanism failure` · Parts: `NSN 1005-01-430-8812` · ETA: `D+3`

**Key point to make:** The fault log links the numbers to the maintenance picture — the S4 doesn't just see "1 NMC", they see what's broken and when parts arrive. This feeds into the SITREP and Export LOGSTAT automatically.

---

## STEP 7 — SITREP TAB
*Gold button, far left of primary row — the brief*

1. Click the gold **SITREP** button
2. Type unit designation: `1-15 FA`
3. Click **↻ Update DTG** — the military timestamp refreshes
4. Walk through **BLUF Alerts** — red and amber items auto-generated from all data entered
5. Show the **Ammunition Status** card — AMMSTAT badges (FULL / ADEQ / LOW / CRIT) per round type, DOS, and cap used
6. Show the **Logistics / Resupply** card — runs possible vs. needed, RESUPPLY VIABLE banner (or SHORTFALL if triggered earlier)
7. Show **Equipment Readiness** — M109A7 Paladin at 94% FMC, 1 NMC flagged
8. Show **Personnel Strength** — element breakdown from PERSTAT data entered in Readiness tab

**Key point to make:** You just briefed the battalion commander. Everything you entered across the last 20 minutes — ammo, logistics, personnel, maintenance — distilled into one screen, with color-coded status and no reformatting.

---

## STEP 9 — EXPORT TAB
*Tab 10 — the formal product*

1. Enter Unit Designation: `1-15 FA`
2. Click **Refresh (Readiness / EFC / Notes)**
3. Scroll through the LOGSTAT — point out:
   - Unit status block
   - Lift capacity and sustainment metrics
   - Full RSR with AUTH status
   - PACE plan with the DOWN alternate
   - NMC item (C Battery, Gun 3) with fault description and parts ETA
   - CP and PAA locations
   - PERSTAT and MAINTSTAT
4. Click **Copy LOGSTAT** → paste into a chat, email, or document

**Key point to make:** SITREP is for the brief. Export is for the product you send — the formal LOGSTAT to the S4 or battle captain. Both pull from the same data; neither requires manual formatting.

---

## STEP 10 — REFERENCES TAB (CLOSE)
*Tab 12 — close with credibility*
*Tab 12 — close with credibility*

Walk through the doctrine list briefly:
- ATP 3-09.23 (Feb 2026) — **Verified** — the RSR defaults, round weights, flat rack capacities
- TM 43-0001-28 series — **Check Edition** — shell-fuze combinations, always verify before live fire
- OSMIS FY24 — **Update Required** — cost factors, pull current rates from Army G4 for budget submissions

**Key point to make:** The app tells you when to be skeptical of its own data. That's the standard every planning tool should be held to.

---

## TALKING POINTS SUMMARY

| Capability | What to Say |
|---|---|
| Real-time updates | "Change one input in the sidebar — every tab updates. No manual recalculation." |
| Task Org status dots | "Red and amber dots on the tab button. You see the problem from anywhere in the app." |
| Doctrinal RSR defaults | "ATP 3-09.23 Table 7-4, built in. One click to a doctrinal planning baseline." |
| Danger close | "DC criteria embedded with exceptions and restrictions. Same window as the mission math." |
| SITREP tab | "The gold button is always there. Brief the commander without reformatting anything." |
| AMMSTAT | "FULL, ADEQ, LOW, CRIT — standardized ammo status against your authorized CSR." |
| Fault log | "One NMC shows up in the SITREP. The S3 can immediately see what's broken and when parts arrive." |
| Loss impact | "If I lose two trucks, can I still sustain fires? The app answers in real time." |
| LOGSTAT export | "Fifteen minutes of inputs. One button. Formatted product ready to send." |
| References tab | "The app tells you when its own data needs verifying. That's the standard." |
| Data persistence | "No save button. No login. Come back tomorrow — your data is still there." |
| No network required | "Once it loads, it runs offline. No server, no account, no IT request." |

---

*FARS — Field Artillery Resource Sync*
*UNCLASSIFIED // FOR OFFICIAL USE ONLY*
*All values are planning estimates — verify against current doctrine and higher HQ guidance.*
