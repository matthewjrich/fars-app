# FARS — Field Artillery Resource Sync
## Briefing Template

**Classification:** UNCLASSIFIED // FOR OFFICIAL USE ONLY
**Presenter:** ___________________
**Date:** ___________________
**Audience:** ___________________

---

## SLIDE 1 — Title / Opening

**FARS — Field Artillery Resource Sync**

*A browser-based planning and situational awareness tool for Field Artillery units*

---

**TALKING POINTS:**
- Good [morning/afternoon]. Today I'll walk you through FARS — Field Artillery Resource Sync — a planning tool built specifically for FA officers and NCOs at Battalion, Battery, and Platoon echelons.
- No install, no login, no server. Runs entirely in your browser and saves automatically.
- Built to reduce the time between receiving a mission and producing a usable logistics brief.

---

## SLIDE 2 — The Problem

**What we're solving:**

| Challenge | Current Reality |
|---|---|
| Ammo logistics math | Repeated manual calculations, Excel spreadsheets, human error |
| LOGSTAT generation | Copy-paste across multiple documents, version control issues |
| Unit SA (CP, PAA, NMC) | Whiteboard, notes app, or nothing |
| PACE plan tracking | OPORD annex buried in a folder |
| Barrel life (EFC) | Separate spreadsheet per gun section |

**TALKING POINTS:**
- Every FA S3 or FSO has run through this: you get a planning timeline, you have to calculate RSR, CSR, runs per day, DOS — and you're doing it on a legal pad or a manually maintained Excel file.
- Fires coordination is already cognitively demanding. Administrative overhead on logistics math shouldn't be part of it.
- FARS consolidates the math, the reference data, and the SA tracking into one place that auto-saves.

---

## SLIDE 3 — What FARS Is (Not)

**FARS IS:**
- A planning tool and quick-reference interface
- Designed for FDC, FSO, S3, and BCS3 operators
- A LOGSTAT generator that pulls from all tabs automatically
- An aid for initial planning, mission briefings, and status updates

**FARS IS NOT:**
- A command and control system
- A replacement for AFATDS, FAAD, or BCS3
- A classified system — all data is local to the browser
- An authoritative source — always verify against TMs, SOPs, and higher guidance

**TALKING POINTS:**
- Think of it as a digitized planning worksheet — the same math you'd do on paper, automated and interconnected.
- Data never leaves your machine. It saves to your browser's local storage. There is no database, no account, no network requirement.

---

## SLIDE 4 — System Overview (Tab Map)

```
PRIMARY TABS
├── Task Organization    — Unit disposition, CPs, PAAs, PACE, NMC tracking
├── Logistics            — RSR/CSR entry, haul capacity, utilization
├── DOS & Resupply       — Days of supply, runs per day, shortfall alerts
├── Fire Missions        — Mission sustainability, DC criteria, shell-fuze ref
├── PAA & Storage        — Storage capacity, Q-D arc calculator
└── Readiness            — PERSTAT and MAINTSTAT tracking

REFERENCE / TOOLS TABS
├── Training Cost        — Event cost estimator (FY24 OSMIS rates)
├── DODIC Reference      — Munition reference database
├── EFC Calculator       — Barrel life tracking per gun
├── Export / LOGSTAT     — LOGSTAT text report + CSV download
└── Notes                — Freeform planning notes
```

**TALKING POINTS:**
- Eleven tabs organized into two rows. Primary tabs are the operational planning tools. The secondary row covers reference material, barrel life, export, and notes.
- Every tab reads from the same sidebar configuration — set your echelon and unit type once, and all tabs update.
- The active tab is remembered between sessions.

---

## SLIDE 5 — DEMO: Sidebar Configuration

*[LIVE DEMO — open sidebar]*

**Walk through:**
1. Click **☰ Unit/Echelon** in the top-left
2. Set Echelon → **Battalion**, Unit Type → **M109A7**
3. Show vehicle quantities (PLS, CATs, trailers)
4. Show Planning Mode — **Manual RSR** vs **Daily Load %**
5. Set Distance to Supply Point → **25 km**, Speed → **30 km/h**
6. Show CSR field → **60 rds/tube/day**

**KEY POINT:** Every field in the sidebar drives calculations across all tabs in real time. Change the distance and watch the turnaround time and DOS update live.

---

## SLIDE 6 — DEMO: Task Organization

*[LIVE DEMO — Tab 1]*

**Walk through:**
1. Show Tree view → organic batteries, HHB, attached units
2. Click **+ Attach / Assign Unit** → demonstrate attaching an infantry company DS
3. Show **CP Locations** — Main CP + secondary card (medics, supply, etc.)
4. Show **PAA Locations** — select battery from dropdown, show auto-populate guns
5. Show org chart update: PAA name appears on battery node in blue
6. Open **PACE Plan** — fill in Primary as SINCGARS FM, change status to DOWN → red row, "NET DOWN" badge
7. Show **amber dot** appears on tab button
8. Click **+ Log NMC Item** → add a gun, show red alert banner and **red dot** on tab button

**KEY POINT:** Tab button indicators — red dot for NMC, amber dot for PACE DOWN — are visible from any tab. You don't have to click into Task Org to know something needs attention.

---

## SLIDE 7 — DEMO: Logistics & DOS

*[LIVE DEMO — Tabs 2 & 3]*

**Logistics Tab:**
1. Show the haul capacity summary at the top
2. Walk through RSR entry for M795 HE and M107 Propellant
3. Show AUTH / EXCEEDS badge
4. Point out Auto-Sync (charges and fuzes calculate automatically)
5. Show capacity utilization gauge

**DOS & Resupply Tab:**
1. Show Days of Supply metric
2. Walk through the four scenario bars (25%, 50%, 75%, 100% CSR)
3. Trigger a **RESUPPLY SHORTFALL** alert by reducing available planning hours or increasing distance

**KEY POINT:** The shortfall alert tells you immediately whether organic assets can sustain the rate of fire — before you brief the S4.

---

## SLIDE 8 — DEMO: Fire Missions Reference

*[LIVE DEMO — Tab 4]*

**Walk through:**
1. Show Max Missions / Effective Rounds output
2. Open **Danger Close Criteria** — enter 450m → DANGER CLOSE result
3. Open **Rate of Fire & Ranges** — show burst/sustained cards
4. Open **Shell-Fuze Combinations** — show round, authorized fuzes, preferred (★), restricted munitions in red

**KEY POINT:** Shell-fuze is often hand-carried in a TM or a printed aid. This puts it in the same window as the fire mission math, with a reminder to verify against current TMs.

---

## SLIDE 9 — DEMO: Export / LOGSTAT

*[LIVE DEMO — Tab 10]*

**Walk through:**
1. Click **Refresh (Readiness / EFC / Notes)** first
2. Scroll through the LOGSTAT output — point out sections: Unit status, RSR, PACE, NMC, CP/PAA locations, PERSTAT, EFC, Notes
3. Click **Copy LOGSTAT** → paste into a message or document
4. Click **Download CSV** → open in Excel to show tabular format

**KEY POINT:** LOGSTAT pulls from every other tab automatically. Fill in your data across the interface, hit Refresh, and you have a formatted status report ready to send — no reformatting.

---

## SLIDE 10 — Additional Capabilities (At a Glance)

| Tab | Capability | Value |
|---|---|---|
| **Readiness** | PERSTAT + MAINTSTAT | Tracks personnel availability and vehicle FMC/PMC/NMC by element |
| **EFC Calculator** | Barrel wear per gun | Monitors barrel life against limits; flags guns approaching replacement |
| **Training Cost** | FY24 OSMIS rates | Estimates CL I/II/III/IV/VIII/IX across event duration automatically |
| **DODIC Reference** | Munition database | Weight, cube, hazmat class, compatibility group — searchable and filterable |
| **PAA & Storage** | Q-D arc calculator | Quantity-distance arcs per munition type and quantity |
| **Notes** | Freeform blocks | Planning notes with titles; copy-all to clipboard |

---

## SLIDE 11 — How to Get Started

**Five steps to first use:**

1. **Open the browser** — navigate to the FARS application URL or local file
2. **Open ☰ Unit/Echelon** → configure your echelon, unit type, and vehicle quantities
3. **Task Org tab** → set your unit designation, CP/PAA locations, PACE plan
4. **Logistics tab** → enter RSR and CSR values for your munition set
5. **Export tab** → Refresh → Copy LOGSTAT

**Data persistence:** All inputs save automatically to the browser. Come back tomorrow and your data is still there. Clear browser data to reset.

**Manual:** See `FARS_User_Manual.md` for complete field-by-field documentation.

---

## SLIDE 12 — Questions

**FARS — Field Artillery Resource Sync**

*All calculations are planning estimates. Verify against current unit SOP, TMs, and higher HQ guidance before operational use.*

*UNCLASSIFIED // FOR OFFICIAL USE ONLY*

---

## NOTES / BACKUP SLIDES

### Common Questions

**Q: Does data go anywhere? Is it secure?**
A: No. All data saves to your browser's local storage (your machine only). Nothing is transmitted. No account required.

**Q: Can I use it offline?**
A: Yes, once the page is loaded. There is no server dependency after initial load.

**Q: What if I switch computers?**
A: Data does not transfer between machines. Use Export → Copy LOGSTAT to capture a snapshot before switching.

**Q: Can multiple people use it simultaneously?**
A: Not natively — each browser instance is independent. Use the Export function to share data between users.

**Q: What are the FY24 OSMIS rates based on?**
A: Operational and Support Management Information System rates pulled from the Army G4 cost database for FY24. Fuel calculated at $4.31/gallon (JP-8/diesel blend). Verify with your S4 for current fiscal year rates.

**Q: How do I update the barrel life limits?**
A: Limits are hardcoded to doctrinal values (M109A7/A6: 1,500 EFC; M777A2: 2,500 EFC; M119A3: 3,000 EFC). Contact the developer for unit-specific adjustments.

**Q: What does "Reset Occupancy" do in Task Org?**
A: Clears all unit and gun assignments from PAA cards while preserving PAA names, grids, and status. Used at the start of a new operation to re-assign positions without re-entering location data.
