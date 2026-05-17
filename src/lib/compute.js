import { MUNITION_155, MUNITION_ROCKETS, MUNITION_105, VEH_LBS, VEH_COSTS, DSL_PER_GAL } from './data.js';

export function computeValues(v, rsrValues, autoSync = true) {
  // Lift capacity
  let haulLbs, totalRoundsCap, capacityVal, capacityLabel;
  let podsPerLauncher = 1, launcherPods = 0, flackPods = 0;
  const totalFlatracks = v.truckQty + v.trailQty;
  const rPF = v.cclMode ? 144 : 160;

  if (v.isM119) {
    const rdsPerHmmwv = Math.floor(VEH_LBS['M1097 HMMWV'] / 42);
    haulLbs = v.hmmwvQty * VEH_LBS['M1097 HMMWV'];
    totalRoundsCap = v.hmmwvQty * rdsPerHmmwv;
    capacityVal = totalRoundsCap;
    capacityLabel = "Total Rounds (HMMWV Lift)";
  } else {
    const pName = (v.isCannon || v.isMlrs) ? 'M1075A1 PLS' : 'M1120 HEMTT LHS';
    haulLbs = (v.truckQty * VEH_LBS[pName]) + (v.trailQty * VEH_LBS['M1076 Trailer']) + (v.catQty * 12000);
    if (v.isCannon) {
      totalRoundsCap = (totalFlatracks * rPF) + (v.catQty * 95);
      capacityVal = totalRoundsCap / 8;
      capacityLabel = "Total Lift (Pallet Eq.)";
    } else {
      podsPerLauncher = v.isMlrs ? 2 : 1;
      launcherPods = v.tubes * podsPerLauncher;
      flackPods = totalFlatracks * 4;
      totalRoundsCap = flackPods + launcherPods;
      capacityVal = totalRoundsCap;
      capacityLabel = "Total Capacity (Pods)";
    }
  }
  const haulStons = haulLbs / 2000;

  // Munition keys — includes any user-defined custom rounds
  const baseKeys = v.isM119 ? Object.keys(MUNITION_105) : v.isCannon ? Object.keys(MUNITION_155) : Object.keys(MUNITION_ROCKETS);
  const customEntries = Object.fromEntries((v.customMunitions || []).map(m => [m.name, { wt: m.wt || 0 }]));
  const munKeys = [...baseKeys, ...Object.keys(customEntries)];
  const munData = { ...(v.isM119 ? MUNITION_105 : v.isCannon ? MUNITION_155 : MUNITION_ROCKETS), ...customEntries };

  // RSR / weight
  let reqWeight = 0, totalItems = 0, currentTotalRsr = 0, sumRds = 0, sumPods = 0;
  if (v.planMode === 'manual') {
    if (v.isCannon && !v.isM119) {
      sumRds = munKeys.reduce((a, k) => a + (rsrValues[k] || 0), 0);
      const projWeight = munKeys.reduce((a, k) => a + (rsrValues[k] || 0) * (munData[k]?.wt || 0), 0);
      const m231 = autoSync ? Math.floor(sumRds * 0.5) : 0;
      const m232 = autoSync ? Math.floor(sumRds * 2.5) : 0;
      const pgk = autoSync ? Math.floor((rsrValues['D529 M795 (HE)'] || 0) * 0.3) : 0;
      const mofa = autoSync ? Math.floor(sumRds * 0.1) : 0;
      const et = autoSync ? Math.floor(sumRds * 0.2) : 0;
      reqWeight = projWeight + (m231*43.2) + (m232*61.2) + (pgk*9.7) + (mofa*1.2) + (et*1.1);
      totalItems = Math.ceil(sumRds / 8);
      currentTotalRsr = sumRds / (v.tubes || 1);
    } else if (v.isM119) {
      sumRds = munKeys.reduce((a, k) => a + (rsrValues[k] || 0), 0);
      reqWeight = munKeys.reduce((a, k) => a + (rsrValues[k] || 0) * (munData[k]?.wt || 0), 0);
      totalItems = sumRds;
      currentTotalRsr = sumRds / (v.tubes || 1);
    } else {
      sumPods = munKeys.reduce((a, k) => a + (rsrValues[k] || 0), 0);
      reqWeight = sumPods * 5111;
      totalItems = sumPods;
      currentTotalRsr = sumPods / (v.tubes || 1);
    }
  } else {
    const avgRdWt = v.isM119 ? 42 : v.isCannon ? 108 : 5111;
    reqWeight = haulLbs * (v.loadPct / 100);
    totalItems = Math.ceil(reqWeight / avgRdWt);
    currentTotalRsr = totalItems / (v.tubes || 1);
    sumRds = totalItems;
    sumPods = totalItems;
  }

  // Spatial utilization
  let spatialUtil = 0;
  if (v.planMode === 'manual') {
    spatialUtil = totalRoundsCap > 0 ? ((v.isM119 ? sumRds : v.isCannon ? sumRds : sumPods) / totalRoundsCap * 100) : 0;
  } else {
    spatialUtil = haulLbs > 0 ? (reqWeight / haulLbs * 100) : 0;
  }

  // Turnaround / runs
  const totalTurnaround = ((v.dist * 2) / v.speed) + v.loadTime;
  const runsPerDay = Math.max(0, Math.floor(v.planHours / totalTurnaround));
  const roundsPerRun = v.isM119
    ? (v.hmmwvQty * Math.floor(VEH_LBS['M1097 HMMWV'] / 42))
    : v.isCannon
      ? (totalFlatracks * rPF + v.catQty * 95)
      : (totalFlatracks * 4);
  const dailyLiftCap = runsPerDay * roundsPerRun;
  const dailyUsage = v.tubes * v.authCsr * (v.firingRate / 100);
  const dudFactor = 1 - (v.dudRate / 100);
  const effectiveRounds = Math.floor(totalRoundsCap * dudFactor);
  const dosAvail = dailyUsage > 0 ? (effectiveRounds / dailyUsage) : 999;
  const runsNeeded = dailyUsage > 0 && roundsPerRun > 0 ? Math.ceil(dailyUsage / roundsPerRun) : 0;

  // Run cost
  const distMiles = v.dist * 2 * 0.621;
  let totalRunCost = 0;
  if (v.isM119) {
    const hmmwvCost = VEH_COSTS["HMMWV (Series)"];
    totalRunCost = v.hmmwvQty * distMiles * (hmmwvCost.clIX + (hmmwvCost.gal * DSL_PER_GAL));
  } else {
    const plsCost = VEH_COSTS["PLS M1075 (Truck)"];
    totalRunCost = (v.truckQty + v.trailQty) * distMiles * (plsCost.clIX + (plsCost.gal * DSL_PER_GAL));
  }
  const dailyRunCost = runsPerDay * totalRunCost;

  return {
    haulLbs, haulStons, totalRoundsCap, capacityVal, capacityLabel,
    reqWeight, totalItems, currentTotalRsr, spatialUtil,
    totalTurnaround, totalFlatracks, podsPerLauncher, launcherPods, flackPods,
    sumRds, sumPods, rPF,
    runsPerDay, dailyLiftCap, dailyUsage, dosAvail, runsNeeded,
    roundsPerRun, effectiveRounds, dudFactor,
    totalRunCost, dailyRunCost, distMiles,
  };
}

export function getMlcVehiclesForUnit(v) {
  const vehicles = [];
  if (v.isM119) {
    if (v.tubes > 0) vehicles.push({name:"M119A3 w/HMMWV", qty:v.tubes, role:"Gun System"});
    if (v.hmmwvQty > 0) vehicles.push({name:"M1097 HMMWV", qty:v.hmmwvQty, role:"Ammo HMMWV"});
  } else if (v.isCannon) {
    const gunName = v.unit === 'M109A7' ? 'M109A7 Paladin' : v.unit === 'M109A6' ? 'M109A6 Paladin' : 'M109A6 Paladin';
    if (v.tubes > 0) vehicles.push({name:gunName, qty:v.tubes, role:"Gun System"});
    if (v.catQty > 0) vehicles.push({name:"M992A3 CAT (FAASV)", qty:v.catQty, role:"Ammo Carrier"});
    if (v.truckQty > 0) vehicles.push({name:"M1075A1 PLS (loaded)", qty:v.truckQty, role:"Ammo Truck"});
    if (v.trailQty > 0) vehicles.push({name:"M1076 Trailer (loaded)", qty:v.trailQty, role:"Ammo Trailer"});
    if (v.unit === 'M777A2') {
      vehicles.splice(0, 1);
      if (v.tubes > 0) vehicles.unshift({name:"M777A2 w/LMTV", qty:v.tubes, role:"Gun System"});
    }
  } else {
    const gunName = v.isMlrs ? 'M270A2 MLRS' : 'M142 HIMARS';
    if (v.tubes > 0) vehicles.push({name:gunName, qty:v.tubes, role:"Launcher"});
    if (v.truckQty > 0) vehicles.push({name:"M1075A1 PLS (loaded)", qty:v.truckQty, role:"Ammo Truck"});
    if (v.trailQty > 0) vehicles.push({name:"M1076 Trailer (loaded)", qty:v.trailQty, role:"Ammo Trailer"});
  }
  return vehicles;
}
