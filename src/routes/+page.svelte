<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Map from '$lib/components/Map.svelte';
  import MissionView from '$lib/components/MissionView.svelte';
  import { gameStore, countryCoverage, visibleInstitutions } from '$lib/stores/gameStore';
  import type { Institution } from '$lib/game/institutions';
  import { permanentUpgrades as allUpgrades } from '$lib/game/upgrades';
  
  let missionInterval: any;
  let incomeInterval: any;
  let spreadInterval: any;

  onMount(() => {
      missionInterval = setInterval(() => {
          gameStore.advanceMission();
      }, 1000);

      incomeInterval = setInterval(() => {
          gameStore.collectPassiveIncome();
      }, 1000);

      spreadInterval = setInterval(() => {
          gameStore.spreadLiberation();
      }, 1000);
  })

  onDestroy(() => {
      clearInterval(missionInterval);
      clearInterval(incomeInterval);
      clearInterval(spreadInterval);
  })

  function handleStartMission(event: CustomEvent<number>) {
    gameStore.startLiberationMission(event.detail);
  }
  
  function purchaseUpgrade(upgradeId: string) {
      gameStore.purchaseUpgrade(upgradeId);
  }
</script>

<div class="game-container">
  <div class="country-coverage">
    <h2>Country Liberation: {$countryCoverage.toFixed(1)}%</h2>
    <progress class="coverage-progress" value={$countryCoverage} max="100"></progress>
  </div>

  <div class="map-area">
    <Map 
        institutions={$visibleInstitutions} 
        isMissionActive={$gameStore.isMissionActive}
        on:start_mission={handleStartMission} 
    />
  </div>
  <div class="ui-area">
    <h1>The Free Software Transitionner</h1>
    <div class="stats">
      <h2>Global Stats</h2>
      <p>GAFAM Market Share: <span class="market-share">{$gameStore.gafamMarketShare.toFixed(2)}%</span></p>
      <p>Liberated Institutions: <span class="liberated-count">{$gameStore.liberatedInstitutionsCount}</span></p>
      <p>Money: <span class="money">${$gameStore.playerMoney}</span></p>
    </div>

    {#if $gameStore.isMissionActive}
        <MissionView />
    {:else}
      <div class="actions">
        <h2>Actions</h2>
        <p>Select an institution on the map to start a mission.</p>
      </div>
    {/if}

    <div class="upgrades">
      <h2>Permanent Upgrades</h2>
      {#each allUpgrades as upgrade}
        <div class="upgrade">
            <h3>{upgrade.name} (${upgrade.cost})</h3>
            <p>{upgrade.description}</p>
            <button 
                on:click={() => purchaseUpgrade(upgrade.id)}
                disabled={$gameStore.playerMoney < upgrade.cost || $gameStore.permanentUpgrades.some(u => u.id === upgrade.id)}
            >
                {$gameStore.permanentUpgrades.some(u => u.id === upgrade.id) ? 'Purchased' : 'Purchase'}
            </button>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    font-family: 'Georgia', 'Times New Roman', Times, serif;
    background-color: #f0f0f0;
    color: #3e2723;
  }

  .game-container {
    display: flex;
    height: 100vh;
  }

  .map-area {
    flex: 3;
    height: 100%;
    position: relative;
  }

  .ui-area {
    flex: 1;
    padding: 2rem;
    background-color: #5d4037; /* Dark Wood */
    color: #ffe0b2; /* Parchment text */
    box-shadow: -5px 0 15px rgba(0,0,0,0.5);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
    border-left: 5px solid #3e2723;
  }

  h1, h2, h3 {
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #8d6e63;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }
  
  h1 {
      font-size: 2rem;
      color: #ffcc80;
  }
  
  h3 {
      padding-bottom: 0.25rem;
      font-size: 1.1rem;
      color: #ffcc80;
  }

  .stats p, .actions p, .upgrade p {
    margin: 0.5rem 0;
  }

  .market-share, .liberated-count, .money {
    font-weight: bold;
    color: #ffd54f;
  }
  
  .country-coverage {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
    min-width: 400px;
    z-index: 2000;
    background-color: #5d4037;
    color: #ffe0b2;
    padding: 0.75rem 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 8px;
    border: 3px solid #8d6e63;
  }

  .country-coverage h2 {
      margin: 0;
      font-size: 1rem;
      border: none;
      padding: 0;
      color: #ffcc80;
  }

  .country-coverage p {
      margin: 0;
      font-size: 0.9rem;
  }

  .coverage-progress {
      width: 100%;
      height: 12px;
      appearance: none;
      border: 1px solid #3e2723;
      background: #3e2723;
      border-radius: 6px;
      overflow: hidden;
  }
  
  .coverage-progress::-webkit-progress-bar {
      background-color: #3e2723;
  }
  
  .coverage-progress::-webkit-progress-value {
      background-color: #66bb6a;
  }
  .coverage-progress::-moz-progress-bar {
      background-color: #66bb6a;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #3e2723;
    background-color: #a1887f;
    color: #2d1915;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.1s;
    font-family: inherit;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 0 3px 0 #3e2723;
    position: relative;
    top: 0;
  }

  button:hover:not(:disabled) {
    background-color: #bcaaa4;
    top: -1px;
    box-shadow: 0 4px 0 #3e2723;
  }
  
  button:active:not(:disabled) {
      top: 2px;
      box-shadow: 0 1px 0 #3e2723;
  }
  
  button:disabled {
      background-color: #6d4c41;
      color: #4e342e;
      border-color: #3e2723;
      box-shadow: none;
      cursor: not-allowed;
      top: 2px;
  }

  .upgrades {
      display: flex;
      flex-direction: column;
      gap: 1rem;
  }

  .upgrade {
    background-color: #4e342e;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #3e2723;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
  }
  
  .actions {
      background-color: #4e342e;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #3e2723;
      text-align: center;
      font-style: italic;
  }
</style>
