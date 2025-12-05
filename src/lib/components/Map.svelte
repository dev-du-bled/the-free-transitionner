<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import type { Map, Marker } from 'leaflet';
  import type { Institution } from '$lib/game/institutions';
  import { DotEmitter } from '$lib/effects/DotEmitter';

  export let institutions: Institution[] = [];

  const dispatch = createEventDispatcher();

  let mapElement: HTMLElement;
  let map: Map;
  let markers: { [id: number]: Marker } = {};
  
  // To keep track of running animations
  const activeEmitters = new Set<number>();

  let L: any;

  onMount(async () => {
    if (typeof window !== 'undefined') {
      L = await import('leaflet');
      map = L.map(mapElement, {
          preferCanvas: true,
          zoomControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          boxZoom: false,
          keyboard: false,
          dragging: false,
          minZoom: 6, // Allow slightly lower for responsive layouts if needed, but keep max restrictive
          maxZoom: 7
      }).setView([46.6, 2.2137], 6.5); // slightly adjusted center and zoom

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // --- France Mask ---
      try {
          const response = await fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/metropole-version-simplifiee.geojson');
          const data = await response.json();
          
          // Create a giant rectangle covering the world
          const world = [
              [90, -180],
              [90, 180],
              [-90, 180],
              [-90, -180]
          ];

          // Extract France coordinates from MultiPolygon
          // Structure: Feature -> geometry -> coordinates -> Array of Polygons -> Array of Rings -> Array of Points
          const francePolygons = data.geometry.coordinates;
          const franceHoles = francePolygons.map((polygon: any) => 
              polygon[0].map((point: any) => [point[1], point[0]]) // Swap lon/lat to lat/lon
          );

          // Create the mask polygon: World is the outer shell, France parts are the holes
          const maskWithHoles = [world, ...franceHoles];

          L.polygon(maskWithHoles, {
              color: 'transparent', // No border
              fillColor: '#f0f0f0', // Match page background
              fillOpacity: 1,
              interactive: false // Let clicks pass through
          }).addTo(map);

      } catch (e) {
          console.error("Failed to load France mask:", e);
      }

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
        
        // --- Spreading Dots Animation ---
        if (institution.liberated && !activeEmitters.has(institution.id)) {
            const emitter = new DotEmitter(L, map, L.latLng(institution.lat, institution.lng));
            emitter.start();
            activeEmitters.add(institution.id);
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
