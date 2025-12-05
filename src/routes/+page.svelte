<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Map from '$lib/components/Map.svelte';
  import MissionView from '$lib/components/MissionView.svelte';
  import { gameStore } from '$lib/stores/gameStore';
  import type { Institution } from '$lib/game/institutions';
  import { permanentUpgrades as allUpgrades } from '$lib/game/upgrades';

  let selectedInstitution: Institution | null = null;
  
  let missionInterval: any;
  let incomeInterval: any;

  onMount(() => {
      missionInterval = setInterval(() => {
          gameStore.advanceMission();
      }, 1000);

      incomeInterval = setInterval(() => {
          gameStore.collectPassiveIncome();
      }, 1000);
  })

  onDestroy(() => {
      clearInterval(missionInterval);
      clearInterval(incomeInterval);
  })

  function handleInstitutionSelected(event: CustomEvent<Institution>) {
    const institutionId = event.detail.id;
    selectedInstitution = $gameStore.institutions.find(i => i.id === institutionId) || null;
  }

  function startMission() {
    if (selectedInstitution) {
      gameStore.startLiberationMission(selectedInstitution.id);
    }
  }
  
  function purchaseUpgrade(upgradeId: string) {
      gameStore.purchaseUpgrade(upgradeId);
  }
</script>

<div class="game-container">
  <div class="map-area">
    <Map institutions={$gameStore.institutions} on:institution_selected={handleInstitutionSelected} />
  </div>
  <div class="ui-area">
    <h1>Liberation Rogue</h1>
    <div class="stats">
      <h2>Global Stats</h2>
      <p>GAFAM Market Share: <span class="market-share">{$gameStore.gafamMarketShare.toFixed(2)}%</span></p>
      <p>Liberated Institutions: <span class="liberated-count">{$gameStore.liberatedInstitutionsCount}</span></p>
      <p>Money: <span class="money">${$gameStore.playerMoney}</span></p>
    </div>

    {#if $gameStore.isMissionActive}
        <MissionView />
    {:else if selectedInstitution}
      <div class="selected-institution">
        <h2>{selectedInstitution.name}</h2>
        <p>Dependency: {selectedInstitution.dependency.toFixed(1)}%</p>
        {#if selectedInstitution.liberated}
            <p class="liberated">This institution has been liberated!</p>
        {:else}
            <button on:click={startMission} disabled={$gameStore.isMissionActive}>Start Liberation Mission</button>
        {/if}
      </div>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f0f0f0;
  }

  .game-container {
    display: flex;
    height: 100vh;
  }

  .map-area {
    flex: 3;
    height: 100%;
  }

  .ui-area {
    flex: 1;
    padding: 2rem;
    background-color: #fff;
    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
  }

  h1, h2, h3 {
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
      padding-bottom: 0.25rem;
      font-size: 1rem;
  }

  .stats p, .actions p, .selected-institution p, .upgrade p {
    margin: 0.5rem 0;
  }

  .market-share, .liberated-count, .money {
    font-weight: bold;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #e9e9e9;
  }
  
  button:disabled {
      background-color: #e0e0e0;
      cursor: not-allowed;
      color: #999;
  }

  .selected-institution, .upgrade {
    background-color: #fafafa;
    padding: 1rem;
    border-radius: 5px;
  }
  
  .liberated {
      color: green;
      font-weight: bold;
  }
</style>