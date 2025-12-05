<script lang="ts">
  import { gameStore } from '$lib/stores/gameStore';
</script>

<div class="mission-view">
    <h2>Mission: Liberate {$gameStore.institutions.find(i => i.id === $gameStore.activeMission.institutionId)?.name}</h2>
    
    <div class="progress-bar">
        <div class="progress" style="width: {$gameStore.activeMission.progress}%"></div>
    </div>
    <p style="text-align: center;">{Math.round($gameStore.activeMission.progress)}%</p>

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
    {:else}
        <p>Mission progressing smoothly...</p>
    {/if}
</div>

<style>
    .mission-view {
        padding: 1rem;
        background-color: #fafafa;
        border-radius: 5px;
    }
    .progress-bar {
        height: 20px;
        width: 100%;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        margin: 1rem 0;
    }
    .progress {
        height: 100%;
        background-color: #4caf50;
        transition: width 0.3s ease-in-out;
    }
    .events {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #fff;
        border: 1px solid #eee;
        border-radius: 5px;
    }
    .choices {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
    }
</style>
