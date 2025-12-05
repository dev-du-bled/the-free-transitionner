import { writable } from 'svelte/store';
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
  const { subscribe, update } = writable<GameState>({
    institutions: initialInstitutions.map(i => ({...i})), // Create deep copies
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
    }
  ];
  
  function resolveEvent(moneyChange: number, progressChange: number, riskChange: number = 0) {
      update(state => {
          if (!state.activeEvent) return state;

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
          
          // --- 1. Event Triggering ---
          if (Math.random() < 0.15) {
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
          let progressIncrease = 10;
          if (state.permanentUpgrades.some(u => u.id === 'script-install')) {
            progressIncrease *= 1.5;
          }

          const newProgress = state.activeMission.progress + progressIncrease;

          // --- 3. Mission Completion ---
          if (newProgress >= 100) {
              const liberatedInstitution = state.institutions.find(i => i.id === state.activeMission.institutionId);
              if (!liberatedInstitution) return state;

              liberatedInstitution.liberated = true;

              // Spread mechanic
              let spreadRadius = 50; 
              let spreadEffect = 10;
              if (state.permanentUpgrades.some(u => u.id === 'community-building')) {
                  spreadRadius *= 1.5;
                  spreadEffect *= 1.5;
              }

              state.institutions.forEach(target => {
                  if (target.id === liberatedInstitution.id || target.liberated) return;
                  const distance = getDistance(liberatedInstitution.lat, liberatedInstitution.lng, target.lat, target.lng);
                  if (distance < spreadRadius) {
                      const reduction = spreadEffect * (1 - (distance / spreadRadius));
                      target.dependency = Math.max(0, target.dependency - reduction);
                  }
              });
              
              // Money reward
              const moneyReward = 100 + Math.round(liberatedInstitution.dependency * 2);

              return {
                  ...state,
                  isMissionActive: false,
                  activeMission: { institutionId: null, progress: 0 },
                  institutions: [...state.institutions],
                  liberatedInstitutionsCount: state.liberatedInstitutionsCount + 1,
                  gafamMarketShare: state.gafamMarketShare - (liberatedInstitution.dependency / 10),
                  playerMoney: state.playerMoney + moneyReward
              }
          } else {
              // --- 4. Mission In Progress ---
              return { ...state, activeMission: { ...state.activeMission, progress: newProgress } }
          }
      })
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

          if (upgrade.id === 'training-materials') {
              newState.institutions.forEach(inst => {
                  if (!inst.liberated) {
                      inst.dependency = Math.max(0, inst.dependency - 5);
                  }
              });
              newState.institutions = [...newState.institutions];
          }

          return newState;
      });
  }

  function collectPassiveIncome() {
      update(state => {
          if (!state.permanentUpgrades.some(u => u.id === 'open-source-contribution')) {
              return state;
          }
          return {
              ...state,
              playerMoney: state.playerMoney + 10,
          }
      });
  }

  return {
    subscribe,
    startLiberationMission,
    advanceMission,
    purchaseUpgrade,
    resolveEvent,
    collectPassiveIncome,
  };
}

export const gameStore = createGameStore();
