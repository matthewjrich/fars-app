// FY24 OSMIS VEHICLE COST FACTORS
export const VEH_COSTS = {
  "MLRS (M270A2)":          {clIX:428.07, clIIIp:4.96,  gal:1.15, fuel:"DSL"},
  "HIMARS (M142)":          {clIX:13.96,  clIIIp:0.69,  gal:0.16, fuel:"JP-8"},
  "FAASV (M992A2)":         {clIX:266.26, clIIIp:2.36,  gal:0.97, fuel:"DSL"},
  "HEMTT M977 (Cargo)":     {clIX:8.33,   clIIIp:1.77,  gal:0.41, fuel:"DSL"},
  "HEMTT M978 (Fueler)":    {clIX:13.49,  clIIIp:1.77,  gal:0.41, fuel:"DSL"},
  "HEMTT M984A2 (Wrecker)": {clIX:7.12,   clIIIp:1.77,  gal:0.41, fuel:"DSL"},
  "HEMTT M1120 (LHS/PLS)":  {clIX:8.33,   clIIIp:1.77,  gal:0.41, fuel:"DSL"},
  "PLS M1075 (Truck)":      {clIX:9.83,   clIIIp:1.77,  gal:0.41, fuel:"DSL"},
  "LMTV M1078 (2.5T)":      {clIX:6.03,   clIIIp:0.38,  gal:0.15, fuel:"DSL"},
  "MTV M1083 (5T)":         {clIX:8.51,   clIIIp:0.45,  gal:0.19, fuel:"DSL"},
  "CMD POST M577":           {clIX:237.63, clIIIp:1.38,  gal:0.57, fuel:"DSL"},
  "HMMWV (Series)":         {clIX:8.51,   clIIIp:0.45,  gal:0.19, fuel:"DSL"},
  "Paladin M109A6":         {clIX:457.36, clIIIp:2.13,  gal:0.88, fuel:"DSL"},
  "HET M1070":              {clIX:34.72,  clIIIp:0.85,  gal:0.35, fuel:"DSL"},
  "HERCULES M88A2":         {clIX:945.44, clIIIp:8.19,  gal:1.90, fuel:"DSL"},
};

export const JP8_PER_GAL = 4.31;
export const DSL_PER_GAL = 4.31;

export const POL_ITEMS = [
  {name:"FRH (gal)", cost:24.93},
  {name:"15/40 Motor Oil (gal)", cost:84.79},
  {name:"Antifreeze (gal)", cost:11.72},
  {name:"CLP (qt)", cost:24.93},
  {name:"GAA Grease (bucket)", cost:77.65},
  {name:"Power Steering Fluid (gal)", cost:15.00},
];

export const CL4_WIRE_COST = 63;
export const CL4_CONC_COST = 85;
export const CL2_FACTOR = 9.29;
export const CL8_FACTOR = 2.27;
export const WATER_CASE_COST = 8.50;
export const MRE_COST = 7.44;
export const UGR_COST = 14.58;
export const JD_COST = 5.50;

export const MUNITION_155 = {
  "D529 M795 (HE)":         {wt:108.1, cube:0.54, hazmat:"1.2H", compat:"H", type:"155mm"},
  "DA12 M1122 (HE TRNG)":   {wt:108.1, cube:0.54, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D579 M549A1 (RAP)":      {wt:102.5, cube:0.58, hazmat:"1.2H", compat:"H", type:"155mm"},
  "DA54 M1113 (RAP ER)":    {wt:105.0, cube:0.58, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D563 M483A1 (DPICM)":    {wt:110.0, cube:0.56, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D864 M864 (BBDPICM)":    {wt:112.5, cube:0.57, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D550 M110 (WP)":         {wt:104.2, cube:0.55, hazmat:"1.3G", compat:"G", type:"155mm"},
  "D528 M825 (SMK)":        {wt:104.2, cube:0.55, hazmat:"1.3G", compat:"G", type:"155mm"},
  "DA45 M982 (EXCAL)":      {wt:156.0, cube:0.72, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D503 M718 (RAAM-L)":     {wt:110.8, cube:0.56, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D509 M741 (RAAM-S)":     {wt:110.8, cube:0.56, hazmat:"1.2H", compat:"H", type:"155mm"},
  "D505 M485 (ILLUM)":      {wt:98.3,  cube:0.52, hazmat:"1.3G", compat:"G", type:"155mm"},
  "DA49 M1066 (IR ILLUM)":  {wt:96.0,  cube:0.51, hazmat:"1.3G", compat:"G", type:"155mm"},
  "DA51 M1123 (IR ER)":     {wt:101.0, cube:0.53, hazmat:"1.2H", compat:"H", type:"155mm"},
  "DA52 M1124 (VIS ER)":    {wt:101.0, cube:0.53, hazmat:"1.2H", compat:"H", type:"155mm"},
};

export const MUNITION_ROCKETS = {
  "M26 DPICM":              {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M26A2 ER":               {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M28 Practice":           {wt:5015, cube:8.2,  hazmat:"1.3G", compat:"G", type:"rockets"},
  "M30 GMLRS":              {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M30A1 GMLRS":            {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M31 GMLRS":              {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M31A1 GMLRS":            {wt:5111, cube:8.4,  hazmat:"1.2H", compat:"H", type:"rockets"},
  "M39 ATACMS (Blk I)":     {wt:4800, cube:42.0, hazmat:"1.2F", compat:"F", type:"rockets"},
  "M39A1 ATACMS":           {wt:4800, cube:42.0, hazmat:"1.2F", compat:"F", type:"rockets"},
  "M40 ATACMS (Blk IA)":    {wt:4800, cube:42.0, hazmat:"1.2F", compat:"F", type:"rockets"},
  "M41 ATACMS (Unitary)":   {wt:4800, cube:42.0, hazmat:"1.2F", compat:"F", type:"rockets"},
  "M57 ATACMS (Unitary)":   {wt:4800, cube:42.0, hazmat:"1.2F", compat:"F", type:"rockets"},
  "PrSM":                   {wt:5300, cube:45.0, hazmat:"1.2F", compat:"F", type:"rockets"},
};

export const CHARGES = {
  "M231 Propellant Charge (L)": {wt:43.2, cube:0.22, hazmat:"1.3C", compat:"C", type:"charges"},
  "M232 Propellant Charge (H)": {wt:61.2, cube:0.30, hazmat:"1.3C", compat:"C", type:"charges"},
  "M4A2 Propellant Charge":     {wt:34.0, cube:0.18, hazmat:"1.3C", compat:"C", type:"charges"},
};

export const FUZES = {
  "NA10 M1156 (PGK)":   {wt:9.7, cube:0.04, hazmat:"1.4S", compat:"S", type:"fuzes"},
  "D564 M782 (MOFA)":   {wt:1.2, cube:0.01, hazmat:"1.4S", compat:"S", type:"fuzes"},
  "M762/M767 (ET Fuze)":{wt:1.1, cube:0.01, hazmat:"1.4S", compat:"S", type:"fuzes"},
  "M557 PD Fuze":       {wt:0.9, cube:0.01, hazmat:"1.4S", compat:"S", type:"fuzes"},
  "M582 Time Fuze":     {wt:1.0, cube:0.01, hazmat:"1.4S", compat:"S", type:"fuzes"},
};

export const MUNITION_105 = {
  "A064 M1 (HE)":           {wt:42.0, cube:0.28, hazmat:"1.2H", compat:"H", type:"105mm"},
  "A071 M84A1 (HE)":        {wt:42.0, cube:0.28, hazmat:"1.2H", compat:"H", type:"105mm"},
  "A515 M913 (HE-RAP)":     {wt:44.0, cube:0.30, hazmat:"1.2H", compat:"H", type:"105mm"},
  "A508 M60A2 (WP)":        {wt:40.5, cube:0.27, hazmat:"1.3G", compat:"G", type:"105mm"},
  "A520 M60 (WP)":          {wt:40.5, cube:0.27, hazmat:"1.3G", compat:"G", type:"105mm"},
  "A530 M915 (DPICM)":      {wt:43.0, cube:0.29, hazmat:"1.2H", compat:"H", type:"105mm"},
  "A578 M1130A1 (HE PFF BB)":{wt:43.5, cube:0.29, hazmat:"1.2H", compat:"H", type:"105mm"},
  "A505 M314A3 (ILLUM)":    {wt:38.0, cube:0.26, hazmat:"1.3G", compat:"G", type:"105mm"},
  "A521 M929 (SMK HC)":     {wt:39.0, cube:0.26, hazmat:"1.3G", compat:"G", type:"105mm"},
};

export const EFC_TABLE_105 = [
  {charge:"Charge 1",       proj:"All",          efc:0.03, notes:"Min wear — registration/training"},
  {charge:"Charge 2",       proj:"All",          efc:0.07, notes:"Low charge"},
  {charge:"Charge 3",       proj:"All",          efc:0.15, notes:"Low-mid charge"},
  {charge:"Charge 4",       proj:"HE/WP/SMK",    efc:0.25, notes:"Mid charge"},
  {charge:"Charge 5",       proj:"HE/WP/SMK",    efc:0.45, notes:"Medium high"},
  {charge:"Charge 6",       proj:"HE/RAP",       efc:0.65, notes:"High charge"},
  {charge:"Charge 7 (Super)",proj:"HE/RAP only", efc:1.00, notes:"Max charge — full barrel wear"},
  {charge:"RAP Charge",     proj:"M913 RAP only",efc:0.80, notes:"Rocket-assisted reduced wear"},
];

export const ALL_DODIC = {...MUNITION_155, ...MUNITION_ROCKETS, ...MUNITION_105, ...CHARGES, ...FUZES};

export const VEH_LBS = {
  "M1075A1 PLS":   32250,
  "M1120 HEMTT LHS": 22000,
  "M1076 Trailer": 32250,
  "M1097 HMMWV":   2200,
};

export const NEW_LBS = {
  "155mm HE":14.6, "155mm RAP":14.2, "155mm DPICM":13.8, "155mm WP/SMK":11.4,
  "155mm EXCAL":22.0, "155mm ILLUM":4.2,
  "105mm HE":5.1, "105mm RAP":5.0, "105mm ILLUM":3.8, "105mm WP/SMK":4.9,
  "GMLRS Pod":180.0, "ATACMS":500.0,
  "Propellant Charge L":12.1, "Propellant Charge H":17.4,
};

export const EFC_TABLE = [
  {charge:"M231 Charge 1",   proj:"All Projectiles",      efc:0.05, notes:"Min wear — training/registration"},
  {charge:"M231 Charge 2",   proj:"All Projectiles",      efc:0.10, notes:"Low charge, smoke/illum"},
  {charge:"M231 Charge 3",   proj:"All Projectiles",      efc:0.20, notes:"Low charge"},
  {charge:"M231 Charge 4",   proj:"HE/RAP/WP/SMK",       efc:0.35, notes:"Mid charge"},
  {charge:"M231 Charge 4R",  proj:"Rocket-Assisted",      efc:0.30, notes:"RAP reduced charge"},
  {charge:"M232 Charge 5",   proj:"HE/RAP/WP/SMK",       efc:0.55, notes:"Medium high"},
  {charge:"M232 Charge 5R",  proj:"Rocket-Assisted",      efc:0.50, notes:"RAP reduced"},
  {charge:"M232 Charge 6",   proj:"HE/DPICM/EXCAL",      efc:0.75, notes:"High charge"},
  {charge:"M232 Charge 7",   proj:"HE/DPICM/EXCAL",      efc:1.00, notes:"Full charge — max wear"},
  {charge:"M232 Charge 8",   proj:"RAP only",             efc:1.10, notes:"RAP max — exceeds FC wear"},
  {charge:"MACS Charge (L)", proj:"M982 EXCAL",           efc:0.50, notes:"Modular L configuration"},
  {charge:"MACS Charge (H)", proj:"M982 EXCAL",           efc:0.85, notes:"Modular H configuration"},
  {charge:"M231 (ILLUM)",    proj:"M485/M1066",           efc:0.15, notes:"Illumination low charge"},
  {charge:"M231 (RAAM)",     proj:"M718/M741",            efc:0.35, notes:"RAAM fuze minefield"},
];

export const BARREL_LIFE = {
  "M109A7":1500, "M777A2":2500, "M109A6":1500, "M198":2000, "M119A3":3000,
};

export const UNIT_DATA = {
  "M109A7": {
    name:"M109A7 Paladin", sub:"155mm Self-Propelled Howitzer",
    stats:[
      {label:"Max Range",    value:"30 km (HE)"},
      {label:"Excalibur",    value:"57 km"},
      {label:"Rate of Fire", value:"4 rds/min"},
      {label:"Crew",         value:"4 Soldiers"},
      {label:"Weight",       value:"35.5 tons"},
      {label:"Caliber",      value:"155mm / 39 cal"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 6 tubes = 18 tubes","Battery":"3 Platoons × 2 tubes = 6 tubes","Platoon":"2 × M109A7 + 1 × M992A3 CAT"},
  },
  "M109A6": {
    name:"M109A6 Paladin", sub:"155mm Self-Propelled Howitzer",
    stats:[
      {label:"Max Range",    value:"30 km (HE)"},
      {label:"Excalibur",    value:"40 km"},
      {label:"Rate of Fire", value:"4 rds/min"},
      {label:"Crew",         value:"4 Soldiers"},
      {label:"Weight",       value:"32.5 tons"},
      {label:"Caliber",      value:"155mm / 39 cal"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 6 tubes = 18 tubes","Battery":"3 Platoons × 2 tubes = 6 tubes","Platoon":"2 × M109A6 + 1 × M992A2 CAT"},
  },
  "M777A2": {
    name:"M777A2", sub:"155mm Towed Lightweight Howitzer",
    stats:[
      {label:"Max Range",    value:"24.7 km (HE)"},
      {label:"RAP Range",    value:"30 km"},
      {label:"Rate of Fire", value:"5 rds/min"},
      {label:"Crew",         value:"8 Soldiers"},
      {label:"Weight",       value:"4,218 lbs"},
      {label:"Caliber",      value:"155mm / 39 cal"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 6 tubes = 18 tubes","Battery":"3 Platoons × 2 tubes = 6 tubes","Platoon":"2 × M777A2 howitzers"},
  },
  "M119A3": {
    name:"M119A3", sub:"105mm Towed Lightweight Howitzer",
    stats:[
      {label:"Max Range",    value:"14 km (HE)"},
      {label:"RAP Range",    value:"19.5 km"},
      {label:"Rate of Fire", value:"8 rpm max / 3 rpm sustained"},
      {label:"Crew",         value:"5 Soldiers"},
      {label:"Weight",       value:"4,700 lbs"},
      {label:"Caliber",      value:"105mm / L119"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 6 tubes = 18 tubes","Battery":"3 Platoons × 2 tubes = 6 tubes","Platoon":"2 × M119A3 howitzers"},
  },
  "HIMARS": {
    name:"M142 HIMARS", sub:"High Mobility Artillery Rocket System",
    stats:[
      {label:"GMLRS Range",  value:"84+ km"},
      {label:"ATACMS Range", value:"300 km"},
      {label:"PrSM Range",   value:"499+ km"},
      {label:"Pod Capacity", value:"1 pod / 6 rockets"},
      {label:"Crew",         value:"3 Soldiers"},
      {label:"Weight",       value:"24,000 lbs"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 9 launchers = 27","Battery":"3 Platoons × 3 launchers = 9","Platoon":"3 × HIMARS launchers"},
  },
  "MLRS": {
    name:"M270A2 MLRS", sub:"Multiple Launch Rocket System",
    stats:[
      {label:"GMLRS Range",  value:"84+ km"},
      {label:"ATACMS Range", value:"300 km"},
      {label:"Pod Capacity", value:"2 pods / 12 rockets"},
      {label:"Crew",         value:"3 Soldiers"},
      {label:"Weight",       value:"55,000 lbs"},
      {label:"Platform",     value:"Tracked / Armored"},
    ],
    org:{"Battalion":"HHB + 3 Btry × 9 launchers = 27","Battery":"3 Platoons × 3 launchers = 9","Platoon":"3 × MLRS launchers"},
  },
};

export const MLC_DATA = {
  "M109A7 Paladin":        {w:null, t:55,  type:"tracked", notes:"38-ton combat weight; Bradley chassis components"},
  "M109A6 Paladin":        {w:null, t:50,  type:"tracked", notes:"32-ton combat weight"},
  "M992A3 CAT (FAASV)":   {w:null, t:45,  type:"tracked", notes:"29-ton combat weight"},
  "M270A2 MLRS":           {w:null, t:45,  type:"tracked", notes:"27.5-ton combat weight"},
  "M142 HIMARS":           {w:20,   t:null, type:"wheeled", notes:"FMTV 5-ton chassis; 12-ton combat weight"},
  "M1075A1 PLS (loaded)":  {w:30,   t:null, type:"wheeled", notes:"Loaded GVW ~49,500 lbs"},
  "M1075A1 PLS (empty)":   {w:22,   t:null, type:"wheeled", notes:"Empty GVW ~36,000 lbs"},
  "M1076 Trailer (loaded)":{w:20,   t:null, type:"wheeled", notes:"Loaded GVW ~40,000 lbs"},
  "M977/M985 HEMTT":       {w:30,   t:null, type:"wheeled", notes:"Loaded GVW ~62,000 lbs"},
  "M1120 HEMTT LHS":       {w:30,   t:null, type:"wheeled", notes:"Loaded GVW ~66,000 lbs"},
  "M777A2 (gun only)":     {w:12,   t:null, type:"wheeled", notes:"4,218 lbs; combine with prime mover for CCN"},
  "M777A2 w/LMTV":         {w:16,   t:null, type:"combo",   notes:"CCN: gun + M1078 LMTV prime mover"},
  "M119A3 (gun only)":     {w:8,    t:null, type:"wheeled", notes:"4,700 lbs; combine with HMMWV for CCN"},
  "M119A3 w/HMMWV":        {w:10,   t:null, type:"combo",   notes:"CCN: gun + M1097 HMMWV prime mover"},
  "M1097 HMMWV":           {w:8,    t:null, type:"wheeled", notes:"~5,200 lbs GVW"},
  "LMTV M1078 (2.5T)":     {w:12,   t:null, type:"wheeled", notes:"Loaded GVW ~19,000 lbs"},
  "MTV M1083 (5T)":        {w:16,   t:null, type:"wheeled", notes:"Loaded GVW ~27,000 lbs"},
  "HET M1070 (tractor)":   {w:55,   t:null, type:"wheeled", notes:"Tractor only; combination with M1000 trailer = MLC 110+"},
};
