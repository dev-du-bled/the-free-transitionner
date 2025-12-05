<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore';
</script>

<div class="mission-view">
    <h2>Transition: Liberate {$gameStore.institutions.find(i => i.id === $gameStore.activeMission.institutionId)?.name}</h2>
    
    <div class="progress-bar">
        <div class="progress" style="width: {$gameStore.activeMission.progress}%"></div>
    </div>
    <p style="text-align: center;">{Math.round($gameStore.activeMission.progress)}%</p>
    
    <div class="controls">
        <button 
            class="cancel-btn" 
            on:click={() => gameStore.cancelMission()}
            disabled={$gameStore.playerMoney < 20}
        >
            Cancel Transition ($20)
        </button>
    </div>

    {#if $gameStore.activeEvent}
        {@const event = $gameStore.activeEvent}
        <div class="events">
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <div class="choices">
                {#each event.choices as choice}
                    <button on:click={choice.action}>{choice.text}</button>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .mission-view {
        padding: 1rem;
        background-color: #4e342e; /* Darker wood */
        border-radius: 6px;
        border: 2px solid #3e2723;
        color: #ffe0b2;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
    }
    
    h2, h3 {
        color: #ffcc80;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        margin-top: 0;
    }

    .progress-bar {
        height: 20px;
        width: 100%;
        background-color: #3e2723;
        border-radius: 10px;
        overflow: hidden;
        margin: 1rem 0;
        border: 1px solid #5d4037;
    }
    .progress {
        height: 100%;
        background-color: #66bb6a;
        transition: width 0.3s ease-in-out;
    }
    .controls {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
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

    .cancel-btn {
        background-color: #ffccbc; /* Light Reddish Wood */
        color: #b71c1c;
        border-color: #b71c1c;
        box-shadow: 0 3px 0 #b71c1c;
    }
    .cancel-btn:hover:not(:disabled) {
        background-color: #ffab91;
        box-shadow: 0 4px 0 #b71c1c;
    }
    .cancel-btn:active:not(:disabled) {
        box-shadow: 0 1px 0 #b71c1c;
    }
    
    .cancel-btn:disabled {
        background-color: #4e342e;
        color: #5d4037;
        border-color: #3e2723;
        box-shadow: none;
        cursor: not-allowed;
        top: 2px;
    }

    .events {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #5d4037;
        border: 1px solid #8d6e63;
        border-radius: 5px;
    }
    .choices {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
    }
</style>
