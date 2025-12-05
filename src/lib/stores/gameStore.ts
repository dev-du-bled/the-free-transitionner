import { writable, derived } from 'svelte/store';
import { institutions as initialInstitutions, type Institution } from '$lib/game/institutions';
import { permanentUpgrades as allUpgrades, type Upgrade } from '$lib/game/upgrades';

// --- Helper Functions ---
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}


// --- Event Interfaces and Data ---
export interface MissionEventChoice {
    text: string;
    action: () => void;
}
export interface MissionEvent {
    id: string;
    title: string;
    description: string;
    choices: MissionEventChoice[];
}

// --- Game State Interface ---
export interface GameState {
  institutions: Institution[];
  initialTotalDependency: number;
  gafamMarketShare: number;
  liberatedInstitutionsCount: number;
  permanentUpgrades: Upgrade[];
  playerMoney: number;
  isMissionActive: boolean;
  activeMission: {
    institutionId: number | null,
    progress: number,
  },
  activeEvent: MissionEvent | null;
}


function createGameStore() {
  const initialTotalDependency = initialInstitutions.reduce((sum, i) => sum + i.dependency, 0);

  const { subscribe, update } = writable<GameState>({
    institutions: initialInstitutions.map(i => ({...i})), // Create deep copies
    initialTotalDependency,
    gafamMarketShare: 95,
    liberatedInstitutionsCount: 0,
    permanentUpgrades: [],
    playerMoney: 50, // Reduced starting money
    isMissionActive: false,
    activeMission: {
      institutionId: null,
      progress: 0,
    },
    activeEvent: null,
  });

  // --- Event Definitions ---
  const missionEvents: MissionEvent[] = [
    {
        id: 'hardware-issue',
        title: 'Critical Hardware Incompatibility',
        description: 'A key piece of hardware is incompatible with the new Linux install. This is a major setback.',
        choices: [
            { text: 'Source compatible hardware ($150)', action: () => resolveEvent(-150, 30) },
            { text: 'Attempt a workaround (+20% risk)', action: () => resolveEvent(0, 10, 20) },
        ]
    },
    {
        id: 'staff-training',
        title: 'Staff Training Required',
        description: 'The institution\'s staff needs urgent training on the new systems.',
        choices: [
            { text: 'Run an express workshop ($50)', action: () => resolveEvent(-50, 15) },
            { text: 'Use online docs (no cost)', action: () => resolveEvent(0, 5) },
        ]
    },
    {
        id: 'vendor-lockin',
        title: 'Vendor Lock-in Discovered',
        description: 'An active long-term contract with a proprietary vendor (e.g., Microsoft 365) was found.',
        choices: [
            { text: 'Pay early termination penalty ($200)', action: () => resolveEvent(-200, 25) },
            { text: 'Negotiate exit (slower progress)', action: () => resolveEvent(0, -10) },
        ]
    },
    {
        id: 'proprietary-trainers',
        title: 'Trainers Lack Certification',
        description: 'The internal trainers are only certified for proprietary software.',
        choices: [
            { text: 'Retrain existing staff ($100)', action: () => resolveEvent(-100, 15) },
            { text: 'Hire external open-source experts ($150)', action: () => resolveEvent(-150, 30) },
        ]
    },
    {
        id: 'resistant-users',
        title: 'User Resistance',
        description: 'Users are pushing back: "I\'ve always done it this way!"',
        choices: [
            { text: 'Host an engagement workshop ($50)', action: () => resolveEvent(-50, 10) },
            { text: 'Force the change (+15% risk)', action: () => resolveEvent(0, 5, 15) },
        ]
    },
    {
        id: 'budget-cut',
        title: 'Unexpected Budget Cut',
        description: 'The institution has slashed the transition budget mid-way.',
        choices: [
            { text: 'Cover costs from own funds ($100)', action: () => resolveEvent(-100, 10) },
            { text: 'Attempt crowdfunding (+25% risk)', action: () => resolveEvent(0, 20, 25) },
        ]
    },
    {
        id: 'software-incompatibility',
        title: 'Software Incompatibility',
        description: 'Critical business software has no Linux-native alternative.',
        choices: [
            { text: 'Sponsor open-source alternative ($300)', action: () => resolveEvent(-300, 40) },
            { text: 'Use Wine/Compatibility layer (slower)', action: () => resolveEvent(0, 5) },
        ]
    }
  ];
  
  function resolveEvent(moneyChange: number, progressChange: number, riskChange: number = 0) {
      update(state => {
          if (!state.activeEvent) return state;

          // Legal Aid: reduce monetary penalties
          if (moneyChange < 0 && state.permanentUpgrades.some(u => u.id === 'legal-aid')) {
              moneyChange = moneyChange / 2;
          }

          const riskRoll = Math.random() * 100;
          if (riskRoll < riskChange) {
              // Mission Failed
              return {
                  ...state,
                  isMissionActive: false,
                  activeMission: { institutionId: null, progress: 0 },
                  activeEvent: null,
                  playerMoney: Math.max(0, state.playerMoney - 50), // Penalty for failure
              }
          }

          return {
              ...state,
              playerMoney: Math.max(0, state.playerMoney + moneyChange),
              activeMission: {
                  ...state.activeMission,
                  progress: Math.min(100, Math.max(0, state.activeMission.progress + progressChange)),
              },
              activeEvent: null,
          }
      });
  }

  function startLiberationMission(institutionId: number) {
    update(state => {
      if (state.isMissionActive) return state;
      const institution = state.institutions.find(i => i.id === institutionId);
      if (!institution || institution.liberated) return state;
      return { ...state, isMissionActive: true, activeMission: { institutionId, progress: 0 }, activeEvent: null };
    });
  }
  
  function advanceMission() {
      update(state => {
          if(!state.isMissionActive || state.activeEvent) return state;
          
          const targetInstitution = state.institutions.find(i => i.id === state.activeMission.institutionId);
          if (!targetInstitution) return state; // Should not happen

          // --- 1. Event Triggering ---
          // Event chance scales with dependency.
          // Min chance: 1% (at 0 dependency)
          // Max chance: 6% (at 100 dependency)
          const eventChance = 0.01 + (targetInstitution.dependency / 100) * 0.05;
          
          if (Math.random() < eventChance) {
              let availableEvents = [...missionEvents];
              if (state.permanentUpgrades.some(u => u.id === 'hardware-certification')) {
                  availableEvents = availableEvents.filter(e => e.id !== 'hardware-issue');
              }
              if (availableEvents.length > 0) {
                  const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
                  return { ...state, activeEvent: randomEvent }; // Pause progress and show event
              }
          }

          // --- 2. Progress Calculation ---
          // Exponential decay: Speed drops sharply as dependency increases.
          // At 0% dep: ~10 progress/tick
          // At 50% dep: ~2.8 progress/tick
          // At 100% dep: ~0.8 progress/tick
          let baseSpeed = 10 * Math.exp(-targetInstitution.dependency / 40);
          baseSpeed = Math.max(0.2, baseSpeed); // Minimum speed to prevent total stalling

          let progressIncrease = baseSpeed;
          if (state.permanentUpgrades.some(u => u.id === 'script-install')) {
            progressIncrease *= 1.5;
          }
          // Build Servers Upgrade
          if (state.permanentUpgrades.some(u => u.id === 'build-servers')) {
            progressIncrease *= 1.2;
          }

          const newProgress = state.activeMission.progress + progressIncrease;

          // --- 3. Mission Completion ---
          if (newProgress >= 100) {
              targetInstitution.liberated = true;
              targetInstitution.influenceRadius = 20; // Initialize spread radius
              
              // Money reward
              const moneyReward = 100 + Math.round(targetInstitution.dependency * 2);

              return {
                  ...state,
                  isMissionActive: false,
                  activeMission: { institutionId: null, progress: 0 },
                  institutions: [...state.institutions],
                  liberatedInstitutionsCount: state.liberatedInstitutionsCount + 1,
                  gafamMarketShare: state.gafamMarketShare - (targetInstitution.dependency / 10),
                  playerMoney: state.playerMoney + moneyReward
              }
          } else {
              // --- 4. Mission In Progress ---
              return { ...state, activeMission: { ...state.activeMission, progress: newProgress } }
          }
      })
  }

  function spreadLiberation() {
      update(state => {
          let changed = false;
          const newInstitutions = state.institutions.map(inst => {
              if (inst.liberated) {
                  // Grow influence
                  inst.influenceRadius = (inst.influenceRadius || 20) + 1.5; // Grow 1.5km per tick
                  changed = true;
                  return inst;
              }
              return inst;
          });

          // Apply influence
          newInstitutions.forEach(target => {
              if (!target.liberated) {
                  let totalReduction = 0;
                  state.institutions.forEach(source => {
                      if (source.liberated && source.influenceRadius) {
                          const dist = getDistance(source.lat, source.lng, target.lat, target.lng);
                          if (dist < source.influenceRadius) {
                              totalReduction += 0.01; // drastically slower burn reduction
                          }
                      }
                  });
                  if (totalReduction > 0) {
                      target.dependency = Math.max(0, target.dependency - totalReduction);
                      changed = true;
                  }
              }
          });

          if (!changed) return state;
          return { ...state, institutions: newInstitutions };
      });
  }

  function purchaseUpgrade(upgradeId: string) {
      update(state => {
          const upgrade = allUpgrades.find(u => u.id === upgradeId);
          if (!upgrade || state.playerMoney < upgrade.cost || state.permanentUpgrades.some(u => u.id === upgradeId)) {
            return state;
          }

          const newState = {
              ...state,
              playerMoney: state.playerMoney - upgrade.cost,
              permanentUpgrades: [...state.permanentUpgrades, upgrade]
          };

          // Apply immediate effects
          if (upgrade.id === 'training-materials') {
              newState.institutions.forEach(inst => {
                  if (!inst.liberated) {
                      inst.dependency = Math.max(0, inst.dependency - 5);
                  }
              });
              newState.institutions = [...newState.institutions];
          }
          if (upgrade.id === 'awareness-campaign') {
              newState.institutions.forEach(inst => {
                  if (!inst.liberated) {
                      inst.dependency = Math.max(0, inst.dependency - 10);
                  }
              });
              newState.institutions = [...newState.institutions];
          }

          return newState;
      });
  }

  function collectPassiveIncome() {
      update(state => {
          let income = 0;
          if (state.permanentUpgrades.some(u => u.id === 'open-source-contribution')) {
              income += 10;
          }
          if (state.permanentUpgrades.some(u => u.id === 'policy-lobbying')) {
              income += 20;
          }
          
          if (income > 0) {
              return {
                  ...state,
                  playerMoney: state.playerMoney + income,
              }
          }
          return state;
      });
  }

  function cancelMission() {
      update(state => {
          if (!state.isMissionActive) return state;
          
          return {
              ...state,
              isMissionActive: false,
              activeMission: { institutionId: null, progress: 0 },
              activeEvent: null,
              playerMoney: Math.max(0, state.playerMoney - 20) // Cancellation fee
          };
      });
  }

  return {
    subscribe,
    startLiberationMission,
    advanceMission,
    purchaseUpgrade,
    resolveEvent,
    collectPassiveIncome,
    spreadLiberation,
    cancelMission,
  };
}

export const gameStore = createGameStore();

export const countryCoverage = derived(
    gameStore,
    ($gameStore) => {
        if (!$gameStore || !$gameStore.initialTotalDependency) return 0;
        const currentTotalDependency = $gameStore.institutions.reduce((sum, i) => i.liberated ? sum : sum + i.dependency, 0);
        return (1 - (currentTotalDependency / $gameStore.initialTotalDependency)) * 100;
    },
    0 // Initial Value
);

export const visibleInstitutions = derived(
    gameStore,
    ($gameStore) => {
        const liberated = $gameStore.institutions.filter(i => i.liberated);
        const nonLiberated = $gameStore.institutions.filter(i => !i.liberated);
        
        if (nonLiberated.length === 0) {
            return liberated;
        }

        // Find the easiest target
        const nextTarget = nonLiberated.reduce((prev, curr) => {
            return prev.dependency < curr.dependency ? prev : curr;
        });

        return [...liberated, nextTarget];
    }
);