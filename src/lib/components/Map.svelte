<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import type { Map, Marker, Circle } from 'leaflet';
  import type { Institution } from '$lib/game/institutions';

  export let institutions: Institution[] = [];

  const dispatch = createEventDispatcher();

  let mapElement: HTMLElement;
  let map: Map;
  let markers: { [id: number]: Marker } = {};
  let circles: { [id: number]: Circle } = {};

  let L: any;

  onMount(async () => {
    if (typeof window !== 'undefined') {
      L = await import('leaflet');
      map = L.map(mapElement).setView([46.2276, 2.2137], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      drawElements();
    }
  });

  afterUpdate(() => {
    if (map) {
      drawElements();
    }
  });
  
  function drawElements() {
      institutions.forEach(institution => {
        const existingMarker = markers[institution.id];
        const icon = getIcon(institution);

        const popupContent = `<b>${institution.name}</b><br>Dependency: ${institution.dependency.toFixed(1)}%`;

        if (existingMarker) {
            existingMarker.setIcon(icon);
            existingMarker.unbindPopup();
            existingMarker.bindPopup(popupContent);
        } else {
            const marker = L.marker([institution.lat, institution.lng], { icon }).addTo(map);
            marker.bindPopup(popupContent);
            marker.on('click', () => {
              dispatch('institution_selected', institution);
            });
            markers[institution.id] = marker;
        }
        
        const existingCircle = circles[institution.id];
        if (institution.liberated && !existingCircle) {
            const circle = L.circle([institution.lat, institution.lng], {
                radius: 20000, // 20km radius
                color: 'blue',
                fillColor: 'blue',
                fillOpacity: 0.2
            }).addTo(map);
            circles[institution.id] = circle;
        }
      });
  }

  function getIcon(institution: Institution) {
    let color: string;
    if (institution.liberated) {
        color = '#007bff'; // Blue
    } else if (institution.dependency > 70) {
        color = '#dc3545'; // Red
    } else if (institution.dependency > 40) {
        color = '#fd7e14'; // Orange
    } else {
        color = '#ffc107'; // Yellow
    }

    return L.divIcon({
      className: `custom-div-icon`,
      html: `<div style="background-color:${color};" class="marker-pin"></div>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
  }
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    height: 100vh;
    width: 100%;
  }

  :global(.custom-div-icon .marker-pin) {
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      position: absolute;
      transform: rotate(-45deg);
      left: 50%;
      top: 50%;
      margin: -15px 0 0 -15px;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
  }
</style>
